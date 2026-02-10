# Razorpay Subscriptions Setup Guide

## Overview

This implementation provides a complete Razorpay subscription system with:
- Subscription creation and management
- Payment verification with signature validation
- Webhook handling for subscription events
- Pro feature gating
- Frontend components for upgrade flow

## Prerequisites

1. **Razorpay Account**: Sign up at [razorpay.com](https://razorpay.com)
2. **Razorpay Plan**: Create a subscription plan in the Razorpay Dashboard

## Setup Steps

### 1. Database Migration

Run the Prisma migration to add Razorpay fields to User model:

```bash
npx prisma migrate dev --name add_razorpay_subscription
npx prisma generate
```

### 2. Environment Variables

Add these variables to your `.env` file:

```bash
# Razorpay Credentials (from Razorpay Dashboard -> Settings -> API Keys)
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID

# Razorpay Webhook Secret (you define this - use a strong random string)
RAZORPAY_WEBHOOK_SECRET=my_secret_webhook_key_123

# Razorpay Plan ID (from Razorpay Dashboard -> Subscriptions -> Plans)
NEXT_PUBLIC_RAZORPAY_PLAN_ID=plan_YOUR_PLAN_ID
```

**How to get credentials:**

1. **API Keys**: Razorpay Dashboard → Settings → API Keys → Generate Keys
2. **Plan ID**: Razorpay Dashboard → Subscriptions → Plans → Create Plan → Copy Plan ID
3. **Webhook Secret**: Create your own strong random string (e.g., use `openssl rand -hex 32`)

### 3. Create a Subscription Plan in Razorpay

1. Go to Razorpay Dashboard → Subscriptions → Plans
2. Click "Create New Plan"
3. Configure:
   - **Plan Name**: Pro Plan
   - **Amount**: ₹999 (or your price)
   - **Billing Period**: Monthly
   - **Billing Interval**: 1
   - **Total Billing Cycles**: Leave blank for infinite
4. Click "Create Plan"
5. Copy the **Plan ID** (starts with `plan_`)

### 4. Set Up Webhooks (for Production)

For testing locally, use ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Start your Next.js app
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Copy the HTTPS URL (e.g., https://a1b2c3d4.ngrok-free.app)
```

Configure webhook in Razorpay Dashboard:

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Click "Add New Webhook"
3. **Webhook URL**: `https://YOUR_NGROK_URL/api/webhooks/razorpay`
4. **Secret**: Use the same value as `RAZORPAY_WEBHOOK_SECRET`
5. **Active Events**: Select these events:
   - `subscription.charged`
   - `subscription.activated`
   - `subscription.cancelled`
   - `subscription.halted`
   - `subscription.paused`
   - `subscription.completed`
6. Click "Create Webhook"

## Usage

### Basic Usage in Your Components

```tsx
import { UpgradeModal } from "@/components/billing/upgrade-modal";
import { checkSubscription } from "@/app/actions/razorpay";
import { useState, useEffect } from "react";

function YourComponent({ userId }: { userId: string }) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    checkSubscription(userId).then(setIsPro);
  }, [userId]);

  const handleProFeature = () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }
    
    // Proceed with pro feature
  };

  return (
    <>
      <button onClick={handleProFeature}>
        Use Pro Feature
      </button>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        userId={userId}
        planId={process.env.NEXT_PUBLIC_RAZORPAY_PLAN_ID!}
        feature="this feature"
      />
    </>
  );
}
```

### Server-Side Feature Gating

```tsx
import { checkSubscription } from "@/app/actions/razorpay";

export default async function ServerComponent({ userId }: { userId: string }) {
  const isPro = await checkSubscription(userId);

  if (!isPro) {
    return <div>Upgrade to Pro to access this feature</div>;
  }

  return <div>Pro Feature Content</div>;
}
```

### Direct Upgrade Button

```tsx
import { UpgradeButton } from "@/components/billing/upgrade-button";

<UpgradeButton
  userId={userId}
  planId={process.env.NEXT_PUBLIC_RAZORPAY_PLAN_ID!}
  planName="Pro Plan"
  planPrice="₹999/month"
/>
```

## Testing

### Test Subscription Flow

1. Start your app: `npm run dev`
2. Navigate to a page with the UpgradeButton
3. Click the button
4. Use Razorpay test credentials:
   - **Test Card**: 4111 1111 1111 1111
   - **Expiry**: Any future date (e.g., 12/25)
   - **CVV**: Any 3 digits (e.g., 123)
5. Complete payment
6. Check database to verify `isPro` is now `true`

### Test Webhook Events

With ngrok running:

1. Go to Razorpay Dashboard → Webhooks
2. Click on your webhook
3. Go to "Webhook Logs"
4. Trigger test events or check real event logs
5. Verify your logs in terminal show webhook handling

## Subscription Lifecycle

1. **User clicks Upgrade** → `createSubscription` called
2. **Razorpay Modal opens** → User enters payment details
3. **Payment submitted** → `verifyPayment` called, signature validated
4. **User upgraded** → `isPro = true`, `razorpayCurrentPeriodEnd` set
5. **Monthly renewal** → Webhook `subscription.charged` → Period extended
6. **User cancels** → Webhook `subscription.cancelled` → `isPro = false`

## Security Notes

1. **Never expose `RAZORPAY_KEY_SECRET`** - Keep it server-side only
2. **Always validate webhook signatures** - Prevents fake webhook attacks
3. **Verify payment signatures** - Ensures payment authenticity
4. **Use HTTPS in production** - Required for Razorpay webhooks
5. **Rotate webhook secrets periodically** - Improves security

## Troubleshooting

### "Payment system is loading. Please try again."
- Check that Razorpay script loaded successfully
- Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set correctly

### "Failed to create subscription"
- Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are correct
- Check Razorpay Dashboard for API key status
- Ensure plan ID is valid

### Webhooks not working
- Verify ngrok is running and URL is correct
- Check webhook secret matches `RAZORPAY_WEBHOOK_SECRET`
- Look for webhook logs in Razorpay Dashboard
- Check your terminal for webhook handler logs

### User not upgraded after payment
- Check browser console for errors
- Verify signature validation passed
- Check database to see if user fields updated
- Review server logs for `verifyPayment` errors

## Production Deployment

1. Update `.env` with production Razorpay keys
2. Replace ngrok URL with your production domain
3. Update webhook URL in Razorpay Dashboard
4. Test with real payment (use small amount)
5. Monitor webhook logs and server logs
6. Set up Razorpay alerts for failed payments

## Support

- **Razorpay Docs**: https://razorpay.com/docs/subscriptions/
- **Razorpay Support**: support@razorpay.com
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-numbers/

## License

This implementation is part of the Structura project.
