import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";
  const pathname = url.pathname;

  // Skip rewrite for paths that already have correct structure
  if (
    pathname.startsWith("/app") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/site")
  ) {
    return NextResponse.next();
  }

  // Extract subdomain
  // localhost:3000 → null
  // app.localhost:3000 → 'app'
  // bakery.localhost:3000 → 'bakery'
  const subdomain = hostname.split(".")[0].split(":")[0];

  // Root domain or 'app' subdomain → Admin Dashboard
  if (subdomain === "localhost" || subdomain === "app") {
    return NextResponse.rewrite(new URL(`/app${pathname}`, req.url));
  }

  // Any other subdomain → Client Site
  return NextResponse.rewrite(
    new URL(`/site/${subdomain}${pathname}`, req.url),
  );
}
