import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    // Check if user is super admin
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { siteId, name, description, category, thumbnailUrl } = body;

    // Check if site exists and has published content
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      include: {
        pages: {
          where: {
            lastPublishedAt: {
              not: null,
            },
          },
        },
      },
    });

    if (!site) {
      return NextResponse.json(
        { success: false, error: "Site not found" },
        { status: 404 },
      );
    }

    if (site.pages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Site has no published pages" },
        { status: 400 },
      );
    }

    // Update site to mark as template
    await prisma.site.update({
      where: { id: siteId },
      data: {
        isTemplate: true,
        templateCategory: category,
        templateDescription: description,
        thumbnailUrl: thumbnailUrl,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create template" },
      { status: 500 },
    );
  }
}
