import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ siteId: string }> },
) {
  try {
    const params = await context.params;
    // Verify authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;

    // Verify site belongs to tenant
    const site = await prisma.site.findUnique({
      where: { id: params.siteId },
    });

    if (!site || site.tenantId !== tenantId) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const { styles } = await req.json();

    const updatedSite = await prisma.site.update({
      where: { id: params.siteId },
      data: { styles },
    });

    return NextResponse.json(updatedSite);
  } catch (error) {
    console.error("Error updating styles:", error);
    return NextResponse.json(
      { error: "Failed to update styles" },
      { status: 500 }
    );
  }
}
