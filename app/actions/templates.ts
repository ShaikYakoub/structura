"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type CloneResult = {
  success: boolean;
  siteId?: string;
  error?: string;
};

export type Template = {
  id: string;
  name: string;
  templateCategory: string | null;
  templateDescription: string | null;
  thumbnailUrl: string | null;
  subdomain: string;
};

/**
 * Get all available templates
 */
export async function getTemplates(category?: string): Promise<Template[]> {
  const templates = await prisma.site.findMany({
    where: {
      isTemplate: true,
      ...(category && category !== "all" ? { templateCategory: category } : {}),
    },
    select: {
      id: true,
      name: true,
      templateCategory: true,
      templateDescription: true,
      thumbnailUrl: true,
      subdomain: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return templates;
}

/**
 * Get template categories
 */
export async function getTemplateCategories(): Promise<string[]> {
  const categories = await prisma.site.findMany({
    where: {
      isTemplate: true,
      templateCategory: { not: null },
    },
    select: {
      templateCategory: true,
    },
    distinct: ["templateCategory"],
  });

  return categories
    .map((c) => c.templateCategory)
    .filter((c): c is string => c !== null);
}

/**
 * Clone a template site for a tenant
 */
export async function createSiteFromTemplate(
  templateId: string,
  tenantId: string,
  newName: string,
  newSubdomain: string
): Promise<CloneResult> {
  try {
    // Validate subdomain is available
    const existingSubdomain = await prisma.site.findUnique({
      where: { subdomain: newSubdomain },
    });

    if (existingSubdomain) {
      return {
        success: false,
        error: "Subdomain is already taken",
      };
    }

    // Fetch the template with all pages
    const template = await prisma.site.findUnique({
      where: {
        id: templateId,
        isTemplate: true,
      },
      include: {
        pages: true,
      },
    });

    if (!template) {
      return {
        success: false,
        error: "Template not found",
      };
    }

    console.log("🔄 Cloning template:", template.name);
    console.log("📄 Pages to clone:", template.pages.length);

    // Use Prisma transaction for atomic operation
    const newSite = await prisma.$transaction(async (tx) => {
      // Step 1: Create the new site
      const site = await tx.site.create({
        data: {
          name: newName,
          subdomain: newSubdomain,
          logo: template.logo,
          navColor: template.navColor,
          navigation: template.navigation as any,
          styles: template.styles as any,
          tenantId,
          isTemplate: false,
          isPublished: false,
        },
      });

      console.log("✅ Site created:", site.id);

      // Step 2: Clone all pages
      if (template.pages.length > 0) {
        const pagePromises = template.pages.map((page) => {
          return tx.page.create({
            data: {
              siteId: site.id,
              slug: page.slug,
              name: page.name,
              path: page.path,
              draftContent: (page.publishedContent || page.draftContent) as any,
              publishedContent: page.publishedContent as any,
              lastPublishedAt: page.lastPublishedAt,
              isHomePage: page.isHomePage,
              isPublished: page.isPublished,
            },
          });
        });

        const createdPages = await Promise.all(pagePromises);
        console.log("✅ Pages cloned:", createdPages.length);
      } else {
        // If template has no pages, create a default home page
        await tx.page.create({
          data: {
            siteId: site.id,
            slug: "home",
            name: "Home",
            path: "/",
            draftContent: [] as any,
            publishedContent: null as any,
            isHomePage: true,
            isPublished: false,
          },
        });
        console.log("✅ Created default home page");
      }

      return site;
    });

    // Revalidate paths
    revalidatePath("/app");
    revalidatePath("/onboarding");

    console.log("🎉 Template cloned successfully:", newSite.id);

    return {
      success: true,
      siteId: newSite.id,
    };
  } catch (error) {
    console.error("❌ Error cloning template:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to clone template",
    };
  }
}

/**
 * Check if subdomain is available
 */
export async function checkSubdomainAvailability(
  subdomain: string
): Promise<boolean> {
  const existing = await prisma.site.findUnique({
    where: { subdomain },
  });

  return !existing;
}

/**
 * Get template preview URL
 */
export function getTemplatePreviewUrl(subdomain: string): string {
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost:3000";
  return `https://${subdomain}.${appDomain}`;
}
