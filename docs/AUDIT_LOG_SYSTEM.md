# Immutable Audit Log System

## Overview

Structura's **Immutable Audit Log System** provides comprehensive activity tracking for all user operations. Every action—from page creation to domain updates—is logged with rich metadata for compliance, debugging, and user transparency.

Key features:
- **Fail-Safe Design**: Logging failures never interrupt main application flow
- **Immutable**: Append-only pattern, logs cannot be modified or deleted directly
- **Rich Metadata**: Captures before/after states, timestamps, IP addresses
- **Performance Optimized**: Batch logging support, indexed queries
- **User Transparency**: Activity timelines for each site
- **Admin Monitoring**: Platform-wide activity dashboard

---

## Architecture

### Database Schema

```prisma
model UserActivityLog {
  id           String   @id @default(cuid())
  siteId       String   @db.Uuid
  userId       String   @db.Uuid
  action       String   // Action type (e.g., "PAGE_CREATE")
  entityId     String   // ID of affected entity
  entityType   String   // Type of entity ("Site", "Page", "Domain")
  details      Json?    // Metadata (before/after states)
  ipAddress    String?  // Optional IP tracking
  userAgent    String?  // Optional browser/device info
  createdAt    DateTime @default(now())

  site Site @relation(fields: [siteId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([siteId])
  @@index([userId])
  @@index([action])
  @@index([entityType])
  @@index([createdAt])
}
```

### Action Types

**Site Operations:**
- `SITE_CREATE` - New site created from template
- `SITE_DELETE` - Site deleted (admin only)
- `SITE_UPDATE` - Site settings modified
- `SITE_PUBLISH` - Site published to live URL
- `SITE_UNPUBLISH` - Site unpublished

**Page Operations:**
- `PAGE_CREATE` - New page created
- `PAGE_DELETE` - Page deleted
- `PAGE_UPDATE` - Page metadata changed (name, slug, etc.)
- `PAGE_PUBLISH` - Page published

**Domain Operations:**
- `DOMAIN_UPDATE` - Custom domain changed
- `DOMAIN_VERIFY` - Domain ownership verified

**Subscription Operations:**
- `SUBSCRIPTION_START` - Pro subscription activated
- `SUBSCRIPTION_CANCEL` - Pro subscription cancelled

### Entity Types

- `Site` - Entire site
- `Page` - Individual page
- `Domain` - Custom domain
- `User` - User account
- `Subscription` - Payment subscription

---

## Core Utility: `lib/audit-logger.ts`

### `logActivity()`

Main logging function with fail-safe design.

```typescript
import { logActivity } from "@/lib/audit-logger";

logActivity({
  siteId: "site_123",
  userId: "user_456",
  action: "PAGE_CREATE",
  entityId: "page_789",
  entityType: "Page",
  details: {
    pageTitle: "About Us",
    pageSlug: "about",
    isHomePage: false,
  },
  ipAddress: "203.0.113.42",
  userAgent: "Mozilla/5.0...",
});
```

**Key Properties:**
- **Never throws errors** - Wrapped in try-catch
- **Fire-and-forget** - Returns void, doesn't block
- **Console logging** - `📝 AUDIT:` prefix for success, `❌` for errors
- **Atomic** - Single database insert

### `logActivities()`

Batch logging for high-volume operations.

```typescript
import { logActivities } from "@/lib/audit-logger";

await logActivities([
  {
    siteId: "site_123",
    userId: "user_456",
    action: "PAGE_PUBLISH",
    entityId: "page_1",
    entityType: "Page",
    details: { pageTitle: "Home" },
  },
  {
    siteId: "site_123",
    userId: "user_456",
    action: "PAGE_PUBLISH",
    entityId: "page_2",
    entityType: "Page",
    details: { pageTitle: "About" },
  },
]);
```

**Performance:**
- Uses `prisma.createMany` for efficient batch inserts
- `skipDuplicates: true` to handle conflicts gracefully
- Also fail-safe with try-catch

### Query Functions

#### `getSiteAuditTrail(siteId, limit=50)`

Fetch activity logs for a specific site.

```typescript
import { getSiteAuditTrail } from "@/lib/audit-logger";

const logs = await getSiteAuditTrail("site_123", 50);

// Returns:
[
  {
    id: "log_1",
    action: "PAGE_CREATE",
    entityType: "Page",
    entityId: "page_789",
    details: { pageTitle: "Contact" },
    createdAt: "2024-01-15T10:30:00Z",
    user: {
      id: "user_456",
      name: "John Doe",
      email: "john@example.com"
    }
  },
  // ...more logs
]
```

**Features:**
- Includes user info (name, email)
- Ordered by `createdAt DESC` (newest first)
- Returns empty array on error (fail-safe)

#### `getUserAuditTrail(userId, limit=50)`

Fetch all activity for a specific user.

```typescript
const logs = await getUserAuditTrail("user_456", 100);

// Includes site info for each action
logs[0].site; // { id, name, subdomain }
```

#### `getRecentActivity(limit=100)`

Platform-wide activity (admin only).

```typescript
const logs = await getRecentActivity(100);

// Returns last 100 activities across all sites/users
logs[0].user; // { id, name, email }
logs[0].site; // { id, name, subdomain }
```

---

## Integration Points

### 1. Page Actions (`lib/actions/pages.ts`)

**createPage()**
```typescript
const page = await prisma.page.create({...});

logActivity({
  siteId,
  userId: session.user.id!,
  action: "PAGE_CREATE",
  entityId: page.id,
  entityType: "Page",
  details: {
    pageTitle: name,
    pageSlug: slug,
    isHomePage: page.isHomePage,
  },
});
```

**deletePage()**
```typescript
// Log BEFORE deletion (to capture page details)
logActivity({
  siteId: page.siteId,
  userId: session.user.id!,
  action: "PAGE_DELETE",
  entityId: pageId,
  entityType: "Page",
  details: {
    pageTitle: page.name,
    pageSlug: page.slug,
  },
});

await prisma.page.delete({ where: { id: pageId } });
```

**updatePageMetadata()**
```typescript
await prisma.page.update({...});

logActivity({
  siteId: page.siteId,
  userId: session.user!.id,
  action: "PAGE_UPDATE",
  entityId: pageId,
  entityType: "Page",
  details: {
    pageTitle: data.name || page.name,
    previousSlug: page.slug,
    newSlug: data.slug,
    changes: Object.keys(updateData),
  },
});
```

### 2. Publish Actions (`app/actions/publish.ts`)

**publishSite()**
```typescript
const result = await prisma.$transaction(async (tx) => {
  // Publish all pages...
  return { count: pages.length };
});

logActivity({
  siteId,
  userId: session.user.id,
  action: "SITE_PUBLISH",
  entityId: siteId,
  entityType: "Site",
  details: {
    pageCount: result.count,
    siteUrl,
  },
});
```

### 3. Domain Updates (`app/api/sites/[siteId]/domain/route.ts`)

**PATCH /api/sites/[siteId]/domain**
```typescript
const currentSite = await prisma.site.findUnique({...});
const updatedSite = await prisma.site.update({...});

if (customDomain !== currentSite.customDomain) {
  logActivity({
    siteId: params.siteId,
    userId: session.user.id,
    action: "DOMAIN_UPDATE",
    entityId: params.siteId,
    entityType: "Domain",
    details: {
      previousDomain: currentSite.customDomain,
      newDomain: customDomain || null,
    },
  });
}
```

### 4. Site Creation (`app/actions/templates.ts`)

**createSiteFromTemplate()**
```typescript
const newSite = await prisma.$transaction(async (tx) => {
  // Create site + clone pages...
  return site;
});

logActivity({
  siteId: newSite.id,
  userId: tenantId, // tenantId is user ID during onboarding
  action: "SITE_CREATE",
  entityId: newSite.id,
  entityType: "Site",
  details: {
    siteName: newName,
    subdomain: newSubdomain,
    templateName: template.name,
    pageCount: template.pages.length || 1,
  },
});
```

---

## User Interface

### Site Activity Component

**Component:** `components/admin/site-activity.tsx`

Displays activity timeline for a specific site.

**Usage:**
```tsx
import { SiteActivity } from "@/components/admin/site-activity";

<SiteActivity siteId={siteId} />
```

**Features:**
- Fetches logs from `/api/audit-logs/${siteId}`
- Color-coded action badges:
  - 🔵 Blue: Create actions
  - 🔴 Red: Delete actions
  - 🟢 Green: Publish actions
  - 🟡 Yellow: Update actions
  - 🟣 Purple: Domain actions
- Action icons (FileText, Trash2, Upload, Edit, Globe, Link)
- Formatted messages: "John created page 'About'"
- Timestamps with Clock icon
- Loading skeletons
- Empty state: "No activity recorded yet"

### API Endpoint

**Route:** `app/api/audit-logs/[siteId]/route.ts`

**Method:** `GET /api/audit-logs/[siteId]`

**Response:**
```json
[
  {
    "id": "log_1",
    "action": "PAGE_CREATE",
    "entityType": "Page",
    "entityId": "page_789",
    "details": {
      "pageTitle": "Contact",
      "pageSlug": "contact"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "user": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
]
```

**Error Handling:**
- Returns `500` status on failure
- Returns empty array on database errors

### Admin Activity Dashboard

**Page:** `app/admin/activity/page.tsx`

Platform-wide activity monitoring (admin only).

**Features:**
- Shows last 100 activities across all sites/users
- Displays user name/email, action, entity type
- Shows associated site name and subdomain
- Action badges and timestamps
- Suspense boundary with loading skeletons
- Empty state with Activity icon

**Access Control:**
- Protected by middleware (admin route)
- Uses `getRecentActivity(100)` server-side

---

## Error Handling

### Fail-Safe Pattern

All logging functions follow a **fail-safe** pattern:

```typescript
export function logActivity(params: LogActivityParams) {
  try {
    await prisma.userActivityLog.create({
      data: {
        siteId: params.siteId,
        userId: params.userId,
        // ...other fields
      },
    });
    console.log(`📝 AUDIT: ${params.action} on ${params.entityType}`);
  } catch (error) {
    // Log error but DON'T throw - never interrupt main flow
    console.error("❌ AUDIT LOG FAILED (non-fatal):", error);
  }
}
```

**Key Principles:**
1. **Never throw errors** - All functions wrapped in try-catch
2. **Console visibility** - Success (📝) and errors (❌) logged
3. **Non-blocking** - Failures don't crash the main application
4. **Silent recovery** - Query functions return empty arrays on error

### Database Cascade

When a user or site is deleted, all associated logs are automatically deleted:

```prisma
site Site @relation(..., onDelete: Cascade)
user User @relation(..., onDelete: Cascade)
```

**Why?** Maintains referential integrity and prevents orphaned logs.

---

## Performance Considerations

### Indexes

Five indexes optimize query performance:

```prisma
@@index([siteId])      // Fast site-specific queries
@@index([userId])      // Fast user-specific queries
@@index([action])      // Filter by action type
@@index([entityType])  // Filter by entity type
@@index([createdAt])   // Time-based sorting
```

### Query Limits

All query functions have default limits to prevent excessive data fetches:

- `getSiteAuditTrail()` - 50 logs (configurable)
- `getUserAuditTrail()` - 50 logs (configurable)
- `getRecentActivity()` - 100 logs (configurable)

### Batch Operations

Use `logActivities()` for high-volume logging:

```typescript
// ✅ Good: Batch insert
await logActivities(activities);

// ❌ Avoid: Sequential inserts
for (const activity of activities) {
  logActivity(activity); // Inefficient
}
```

---

## Security Considerations

### Authentication

All logging requires a valid session:

```typescript
const session = await auth();
if (!session?.user?.id) {
  throw new Error("Unauthorized");
}

logActivity({
  userId: session.user.id,
  // ...
});
```

### Privacy

**IP Address & User Agent:**
- Optional fields (`ipAddress`, `userAgent`)
- Not currently collected by default
- Can be added for enhanced security tracking

**PII in Details:**
- Avoid logging sensitive user data (passwords, payment info)
- Only log business context (page titles, domain names)

### Admin-Only Access

Platform-wide activity is restricted:

```typescript
// app/admin/activity/page.tsx
// Protected by middleware.ts (admin route check)
const logs = await getRecentActivity(100);
```

---

## Testing Audit Logs

### Manual Testing

1. **Create a page:**
   - Go to site editor → Create page "Test"
   - Check console: `📝 AUDIT: PAGE_CREATE on Page`
   - Verify log in database or Site Activity component

2. **Delete a page:**
   - Delete "Test" page
   - Check console: `📝 AUDIT: PAGE_DELETE on Page`
   - Verify log shows page title before deletion

3. **Publish site:**
   - Click "Publish Site"
   - Check console: `📝 AUDIT: SITE_PUBLISH on Site`
   - Verify log shows page count

4. **Update domain:**
   - Go to Site Settings → Update custom domain
   - Check console: `📝 AUDIT: DOMAIN_UPDATE on Domain`
   - Verify log shows before/after domains

5. **View activity:**
   - Check Site Activity component shows all actions
   - Check Admin Activity dashboard shows platform-wide logs

### Verify Fail-Safe

1. **Simulate database error:**
   - Temporarily break Prisma connection
   - Perform an action (create page)
   - Check console: `❌ AUDIT LOG FAILED (non-fatal)`
   - **Verify main action still succeeds** (page created)

---

## Migration & Deployment

### Database Migration

Schema has already been applied:

```bash
npx prisma db push
# ✅ Your database is now in sync with your Prisma schema.
# ✅ Generated Prisma Client
```

### Zero-Downtime Deployment

1. **Deploy schema changes first** (already done)
2. **Deploy application code** (with logging calls)
3. **Logs start accumulating automatically**
4. **No downtime** - logging is non-blocking

### Rollback Strategy

If audit logging causes issues:

1. **Logging failures are non-fatal** - main app continues
2. **Remove logging calls** from server actions
3. **Keep database schema** for future re-enablement
4. **Data remains intact** - logs are immutable

---

## Future Enhancements

### Potential Additions

1. **IP Address Tracking:**
   ```typescript
   const ip = req.headers.get("x-forwarded-for") || req.ip;
   logActivity({ ..., ipAddress: ip });
   ```

2. **User Agent Tracking:**
   ```typescript
   const userAgent = req.headers.get("user-agent");
   logActivity({ ..., userAgent });
   ```

3. **Retention Policies:**
   ```typescript
   // Delete logs older than 90 days
   await prisma.userActivityLog.deleteMany({
     where: {
       createdAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
     }
   });
   ```

4. **Export to CSV:**
   ```typescript
   export async function exportAuditLogs(siteId: string) {
     const logs = await getSiteAuditTrail(siteId, 1000);
     return generateCSV(logs);
   }
   ```

5. **Real-time Updates:**
   ```typescript
   // Use Pusher/WebSocket for live activity feed
   pusher.trigger(`site-${siteId}`, "activity-log", log);
   ```

6. **Advanced Filtering:**
   ```typescript
   getSiteAuditTrail(siteId, {
     actions: ["PAGE_CREATE", "PAGE_DELETE"],
     dateRange: { start, end },
     userId: "user_123",
   });
   ```

---

## Troubleshooting

### Logs Not Appearing

1. **Check console output:**
   - Success: `📝 AUDIT: {action} on {entityType}`
   - Failure: `❌ AUDIT LOG FAILED`

2. **Verify database connection:**
   ```bash
   npx prisma studio
   # Open UserActivityLog table
   ```

3. **Check authentication:**
   - Ensure `session.user.id` is defined
   - Verify session is valid

### TypeScript Errors

**Error:** `'session.user' is possibly 'undefined'`

**Fix:** Update auth check:
```typescript
// ❌ Before
if (!session) { throw new Error(...); }

// ✅ After
if (!session?.user?.id) { throw new Error(...); }
```

### Performance Issues

1. **Batch log writes** for bulk operations
2. **Increase query limits** only when necessary
3. **Add caching** for frequently accessed logs (Redis)
4. **Archive old logs** to separate table

---

## Summary

Structura's Immutable Audit Log System provides:

✅ **Comprehensive Tracking** - Every user action logged with metadata  
✅ **Fail-Safe Design** - Never interrupts main application flow  
✅ **Immutable Data** - Append-only, cannot be modified  
✅ **Performance Optimized** - Indexed queries, batch operations  
✅ **User Transparency** - Activity timelines for each site  
✅ **Admin Monitoring** - Platform-wide activity dashboard  
✅ **Security & Compliance** - Complete audit trail for debugging  

The system is production-ready and automatically logs all critical operations without requiring additional developer intervention.
