"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { createSubscription, verifyPayment } from "@/app/actions/razorpay";
import Script from "next/script";

interface UpgradeButtonProps {
  userId: string;
  planId: string;
  planName?: string;
  planPrice?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function UpgradeButton({
  userId,
  planId,
  planName = "Pro Plan",
  planPrice = "₹999/month",
}: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const handleUpgrade = async () => {
    if (!razorpayLoaded) {
      toast.error("Payment system is loading. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create subscription on server
      const result = await createSubscription(userId, planId);

      if (!result.success || !result.subscriptionId) {
        throw new Error(result.error || "Failed to create subscription");
      }

      // Step 2: Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: result.subscriptionId,
        name: "Structura",
        description: planName,
        image: "/logo.png", // Your logo
        theme: {
          color: "#3399cc",
        },
        handler: async function (response: any) {
          // Step 3: Verify payment on server
          const verificationResult = await verifyPayment(
            userId,
            response.razorpay_payment_id,
            response.razorpay_subscription_id,
            response.razorpay_signature
          );

          if (verificationResult.success) {
            toast.success(verificationResult.message, {
              duration: 5000,
            });
            
            // Reload page to reflect Pro status
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else {
            toast.error(verificationResult.message);
          }
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
            toast.info("Payment cancelled");
          },
        },
        notes: {
          userId: userId,
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to initiate payment"
      );
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Load Razorpay Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => {
          console.error("Failed to load Razorpay script");
          toast.error("Failed to load payment system");
        }}
      />

      <Button
        onClick={handleUpgrade}
        disabled={isLoading || !razorpayLoaded}
        size="lg"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade to Pro - {planPrice}
          </>
        )}
      </Button>
    </>
  );
}
