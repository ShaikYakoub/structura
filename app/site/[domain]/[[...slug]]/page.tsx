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
    },
    select: { name: true, publishedContent: true },
  });

  // Only show metadata if page is published
  if (!page || !page.publishedContent) {
    return {
      title: `Coming Soon - ${site.name}`,
      description: site.description || `Welcome to ${site.name}`,
    };
  }

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
    },
  });

  if (!page) {
    notFound();
  }

  // Use publishedContent instead of draftContent for live site
  if (!page.publishedContent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Coming Soon</h1>
          <p className="mt-2 text-gray-600">This page has not been published yet.</p>
        </div>
      </div>
    );
  }

  // Parse publishedContent JSON
  const content = page.publishedContent as { sections: any[] } | null;
  const sections = content?.sections || [];

  return <Renderer sections={sections} />;
}
