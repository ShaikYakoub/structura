import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { componentRegistry } from "@/lib/registry";

interface SiteSlugPageProps {
  params: {
    site: string;
    slug: string;
  };
}

async function getSitePage(siteIdentifier: string, slug: string) {
  const site = await prisma.site.findFirst({
    where: {
      OR: [
        { subdomain: siteIdentifier },
        { customDomain: siteIdentifier },
      ],
    },
    select: { id: true },
  });

  if (!site) return null;

  const page = await prisma.page.findUnique({
    where: {
      siteId_slug: {
        siteId: site.id,
        slug: slug,
      },
    },
    select: {
      id: true,
      name: true,
      publishedContent: true,
      lastPublishedAt: true,
    },
  });

  return page;
}

export default async function SiteSlugPage({ params }: SiteSlugPageProps) {
  const page = await getSitePage(params.site, params.slug);

  if (!page || !page.publishedContent) {
    notFound();
  }

  const blocks = Array.isArray(page.publishedContent)
    ? page.publishedContent
    : [];

  return (
    <div>
      {blocks.map((block: any, index: number) => {
        const componentInfo = componentRegistry[block.type as keyof typeof componentRegistry];
        
        if (!componentInfo) return null;

        const Component = componentInfo.component;
        return <Component key={index} {...block.data} />;
      })}
    </div>
  );
}
