import { auth } from "@/auth";

// YOUR SUPER ADMIN EMAIL (HARDCODED FOR SECURITY)
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "your@email.com";

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.email === SUPER_ADMIN_EMAIL;
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Unauthorized - Admin access required");
  }
}

export function getSuperAdminEmail(): string {
  return SUPER_ADMIN_EMAIL;
}
