"use server";

import { z } from "zod";
import { sendNewsletterEmail } from "./send-email";

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  siteName: z.string().min(1, "Site name is required"),
});

export type NewsletterState = {
  success?: string;
  error?: string;
};

export async function subscribeToNewsletter(
  prevState: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const rawData = {
    email: formData.get("email"),
    siteName: formData.get("siteName"),
  };

  // Validate fields
  const validatedFields = newsletterSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.email?.[0] || "Invalid email",
    };
  }

  try {
    // Send real email using Resend
    const result = await sendNewsletterEmail(
      validatedFields.data.email,
      validatedFields.data.siteName
    );

    if (!result.success) {
      return {
        error: result.error || "Failed to subscribe. Please try again later.",
      };
    }

    return {
      success: result.message,
    };
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return {
      error: "Failed to subscribe. Please try again later.",
    };
  }
}
