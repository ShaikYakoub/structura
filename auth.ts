import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

interface ImpersonationPayload {
  email: string;
  type: "impersonation";
  adminEmail: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    // Regular login provider
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { tenant: true },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await compare(
          credentials.password as string,
          user.password,
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: user.tenantId ?? undefined,
          bannedAt: user.bannedAt ?? undefined,
        };
      },
    }),

    // Impersonation provider (The Backdoor)
    Credentials({
      id: "impersonation",
      name: "Impersonation",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token) {
          console.error("❌ No impersonation token provided");
          return null;
        }

        try {
          // Verify the Golden Ticket
          const decoded = jwt.verify(
            credentials.token as string,
            process.env.NEXTAUTH_SECRET!,
          ) as ImpersonationPayload;

          console.log("🔍 Verifying impersonation token:", decoded);

          // Validate token type
          if (decoded.type !== "impersonation") {
            console.error("❌ Invalid token type");
            return null;
          }

          // Fetch the target user
          const user = await prisma.user.findUnique({
            where: { email: decoded.email },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              bannedAt: true,
              tenantId: true,
            },
          });

          if (!user) {
            console.error("❌ Target user not found");
            return null;
          }

          if (user.bannedAt) {
            console.error("❌ Cannot impersonate banned user");
            return null;
          }

          console.log("✅ Impersonation successful for:", user.email);

          // Log successful impersonation
          await prisma.auditLog.create({
            data: {
              adminEmail: decoded.adminEmail,
              action: "ADMIN_IMPERSONATION_SUCCESS",
              targetId: user.id,
              targetType: "user",
              metadata: {
                adminEmail: decoded.adminEmail,
                targetUserEmail: user.email,
                timestamp: new Date().toISOString(),
              },
            },
          });

          // Return user with impersonation metadata
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            tenantId: user.tenantId ?? undefined,
            bannedAt: user.bannedAt ?? undefined,
            isImpersonated: true,
            originalAdmin: decoded.adminEmail,
          };
        } catch (error: any) {
          console.error("❌ Token verification failed:", error.message);

          // Log failed impersonation attempt
          try {
            await prisma.auditLog.create({
              data: {
                adminEmail: "unknown",
                action: "ADMIN_IMPERSONATION_FAILED",
                targetId: "impersonation",
                targetType: "user",
                metadata: {
                  error: error.message,
                  timestamp: new Date().toISOString(),
                },
              },
            });
          } catch (logError) {
            console.error("Failed to log impersonation failure:", logError);
          }

          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tenantId = (user as any).tenantId;
        token.bannedAt = (user as any).bannedAt;

        // Store impersonation metadata in token
        if ((user as any).isImpersonated) {
          token.isImpersonated = true;
          token.originalAdmin = (user as any).originalAdmin;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).tenantId = token.tenantId as string;
        (session.user as any).bannedAt = token.bannedAt as Date | null;

        // Pass impersonation metadata to session
        if (token.isImpersonated) {
          (session.user as any).isImpersonated = true;
          (session.user as any).originalAdmin = token.originalAdmin as string;
        }
      }
      return session;
    },
  },
});
