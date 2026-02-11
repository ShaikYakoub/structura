import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { siteId, path } = await req.json();

    if (!siteId || !path) {
      return NextResponse.json(
        { error: "Missing siteId or path" },
        { status: 400 }
      );
    }

    // Get today's date (midnight UTC)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Upsert: increment if exists, create if not
    await prisma.siteAnalytics.upsert({
      where: {
        siteId_date_path: {
          siteId,
          date: today,
          path,
        },
      },
      update: {
        views: {
          increment: 1,
        },
      },
      create: {
        siteId,
        date: today,
        path,
        views: 1,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics error:", error);
    // Return success even on error to not break the site
    return NextResponse.json({ success: true });
  }
}
