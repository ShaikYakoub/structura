import { notFound } from "next/navigation";
import { Metadata } from "next";
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
    select: { 
      id: true,
      name: true,
      logo: true,
    },
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
      seoTitle: true,
      seoDescription: true,
      seoKeywords: true,
      seoImage: true,
    },
    orderBy: [
      { isHomePage: "desc" },
      { createdAt: "asc" },
    ],
  });

  if (!page) return null;

  return { page, site };
}

// Generate dynamic metadata for home page
export async function generateMetadata({
  params,
}: SitePageProps): Promise<Metadata> {
  const data = await getSiteHomePage(params.site);

  if (!data) {
    return {
      title: "Site Not Found",
    };
  }

  const { page, site } = data;
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost:3000";
  const siteUrl = params.site.includes('.')
    ? `https://${params.site}`
    : `https://${params.site}.${appDomain}`;

  return {
    title: page.seoTitle || site.name,
    description: page.seoDescription || `Welcome to ${site.name}`,
    keywords: page.seoKeywords || undefined,
    
    // Open Graph
    openGraph: {
      title: page.seoTitle || site.name,
      description: page.seoDescription || `Welcome to ${site.name}`,
      url: siteUrl,
      siteName: site.name,
      images: page.seoImage
        ? [{ url: page.seoImage, width: 1200, height: 630, alt: page.seoTitle || site.name }]
        : site.logo
        ? [{ url: site.logo, width: 1200, height: 630, alt: site.name }]
        : [],
      type: "website",
    },
    
    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title: page.seoTitle || site.name,
      description: page.seoDescription || `Welcome to ${site.name}`,
      images: page.seoImage ? [page.seoImage] : site.logo ? [site.logo] : [],
    },
    
    // Additional
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: siteUrl,
    },
  };
}

export default async function SiteHomePage({ params }: SitePageProps) {
  const data = await getSiteHomePage(params.site);

  if (!data || !data.page.publishedContent) {
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

  const blocks = Array.isArray(data.page.publishedContent)
    ? data.page.publishedContent
    : [];

  return (
    <div>
      {blocks.map((block: any, index: number) => {
        const componentInfo = componentRegistry[block.type as keyof typeof componentRegistry];
        
        if (!componentInfo) return null;

        const Component = componentInfo.component;
        const blockProps = { 
          ...block.data,
          // Pass siteId and siteName for forms
          siteId: data.site.id,
          siteName: data.site.name,
        };
        return <Component key={index} {...blockProps} />;
      })}
    </div>
  );
}
