import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  // Verify cron secret (for production)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete expired tokens
    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });

    console.log(`🧹 Cleaned up ${result.count} expired password reset tokens`);

    return NextResponse.json({
      success: true,
      deleted: result.count,
    });
  } catch (error) {
    console.error("Error cleaning up tokens:", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
