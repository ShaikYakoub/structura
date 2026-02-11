import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const body = await req.json();
    const { name, slug, seoTitle, seoDescription, seoKeywords, seoImage } = body;

    // Validate page exists
    const existingPage = await prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!existingPage) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    // Update page
    const page = await prisma.page.update({
      where: { id: pageId },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        seoTitle,
        seoDescription,
        seoKeywords,
        seoImage,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 }
    );
  }
}
