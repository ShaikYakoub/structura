"use server";

import { resend } from "@/lib/resend";
import prisma from "@/lib/prisma";

export type EmailResult = {
  success: boolean;
  message: string;
  error?: string;
};

/**
 * Send contact form email to site owner
 */
export async function sendContactEmail(
  siteId: string,
  formData: {
    name: string;
    email: string;
    message: string;
    phone?: string;
  }
): Promise<EmailResult> {
  try {
    // Get site and owner info
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: {
        name: true,
        subdomain: true,
        tenant: {
          select: { email: true, name: true },
        },
      },
    });

    if (!site) {
      return {
        success: false,
        message: "Site not found",
      };
    }

    // Send to site owner (tenant email)
    const ownerEmail = site.tenant?.email || process.env.SITE_OWNER_EMAIL || "owner@yourdomain.com";

    const { data, error } = await resend.emails.send({
      from: "Structura Contact Form <onboarding@resend.dev>",
      to: [ownerEmail],
      replyTo: formData.email,
      subject: `New Contact Form Submission from ${site.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>From:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            ${formData.phone ? `<p><strong>Phone:</strong> ${formData.phone}</p>` : ""}
            <p><strong>Site:</strong> ${site.name} (${site.subdomain})</p>
          </div>
          <div style="margin: 20px 0;">
            <h3 style="color: #555;">Message:</h3>
            <p style="white-space: pre-wrap;">${formData.message}</p>
          </div>
          <hr style="border: 1px solid #ddd; margin: 20px 0;" />
          <p style="color: #888; font-size: 12px;">
            This email was sent from ${site.name} contact form via Structura
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Email error:", error);
      return {
        success: false,
        message: "Failed to send email",
        error: error.message,
      };
    }

    console.log("✅ Email sent:", data?.id);

    return {
      success: true,
      message: "Thank you! Your message has been sent successfully.",
    };
  } catch (error) {
    console.error("❌ Email error:", error);
    return {
      success: false,
      message: "Failed to send email",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send newsletter subscription confirmation
 */
export async function sendNewsletterEmail(
  email: string,
  siteName: string
): Promise<EmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: "Structura Newsletter <onboarding@resend.dev>",
      to: [email],
      subject: `Welcome to ${siteName} Newsletter!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to ${siteName}! 🎉</h2>
          <p>Thank you for subscribing to our newsletter!</p>
          <p>You'll be the first to know about:</p>
          <ul>
            <li>Latest updates and news</li>
            <li>Exclusive content and offers</li>
            <li>Tips and insights</li>
          </ul>
          <hr style="border: 1px solid #ddd; margin: 20px 0;" />
          <p style="color: #888; font-size: 12px;">
            You're receiving this email because you subscribed to ${siteName}.
            <br />
            Powered by Structura
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Newsletter email error:", error);
      return {
        success: false,
        message: "Failed to send confirmation email",
        error: error.message,
      };
    }

    console.log("✅ Newsletter email sent:", data?.id);

    return {
      success: true,
      message: "Thank you for subscribing! Check your inbox.",
    };
  } catch (error) {
    console.error("❌ Newsletter email error:", error);
    return {
      success: false,
      message: "Failed to send confirmation email",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
