import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";
  const path = url.pathname;

  // Debug logging
  console.log("🔍 Middleware Debug:");
  console.log("  Hostname detected:", hostname);
  console.log("  Path detected:", path);

  // Get environment variables
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost:3000";
  const protocol = process.env.NEXT_PUBLIC_APP_PROTOCOL || "http";

  // Remove www. from hostname if present
  if (hostname.startsWith("www.")) {
    const newUrl = new URL(req.url);
    newUrl.hostname = hostname.replace("www.", "");
    console.log("  ↪️ Redirecting: www -> non-www");
    return NextResponse.redirect(newUrl, 301);
  }

  // Extract subdomain
  const hostnameParts = hostname.split(".");
  let subdomain = "";

  // Determine subdomain based on environment
  if (hostname.includes("localhost")) {
    // Local development: app.localhost:3000 or sub.localhost:3000
    // Only extract subdomain if there are at least 2 parts (e.g., "app.localhost:3000")
    if (hostnameParts.length >= 2) {
      subdomain = hostnameParts[0];
    }
  } else {
    // Production: sub.shaikyakoub.com
    // If hostname has more than 2 parts (e.g., sub.shaikyakoub.com), extract subdomain
    if (hostnameParts.length > 2) {
      subdomain = hostnameParts[0];
    }
  }

  console.log("  Subdomain extracted:", subdomain || "(none - root domain)");

  // ============================================
  // ROUTE 1: Admin Panel (/admin routes)
  // ============================================
  if (path.startsWith("/admin")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

    // Check if user is super admin
    if (token?.email !== superAdminEmail) {
      console.log("  🚫 Admin access denied - returning 404");
      // Return 404 instead of 403 for security (hide admin panel existence)
      return NextResponse.rewrite(new URL("/404", req.url));
    }

    console.log("  ✅ Admin access granted");
    return NextResponse.next();
  }

  // ============================================
  // ROUTE 2: App Subdomain (app.domain.com)
  // ============================================
  if (subdomain === "app") {
    console.log("  ➡️ Routing to: App subdomain");

    // Check if user is banned
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (token?.bannedAt) {
      console.log("  🚫 User is banned");
      return NextResponse.redirect(new URL("/banned", req.url));
    }

    // App routes like /dashboard, /editor are already at root level
    // Just let them through
    return NextResponse.next();
  }

  // ============================================
  // ROUTE 3: Root Domain (Marketing Site)
  // ============================================
  const isRootDomain =
    hostname === appDomain ||
    hostname === appDomain.replace(":3000", "") ||
    hostname === `localhost:${new URL(req.url).port}`;

  if (isRootDomain && subdomain === "") {
    console.log("  ➡️ Routing to: Marketing site (root domain)");

    // If path is already in marketing routes, let it through
    if (
      path.startsWith("/login") ||
      path.startsWith("/register") ||
      path.startsWith("/terms") ||
      path.startsWith("/privacy") ||
      path.startsWith("/refund") ||
      path.startsWith("/templates") ||
      path.startsWith("/docs") ||
      path === "/"
    ) {
      return NextResponse.next();
    }

    // Otherwise, let Next.js handle it normally
    return NextResponse.next();
  }

  // ============================================
  // ROUTE 4: Custom Domain
  // ============================================
  // If hostname is completely different (not our domain), treat as custom domain
  if (
    !hostname.includes(appDomain.split(":")[0]) &&
    !hostname.includes("localhost")
  ) {
    console.log("  ➡️ Routing to: Custom domain site");
    console.log("  Rewriting to: /_sites/" + hostname + path);

    // Rewrite to the _sites route with the custom domain
    const url = new URL(`/_sites/${hostname}${path}`, req.url);
    return NextResponse.rewrite(url);
  }

  // ============================================
  // ROUTE 5: User Subdomain (user.domain.com)
  // ============================================
  if (subdomain && subdomain !== "app" && subdomain !== "www") {
    console.log("  ➡️ Routing to: User subdomain site");
    console.log("  Rewriting to: /_sites/" + subdomain + path);

    // Check if site is banned
    // Note: We can't easily check this in middleware without DB query
    // Consider implementing a cache or moving this check to the page level

    // Rewrite to the _sites route with the subdomain
    const url = new URL(`/_sites/${subdomain}${path}`, req.url);
    return NextResponse.rewrite(url);
  }

  // ============================================
  // Default: Let Next.js handle it
  // ============================================
  console.log("  ➡️ Default: No rewrite needed");
  return NextResponse.next();
}
