import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/site/navbar";
import { StyleInjector } from "@/components/site/style-injector";

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
      </head>
      <body className="min-h-screen bg-background font-body text-foreground antialiased">
        <Navbar
          data={navigationData as any}
          logo={site.logo}
          siteName={site.name}
          bgColor={site.navColor}
        />
        {children}
      </body>
    </html>
  );
}
