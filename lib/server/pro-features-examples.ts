/**
 * Server-Side Feature Gating Examples
 * 
 * This file demonstrates how to implement Pro feature checks in:
 * - API Routes
 * - Server Actions
 * - Server Components
 */

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { checkSubscription } from "@/app/actions/razorpay";

/**
 * Example 1: API Route Protection
 * Use this pattern to protect API endpoints that should only be accessible to Pro users
 */
export async function protectedApiRoute(request: NextRequest) {
  // Get user ID from your auth system (e.g., session, JWT, etc.)
  const userId = "user_123"; // Replace with actual auth check

  // Check Pro status
  const isPro = await checkSubscription(userId);

  if (!isPro) {
    return NextResponse.json(
      { error: "This feature requires a Pro subscription" },
      { status: 403 }
    );
  }

  // User is Pro, proceed with the protected logic
  return NextResponse.json({ message: "Access granted to Pro feature" });
}

/**
 * Example 2: Direct Database Check (More Efficient for API Routes)
 * Skip the server action and query the database directly
 */
export async function checkProStatusDirect(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isPro: true,
      razorpayCurrentPeriodEnd: true,
    },
  });

  if (!user) return false;

  return (
    user.isPro &&
    user.razorpayCurrentPeriodEnd !== null &&
    user.razorpayCurrentPeriodEnd > new Date()
  );
}

/**
 * Example 3: Site Limit Enforcement in API
 */
export async function publishSiteApi(request: NextRequest) {
  const userId = "user_123"; // Replace with actual auth check
  const { siteId } = await request.json();

  // Check Pro status
  const isPro = await checkProStatusDirect(userId);

  if (!isPro) {
    // Count user's published sites
    const publishedCount = await prisma.site.count({
      where: {
        userId,
        isPublished: true,
      },
    });

    const FREE_SITE_LIMIT = 3;
    if (publishedCount >= FREE_SITE_LIMIT) {
      return NextResponse.json(
        {
          error: `Free plan limit reached. You can only publish ${FREE_SITE_LIMIT} sites. Upgrade to Pro for unlimited sites.`,
          code: "SITE_LIMIT_REACHED",
        },
        { status: 403 }
      );
    }
  }

  // Proceed with publishing
  await prisma.site.update({
    where: { id: siteId },
    data: { isPublished: true },
  });

  return NextResponse.json({ success: true });
}

/**
 * Example 4: Custom Domain Check in API
 */
export async function setCustomDomainApi(request: NextRequest) {
  const userId = "user_123"; // Replace with actual auth check
  const { siteId, customDomain } = await request.json();

  // Check Pro status
  const isPro = await checkProStatusDirect(userId);

  if (!isPro) {
    return NextResponse.json(
      {
        error: "Custom domains are only available on the Pro plan",
        code: "PRO_FEATURE_REQUIRED",
      },
      { status: 403 }
    );
  }

  // Verify site belongs to user
  const site = await prisma.site.findFirst({
    where: {
      id: siteId,
      userId,
    },
  });

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  // Update custom domain
  await prisma.site.update({
    where: { id: siteId },
    data: { customDomain },
  });

  return NextResponse.json({ success: true });
}

/**
 * Example 5: Server Component Pro Status Check
 */
export async function getUserProStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isPro: true,
      razorpayCurrentPeriodEnd: true,
      razorpaySubscriptionId: true,
    },
  });

  if (!user) {
    return {
      isPro: false,
      periodEnd: null,
      subscriptionId: null,
    };
  }

  const isActive =
    user.isPro &&
    user.razorpayCurrentPeriodEnd !== null &&
    user.razorpayCurrentPeriodEnd > new Date();

  return {
    isPro: isActive,
    periodEnd: user.razorpayCurrentPeriodEnd,
    subscriptionId: user.razorpaySubscriptionId,
  };
}

/**
 * Example 6: Middleware-Level Feature Gate
 * Check Pro status and add to request headers
 */
export async function proCheckMiddleware(userId: string) {
  const isPro = await checkProStatusDirect(userId);
  
  // You can add this to request headers and use it downstream
  return {
    'x-user-is-pro': isPro.toString(),
  };
}

/**
 * Example 7: Feature-Specific Check Utility
 * Create reusable functions for different Pro features
 */
export const ProFeatures = {
  // Check if user can publish more sites
  canPublishSite: async (userId: string): Promise<{ allowed: boolean; reason?: string }> => {
    const isPro = await checkProStatusDirect(userId);
    
    if (isPro) {
      return { allowed: true };
    }

    const publishedCount = await prisma.site.count({
      where: { userId, isPublished: true },
    });

    const limit = 3;
    if (publishedCount >= limit) {
      return {
        allowed: false,
        reason: `Free plan limit reached (${limit} sites)`,
      };
    }

    return { allowed: true };
  },

  // Check if user can use custom domains
  canUseCustomDomain: async (userId: string): Promise<boolean> => {
    return await checkProStatusDirect(userId);
  },

  // Check if user can remove branding
  canRemoveBranding: async (userId: string): Promise<boolean> => {
    return await checkProStatusDirect(userId);
  },

  // Get user's feature limits
  getFeatureLimits: async (userId: string) => {
    const isPro = await checkProStatusDirect(userId);
    
    return {
      maxPublishedSites: isPro ? Infinity : 3,
      customDomain: isPro,
      removeBranding: isPro,
      prioritySupport: isPro,
      analytics: isPro,
    };
  },
};

/**
 * Example 8: Real-Time Pro Status Check with Caching
 * Use this for frequently accessed routes
 */
const proStatusCache = new Map<string, { isPro: boolean; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function checkProStatusCached(userId: string): Promise<boolean> {
  const cached = proStatusCache.get(userId);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.isPro;
  }

  const isPro = await checkProStatusDirect(userId);
  proStatusCache.set(userId, { isPro, timestamp: now });

  return isPro;
}

/**
 * Usage in an API Route (app/api/sites/[siteId]/publish/route.ts):
 * 
 * import { ProFeatures } from "@/lib/server/pro-features";
 * 
 * export async function POST(request: NextRequest) {
 *   const userId = "user_123"; // Get from auth
 *   const { siteId } = await request.json();
 *   
 *   const { allowed, reason } = await ProFeatures.canPublishSite(userId);
 *   
 *   if (!allowed) {
 *     return NextResponse.json({ error: reason }, { status: 403 });
 *   }
 *   
 *   // Proceed with publishing...
 * }
 */

/**
 * Usage in a Server Component (app/app/page.tsx):
 * 
 * import { getUserProStatus } from "@/lib/server/pro-features";
 * import { auth } from "@/lib/auth"; // Your auth system
 * 
 * export default async function DashboardPage() {
 *   const session = await auth();
 *   const { isPro, periodEnd } = await getUserProStatus(session.user.id);
 *   
 *   return (
 *     <div>
 *       {isPro ? (
 *         <ProDashboard periodEnd={periodEnd} />
 *       ) : (
 *         <FreeDashboard />
 *       )}
 *     </div>
 *   );
 * }
 */
