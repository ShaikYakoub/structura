"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

export async function publishSite(siteId: string) {
  try {
    // Get site info for URL
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: {
        subdomain: true,
        customDomain: true,
      },
    });

    if (!site) {
      throw new Error("Site not found");
    }

    // Atomic transaction: update all pages
    const result = await prisma.$transaction(async (tx) => {
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
              publishedContent: page.draftContent as any,
              lastPublishedAt: new Date(),
            },
          })
        )
      );

      return { count: pages.length };
    });

    // Determine the live URL
    const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "shaikyakoub.com";
    const siteUrl = site.customDomain
      ? `https://${site.customDomain}`
      : `https://${site.subdomain}.${appDomain}`;

    // Revalidate all pages for this site
    revalidatePath("/", "layout");
    revalidateTag(`site-${siteId}`);

    return { 
      success: true, 
      siteUrl,
      message: `Successfully published ${result.count} page(s)`,
      pagesPublished: result.count,
    };
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
