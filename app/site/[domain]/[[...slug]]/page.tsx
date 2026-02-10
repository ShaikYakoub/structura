import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Renderer } from "@/components/renderer";
import type { Metadata } from "next";

interface SitePageProps {
  params: {
    domain: string;
    slug?: string[];
  };
}

export async function generateMetadata({
  params,
}: SitePageProps): Promise<Metadata> {
  const { domain, slug } = params;

  const site = await prisma.site.findUnique({
    where: { subdomain: domain },
    select: { name: true, description: true, id: true },
  });

  if (!site) {
    return {
      title: "Site Not Found",
    };
  }

  // Determine page path
  const pagePath = slug && slug.length > 0 ? `/${slug.join("/")}` : "/";

  // Find the page
  const page = await prisma.page.findFirst({
    where: {
      siteId: site.id,
      path: pagePath,
      isPublished: true,
    },
    select: { name: true },
  });

  return {
    title: page ? `${page.name} - ${site.name}` : site.name,
    description: site.description || `Welcome to ${site.name}`,
  };
}

export default async function SitePage({ params }: SitePageProps) {
  const { domain, slug } = params;

  // Find the site
  const site = await prisma.site.findUnique({
    where: { subdomain: domain },
  });

  if (!site) {
    notFound();
  }

  // Determine page path
  const pagePath = slug && slug.length > 0 ? `/${slug.join("/")}` : "/";

  // Find the page
  const page = await prisma.page.findFirst({
    where: {
      siteId: site.id,
      path: pagePath,
      isPublished: true,
    },
  });

  if (!page) {
    notFound();
  }

  // Parse content JSON
  const content = page.content as { sections: any[] } | null;
  const sections = content?.sections || [];

  return <Renderer sections={sections} />;
}
