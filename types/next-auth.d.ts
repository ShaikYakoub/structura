import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tenantId?: string;
      bannedAt?: Date | null;
      isImpersonated?: boolean;
      originalAdmin?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    tenantId?: string;
    bannedAt?: Date | null;
    isImpersonated?: boolean;
    originalAdmin?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    tenantId?: string;
    bannedAt?: Date | null;
    isImpersonated?: boolean;
    originalAdmin?: string;
  }
}
