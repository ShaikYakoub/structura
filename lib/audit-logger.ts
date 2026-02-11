import prisma from "@/lib/prisma";

export type AuditAction =
  | "SITE_CREATE"
  | "SITE_DELETE"
  | "SITE_UPDATE"
  | "SITE_PUBLISH"
 | "SITE_UNPUBLISH"
  | "PAGE_CREATE"
  | "PAGE_DELETE"
  | "PAGE_UPDATE"
  | "PAGE_PUBLISH"
  | "DOMAIN_UPDATE"
  | "DOMAIN_VERIFY"
  | "SUBSCRIPTION_START"
  | "SUBSCRIPTION_CANCEL";

export type EntityType = "Site" | "Page" | "Domain" | "User" | "Subscription";

interface LogActivityParams {
  siteId: string;
  userId: string;
  action: AuditAction;
  entityId: string;
  entityType: EntityType;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log user activity to immutable audit trail
 * This function NEVER throws - failures are logged but don't interrupt main flow
 */
export async function logActivity({
  siteId,
  userId,
  action,
  entityId,
  entityType,
  details,
  ipAddress,
  userAgent,
}: LogActivityParams): Promise<void> {
  try {
    await prisma.userActivityLog.create({
      data: {
        siteId,
        userId,
        action,
        entityId,
        entityType,
        details: details || {},
        ipAddress,
        userAgent,
      },
    });

    console.log(
      `📝 AUDIT: ${action} on ${entityType} ${entityId} by user ${userId}`
    );
  } catch (error) {
    // CRITICAL: Never let audit logging break the main application
    console.error("❌ AUDIT LOG FAILED (non-fatal):", error);
    console.error("Failed to log:", { action, entityId, entityType, userId });

    // Optional: Send to error tracking service (Sentry, etc.)
    // but don't await or throw
  }
}

/**
 * Batch log multiple activities (for performance)
 */
export async function logActivities(
  activities: LogActivityParams[]
): Promise<void> {
  try {
    await prisma.userActivityLog.createMany({
      data: activities.map((activity) => ({
        siteId: activity.siteId,
        userId: activity.userId,
        action: activity.action,
        entityId: activity.entityId,
        entityType: activity.entityType,
        details: activity.details || {},
        ipAddress: activity.ipAddress,
        userAgent: activity.userAgent,
      })),
      skipDuplicates: true,
    });

    console.log(`📝 AUDIT: Logged ${activities.length} activities`);
  } catch (error) {
    console.error("❌ BATCH AUDIT LOG FAILED (non-fatal):", error);
  }
}

/**
 * Get audit trail for a site
 */
export async function getSiteAuditTrail(
  siteId: string,
  limit: number = 50
): Promise<any[]> {
  try {
    return await prisma.userActivityLog.findMany({
      where: { siteId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch audit trail:", error);
    return [];
  }
}

/**
 * Get audit trail for a user
 */
export async function getUserAuditTrail(
  userId: string,
  limit: number = 50
): Promise<any[]> {
  try {
    return await prisma.userActivityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        site: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch audit trail:", error);
    return [];
  }
}

/**
 * Get recent activity across entire platform (admin only)
 */
export async function getRecentActivity(limit: number = 100): Promise<any[]> {
  try {
    return await prisma.userActivityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        site: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch recent activity:", error);
    return [];
  }
}
