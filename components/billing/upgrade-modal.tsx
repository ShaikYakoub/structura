"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UpgradeButton } from "./upgrade-button";
import { Check } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  planId: string;
  feature?: string;
}

const PRO_FEATURES = [
  "Unlimited published sites",
  "Custom domain support",
  "Remove Structura branding",
  "Priority support",
  "Advanced analytics",
  "Team collaboration (coming soon)",
];

export function UpgradeModal({
  isOpen,
  onClose,
  userId,
  planId,
  feature = "this feature",
}: UpgradeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Upgrade to Pro</DialogTitle>
          <DialogDescription>
            Unlock {feature} and all premium features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Features List */}
          <div className="space-y-2">
            {PRO_FEATURES.map((feat, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm">{feat}</span>
              </div>
            ))}
          </div>

          {/* Upgrade Button */}
          <UpgradeButton
            userId={userId}
            planId={planId}
            planName="Pro Plan"
            planPrice="₹999/month"
          />

          <p className="text-xs text-center text-muted-foreground">
            Cancel anytime. No questions asked.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
