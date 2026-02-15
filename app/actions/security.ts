"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function purgeOldLogs() {
  try {
    const session = await auth();

    // Check if user is super admin
    if (session?.user?.email !== process.env.SUPER_ADMIN_EMAIL) {
      return { success: false, error: "Unauthorized" };
    }

    // Calculate date 90 days ago
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Delete old logs
    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo,
        },
      },
    });

    revalidatePath("/admin/security");

    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error purging logs:", error);
    return { success: false, error: "Failed to purge logs" };
  }
}
