import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAdmin } from "@/lib/admin-auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ templateId: string }> },
) {
  try {
    // Check if user is super admin
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { templateId } = await params;

    // Get site to verify it exists
    const site = await prisma.site.findUnique({
      where: { id: templateId },
    });

    if (!site) {
      return NextResponse.json(
        { success: false, error: "Template not found" },
        { status: 404 },
      );
    }

    // Unmark site as template
    await prisma.site.update({
      where: { id: templateId },
      data: {
        isTemplate: false,
        templateCategory: null,
        templateDescription: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete template" },
      { status: 500 },
    );
  }
}
