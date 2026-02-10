"use server";

import { z } from "zod";

// Validation schema
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormState = {
  success?: string;
  errors?: {
    name?: string;
    email?: string;
    message?: string;
  };
};

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // Extract form data
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  };

  // Validate with Zod
  const validatedFields = contactSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as any,
    };
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Here you would typically:
  // 1. Save to database
  // 2. Send email notification
  // 3. Integrate with CRM
  
  try {
    // Example: Save to database
    // await prisma.contactSubmission.create({
    //   data: validatedFields.data,
    // });

    // Example: Send email (using Resend, SendGrid, etc.)
    // await sendEmail({
    //   to: 'admin@example.com',
    //   subject: 'New Contact Form Submission',
    //   body: `Name: ${validatedFields.data.name}\nEmail: ${validatedFields.data.email}\nMessage: ${validatedFields.data.message}`,
    // });

    console.log("Contact form submitted:", validatedFields.data);

    return {
      success: "Thank you for your message! We'll get back to you soon.",
    };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return {
      errors: {
        message: "Failed to submit form. Please try again later.",
      },
    };
  }
}
