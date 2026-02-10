import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/site/navbar";
import { StyleInjector } from "@/components/site/style-injector";

interface SiteLayoutProps {
  children: React.ReactNode;
  params: {
    domain: string;
  };
}

async function getSiteData(domain: string) {
  const site = await prisma.site.findUnique({
    where: { subdomain: domain },
    select: {
      id: true,
      name: true,
      logo: true,
      navColor: true,
      navigation: true,
      styles: true,
    },
  });

  if (!site) return null;

  return site;
}

export default async function SiteLayout({ children, params }: SiteLayoutProps) {
  const site = await getSiteData(params.domain);

  if (!site) {
    notFound();
  }

  // Parse navigation JSON
  const navigationData = Array.isArray(site.navigation) 
    ? site.navigation 
    : [];

  // Parse styles JSON
  const stylesData = typeof site.styles === 'object' && site.styles !== null
    ? site.styles 
    : {};

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* StyleInjector MUST be in <head> to prevent FOUC */}
        <StyleInjector styles={stylesData as any} />
      </head>
      <body className="min-h-screen bg-background font-body text-foreground antialiased">
        <Navbar
          data={navigationData}
          logo={site.logo}
          siteName={site.name}
          bgColor={site.navColor}
        />
        <main>{children}</main>
      </body>
    </html>
  );
}
