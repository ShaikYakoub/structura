import Razorpay from "razorpay";
import crypto from "crypto";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("⚠️ Razorpay credentials are not set in environment variables");
}

// Initialize Razorpay instance
export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

/**
 * Validate payment signature from Razorpay checkout
 */
export function validatePaymentSignature(
  subscriptionId: string,
  paymentId: string,
  signature: string
): boolean {
  const text = `${paymentId}|${subscriptionId}`;
  const secret = process.env.RAZORPAY_KEY_SECRET!;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(text)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Validate webhook signature from Razorpay
 */
export function validateWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Helper to get plan details
 */
export async function getPlanDetails(planId: string) {
  try {
    const plan = await razorpayInstance.plans.fetch(planId);
    return plan;
  } catch (error) {
    console.error("Error fetching plan:", error);
    return null;
  }
}
