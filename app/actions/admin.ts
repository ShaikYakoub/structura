"use server";

import prisma from "@/lib/prisma";
import { requireAdmin, getSuperAdminEmail } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";

/**
 * Log admin action for audit trail
 */
async function logAdminAction(
  action: string,
  targetId: string,
  targetType: "user" | "site",
  metadata?: any
) {
  await prisma.auditLog.create({
    data: {
      adminEmail: getSuperAdminEmail(),
      action,
      targetId,
      targetType,
      metadata: metadata || {},
    },
  });

  console.log(`🔒 ADMIN ACTION: ${action} on ${targetType} ${targetId} by ${getSuperAdminEmail()}`);
}

/**
 * Ban a user
 */
export async function banUser(
  userId: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  try {
    await requireAdmin();

    await prisma.user.update({
      where: { id: userId },
      data: {
        bannedAt: new Date(),
        banReason: reason,
      },
    });

    await logAdminAction("ban_user", userId, "user", { reason });

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "User banned successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to ban user",
    };
  }
}

/**
 * Unban a user
 */
export async function unbanUser(
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await requireAdmin();

    await prisma.user.update({
      where: { id: userId },
      data: {
        bannedAt: null,
        banReason: null,
      },
    });

    await logAdminAction("unban_user", userId, "user");

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "User unbanned successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to unban user",
    };
  }
}

/**
 * Create impersonation session (returns special token)
 */
export async function createImpersonationSession(
  userId: string
): Promise<{ success: boolean; redirectUrl?: string; message: string }> {
  try {
    await requireAdmin();

    // Log impersonation
    await logAdminAction("impersonate_user", userId, "user");

    // In a real implementation, you'd create a special session token
    // For now, we'll just log it and redirect
    // You can implement this with NextAuth callbacks

    return {
      success: true,
      redirectUrl: `/admin/impersonate/${userId}`,
      message: "Impersonation session created",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create impersonation session",
    };
  }
}

/**
 * Take down a site (ban it)
 */
export async function takedownSite(
  siteId: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  try {
    await requireAdmin();

    await prisma.site.update({
      where: { id: siteId },
      data: {
        banned: true,
        bannedAt: new Date(),
        banReason: reason,
      },
    });

    await logAdminAction("takedown_site", siteId, "site", { reason });

    revalidatePath("/admin/sites");

    return {
      success: true,
      message: "Site taken down successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to take down site",
    };
  }
}

/**
 * Restore a banned site
 */
export async function restoreSite(
  siteId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await requireAdmin();

    await prisma.site.update({
      where: { id: siteId },
      data: {
        banned: false,
        bannedAt: null,
        banReason: null,
      },
    });

    await logAdminAction("restore_site", siteId, "site");

    revalidatePath("/admin/sites");

    return {
      success: true,
      message: "Site restored successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to restore site",
    };
  }
}
