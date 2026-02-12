import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import Razorpay from "razorpay";
import prisma from "@/lib/prisma";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is already Pro
    if (user.isPro) {
      return NextResponse.json(
        { error: "User is already on Pro plan" },
        { status: 400 }
      );
    }

    // Create Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PRO_PLAN_ID!, // You'll need to create this plan in Razorpay dashboard
      customer_notify: 1,
      total_count: 12, // 12 months
      customer: {
        name: user.name || "User",
        email: user.email,
        contact: "", // You might want to collect phone number
      },
    });

    // Store subscription details in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        razorpaySubscriptionId: subscription.id,
        razorpayPlanId: subscription.plan_id,
        isPro: true, // Mark as pro immediately, or wait for webhook confirmation
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      amount: subscription.customer_notify,
    });

  } catch (error) {
    console.error("Subscription creation error:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}