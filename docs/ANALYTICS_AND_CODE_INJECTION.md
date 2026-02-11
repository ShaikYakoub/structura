# Analytics & Custom Code Injection

## Overview

This document describes the implementation of the **Privacy-First Analytics** and **Custom Code Injection** features in Structura.

## Features

### 1. Custom Code Injection

Allows site owners to inject custom HTML/JavaScript code into their live sites.

#### Database Schema

```prisma
model Site {
  // ... existing fields
  customHeadCode        String?  // Custom code injected in <head>
  customBodyCode        String?  // Custom code injected before </body>
  cookieBannerEnabled   Boolean @default(true)
  analytics             SiteAnalytics[]
}
```

#### Use Cases

**Head Code (`customHeadCode`):**
- Google Analytics
- Google Tag Manager
- Meta Pixel (Facebook)
- Custom fonts (Google Fonts)
- SEO verification tags

**Body Code (`customBodyCode`):**
- Chat widgets (Intercom, Crisp, Tawk.to)
- Live tracking scripts
- Custom widgets
- Deferred scripts

#### Admin Interface

**Location:** `/dashboard/[siteId]/settings` → Code Injection tab

**Component:** `components/dashboard/code-injection-settings.tsx`

**Features:**
- ⚠️ Warning alert about security risks
- Head code textarea with 10 rows
- Body code textarea with 10 rows
- Cookie banner toggle
- Save button with loading state
- Toast notifications

**API Endpoint:**
```
PATCH /api/sites/[siteId]/code-injection
```

**Request Body:**
```json
{
  "customHeadCode": "string | null",
  "customBodyCode": "string | null",
  "cookieBannerEnabled": "boolean"
}
```

#### Implementation in Site Layout

**File:** `app/_sites/[site]/layout.tsx`

```tsx
// In <head>
{site.customHeadCode && (
  <div
    dangerouslySetInnerHTML={{ __html: site.customHeadCode }}
    suppressHydrationWarning
  />
)}

// Before </body>
{site.customBodyCode && (
  <div
    dangerouslySetInnerHTML={{ __html: site.customBodyCode }}
    suppressHydrationWarning
  />
)}
```

---

### 2. Privacy-First Analytics

Internal analytics engine that tracks page views without collecting IP addresses.

#### Database Schema

```prisma
model SiteAnalytics {
  id        String   @id @default(cuid())
  siteId    String   @db.Uuid
  date      DateTime @db.Date  // Midnight UTC for daily aggregation
  path      String              // Page path (e.g., "/", "/about")
  views     Int      @default(1)
  createdAt DateTime @default(now())

  site Site @relation(fields: [siteId], references: [id], onDelete: Cascade)

  @@unique([siteId, date, path])  // One record per day per page
  @@index([siteId, date])         // Fast queries by site and date range
  @@index([siteId])               // Fast queries by site
}
```

**Key Design Principles:**
- **Daily Aggregation:** One record per (siteId, date, path)
- **Upsert Pattern:** Increment views if record exists, create if not
- **No PII:** No IP addresses, user agents, or personal data stored
- **Consent-Based:** Only tracks after user accepts cookies

#### Client-Side Tracking

**Component:** `components/analytics/tracker.tsx`

```tsx
<AnalyticsTracker siteId={site.id} />
```

**Behavior:**
- Only tracks in production (`process.env.NODE_ENV === "production"`)
- Checks localStorage for consent (`"cookie-consent" === "accepted"`)
- Tracks on every pathname change
- Fails silently to not break the site
- Invisible component (returns `null`)

**API Endpoint:**
```
POST /api/analytics
```

**Request Body:**
```json
{
  "siteId": "string",
  "path": "string"
}
```

**Implementation:**
```typescript
// Upsert pattern
await prisma.siteAnalytics.upsert({
  where: {
    siteId_date_path: {
      siteId,
      date: today,  // Midnight UTC
      path,
    },
  },
  update: {
    views: { increment: 1 },
  },
  create: {
    siteId,
    date: today,
    path,
    views: 1,
  },
});
```

#### Analytics Dashboard

**Component:** `components/dashboard/analytics.tsx`

**Location:** `/dashboard/[siteId]/analytics`

**Features:**

1. **Stats Cards:**
   - Total Views (last 30 days)
   - Top Page (most viewed path)
   - Trend (week-over-week percentage)

2. **Line Chart:**
   - Views over time (last 30 days)
   - Built with Recharts
   - X-axis: Date (formatted as "Jan 1")
   - Y-axis: View count
   - Tooltip with full date

3. **Top Pages Table:**
   - Ranked list (1-10)
   - Path and view count
   - Sorted by views descending

**API Endpoint:**
```
GET /api/analytics/[siteId]
```

**Response:**
```json
{
  "totalViews": 12345,
  "chartData": [
    { "date": "2024-01-01", "views": 150 },
    { "date": "2024-01-02", "views": 200 }
  ],
  "topPages": [
    { "path": "/", "views": 5000 },
    { "path": "/about", "views": 3000 }
  ]
}
```

**Data Processing:**
- Queries last 30 days from SiteAnalytics
- Aggregates views by date for chart
- Groups by path for top pages
- Calculates total views across all records

#### Cookie Banner

**Component:** `components/site/cookie-banner.tsx`

**Features:**
- Fixed bottom card (responsive)
- Cookie icon + description
- Accept/Decline buttons
- Close button (X)
- localStorage storage: `"cookie-consent"`

**Behavior:**
- Only shows if no consent stored
- "Accept" → enables tracking
- "Decline" → disables tracking
- Auto-hides after choice

**Implementation in Layout:**
```tsx
{site.cookieBannerEnabled && <CookieBanner />}
```

---

## Architecture

### Data Flow

```
User Visits Page
    ↓
AnalyticsTracker (Client)
    ↓
Check localStorage for consent
    ↓ (if accepted)
POST /api/analytics
    ↓
Upsert SiteAnalytics
    ↓ (increment views OR create new record)
Database Updated
    ↓
Admin Views Dashboard
    ↓
GET /api/analytics/[siteId]
    ↓
Aggregate last 30 days
    ↓
Display Charts + Stats
```

### Privacy Implementation

**What We Track:**
- Site ID
- Page path
- Date (midnight UTC)
- View count

**What We DON'T Track:**
- IP addresses
- User agents
- Cookies (except consent)
- Referrers
- Personal information
- Session data
- Click positions
- Browser fingerprints

**GDPR Compliance:**
- Cookie consent banner
- Opt-in tracking (not opt-out)
- No personal data collection
- User can decline at any time
- Transparent about data usage

---

## Installation

### Dependencies

```bash
npm install recharts
```

### Database Migration

```bash
npx prisma db push
```

---

## Usage

### Admin: Setup Custom Code

1. Go to `/dashboard/[siteId]/settings`
2. Navigate to "Code Injection" tab
3. Paste Google Analytics code in "Head Code"
4. Paste Intercom widget in "Body Code"
5. Enable/disable cookie banner
6. Click "Save Settings"

### Admin: View Analytics

1. Go to `/dashboard/[siteId]/analytics`
2. View total views (last 30 days)
3. See views over time chart
4. Check top 10 pages

### User: Cookie Consent

1. Visit any site page
2. See cookie banner at bottom
3. Click "Accept" to enable tracking
4. Or click "Decline" to opt out
5. Banner disappears after choice

---

## Code Examples

### Example: Google Analytics in Head Code

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-XXXXX-Y"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'UA-XXXXX-Y');
</script>
```

### Example: Intercom in Body Code

```html
<!-- Intercom Widget -->
<script>
  window.intercomSettings = {
    api_base: "https://api-iam.intercom.io",
    app_id: "YOUR_APP_ID"
  };
</script>
<script>
(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/YOUR_APP_ID';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
</script>
```

---

## Security Considerations

### Code Injection

⚠️ **Warning:** Custom code injection is powerful but dangerous.

**Risks:**
- Malformed HTML can break the site
- Malicious scripts can compromise security
- Heavy scripts can slow page load

**Best Practices:**
- Test code in a staging environment first
- Only inject code from trusted sources
- Minimize script size and load time
- Use `async` or `defer` for scripts
- Monitor site performance after adding code

**admin UI Warning:**
```
⚠️ Advanced Users Only
Be careful when injecting custom code. Malformed or malicious code
can break your site or compromise security.
```

---

## API Reference

### PATCH `/api/sites/[siteId]/code-injection`

Update custom code injection settings.

**Request:**
```json
{
  "customHeadCode": "<script>...</script>",
  "customBodyCode": "<div>...</div>",
  "cookieBannerEnabled": true
}
```

**Response:**
```json
{
  "id": "site-id",
  "customHeadCode": "<script>...</script>",
  "customBodyCode": "<div>...</div>",
  "cookieBannerEnabled": true
}
```

### POST `/api/analytics`

Record a page view.

**Request:**
```json
{
  "siteId": "site-id",
  "path": "/about"
}
```

**Response:**
```json
{
  "success": true
}
```

**Note:** Always returns success to not break the site.

### GET `/api/analytics/[siteId]`

Fetch analytics data for a site.

**Response:**
```json
{
  "totalViews": 12345,
  "chartData": [
    { "date": "2024-01-01", "views": 150 },
    { "date": "2024-01-02", "views": 200 }
  ],
  "topPages": [
    { "path": "/", "views": 5000 },
    { "path": "/about", "views": 3000 }
  ]
}
```

---

## Testing

### Test Code Injection

1. Add a simple script to Head Code:
   ```html
   <script>console.log('Head code works!');</script>
   ```

2. Add a visible div to Body Code:
   ```html
   <div style="position:fixed;bottom:10px;right:10px;background:red;color:white;padding:10px;">Body code works!</div>
   ```

3. Visit your live site
4. Open DevTools console → should see "Head code works!"
5. Check bottom-right corner → should see red div

### Test Analytics Tracking

1. Enable cookie banner in settings
2. Visit your live site (must be production)
3. Accept cookies in the banner
4. Navigate to different pages
5. Wait a few minutes
6. Check `/dashboard/[siteId]/analytics`
7. Should see views incrementing

### Test Cookie Consent

1. Clear localStorage in DevTools
2. Refresh page
3. Cookie banner should appear
4. Click "Decline"
5. Check localStorage → `"cookie-consent": "declined"`
6. Navigate to other pages
7. No tracking should occur
8. Banner should not reappear

---

## Performance

### Database Indexes

```prisma
@@unique([siteId, date, path])  // Prevent duplicates, enable upsert
@@index([siteId, date])         // Fast date range queries
@@index([siteId])               // Fast site-wide queries
```

**Query Performance:**
- Unique constraint allows instant upserts
- Date index enables fast 30-day queries
- Site index speeds up dashboard loading

### Client Impact

**AnalyticsTracker:**
- Runs once per page navigation
- Async POST request (non-blocking)
- Fails silently on error
- ~50ms overhead

**CookieBanner:**
- Only renders if no consent
- Minimal DOM impact
- Auto-removes after choice

---

## Troubleshooting

### Analytics Not Tracking

**Issue:** Dashboard shows 0 views despite site traffic.

**Solutions:**
1. Check if `process.env.NODE_ENV === "production"`
   - Analytics only tracks in production
2. Check localStorage for `"cookie-consent": "accepted"`
   - User must accept cookies first
3. Open DevTools Network tab
   - Look for POST to `/api/analytics`
   - Check for 200 response
4. Check database:
   ```sql
   SELECT * FROM "SiteAnalytics" WHERE "siteId" = 'your-site-id';
   ```

### Custom Code Not Appearing

**Issue:** Custom code doesn't show on live site.

**Solutions:**
1. Check if code was saved:
   - Go to settings → Code Injection
   - Verify code is in textareas
2. Clear browser cache and reload
3. Check DevTools Elements tab:
   - Search for your custom code
   - Look for errors in Console
4. Verify site layout is fetching fields:
   ```tsx
   select: {
     customHeadCode: true,
     customBodyCode: true,
   }
   ```

### Cookie Banner Not Showing

**Issue:** Cookie banner doesn't appear.

**Solutions:**
1. Check if enabled in settings
2. Clear localStorage:
   ```js
   localStorage.removeItem('cookie-consent');
   ```
3. Refresh page
4. Check DevTools Console for errors

---

## Future Enhancements

**Potential Additions:**
- [ ] Real-time analytics (WebSocket)
- [ ] User session tracking
- [ ] Conversion funnel analysis
- [ ] A/B testing integration
- [ ] Export to CSV/PDF
- [ ] Email reports (daily/weekly)
- [ ] Custom date range selector
- [ ] Compare time periods
- [ ] Geographic analytics (country-level, no IP)
- [ ] Device type breakdown (mobile vs desktop)
- [ ] Referrer tracking (privacy-friendly)
- [ ] Custom event tracking
- [ ] Goal tracking and conversions

---

## Related Documentation

- [Email System](./EMAIL_AND_SEO.md) - Real email sending with Resend
- [SEO System](./EMAIL_AND_SEO.md) - Dynamic metadata and SEO fields
- [Template System](./TEMPLATE_SYSTEM.md) - Site cloning with atomic transactions
- [Multi-Tenancy](./MULTI_TENANCY.md) - Subdomain and custom domain routing

---

## Credits

**Built with:**
- Next.js 15 (App Router)
- Prisma (Database ORM)
- Recharts (Analytics charts)
- React (UI components)
- TypeScript (Type safety)

**Privacy-First Design:**
- No IP address collection
- No third-party tracking
- Cookieless by default
- GDPR compliant
- User consent required

---

**Last Updated:** 2024
**Version:** 1.0.0
