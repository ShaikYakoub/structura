import { NextRequest, NextResponse } from "next/server";
import { getSiteAuditTrail } from "@/lib/audit-logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  try {
    const { siteId } = await params;
    const logs = await getSiteAuditTrail(siteId, 50);
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 },
    );
  }
}
