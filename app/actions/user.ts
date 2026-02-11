"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(data: {
  name: string;
  email: string;
}) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    if (!data.name.trim()) {
      return { success: false, error: "Name is required" };
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

    revalidatePath("/dashboard/settings");

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
