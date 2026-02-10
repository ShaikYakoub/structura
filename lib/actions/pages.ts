"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Validate slug format
function isValidSlug(slug: string): boolean {
  if (slug === "/" || slug === "") return true; // Home page
  return /^[a-z0-9-]+$/.test(slug);
}

// Convert name to URL-safe slug (internal helper)
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Create a new page
export async function createPage(siteId: string, name: string, slug: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const tenantId = (session.user as any).tenantId;

  // Verify site belongs to tenant
  const site = await prisma.site.findUnique({
    where: { id: siteId },
  });

  if (!site || site.tenantId !== tenantId) {
    throw new Error("Site not found");
  }

  // Validate slug
  if (!isValidSlug(slug)) {
    throw new Error(
      "Invalid slug. Use only lowercase letters, numbers, and hyphens.",
    );
  }

  // Check if slug already exists
  const existing = await prisma.page.findUnique({
    where: {
      siteId_slug: {
        siteId,
        slug,
      },
    },
  });

  if (existing) {
    throw new Error("A page with this slug already exists");
  }

  // Generate path
  const path = slug === "/" || slug === "" ? "/" : `/${slug}`;

  // Create page with empty sections
  const page = await prisma.page.create({
    data: {
      name,
      slug,
      path,
      siteId,
      content: { sections: [] },
      isPublished: false,
      isHomePage: slug === "/" || slug === "",
    },
  });

  revalidatePath(`/app/site/${siteId}/editor`);
  return page;
}

// Get all pages for a site
export async function getSitePages(siteId: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const tenantId = (session.user as any).tenantId;

  // Verify site belongs to tenant
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      pages: {
        orderBy: [
          { isHomePage: "desc" }, // Home page first
          { createdAt: "asc" },
        ],
      },
    },
  });

  if (!site || site.tenantId !== tenantId) {
    throw new Error("Site not found");
  }

  return site.pages;
}

// Get a specific page
export async function getPage(pageId: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const tenantId = (session.user as any).tenantId;

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: { site: true },
  });

  if (!page || page.site.tenantId !== tenantId) {
    throw new Error("Page not found");
  }

  return page;
}

// Update page content (JSON)
export async function updatePageContent(pageId: string, content: any) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const tenantId = (session.user as any).tenantId;

  // Verify page belongs to tenant
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: { site: true },
  });

  if (!page || page.site.tenantId !== tenantId) {
    throw new Error("Page not found");
  }

  await prisma.page.update({
    where: { id: pageId },
    data: {
      content,
      updatedAt: new Date(),
    },
  });

  // Revalidate both editor and live site
  revalidatePath(`/app/site/${page.siteId}/editor`);
  revalidatePath(`/site/${page.site.subdomain}`);
  if (!page.isHomePage) {
    revalidatePath(`/site/${page.site.subdomain}${page.path}`);
  }
}

// Update page metadata (name, slug, etc.)
export async function updatePageMetadata(
  pageId: string,
  data: { name?: string; slug?: string; isPublished?: boolean },
) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const tenantId = (session.user as any).tenantId;

  // Verify page belongs to tenant
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: { site: true },
  });

  if (!page || page.site.tenantId !== tenantId) {
    throw new Error("Page not found");
  }

  // Don't allow changing home page slug
  if (page.isHomePage && data.slug && data.slug !== "/" && data.slug !== "") {
    throw new Error("Cannot change home page slug");
  }

  // Validate new slug if provided
  if (data.slug && !isValidSlug(data.slug)) {
    throw new Error(
      "Invalid slug. Use only lowercase letters, numbers, and hyphens.",
    );
  }

  // Check slug uniqueness if changing
  if (data.slug && data.slug !== page.slug) {
    const existing = await prisma.page.findUnique({
      where: {
        siteId_slug: {
          siteId: page.siteId,
          slug: data.slug,
        },
      },
    });

    if (existing) {
      throw new Error("A page with this slug already exists");
    }
  }

  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.slug) {
    updateData.slug = data.slug;
    updateData.path =
      data.slug === "/" || data.slug === "" ? "/" : `/${data.slug}`;
  }
  if (typeof data.isPublished === "boolean") {
    updateData.isPublished = data.isPublished;
  }

  await prisma.page.update({
    where: { id: pageId },
    data: updateData,
  });

  revalidatePath(`/app/site/${page.siteId}/editor`);
  revalidatePath(`/site/${page.site.subdomain}`);
}

// Delete a page
export async function deletePage(pageId: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const tenantId = (session.user as any).tenantId;

  // Verify page belongs to tenant
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: { site: true },
  });

  if (!page || page.site.tenantId !== tenantId) {
    throw new Error("Page not found");
  }

  // Don't allow deleting home page
  if (page.isHomePage) {
    throw new Error("Cannot delete home page");
  }

  await prisma.page.delete({
    where: { id: pageId },
  });

  revalidatePath(`/app/site/${page.siteId}/editor`);
  revalidatePath(`/site/${page.site.subdomain}`);
}
