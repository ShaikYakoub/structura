# Super Admin Dashboard (God Mode)

## Overview

The Super Admin Dashboard provides comprehensive platform management capabilities for Structura. This secure admin panel allows the super admin to monitor users, manage sites, ban malicious accounts, and track platform metrics.

## Security Architecture

### Email-Based Admin Protection

The system uses **email-based authentication** for admin access. Only one email address (hardcoded in environment variables) can access the admin panel.

**Environment Variable:**
```bash
SUPER_ADMIN_EMAIL=your@email.com
```

**Security Features:**
- ✅ Middleware protection on `/admin/*` routes
- ✅ Returns 404 (not 403) for unauthorized access (security through obscurity)
- ✅ Session-based authentication with NextAuth
- ✅ JWT token validation in middleware
- ✅ No admin UI visible to non-admins

### Middleware Protection

**File:** `middleware.ts`

The middleware intercepts all requests and enforces:

1. **Admin Route Protection** (`/admin/*`):
   - Checks JWT token for super admin email
   - Returns 404 if not authorized (hides admin panel existence)

2. **Banned User Protection** (`/dashboard/*`, `/editor/*`):
   - Checks if user has `bannedAt` field set
   - Redirects to `/banned` page if account is suspended

**Code:**
```typescript
// Protect admin routes
if (pathname.startsWith("/admin")) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  
  if (token?.email !== superAdminEmail) {
    return NextResponse.rewrite(new URL("/404", req.url));
  }
}

// Check if user is banned
if (pathname.startsWith("/dashboard") || pathname.startsWith("/editor")) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (token?.bannedAt) {
    return NextResponse.redirect(new URL("/banned", req.url));
  }
}
```

---

## Database Schema

### User Model (Admin Fields)

```prisma
model User {
  // ... existing fields
  
  // Admin & Moderation
  bannedAt      DateTime?
  banReason     String?
  
  @@index([bannedAt])
}
```

**Fields:**
- `bannedAt`: Timestamp when user was banned (null = not banned)
- `banReason`: Reason for ban (displayed to support team)

### Site Model (Admin Fields)

```prisma
model Site {
  // ... existing fields
  
  // Moderation
  banned       Boolean   @default(false)
  bannedAt     DateTime?
  banReason    String?
  
  @@index([banned])
}
```

**Fields:**
- `banned`: Boolean flag for instant checks
- `bannedAt`: Timestamp when site was taken down
- `banReason`: Reason for takedown (DMCA, spam, phishing, etc.)

### AuditLog Model

```prisma
model AuditLog {
  id          String   @id @default(cuid())
  adminEmail  String
  action      String
  targetId    String
  targetType  String
  metadata    Json?
  createdAt   DateTime @default(now())
  
  @@index([adminEmail])
  @@index([targetId])
  @@index([createdAt])
}
```

**Purpose:** Tracks all admin actions for accountability and auditing.

**Actions Logged:**
- `ban_user` - User account suspended
- `unban_user` - User account restored
- `impersonate_user` - Admin impersonated user session
- `takedown_site` - Site banned/taken down
- `restore_site` - Site restored

**Example Log Entry:**
```json
{
  "id": "clx123abc",
  "adminEmail": "admin@shaikyakoub.com",
  "action": "ban_user",
  "targetId": "user-uuid-123",
  "targetType": "user",
  "metadata": {
    "reason": "Spam and TOS violation"
  },
  "createdAt": "2024-02-11T10:30:00Z"
}
```

---

## Admin Panel Pages

### 1. Overview Dashboard (`/admin`)

**Stats Cards:**
- Total Users (with Pro user count)
- Total Sites (published websites)
- Monthly Revenue (₹999 × Pro subscriptions)
- Annual Revenue (projected ARR)

**Recent Users Widget:**
- Last 5 registered users
- Shows name, email, Pro badge, join date

**Revenue Calculation:**
- Monthly: `proSubscriptions × 999`
- Annual: `monthlyRevenue × 12`

### 2. User Management (`/admin/users`)

**Features:**
- View all users in sortable table
- Ban/Unban users with reason
- Impersonate users (with audit logging)
- See site count per user
- Filter by active/banned status

**Table Columns:**
- User (name + email)
- Plan (Pro/Free badge)
- Sites (count)
- Joined (date)
- Status (Active/Banned badge)
- Actions (Impersonate, Ban/Unban buttons)

**Ban User Dialog:**
- Reason input field (required)
- Warning message about access restriction
- Confirm/Cancel buttons

**Impersonation:**
- Logs action to AuditLog
- Returns impersonation URL (for future session switching)
- Disabled for banned users

### 3. Site Management (`/admin/sites`)

**Features:**
- View all sites on platform
- Takedown/Restore sites with reason
- View live sites in new tab
- See publish status and page count

**Table Columns:**
- Site (name)
- Domain (subdomain or custom)
- Pages (count)
- Created (date)
- Status (Published/Draft/Banned badge)
- Actions (View, Takedown/Restore buttons)

**Takedown Dialog:**
- Reason input field (required)
- Warning about immediate inaccessibility
- Confirm/Cancel buttons

**Site URL Generation:**
```typescript
const getSiteUrl = (site) => {
  const domain = site.customDomain || `${site.subdomain}.shaikyakoub.com`;
  return `https://${domain}`;
};
```

### 4. Settings Page (`/admin/settings`)

**Not yet implemented** - Reserved for future features:
- Platform settings
- Email templates
- Notification preferences
- API keys management

---

## Admin Actions (Server Actions)

**File:** `app/actions/admin.ts`

All admin actions are **server actions** ("use server") for security.

### `banUser(userId, reason)`

**Purpose:** Suspend a user account

**Logic:**
1. Verify admin authentication (`requireAdmin()`)
2. Update user: set `bannedAt` to current timestamp
3. Set `banReason` to provided reason
4. Log action to AuditLog
5. Revalidate `/admin/users` path
6. Return success/error message

**Result:**
- User cannot log in (middleware redirects to `/banned`)
- User loses access to all sites
- Subscription remains active (manual cancellation required)

### `unbanUser(userId)`

**Purpose:** Restore a suspended user account

**Logic:**
1. Verify admin authentication
2. Update user: set `bannedAt` to null
3. Clear `banReason`
4. Log action to AuditLog
5. Revalidate path
6. Return success/error

### `createImpersonationSession(userId)`

**Purpose:** Create impersonation session for troubleshooting

**Logic:**
1. Verify admin authentication
2. Log impersonation to AuditLog
3. Return impersonation URL (future: create special JWT token)

**Note:** Full impersonation not yet implemented. Currently logs action only.

**Future Implementation:**
- Create special JWT with `impersonatedUserId` claim
- Use NextAuth callbacks to switch session
- Add visual indicator in UI (red banner)
- Auto-expire after 30 minutes

### `takedownSite(siteId, reason)`

**Purpose:** Ban a site (DMCA, spam, phishing, etc.)

**Logic:**
1. Verify admin authentication
2. Update site: set `banned` to true, `bannedAt` to now
3. Set `banReason`
4. Log action to AuditLog
5. Revalidate `/admin/sites`
6. Return success/error

**Result:**
- Site becomes inaccessible immediately
- Subdomain/custom domain returns 404 or banned page
- User can still access dashboard (but site is hidden)

### `restoreSite(siteId)`

**Purpose:** Restore a banned site

**Logic:**
1. Verify admin authentication
2. Update site: set `banned` to false
3. Clear `bannedAt` and `banReason`
4. Log action to AuditLog
5. Revalidate path
6. Return success/error

---

## Admin Authentication Utilities

**File:** `lib/admin-auth.ts`

### `isAdmin(): Promise<boolean>`

**Purpose:** Check if current session is super admin

**Logic:**
1. Get server session with NextAuth
2. Compare session email with `SUPER_ADMIN_EMAIL`
3. Return true/false

**Usage:**
```typescript
const admin = await isAdmin();
if (!admin) {
  redirect("/404");
}
```

### `requireAdmin(): Promise<void>`

**Purpose:** Throw error if not admin (for server actions)

**Logic:**
1. Call `isAdmin()`
2. If false, throw error "Unauthorized - Admin access required"

**Usage:**
```typescript
export async function banUser(userId: string) {
  await requireAdmin(); // Throws if not admin
  // ... rest of logic
}
```

### `getSuperAdminEmail(): string`

**Purpose:** Get super admin email for logging

**Returns:** Email from `SUPER_ADMIN_EMAIL` env var

---

## UI Components

### UserManagementTable

**File:** `components/admin/user-management-table.tsx`

**Props:**
```typescript
interface User {
  id: string;
  name: string | null;
  email: string;
  isPro: boolean;
  createdAt: Date;
  bannedAt: Date | null;
  banReason: string | null;
  _count: { sites: number };
}
```

**Features:**
- Client component ("use client")
- Sortable table with shadcn/ui Table components
- Ban dialog with reason input
- Toast notifications with sonner
- Optimistic UI updates (revalidation)

**State:**
- `showBanDialog`: Boolean for dialog visibility
- `selectedUser`: Currently selected user for banning
- `banReason`: Reason text input

### SiteManagementTable

**File:** `components/admin/site-management-table.tsx`

**Props:**
```typescript
interface Site {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  createdAt: Date;
  banned: boolean;
  bannedAt: Date | null;
  banReason: string | null;
  isPublished: boolean;
  pageCount: number;
}
```

**Features:**
- Similar structure to UserManagementTable
- Takedown dialog with reason input
- External site links (opens in new tab)
- Disabled "View" button for banned sites

---

## Banned Page

**File:** `app/banned/page.tsx`

**Purpose:** Display message to banned users

**Features:**
- ShieldAlert icon (destructive color)
- Card layout with centered content
- Clear message about account suspension
- Contact support button (mailto link)
- Return home button

**User Experience:**
- Middleware automatically redirects banned users here
- Shows on any `/dashboard` or `/editor` route access
- Professional, non-accusatory messaging
- Provides support contact option

---

## Installation & Setup

### 1. Set Super Admin Email

Add to `.env`:
```bash
SUPER_ADMIN_EMAIL=your@email.com
```

### 2. Run Database Migration

```bash
npx prisma db push
```

This adds:
- `bannedAt`, `banReason` to User model
- `banned`, `bannedAt`, `banReason` to Site model
- `AuditLog` model with indexes

### 3. Access Admin Panel

1. Log in with super admin email
2. Navigate to `/admin`
3. Middleware will allow access if email matches

**Note:** Non-admin users see 404, not 403 or login prompt.

---

## Usage Examples

### Ban a User

1. Go to `/admin/users`
2. Find user in table
3. Click "Ban" button
4. Enter reason (e.g., "Spam and TOS violation")
5. Click "Ban User"
6. Toast notification confirms success
7. User status changes to "Banned" badge
8. User is redirected to `/banned` on next login

### Take Down a Site

1. Go to `/admin/sites`
2. Find site in table
3. Click "Takedown" button
4. Enter reason (e.g., "DMCA takedown notice")
5. Click "Take Down Site"
6. Site status changes to "Banned" badge
7. Site becomes inaccessible immediately

### View Audit Logs (Database)

```sql
SELECT * FROM "AuditLog"
ORDER BY "createdAt" DESC
LIMIT 50;
```

**Example Output:**
```
id          | adminEmail              | action        | targetId  | targetType | createdAt
------------|-------------------------|---------------|-----------|------------|-------------------
clx123      | admin@shaikyakoub.com   | ban_user      | user-123  | user       | 2024-02-11 10:30
clx124      | admin@shaikyakoub.com   | takedown_site | site-456  | site       | 2024-02-11 11:15
```

---

## Security Best Practices

### 1. Single Super Admin

**Why:** Limits blast radius of admin compromise

**Alternative:** For multiple admins, store emails in database table:
```prisma
model AdminUser {
  id         String   @id @default(cuid())
  email      String   @unique
  role       String   // "super_admin", "moderator"
  createdAt  DateTime @default(now())
}
```

### 2. Audit Logging

**Why:** Accountability and forensics

**Best Practice:**
- Log all admin actions with metadata
- Include timestamps and admin email
- Store in separate table (not User/Site)
- Review logs periodically for anomalies

### 3. Two-Factor Authentication

**Not yet implemented** - Future enhancement:

```typescript
// In admin-auth.ts
export async function requireAdmin2FA() {
  await requireAdmin();
  
  const session = await getServerSession(authOptions);
  if (!session.user.twoFactorVerified) {
    throw new Error("2FA verification required");
  }
}
```

### 4. Rate Limiting

**Not yet implemented** - Future enhancement:

```typescript
// In middleware.ts
if (pathname.startsWith("/admin")) {
  const ip = request.ip;
  const rateLimitKey = `admin_${ip}`;
  
  if (await isRateLimited(rateLimitKey)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
}
```

---

## Troubleshooting

### Admin Panel Returns 404

**Problem:** Even logged in as super admin, `/admin` shows 404

**Solutions:**
1. Check `.env` file has correct `SUPER_ADMIN_EMAIL`
2. Verify logged-in email matches exactly (case-sensitive)
3. Clear browser cookies and log in again
4. Check middleware.ts is not cached (restart dev server)

**Debug:**
```typescript
// Add to middleware.ts
console.log("Admin check:", {
  tokenEmail: token?.email,
  superAdminEmail: process.env.SUPER_ADMIN_EMAIL,
  matches: token?.email === process.env.SUPER_ADMIN_EMAIL
});
```

### Banned Users Can Still Log In

**Problem:** User with `bannedAt` set can still access dashboard

**Solutions:**
1. Check middleware matcher includes `/dashboard` and `/editor`
2. Verify middleware is running (add console.log)
3. Clear Next.js cache: `rm -rf .next`
4. Restart dev server

**Verify Middleware:**
```bash
# Should see log on every request
🔍 Middleware: { hostname: 'localhost:3000', pathname: '/dashboard' }
```

### Site Takedown Not Working

**Problem:** Banned site still accessible

**Solutions:**
1. Check site routing logic in `app/_sites/[site]/layout.tsx`
2. Add banned site check before rendering:

```typescript
// In _sites/[site]/layout.tsx
if (site.banned) {
  return (
    <div>
      <h1>Site Unavailable</h1>
      <p>This site has been taken down.</p>
    </div>
  );
}
```

### Audit Logs Not Appearing

**Problem:** AuditLog table is empty despite admin actions

**Solutions:**
1. Check `logAdminAction()` is being called
2. Verify Prisma client is up-to-date: `npx prisma generate`
3. Check database connection
4. Add error logging:

```typescript
async function logAdminAction(...) {
  try {
    await prisma.auditLog.create({ ... });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}
```

---

## Future Enhancements

### 1. IP Banning

```prisma
model BannedIP {
  id        String   @id @default(cuid())
  ipAddress String   @unique
  reason    String
  bannedAt  DateTime @default(now())
}
```

### 2. Temporary Bans

```prisma
model User {
  bannedAt     DateTime?
  bannedUntil  DateTime? // Auto-unban at this time
}
```

**Implementation:**
- Cron job checks `bannedUntil` daily
- Automatically clears `bannedAt` when expired

### 3. Ban Appeals

```prisma
model BanAppeal {
  id           String   @id @default(cuid())
  userId       String   @db.Uuid
  appealText   String
  status       String   // "pending", "approved", "rejected"
  reviewedBy   String?
  reviewedAt   DateTime?
  createdAt    DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
}
```

### 4. Email Notifications

- Email user when banned (with reason and appeal link)
- Email admin on new ban appeals
- Weekly digest of admin actions

### 5. Advanced Analytics

- User growth charts (MRR, churn rate)
- Site creation trends
- Ban rate over time
- Revenue forecasting

### 6. Search & Filters

- Search users by email/name
- Filter sites by status (published/draft/banned)
- Date range filters
- Export to CSV

---

## API Reference

### Server Actions

#### `banUser(userId: string, reason: string)`

**Returns:** `Promise<{ success: boolean; message: string }>`

**Example:**
```typescript
const result = await banUser("user-123", "Spam");
if (result.success) {
  toast.success(result.message);
}
```

#### `unbanUser(userId: string)`

**Returns:** `Promise<{ success: boolean; message: string }>`

#### `createImpersonationSession(userId: string)`

**Returns:** `Promise<{ success: boolean; redirectUrl?: string; message: string }>`

#### `takedownSite(siteId: string, reason: string)`

**Returns:** `Promise<{ success: boolean; message: string }>`

#### `restoreSite(siteId: string)`

**Returns:** `Promise<{ success: boolean; message: string }>`

---

## Testing Checklist

### User Management
- [ ] Admin can view all users
- [ ] Admin can ban user with reason
- [ ] Banned user is redirected to `/banned` page
- [ ] Admin can unban user
- [ ] Unbanned user can access dashboard again
- [ ] Ban action is logged to AuditLog
- [ ] Toast notifications appear on success/error

### Site Management
- [ ] Admin can view all sites
- [ ] Admin can take down site with reason
- [ ] Banned site is inaccessible
- [ ] Admin can restore banned site
- [ ] Restored site is accessible again
- [ ] Takedown action is logged to AuditLog

### Security
- [ ] Only super admin email can access `/admin`
- [ ] Non-admin users see 404 at `/admin`
- [ ] Banned users cannot access `/dashboard`
- [ ] Banned users cannot access `/editor`
- [ ] Middleware runs on all protected routes
- [ ] JWT tokens are validated correctly

### Audit Logging
- [ ] All ban actions are logged
- [ ] All unban actions are logged
- [ ] All impersonation attempts are logged
- [ ] All takedown actions are logged
- [ ] All restore actions are logged
- [ ] Logs include admin email and timestamp

---

## Related Documentation

- [User Authentication](./USER_AUTH.md) - NextAuth setup
- [Multi-Tenancy](./MULTI_TENANCY.md) - Tenant system
- [Analytics](./ANALYTICS_AND_CODE_INJECTION.md) - Platform analytics

---

**Last Updated:** February 11, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
