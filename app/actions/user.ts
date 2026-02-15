"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(data: { name: string; email: string }) {
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

    revalidatePath("/app/settings");

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

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
