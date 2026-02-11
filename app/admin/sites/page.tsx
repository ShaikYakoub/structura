import prisma from "@/lib/prisma";
import { SiteManagementTable } from "@/components/admin/site-management-table";

async function getAllSites() {
  return await prisma.site.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      subdomain: true,
      customDomain: true,
      createdAt: true,
      banned: true,
      bannedAt: true,
      banReason: true,
      pages: {
        select: {
          id: true,
          publishedContent: true,
        },
      },
    },
  });
}

export default async function AdminSitesPage() {
  const sites = await getAllSites();

  const sitesWithStatus = sites.map((site) => ({
    ...site,
    isPublished: site.pages.some((page) => page.publishedContent !== null),
    pageCount: site.pages.length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Site Management</h1>
        <p className="text-muted-foreground">
          Manage all published sites on the platform
        </p>
      </div>

      <SiteManagementTable sites={sitesWithStatus} />
    </div>
  );
}
