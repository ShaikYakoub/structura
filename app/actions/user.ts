"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { uploadFile, deleteFile, extractKeyFromUrl } from "@/lib/s3";
import bcrypt from "bcryptjs";

// ============================================
// PROFILE IMAGE UPLOAD
// ============================================

export async function updateProfileImage(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Get file from form data
    const file = formData.get("file") as File;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
      };
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "File size exceeds 5MB limit.",
      };
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.type.split("/")[1];
    const key = `avatars/${user.id}-${timestamp}.${extension}`;

    console.log("📤 Uploading to DO Spaces:", key);

    // Upload to DigitalOcean Spaces
    const publicUrl = await uploadFile(key, buffer, file.type);

    console.log("✅ Upload successful:", publicUrl);

    // Delete old avatar if exists
    if (user.image) {
      const oldKey = extractKeyFromUrl(user.image);
      if (oldKey) {
        try {
          await deleteFile(oldKey);
          console.log("🗑️ Old avatar deleted:", oldKey);
        } catch (error) {
          console.warn("Failed to delete old avatar:", error);
          // Continue even if deletion fails
        }
      }
    }

    // Update user in database
    await prisma.user.update({
      where: { id: user.id },
      data: { image: publicUrl },
    });

    revalidatePath("/app/settings");
    revalidatePath("/app");

    return { success: true, imageUrl: publicUrl };
  } catch (error: any) {
    console.error("❌ Upload error:", error);
    return {
      success: false,
      error: "Failed to upload image. Please try again.",
    };
  }
}

// ============================================
// PROFILE UPDATE
// ============================================

export async function updateUserProfile(data: {
  name: string | null;
  email: string;
}) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    if (data.name !== null && !data.name.trim()) {
      return { success: false, error: "Name cannot be empty" };
    }

    if (!data.email.trim()) {
      return { success: false, error: "Email is required" };
    }

    // Check if email is already taken by another user
    if (data.email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return { success: false, error: "Email already in use" };
      }
    }

    // Update user
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: data.name,
        email: data.email,
      },
    });

    revalidatePath("/app/settings");

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

// ============================================
// PASSWORD CHANGE
// ============================================

export async function updatePassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.password) {
      return { success: false, error: "User not found or no password set" };
    }

    // Validate passwords
    if (data.newPassword !== data.confirmPassword) {
      return { success: false, error: "Passwords do not match" };
    }

    if (data.newPassword.length < 8) {
      return {
        success: false,
        error: "New password must be at least 8 characters",
      };
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      data.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating password:", error);
    return { success: false, error: "Failed to update password" };
  }
}

// ============================================
// DELETE ACCOUNT
// ============================================

export async function deleteAccount(password: string) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        tenant: {
          include: {
            sites: true,
          },
        },
      },
    });

    if (!user || !user.password) {
      return { success: false, error: "User not found" };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, error: "Incorrect password" };
    }

    // Delete user (cascade will handle related data)
    await prisma.user.delete({
      where: { id: user.id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting account:", error);
    return { success: false, error: "Failed to delete account" };
  }
}

// ============================================
// SITE DELETION
// ============================================

export async function deleteSite(siteId: string) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    // Get user with tenant
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { tenant: true },
    });

    if (!user?.tenantId) {
      return { success: false, error: "User not found or no tenant" };
    }

    // Find the site and verify ownership
    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return { success: false, error: "Site not found" };
    }

    if (site.tenantId !== user.tenantId) {
      return { success: false, error: "Unauthorized to delete this site" };
    }

    // Delete the site (cascade will delete pages)
    await prisma.site.delete({
      where: { id: siteId },
    });

    revalidatePath("/app");

    return { success: true };
  } catch (error) {
    console.error("Error deleting site:", error);
    return { success: false, error: "Failed to delete site" };
  }
}
