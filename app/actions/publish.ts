"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

export async function publishSite(siteId: string) {
  try {
    // Atomic transaction: update all pages
    await prisma.$transaction(async (tx) => {
      const pages = await tx.page.findMany({
        where: { siteId },
        select: { id: true, draftContent: true },
      });

      // Publish all pages: copy draftContent → publishedContent
      await Promise.all(
        pages.map((page) =>
          tx.page.update({
            where: { id: page.id },
            data: {
              publishedContent: page.draftContent,
              lastPublishedAt: new Date(),
            },
          })
        )
      );
    });

    // Revalidate all pages for this site
    revalidatePath("/", "layout");
    revalidateTag(`site-${siteId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to publish site:", error);
    return { success: false, error: "Failed to publish site" };
  }
}

export async function saveDraft(pageId: string, content: any) {
  try {
    await prisma.page.update({
      where: { id: pageId },
      data: {
        draftContent: content,
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to save draft:", error);
    return { success: false, error: "Failed to save draft" };
  }
}

export async function hasUnpublishedChanges(pageId: string): Promise<boolean> {
  try {
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { draftContent: true, publishedContent: true },
    });

    if (!page) return false;

    // Compare content using JSON stringify
    const draftStr = JSON.stringify(page.draftContent);
    const publishedStr = JSON.stringify(page.publishedContent || null);

    return draftStr !== publishedStr;
  } catch (error) {
    console.error("Failed to check for unpublished changes:", error);
    return false;
  }
}
