import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const body = await request.json();
    const {
      isTemplate,
      templateCategory,
      templateDescription,
      thumbnailUrl,
    } = body;

    // Validate site exists
    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json(
        { error: "Site not found" },
        { status: 404 }
      );
    }

    // Update template settings
    const updatedSite = await prisma.site.update({
      where: { id: siteId },
      data: {
        isTemplate,
        templateCategory,
        templateDescription,
        thumbnailUrl,
      },
    });

    return NextResponse.json({
      success: true,
      site: updatedSite,
    });
  } catch (error) {
    console.error("Error updating template settings:", error);
    return NextResponse.json(
      { error: "Failed to update template settings" },
      { status: 500 }
    );
  }
}
