import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    // Get last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

    // Fetch analytics data
    const analytics = await prisma.siteAnalytics.findMany({
      where: {
        siteId,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Calculate total views
    const totalViews = analytics.reduce((sum, record) => sum + record.views, 0);

    // Group by date for chart
    const chartMap = new Map<string, number>();
    analytics.forEach((record) => {
      const dateKey = record.date.toISOString().split("T")[0];
      chartMap.set(dateKey, (chartMap.get(dateKey) || 0) + record.views);
    });

    const chartData = Array.from(chartMap.entries()).map(([date, views]) => ({
      date,
      views,
    }));

    // Group by path for top pages
    const pathMap = new Map<string, number>();
    analytics.forEach((record) => {
      pathMap.set(record.path, (pathMap.get(record.path) || 0) + record.views);
    });

    const topPages = Array.from(pathMap.entries())
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    return NextResponse.json({
      totalViews,
      chartData,
      topPages,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
