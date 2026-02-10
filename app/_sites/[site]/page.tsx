import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { componentRegistry } from "@/lib/registry";

interface SitePageProps {
  params: {
    site: string;
  };
}

async function getSiteHomePage(siteIdentifier: string) {
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

  // Get the home page (isHomePage: true or slug: "home" or slug: "")
  const page = await prisma.page.findFirst({
    where: {
      siteId: site.id,
      OR: [
        { isHomePage: true },
        { slug: "home" },
        { slug: "" },
      ],
    },
    select: {
      id: true,
      name: true,
      publishedContent: true,
      lastPublishedAt: true,
    },
    orderBy: [
      { isHomePage: "desc" },
      { createdAt: "asc" },
    ],
  });

  return page;
}

export default async function SiteHomePage({ params }: SitePageProps) {
  const page = await getSiteHomePage(params.site);

  if (!page || !page.publishedContent) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Coming Soon</h1>
          <p className="text-muted-foreground">
            This site is being built. Check back soon!
          </p>
        </div>
      </div>
    );
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
