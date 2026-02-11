"use server";

import { getRazorpayInstance, validatePaymentSignature } from "@/lib/razorpay";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type SubscriptionResult = {
  success: boolean;
  subscriptionId?: string;
  error?: string;
};

export type VerificationResult = {
  success: boolean;
  message: string;
};

/**
 * Create a Razorpay subscription
 */
export async function createSubscription(
  userId: string,
  planId: string
): Promise<SubscriptionResult> {
  try {
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, razorpayCustomerId: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    let customerId = user.razorpayCustomerId;

    // Create customer if doesn't exist
    if (!customerId) {
      const razorpay = getRazorpayInstance();
      const customer = await razorpay.customers.create({
        email: user.email,
        name: user.name || user.email,
        fail_existing: 0,
      });

      customerId = customer.id;

      // Save customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { razorpayCustomerId: customerId },
      });
    }

    // Create subscription
    const razorpay = getRazorpayInstance();
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_id: customerId,
      total_count: 12, // 12 months
      quantity: 1,
      customer_notify: 1, // Send notification to customer
      notes: {
        userId: userId,
      },
    } as any);

    console.log("✅ Subscription created:", subscription.id);

    return {
      success: true,
      subscriptionId: subscription.id,
    };
  } catch (error) {
    console.error("❌ Error creating subscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create subscription",
    };
  }
}

/**
 * Verify payment and activate subscription
 */
export async function verifyPayment(
  userId: string,
  paymentId: string,
  subscriptionId: string,
  signature: string
): Promise<VerificationResult> {
  try {
    // Verify signature
    const isValid = validatePaymentSignature(
      subscriptionId,
      paymentId,
      signature
    );

    if (!isValid) {
      console.error("❌ Invalid payment signature");
      return {
        success: false,
        message: "Payment verification failed. Invalid signature.",
      };
    }

    // Get subscription details from Razorpay
    const razorpay = getRazorpayInstance();
    const subscription = await razorpay.subscriptions.fetch(
      subscriptionId
    );

    if (!subscription) {
      return {
        success: false,
        message: "Subscription not found",
      };
    }

    // Calculate period end (30 days from now)
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);

    // Update user in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        razorpaySubscriptionId: subscriptionId,
        razorpayPlanId: subscription.plan_id,
        razorpayCurrentPeriodEnd: periodEnd,
        isPro: true,
      },
    });

    console.log("✅ Payment verified and user upgraded to Pro");

    // Revalidate user-related pages
    revalidatePath("/app");
    revalidatePath("/");

    return {
      success: true,
      message: "Payment verified successfully! Welcome to Pro! 🎉",
    };
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Payment verification failed",
    };
  }
}

/**
 * Check if user has active subscription
 */
export async function checkSubscription(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isPro: true,
        razorpayCurrentPeriodEnd: true,
      },
    });

    if (!user) return false;

    // Check if user is Pro and subscription hasn't expired
    return (
      user.isPro &&
      user.razorpayCurrentPeriodEnd !== null &&
      user.razorpayCurrentPeriodEnd > new Date()
    );
  } catch (error) {
    console.error("Error checking subscription:", error);
    return false;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  userId: string
): Promise<VerificationResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { razorpaySubscriptionId: true },
    });

    if (!user?.razorpaySubscriptionId) {
      return {
        success: false,
        message: "No active subscription found",
      };
    }

    // Cancel on Razorpay
    const razorpay = getRazorpayInstance();
    await razorpay.subscriptions.cancel(
      user.razorpaySubscriptionId,
      true // Cancel at end of cycle
    );

    console.log("✅ Subscription cancelled:", user.razorpaySubscriptionId);

    return {
      success: true,
      message: "Subscription will be cancelled at the end of billing period",
    };
  } catch (error) {
    console.error("❌ Error cancelling subscription:", error);
    return {
      success: false,
      message: "Failed to cancel subscription",
    };
  }
}
