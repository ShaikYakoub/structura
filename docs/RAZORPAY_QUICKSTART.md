# Razorpay Quick Start Guide

This is a condensed version of the full [RAZORPAY_SETUP.md](./RAZORPAY_SETUP.md) guide. Follow these steps to get your Razorpay subscriptions up and running quickly.

## ⚡ Prerequisites

- [ ] Node.js and npm installed
- [ ] Razorpay account (sign up at [razorpay.com](https://razorpay.com))
- [ ] Prisma CLI: `npm install -g prisma`

## 🚀 Quick Setup (10 minutes)

### Step 1: Get Razorpay Credentials (2 min)

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to **Settings → API Keys**
3. Click **Generate Test Key** (or use existing key)
4. Copy your **Key ID** (starts with `rzp_test_`) and **Key Secret**

### Step 2: Create a Subscription Plan (2 min)

1. In Razorpay Dashboard, go to **Subscriptions → Plans**
2. Click **Create New Plan**
3. Fill in:
   - **Plan Name**: Pro Plan
   - **Billing Amount**: ₹999 (or your price)
   - **Billing Period**: Monthly
   - **Billing Interval**: 1
4. Click **Create Plan**
5. Copy the **Plan ID** (starts with `plan_`)

### Step 3: Configure Environment Variables (1 min)

Create or update your `.env` file:

```bash
# Razorpay API Keys
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY_HERE

# Public Keys (for frontend)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
NEXT_PUBLIC_RAZORPAY_PLAN_ID=plan_YOUR_PLAN_ID_HERE

# Webhook Secret (any secure random string)
RAZORPAY_WEBHOOK_SECRET=my_super_secret_webhook_key_12345
```

**⚠️ Important**: Never commit your `.env` file to git!

### Step 4: Run Database Migration (1 min)

```bash
# Run the migration to add Razorpay fields to User table
npx prisma migrate dev --name add_razorpay_subscription

# Regenerate Prisma Client
npx prisma generate
```

This adds these fields to your User model:
- `razorpayCustomerId`
- `razorpaySubscriptionId`
- `razorpayPlanId`
- `razorpayCurrentPeriodEnd`
- `isPro`

### Step 5: Start Your Dev Server (1 min)

```bash
npm run dev
```

Your app should now be running at `http://localhost:3000`

## 🧪 Testing (5 minutes)

### Test Payment Flow

1. Navigate to a page with the upgrade button
2. Click **Upgrade to Pro**
3. Use Razorpay test card:
   - **Card Number**: 4111 1111 1111 1111
   - **Expiry**: Any future date (e.g., 12/25)
   - **CVV**: Any 3 digits (e.g., 123)
   - **Name**: Any name
4. Complete the payment
5. You should see:
   - Success toast message
   - Page reload
   - Pro features unlocked

### Verify in Database

```bash
npx prisma studio
```

Open the User table and check:
- `isPro` should be `true`
- `razorpaySubscriptionId` should be set
- `razorpayCurrentPeriodEnd` should be ~30 days from now

## 🪝 Webhook Setup (Optional for Testing)

Webhooks handle subscription lifecycle events (renewals, cancellations, etc.). For local testing:

### 1. Install ngrok (if not installed)

```bash
# Windows (with Chocolatey)
choco install ngrok

# Or download from https://ngrok.com/download
```

### 2. Start ngrok tunnel

```bash
# In a new terminal
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### 3. Configure webhook in Razorpay

1. Go to [Razorpay Dashboard → Webhooks](https://dashboard.razorpay.com/app/webhooks)
2. Click **Add New Webhook**
3. Fill in:
   - **Webhook URL**: `https://YOUR_NGROK_URL/api/webhooks/razorpay`
   - **Secret**: Same as `RAZORPAY_WEBHOOK_SECRET` in your `.env`
   - **Alert Email**: Your email
4. Select these events:
   - ✅ `subscription.charged`
   - ✅ `subscription.activated`
   - ✅ `subscription.cancelled`
   - ✅ `subscription.halted`
   - ✅ `subscription.paused`
   - ✅ `subscription.completed`
5. Click **Create Webhook**

### 4. Test webhook

1. Go back to your app and complete a test subscription
2. Check your ngrok terminal - you should see POST requests to `/api/webhooks/razorpay`
3. Check your app's terminal - you should see log messages with emojis (💰, ✨, etc.)

## 📦 Integration Examples

### Example 1: Basic Upgrade Button

```tsx
import { UpgradeButton } from "@/components/billing/upgrade-button";

export default function MyPage() {
  return (
    <UpgradeButton
      userId="user_123"
      planId={process.env.NEXT_PUBLIC_RAZORPAY_PLAN_ID!}
      planName="Pro Plan"
      planPrice="₹999/month"
    />
  );
}
```

### Example 2: Feature Gating Modal

```tsx
import { useState } from "react";
import { UpgradeModal } from "@/components/billing/upgrade-modal";
import { Button } from "@/components/ui/button";

export default function CustomDomainSection() {
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <>
      <Button onClick={() => setShowUpgrade(true)}>
        Set Custom Domain
      </Button>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        userId="user_123"
        planId={process.env.NEXT_PUBLIC_RAZORPAY_PLAN_ID!}
        feature="custom domain support"
      />
    </>
  );
}
```

### Example 3: Check Pro Status

```tsx
import { checkSubscription } from "@/app/actions/razorpay";
import { useEffect, useState } from "react";

export default function ProFeature() {
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    checkSubscription("user_123").then(setIsPro);
  }, []);

  if (!isPro) {
    return <div>Upgrade to access this feature</div>;
  }

  return <div>Pro Feature Content</div>;
}
```

### Example 4: Server-Side Check

```tsx
// Server Component
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await prisma.user.findUnique({
    where: { id: "user_123" },
    select: { isPro: true, razorpayCurrentPeriodEnd: true },
  });

  const isPro = user?.isPro && 
                user?.razorpayCurrentPeriodEnd! > new Date();

  return (
    <div>
      {isPro ? "Pro Dashboard" : "Free Dashboard"}
    </div>
  );
}
```

## ✅ Verification Checklist

- [ ] Environment variables set in `.env`
- [ ] Database migration completed (`npx prisma migrate dev`)
- [ ] Dev server running (`npm run dev`)
- [ ] Test payment completed successfully
- [ ] User's `isPro` field updated in database
- [ ] Webhook endpoint configured (optional)
- [ ] Test webhook received (optional)

## 🎯 What's Next?

1. **Integrate feature gating** into your existing components:
   - Publish button
   - Custom domain settings
   - Site limit checks

2. **Add billing dashboard** to your app:
   ```tsx
   import { BillingDashboard } from "@/components/billing/billing-dashboard";
   ```

3. **Test subscription lifecycle**:
   - Subscribe → Verify activation
   - Wait for webhook events
   - Test cancellation flow

4. **Go to production**:
   - Switch to live API keys (starts with `rzp_live_`)
   - Update webhook URL to your production domain
   - Test with real payment methods

## 📚 Full Documentation

For detailed information, see:
- [RAZORPAY_SETUP.md](./RAZORPAY_SETUP.md) - Complete setup guide
- [components/billing/](../components/billing/) - Billing components
- [app/actions/razorpay.ts](../app/actions/razorpay.ts) - Server actions
- [app/api/webhooks/razorpay/](../app/api/webhooks/razorpay/) - Webhook handler

## 🆘 Troubleshooting

### "Payment successful but isPro still false"

- Check browser console for verification errors
- Check server terminal for error messages
- Verify `RAZORPAY_KEY_SECRET` is correct in `.env`

### "Webhook not receiving events"

- Verify ngrok is running and URL is correct
- Check webhook secret matches in `.env` and Razorpay Dashboard
- Look for errors in ngrok terminal

### "Invalid signature" error

- Regenerate your API keys in Razorpay Dashboard
- Update `.env` file with new keys
- Restart your dev server

### Need Help?

- Check the full [RAZORPAY_SETUP.md](./RAZORPAY_SETUP.md) guide
- Review example code in [components/examples/](../components/examples/)
- Check Razorpay docs: https://razorpay.com/docs/

---

**🎉 Congratulations!** You now have a fully functional subscription billing system!
