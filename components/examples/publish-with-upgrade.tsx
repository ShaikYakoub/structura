"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/billing/upgrade-modal";
import { checkSubscription } from "@/app/actions/razorpay";
import { Globe, Lock } from "lucide-react";
import { toast } from "sonner";

interface PublishWithUpgradeProps {
  userId: string;
  siteId: string;
  onPublish: () => Promise<void>;
}

/**
 * Example component showing how to implement feature gating for the publish action.
 * 
 * This can be adapted for any Pro feature:
 * - Custom domain configuration
 * - Site limit enforcement
 * - Advanced analytics
 * - Team collaboration
 */
export function PublishWithUpgrade({ userId, siteId, onPublish }: PublishWithUpgradeProps) {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    checkSubscriptionStatus();
  }, [userId]);

  const checkSubscriptionStatus = async () => {
    const status = await checkSubscription(userId);
    setIsPro(status);
    setLoading(false);
  };

  const handlePublishClick = async () => {
    // Check if user has Pro access
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }

    // User is Pro, proceed with publish
    setPublishing(true);
    try {
      await onPublish();
      toast.success("Site published successfully!");
    } catch (error) {
      toast.error("Failed to publish site");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <Button disabled>
        <Globe className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={handlePublishClick}
        disabled={publishing}
      >
        {isPro ? (
          <>
            <Globe className="mr-2 h-4 w-4" />
            {publishing ? "Publishing..." : "Publish Site"}
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Publish Site (Pro)
          </>
        )}
      </Button>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        userId={userId}
        planId={process.env.NEXT_PUBLIC_RAZORPAY_PLAN_ID || ""}
        feature="unlimited published sites"
      />
    </>
  );
}

/**
 * Example: Site Limit Enforcement
 * Use this pattern to limit free users to X published sites
 */
export function useSiteLimitCheck(userId: string, currentSiteCount: number) {
  const [isPro, setIsPro] = useState(false);
  const [canPublish, setCanPublish] = useState(false);
  const FREE_SITE_LIMIT = 3;

  useEffect(() => {
    checkSubscription(userId).then((status) => {
      setIsPro(status);
      setCanPublish(status || currentSiteCount < FREE_SITE_LIMIT);
    });
  }, [userId, currentSiteCount]);

  return {
    isPro,
    canPublish,
    sitesRemaining: isPro ? Infinity : Math.max(0, FREE_SITE_LIMIT - currentSiteCount),
    limit: FREE_SITE_LIMIT,
  };
}

/**
 * Example: Custom Domain Feature Gating
 */
export function CustomDomainInput({ userId, siteId }: { userId: string; siteId: string }) {
  const [isPro, setIsPro] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [domain, setDomain] = useState("");

  useEffect(() => {
    checkSubscription(userId).then(setIsPro);
  }, [userId]);

  const handleSaveDomain = () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }

    // Save custom domain logic here
    toast.success("Custom domain saved!");
  };

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          Custom Domain
          {!isPro && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Pro only
            </span>
          )}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="yourdomain.com"
            disabled={!isPro}
            className="flex-1 px-3 py-2 border rounded-md disabled:opacity-50"
          />
          <Button onClick={handleSaveDomain} disabled={!domain}>
            Save
          </Button>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        userId={userId}
        planId={process.env.NEXT_PUBLIC_RAZORPAY_PLAN_ID || ""}
        feature="custom domain support"
      />
    </>
  );
}
