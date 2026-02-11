import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const body = await req.json();
    const { customHeadCode, customBodyCode, cookieBannerEnabled } = body;

    const site = await prisma.site.update({
      where: { id: siteId },
      data: {
        customHeadCode,
        customBodyCode,
        cookieBannerEnabled,
      },
    });

    return NextResponse.json(site);
  } catch (error) {
    console.error("Error updating code injection:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
