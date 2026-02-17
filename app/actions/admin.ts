"use server";

import prisma from "@/lib/prisma";
import { requireAdmin, getSuperAdminEmail } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import jwt from "jsonwebtoken";

interface ImpersonationPayload {
  email: string;
  type: "impersonation";
  adminEmail: string;
  iat: number;
  exp: number;
}

/**
 * Log admin action for audit trail
 */
async function logAdminAction(
  action: string,
  targetId: string,
  targetType: "user" | "site",
  metadata?: any,
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

  console.log(
    `🔒 ADMIN ACTION: ${action} on ${targetType} ${targetId} by ${getSuperAdminEmail()}`,
  );
}

/**
 * Ban a user
 */
export async function banUser(
  userId: string,
  reason: string,
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
  userId: string,
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
export async function createImpersonationSession(userId: string): Promise<{
  success: boolean;
  token?: string;
  targetUserName?: string;
  message: string;
}> {
  try {
    const session = await auth();

    // Verify Super Admin
    if (session?.user?.email !== process.env.SUPER_ADMIN_EMAIL) {
      console.error("❌ Unauthorized impersonation attempt");
      return {
        success: false,
        message: "Unauthorized: Super Admin access required",
      };
    }

    // Fetch target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        bannedAt: true,
      },
    });

    if (!targetUser) {
      return { success: false, message: "User not found" };
    }

    // Prevent impersonating banned users
    if (targetUser.bannedAt) {
      return { success: false, message: "Cannot impersonate banned users" };
    }

    // Prevent admin from impersonating themselves
    if (!session?.user?.email || targetUser.email === session.user.email) {
      return {
        success: false,
        message: "Cannot impersonate yourself",
      };
    }

    // Generate Golden Ticket JWT
    const token = jwt.sign(
      {
        email: targetUser.email,
        type: "impersonation",
        adminEmail: session?.user?.email || "unknown",
      },
      process.env.NEXTAUTH_SECRET!,
      {
        expiresIn: "60s", // Token valid for 60 seconds only
      },
    );

    console.log("🎫 Golden Ticket generated for:", targetUser.email);

    // Log the impersonation attempt
    await logAdminAction("impersonate_user", userId, "user", {
      adminEmail: session?.user?.email || "unknown",
      targetUserEmail: targetUser.email,
      targetUserName: targetUser.name,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      token,
      targetUserName: targetUser.name || targetUser.email,
      message: "Impersonation token generated",
    };
  } catch (error) {
    console.error("❌ Error generating impersonation token:", error);
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
  reason: string,
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
  siteId: string,
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
