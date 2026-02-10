"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpgradeModal } from "@/components/billing/upgrade-modal";
import { checkSubscription, cancelSubscription } from "@/app/actions/razorpay";
import { toast } from "sonner";
import { Sparkles, Crown, Calendar, CreditCard } from "lucide-react";

interface BillingDashboardProps {
  userId: string;
}

export function BillingDashboard({ userId }: BillingDashboardProps) {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadSubscriptionStatus();
  }, [userId]);

  const loadSubscriptionStatus = async () => {
    setLoading(true);
    const status = await checkSubscription(userId);
    setIsPro(status);
    setLoading(false);
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll keep Pro access until the end of your billing period.")) {
      return;
    }

    setCancelling(true);
    const result = await cancelSubscription(userId);
    
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    
    setCancelling(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isPro ? (
                  <>
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Pro Plan
                  </>
                ) : (
                  <>Free Plan</>
                )}
              </CardTitle>
              <CardDescription>
                {isPro
                  ? "You have access to all Pro features"
                  : "Upgrade to unlock premium features"}
              </CardDescription>
            </div>
            {isPro && (
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Active
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isPro ? (
            <>
              {/* Pro Features */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Crown className="h-4 w-4 text-muted-foreground" />
                  <span>Unlimited published sites</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Crown className="h-4 w-4 text-muted-foreground" />
                  <span>Custom domain support</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Crown className="h-4 w-4 text-muted-foreground" />
                  <span>Remove Structura branding</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Crown className="h-4 w-4 text-muted-foreground" />
                  <span>Priority support</span>
                </div>
              </div>

              {/* Billing Info */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Billing
                  </span>
                  <span className="font-medium">₹999/month</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Next billing
                  </span>
                  <span className="font-medium">Auto-renews monthly</span>
                </div>
              </div>

              {/* Cancel Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCancelSubscription}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Cancel Subscription"}
              </Button>
            </>
          ) : (
            <>
              {/* Free Plan Features */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>• 3 published sites</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>• Subdomain only</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>• Structura branding</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>• Community support</span>
                </div>
              </div>

              {/* Upgrade Button */}
              <Button
                className="w-full"
                onClick={() => setShowUpgradeModal(true)}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        userId={userId}
        planId={process.env.NEXT_PUBLIC_RAZORPAY_PLAN_ID || ""}
        feature="all Pro features"
      />
    </>
  );
}
