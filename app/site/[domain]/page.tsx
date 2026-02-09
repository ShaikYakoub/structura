import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Renderer } from "@/components/renderer";
import type { Metadata } from "next";

interface SitePageProps {
  params: Promise<{
    domain: string;
  }>;
}

export async function generateMetadata({
  params,
}: SitePageProps): Promise<Metadata> {
  const { domain } = await params;

  const site = await prisma.site.findUnique({
    where: { subdomain: domain },
    select: { name: true, description: true },
  });

  if (!site) {
    return {
      title: "Site Not Found",
    };
  }

  return {
    title: site.name,
    description: site.description || `Welcome to ${site.name}`,
  };
}

export default async function SitePage({ params }: SitePageProps) {
  const { domain } = await params;

  const site = await prisma.site.findUnique({
    where: { subdomain: domain },
  });

  if (!site) {
    notFound();
  }

  // Parse content JSON
  const content = site.content as { sections: any[] } | null;
  const sections = content?.sections || [];

  return <Renderer sections={sections} />;
}
