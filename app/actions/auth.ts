"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { Resend } from "resend";
import { PasswordResetEmail } from "@/emails/password-reset";

const resend = new Resend(process.env.RESEND_API_KEY);

// Validation schemas
const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const newPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

// ============================================
// REQUEST PASSWORD RESET
// ============================================

export async function requestPasswordReset(email: string) {
  try {
    // Validate email
    const validation = resetPasswordSchema.safeParse({ email });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    const validatedEmail = validation.data.email;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: validatedEmail },
    });

    // Security: Always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      console.log(
        "⚠️ Password reset requested for non-existent email:",
        validatedEmail,
      );
      // Still return success to prevent enumeration
      return {
        success: true,
        message:
          "If an account exists with this email, you will receive a password reset link.",
      };
    }

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: validatedEmail },
    });

    // Generate unique token
    const token = randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save token to database
    await prisma.passwordResetToken.create({
      data: {
        email: validatedEmail,
        token,
        expires,
      },
    });

    // Construct reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-password?token=${token}`;

    console.log("📧 Sending password reset email to:", validatedEmail);
    console.log("🔗 Reset URL:", resetUrl);

    // Send email via Resend
    try {
      await resend.emails.send({
        from:
          process.env.RESEND_FROM_EMAIL || "Structura <onboarding@resend.dev>",
        to: validatedEmail,
        subject: "Reset your password",
        react: PasswordResetEmail({
          userName: user.name || "User",
          resetUrl,
        }),
      });

      console.log("✅ Password reset email sent successfully");
    } catch (emailError) {
      console.error("❌ Failed to send email:", emailError);
      // Delete the token if email fails
      await prisma.passwordResetToken.delete({
        where: { token },
      });

      return {
        success: false,
        error: "Failed to send reset email. Please try again later.",
      };
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        adminEmail: "system",
        action: "PASSWORD_RESET_REQUESTED",
        targetType: "User",
        targetId: user.id,
        userId: user.id,
        entityType: "User",
        entityId: user.id,
        details: {
          email: validatedEmail,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return {
      success: true,
      message:
        "If an account exists with this email, you will receive a password reset link.",
    };
  } catch (error) {
    console.error("❌ Error in requestPasswordReset:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// ============================================
// VERIFY RESET TOKEN
// ============================================

export async function verifyResetToken(token: string) {
  try {
    if (!token) {
      return { success: false, error: "Invalid token" };
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!resetToken) {
      return {
        success: false,
        error: "Invalid or expired reset link",
      };
    }

    // Check if token has expired
    if (new Date() > resetToken.expires) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { token },
      });

      return {
        success: false,
        error: "This reset link has expired. Please request a new one.",
      };
    }

    return {
      success: true,
      email: resetToken.email,
    };
  } catch (error) {
    console.error("❌ Error verifying token:", error);
    return {
      success: false,
      error: "Invalid token",
    };
  }
}

// ============================================
// SET NEW PASSWORD
// ============================================

export async function setNewPassword(token: string, password: string) {
  try {
    // Validate input
    const validation = newPasswordSchema.safeParse({ token, password });

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    const { token: validatedToken, password: validatedPassword } =
      validation.data;

    // Verify token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: validatedToken },
    });

    if (!resetToken) {
      return {
        success: false,
        error: "Invalid or expired reset link",
      };
    }

    // Check if token has expired
    if (new Date() > resetToken.expires) {
      await prisma.passwordResetToken.delete({
        where: { token: validatedToken },
      });

      return {
        success: false,
        error: "This reset link has expired. Please request a new one.",
      };
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Delete the used token (prevent replay attacks)
    await prisma.passwordResetToken.delete({
      where: { token: validatedToken },
    });

    // Delete all other tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { email: resetToken.email },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        adminEmail: "system",
        action: "PASSWORD_RESET_COMPLETED",
        targetType: "User",
        targetId: user.id,
        userId: user.id,
        entityType: "User",
        entityId: user.id,
        details: {
          email: user.email,
          timestamp: new Date().toISOString(),
        },
      },
    });

    console.log("✅ Password reset successful for:", user.email);

    return {
      success: true,
      message:
        "Password reset successful! You can now log in with your new password.",
    };
  } catch (error) {
    console.error("❌ Error in setNewPassword:", error);
    return {
      success: false,
      error: "Failed to reset password. Please try again.",
    };
  }
}
