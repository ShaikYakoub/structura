"use server";

import { z } from "zod";
import { sendContactEmail } from "./send-email";

// Validation schema
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  phone: z.string().optional(),
  siteId: z.string().min(1, "Site ID is required"),
});

export type ContactFormState = {
  success?: string;
  errors?: {
    name?: string;
    email?: string;
    message?: string;
    phone?: string;
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
    phone: formData.get("phone"),
    siteId: formData.get("siteId"),
  };

  // Validate with Zod
  const validatedFields = contactSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as any,
    };
  }

  try {
    // Send real email using Resend
    const result = await sendContactEmail(validatedFields.data.siteId, {
      name: validatedFields.data.name,
      email: validatedFields.data.email,
      message: validatedFields.data.message,
      phone: validatedFields.data.phone,
    });

    if (!result.success) {
      return {
        errors: {
          message: result.error || "Failed to send email. Please try again later.",
        },
      };
    }

    return {
      success: result.message,
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
