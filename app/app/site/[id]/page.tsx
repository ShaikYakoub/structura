import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SiteEditor } from "@/components/site-editor";
import { NavManager } from "@/components/editor/panels/nav-manager";
import { ThemeSettings } from "@/components/editor/panels/theme-settings";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SiteEditorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SiteEditorPage({ params }: SiteEditorPageProps) {
  const { id } = await params;
  const session = await auth();
  const tenantId = (session?.user as any)?.tenantId;

  const site = await prisma.site.findUnique({
    where: { id },
    include: { pages: true },
  });

  if (!site || site.tenantId !== tenantId) {
    notFound();
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Edit Site</h1>
          <p className="text-gray-600 mt-2">{site.subdomain}.localhost:3000</p>
        </div>
        <Link href={`/app/site/${id}/editor`}>
          <Button>Visual Editor</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SiteEditor site={site} />
        </div>
        <div className="space-y-6">
          <ThemeSettings
            siteId={site.id}
            currentStyles={typeof site.styles === 'object' && site.styles !== null ? site.styles : {}}
          />
          <NavManager
            siteId={site.id}
            currentNavigation={Array.isArray(site.navigation) ? site.navigation : []}
            pages={site.pages}
          />
        </div>
      </div>
    </div>
  );
}
