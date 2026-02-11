# Production Setup Guide

## Overview

This guide covers Structura's production-ready setup including error tracking, legal compliance, SEO optimization, and support features.

---

## 1. Sentry Error Tracking

### Installation

Sentry has been installed and configured for production error tracking:

```bash
npm install @sentry/nextjs
```

### Configuration Files

**`sentry.client.config.ts`** - Client-side error tracking
- Performance monitoring: 10% sample rate
- Session replay: 100% on errors, 10% for sessions
- Filters common non-critical errors (ResizeObserver, cancelled operations)
- Removes sensitive data (cookies) before sending

**`sentry.server.config.ts`** - Server-side error tracking
- Network error filtering (ECONNRESET, ETIMEDOUT)
- Excludes super admin actions from noise
- 10% performance monitoring sample rate

**`sentry.edge.config.ts`** - Edge runtime error tracking
- Minimal configuration for edge functions
- 10% performance monitoring

**`app/global-error.tsx`** - Global error boundary
- Catches unhandled errors across the app
- Automatically reports to Sentry
- Shows user-friendly error UI
- Shows error details in development mode
- Provides "Try Again" and "Go Home" actions

### Environment Variables

Add to your `.env`:

```bash
NEXT_PUBLIC_SENTRY_DSN="https://your-key@o123456.ingest.sentry.io/123456"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"
```

### How to Get Sentry DSN

1. Sign up at [sentry.io](https://sentry.io)
2. Create a new project (select Next.js)
3. Copy the DSN from Project Settings → Client Keys
4. Generate auth token from User Settings → Auth Tokens (needed for source maps)

### Production Behavior

Sentry **only activates in production** (`NODE_ENV=production`):
- Development: Errors logged to console only
- Production: Errors sent to Sentry dashboard

### What Gets Tracked

**Automatically tracked:**
- Unhandled exceptions
- Promise rejections
- API route errors
- Middleware errors
- React component errors

**Performance monitoring:**
- Server-side rendering times
- API endpoint response times
- Database query performance
- External API calls

**Session replay (on errors):**
- User interactions before error
- Network requests
- Console logs
- DOM mutations

### Viewing Errors

Access your Sentry dashboard:
1. Go to [sentry.io](https://sentry.io)
2. View errors in Issues tab
3. See performance in Performance tab
4. Watch session replays in Replays tab

---

## 2. Legal Compliance Pages

### Pages Created

All legal pages are in the `app/(marketing)` route group:

**`/terms`** - Terms of Service ([app/(marketing)/terms/page.tsx](app/(marketing)/terms/page.tsx))
- User responsibilities
- Content ownership
- Prohibited content
- Subscription terms
- Termination policy
- Limitation of liability

**`/privacy`** - Privacy Policy ([app/(marketing)/privacy/page.tsx](app/(marketing)/privacy/page.tsx))
- Information collection
- Data usage
- Security measures
- GDPR rights
- Third-party services
- Data retention
- Children's privacy

**`/refund`** - Refund Policy ([app/(marketing)/refund/page.tsx](app/(marketing)/refund/page.tsx))
- 7-day money-back guarantee
- Cancellation process
- Refund eligibility
- Non-refundable items
- Dispute resolution

### Marketing Layout

**`app/(marketing)/layout.tsx`** - Shared layout for legal pages
- Navbar with logo and navigation
- Footer with legal links
- Support bubble widget
- Consistent styling

### Components

**`components/marketing/navbar.tsx`** - Header navigation
- Logo/brand name
- Features, Pricing, Templates links
- Sign In / Get Started buttons
- Sticky header with backdrop blur

**`components/marketing/footer.tsx`** - Site footer
- Four columns: Brand, Product, Legal, Support
- Links to all important pages
- Copyright notice
- Responsive grid layout

### Customization

Update legal pages with your actual:
- Company name
- Legal email addresses (legal@, privacy@, support@)
- Specific terms for your service
- Payment processor details
- Data storage locations
- Last updated dates

### SEO for Legal Pages

Each page has proper metadata:
- Page title
- Meta description
- Automatic Open Graph tags (inherited from root layout)

---

## 3. Platform Metadata & SEO

### Root Layout Updates

**`app/layout.tsx`** has comprehensive metadata:

**Title Template:**
```typescript
title: {
  default: "Structura - Build Websites in Minutes",
  template: "%s | Structura", // Page Title | Structura
}
```

**SEO Keywords:**
- website builder
- no-code
- landing page builder
- SaaS builder
- portfolio builder
- business website

**Open Graph (Social Sharing):**
- Optimized for Facebook, LinkedIn, Discord
- 1200x630px image (og-image.jpg)
- Proper title and description
- Site name and locale

**Twitter Card:**
- Large image card format
- Optimized titles and descriptions
- Custom image
- Creator handle (@structura)

**Robots Configuration:**
- Index: true (allow search engines)
- Follow: true (follow links)
- Max video preview, image preview, snippet

**Search Console Verification:**
- Google verification code placeholder
- Add your actual verification code

### Icons Setup

**Required icon files** (place in `public/` folder):
- `/favicon.ico` - 32x32 or 16x16
- `/favicon-16x16.png` - 16x16
- `/apple-touch-icon.png` - 180x180 (iOS home screen)
- `/og-image.jpg` - 1200x630 (social sharing)

**Generate icons using:**
- [Favicon Generator](https://realfavicongenerator.net/)
- [Open Graph Image Generator](https://www.opengraph.xyz/)

### Per-Page Metadata

Override metadata on individual pages:

```typescript
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Structura collects and protects your data",
  // Inherits Open Graph, Twitter, etc. from root
};
```

### Google Search Console Setup

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property for your domain
3. Get verification code
4. Add to `verification.google` in layout.tsx
5. Submit sitemap (optional): `/sitemap.xml`

---

## 4. Support Widget

### Support Bubble Component

**`components/marketing/support-bubble.tsx`** - Floating help widget

**Features:**
- Fixed bottom-right position
- Animated slide-in card
- Email support link (mailto:support@structura.com)
- Documentation link
- Response time message
- Toggle open/close with smooth animation

**Usage:**
Automatically included in marketing layout. Available on:
- `/terms`
- `/privacy`
- `/refund`
- Any page using `(marketing)` layout

**Customization:**

Update email address:
```tsx
<a href="mailto:your-email@structura.com">
  Email Support
</a>
```

Add more support options:
```tsx
<Button variant="outline" className="w-full justify-start" asChild>
  <a href="https://discord.gg/your-server">
    <MessageSquare className="mr-2 h-4 w-4" />
    Join Discord
  </a>
</Button>
```

### Styling

- Uses Tailwind CSS
- Matches your theme (light/dark mode)
- z-index: 50 (above most content)
- Hover animations with scale
- Smooth transitions

---

## 5. Deployment Checklist

### Before Production Launch

**1. Environment Variables:**
```bash
# Update these in production:
NEXT_PUBLIC_SENTRY_DSN="your-real-sentry-dsn"
SENTRY_AUTH_TOKEN="your-real-auth-token"
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://structura.com"
```

**2. Legal Pages:**
- [ ] Update company name throughout
- [ ] Set real email addresses (legal@, privacy@, support@)
- [ ] Review and customize terms to your service
- [ ] Verify refund policy matches your business model
- [ ] Update "Last updated" dates
- [ ] Have lawyer review (recommended)

**3. SEO Assets:**
- [ ] Create favicon.ico
- [ ] Create apple-touch-icon.png
- [ ] Create og-image.jpg (1200x630)
- [ ] Update Twitter handle in metadata
- [ ] Add Google verification code
- [ ] Update domain in Open Graph URLs

**4. Sentry Setup:**
- [ ] Create Sentry project
- [ ] Add DSN to environment
- [ ] Enable source maps upload
- [ ] Configure alerts
- [ ] Test error tracking in staging

**5. Support:**
- [ ] Set up support@structura.com email
- [ ] Configure email forwarding
- [ ] Test contact links
- [ ] Create FAQ/docs page (optional)

### Post-Launch

**1. Monitor Sentry:**
- Check for errors daily
- Set up Slack/email alerts
- Review performance metrics
- Watch session replays for UX issues

**2. Legal Compliance:**
- Add cookie consent banner (if needed for EU)
- Set up GDPR data export process
- Document data retention policy
- Train team on Terms enforcement

**3. SEO:**
- Submit to Google Search Console
- Create sitemap.xml
- Add structured data (schema.org)
- Monitor search rankings
- Set up Google Analytics (optional)

---

## 6. Testing

### Sentry Error Tracking

**Test in development:**
```typescript
// Add to any page to test Sentry
<button onClick={() => { throw new Error("Test error"); }}>
  Test Sentry
</button>
```

**Test in production:**
1. Deploy to production
2. Trigger an error
3. Check Sentry dashboard (within 30 seconds)
4. Verify source maps show correct file/line

### Legal Pages

**Manual checks:**
- [ ] All links work
- [ ] Email links open mail client
- [ ] Responsive on mobile
- [ ] Footer shows on all pages
- [ ] Support bubble appears
- [ ] Light/dark mode works

### SEO

**Test with tools:**
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Open Graph Debugger](https://www.opengraph.xyz/)

**Manual tests:**
- Share link on Twitter (check card preview)
- Share link on Facebook (check image/title)
- Add to iOS home screen (check icon)
- View in Google search results

---

## 7. Maintenance

### Regular Updates

**Monthly:**
- Review Sentry errors and fix top issues
- Check legal page accuracy (laws change)
- Update "Last updated" dates if terms change
- Monitor support email for common questions

**Quarterly:**
- Review and update SEO keywords
- Refresh Open Graph images
- Audit support widget effectiveness
- Check GDPR compliance updates

**Annually:**
- Full legal review with lawyer
- Update terms based on new features
- Refresh SEO strategy
- Review privacy policy for new data practices

### Sentry Maintenance

**Data retention:**
- Free plan: 30 days
- Paid plans: 90+ days

**Clean up:**
- Archive resolved issues
- Ignore recurring non-critical errors
- Update ignored errors list
- Review performance budgets

---

## 8. Cost Estimates

### Services

**Sentry:**
- Free tier: 5k errors/month
- Team plan: $26/month (50k errors)
- Business: $80/month (100k errors)

**Domain & Hosting:**
- Domain: ~$12/year
- Digital Ocean: ~$10-20/month
- Database: ~$7-15/month

**Email:**
- Resend: Free tier, then $20/month
- Professional email: ~$6/month (Google Workspace)

**Legal:**
- Terms/Privacy templates: Free (customize carefully)
- Lawyer review: $500-2000 (one-time, recommended)
- Ongoing compliance: DIY or $100-500/month

---

## 9. Support Resources

### Documentation

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Next.js Metadata Docs](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [GDPR Compliance Guide](https://gdpr.eu/)
- [Open Graph Protocol](https://ogp.me/)

### Templates

All files created in this setup:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `app/global-error.tsx`
- `app/(marketing)/layout.tsx`
- `app/(marketing)/terms/page.tsx`
- `app/(marketing)/privacy/page.tsx`
- `app/(marketing)/refund/page.tsx`
- `components/marketing/navbar.tsx`
- `components/marketing/footer.tsx`
- `components/marketing/support-bubble.tsx`
- Updated: `app/layout.tsx`, `.env`

### Contact

For setup questions:
- Check `/docs` directory for more guides
- Review existing templates
- Test in development before deploying

---

## Summary

✅ **Sentry Error Tracking** - Production-ready with smart filtering  
✅ **Legal Compliance** - Complete Terms, Privacy, Refund pages  
✅ **SEO Optimization** - Comprehensive metadata with Open Graph  
✅ **Support System** - Floating help bubble with email contact  
✅ **Production Safety** - Error boundaries, sensitive data filtering  
✅ **Best Practices** - GDPR compliance, accessibility, mobile-first  

Your Structura application is now production-ready with enterprise-grade error tracking, legal compliance, and user support features.
