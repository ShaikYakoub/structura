import { NextRequest, NextResponse } from "next/server";

// Your main domain configuration
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || "shaikyakoub.com";
const APP_SUBDOMAIN = process.env.NEXT_PUBLIC_APP_SUBDOMAIN || "app";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /_vercel (Vercel internals)
     * 5. Static files (e.g. /favicon.ico, /sitemap.xml, /robots.txt, etc.)
     */
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";
  const searchParams = url.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

  // Get the pathname (e.g. /, /about, /blog/first-post)
  const pathname = url.pathname;

  // Normalize hostname (remove www, handle ports for local dev)
  const normalizedHostname = hostname
    .replace(/^www\./, "")
    .replace(/:\d+$/, ""); // Remove port for local dev

  console.log("🔍 Middleware:", {
    hostname,
    normalizedHostname,
    pathname,
    appDomain: APP_DOMAIN,
  });

  // 1. Handle App Dashboard (app.shaikyakoub.com)
  if (normalizedHostname === `${APP_SUBDOMAIN}.${APP_DOMAIN}`) {
    console.log("📱 Routing to: /app");
    return NextResponse.rewrite(new URL(`/app${path}`, req.url));
  }

  // 2. Handle Root Marketing Site (shaikyakoub.com)
  if (normalizedHostname === APP_DOMAIN) {
    console.log("🏠 Routing to: /home");
    return NextResponse.rewrite(new URL(`/home${path}`, req.url));
  }

  // 3. Handle Localhost for Development
  if (
    hostname.includes("localhost") ||
    hostname.includes("127.0.0.1")
  ) {
    // Extract subdomain from localhost:3000 format
    // For local testing: test-site.localhost:3000
    const parts = hostname.split(".");
    
    if (parts.length > 1 && parts[0] !== "localhost") {
      const subdomain = parts[0];
      console.log("🧪 Local subdomain routing:", subdomain);
      
      // Rewrite to _sites/[site]
      return NextResponse.rewrite(
        new URL(`/_sites/${subdomain}${path}`, req.url)
      );
    }

    // Default localhost to app dashboard
    return NextResponse.rewrite(new URL(`/app${path}`, req.url));
  }

  // 4. Handle User Sites (Subdomains or Custom Domains)
  // Examples:
  // - demo.shaikyakoub.com (subdomain)
  // - customdomain.com (custom domain)

  // Check if it's a subdomain of your platform
  const isSubdomain = normalizedHostname.endsWith(`.${APP_DOMAIN}`) &&
    normalizedHostname !== APP_DOMAIN &&
    normalizedHostname !== `${APP_SUBDOMAIN}.${APP_DOMAIN}`;

  if (isSubdomain) {
    // Extract subdomain (e.g., "demo" from "demo.shaikyakoub.com")
    const subdomain = normalizedHostname.replace(`.${APP_DOMAIN}`, "");
    console.log("🌐 Subdomain site:", subdomain);

    // Rewrite to _sites/[site]
    return NextResponse.rewrite(
      new URL(`/_sites/${subdomain}${path}`, req.url)
    );
  }

  // If we reach here, it's likely a custom domain
  console.log("🔗 Custom domain:", normalizedHostname);
  
  // Rewrite to _sites/[site] using the full domain
  return NextResponse.rewrite(
    new URL(`/_sites/${normalizedHostname}${path}`, req.url)
  );
}
