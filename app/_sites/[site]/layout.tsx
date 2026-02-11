import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/site/navbar";
import { StyleInjector } from "@/components/site/style-injector";
import { AnalyticsTracker } from "@/components/analytics/tracker";
import { CookieBanner } from "@/components/site/cookie-banner";

interface SiteLayoutProps {
  children: React.ReactNode;
  params: {
    site: string;
  };
}

async function getSiteData(siteIdentifier: string) {
  // Try to find by subdomain first, then by custom domain
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
      navColor: true,
      navigation: true,
      styles: true,
      subdomain: true,
      customDomain: true,
      customHeadCode: true,
      customBodyCode: true,
      cookieBannerEnabled: true,
    },
  });

  return site;
}

export default async function SiteLayout({ children, params }: SiteLayoutProps) {
  const site = await getSiteData(params.site);

  if (!site) {
    notFound();
  }

  const navigationData = Array.isArray(site.navigation) ? site.navigation : [];
  const stylesData = typeof site.styles === 'object' ? site.styles : {};

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StyleInjector styles={stylesData as any} />
        {site.customHeadCode && (
          <div
            dangerouslySetInnerHTML={{ __html: site.customHeadCode }}
            suppressHydrationWarning
          />
        )}
      </head>
      <body className="min-h-screen bg-background font-body text-foreground antialiased">
        <Navbar
          data={navigationData as any}
          logo={site.logo}
          siteName={site.name}
          bgColor={site.navColor}
        />
        {children}
        <AnalyticsTracker siteId={site.id} />
        {site.cookieBannerEnabled && <CookieBanner />}
        {site.customBodyCode && (
          <div
            dangerouslySetInnerHTML={{ __html: site.customBodyCode }}
            suppressHydrationWarning
          />
        )}
      </body>
    </html>
  );
}
