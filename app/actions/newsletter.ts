"use server";

import { z } from "zod";

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type NewsletterState = {
  success?: string;
  error?: string;
};

export async function subscribeToNewsletter(
  prevState: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const email = formData.get("email");

  // Validate email
  const validatedFields = newsletterSchema.safeParse({ email });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.email?.[0] || "Invalid email",
    };
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Here you would typically:
  // 1. Save to database
  // 2. Add to email marketing service (Mailchimp, ConvertKit, etc.)
  // await prisma.newsletterSubscriber.create({ data: { email: validatedFields.data.email } });

  console.log("Newsletter subscription:", validatedFields.data.email);

  return {
    success: "Thank you for subscribing! Check your inbox for confirmation.",
  };
}
