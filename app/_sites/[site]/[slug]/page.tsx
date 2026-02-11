import { notFound } from "next/navigation";
import { Metadata } from "next";
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
    select: { 
      id: true,
      name: true,
      logo: true,
    },
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
      seoTitle: true,
      seoDescription: true,
      seoKeywords: true,
      seoImage: true,
    },
  });

  if (!page) return null;

  return { page, site };
}

// Generate dynamic metadata for slug pages
export async function generateMetadata({
  params,
}: SiteSlugPageProps): Promise<Metadata> {
  const data = await getSitePage(params.site, params.slug);

  if (!data) {
    return {
      title: "Page Not Found",
    };
  }

  const { page, site } = data;
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost:3000";
  const siteUrl = params.site.includes('.')
    ? `https://${params.site}`
    : `https://${params.site}.${appDomain}`;

  return {
    title: page.seoTitle || `${page.name} | ${site.name}`,
    description: page.seoDescription || `Visit ${page.name} on ${site.name}`,
    keywords: page.seoKeywords || undefined,
    
    // Open Graph
    openGraph: {
      title: page.seoTitle || page.name,
      description: page.seoDescription || `Visit ${page.name} on ${site.name}`,
      url: `${siteUrl}/${params.slug}`,
      siteName: site.name,
      images: page.seoImage
        ? [
            {
              url: page.seoImage,
              width: 1200,
              height: 630,
              alt: page.seoTitle || page.name,
            },
          ]
        : site.logo
        ? [
            {
              url: site.logo,
              width: 1200,
              height: 630,
              alt: site.name,
            },
          ]
        : [],
      type: "website",
    },
    
    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title: page.seoTitle || page.name,
      description: page.seoDescription || `Visit ${page.name} on ${site.name}`,
      images: page.seoImage ? [page.seoImage] : site.logo ? [site.logo] : [],
    },
    
    // Additional
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `${siteUrl}/${params.slug}`,
    },
  };
}

export default async function SiteSlugPage({ params }: SiteSlugPageProps) {
  const data = await getSitePage(params.site, params.slug);

  if (!data || !data.page.publishedContent) {
    notFound();
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
