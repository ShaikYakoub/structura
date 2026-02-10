import { NextRequest, NextResponse } from "next/server";
import { validateWebhookSignature } from "@/lib/razorpay";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Get the raw body as text
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      console.error("❌ No signature provided");
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const isValid = validateWebhookSignature(body, signature, webhookSecret);

    if (!isValid) {
      console.error("❌ Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse the event
    const event = JSON.parse(body);
    const eventType = event.event;

    console.log("🔔 Webhook received:", eventType);

    switch (eventType) {
      case "subscription.charged":
        await handleSubscriptionCharged(event);
        break;

      case "subscription.activated":
        await handleSubscriptionActivated(event);
        break;

      case "subscription.cancelled":
        await handleSubscriptionCancelled(event);
        break;

      case "subscription.halted":
      case "subscription.paused":
        await handleSubscriptionHalted(event);
        break;

      case "subscription.completed":
        await handleSubscriptionCompleted(event);
        break;

      default:
        console.log("🤷 Unhandled event type:", eventType);
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCharged(event: any) {
  const subscription = event.payload.subscription.entity;
  const subscriptionId = subscription.id;

  console.log("💰 Subscription charged:", subscriptionId);

  // Find user by subscription ID
  const user = await prisma.user.findFirst({
    where: { razorpaySubscriptionId: subscriptionId },
  });

  if (!user) {
    console.error("User not found for subscription:", subscriptionId);
    return;
  }

  // Calculate new period end (30 days from now)
  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + 30);

  // Update user subscription
  await prisma.user.update({
    where: { id: user.id },
    data: {
      razorpayCurrentPeriodEnd: periodEnd,
      isPro: true,
    },
  });

  console.log("✅ User subscription renewed:", user.email);
}

async function handleSubscriptionActivated(event: any) {
  const subscription = event.payload.subscription.entity;
  const subscriptionId = subscription.id;

  console.log("✨ Subscription activated:", subscriptionId);

  const user = await prisma.user.findFirst({
    where: { razorpaySubscriptionId: subscriptionId },
  });

  if (!user) {
    console.error("User not found for subscription:", subscriptionId);
    return;
  }

  // Calculate period end
  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + 30);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isPro: true,
      razorpayCurrentPeriodEnd: periodEnd,
    },
  });

  console.log("✅ User activated as Pro:", user.email);
}

async function handleSubscriptionCancelled(event: any) {
  const subscription = event.payload.subscription.entity;
  const subscriptionId = subscription.id;

  console.log("❌ Subscription cancelled:", subscriptionId);

  const user = await prisma.user.findFirst({
    where: { razorpaySubscriptionId: subscriptionId },
  });

  if (!user) {
    console.error("User not found for subscription:", subscriptionId);
    return;
  }

  // Revoke Pro access immediately
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isPro: false,
      razorpayCurrentPeriodEnd: new Date(), // Set to now
    },
  });

  console.log("✅ Pro access revoked:", user.email);
}

async function handleSubscriptionHalted(event: any) {
  const subscription = event.payload.subscription.entity;
  const subscriptionId = subscription.id;

  console.log("⏸️ Subscription halted/paused:", subscriptionId);

  const user = await prisma.user.findFirst({
    where: { razorpaySubscriptionId: subscriptionId },
  });

  if (!user) return;

  // Revoke Pro access when payment fails
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isPro: false,
    },
  });

  console.log("✅ Pro access suspended:", user.email);
}

async function handleSubscriptionCompleted(event: any) {
  const subscription = event.payload.subscription.entity;
  const subscriptionId = subscription.id;

  console.log("🏁 Subscription completed:", subscriptionId);

  const user = await prisma.user.findFirst({
    where: { razorpaySubscriptionId: subscriptionId },
  });

  if (!user) return;

  // Mark subscription as ended
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isPro: false,
      razorpayCurrentPeriodEnd: new Date(),
    },
  });

  console.log("✅ Subscription ended:", user.email);
}
