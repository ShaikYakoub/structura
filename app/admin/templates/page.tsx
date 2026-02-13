import prisma from "@/lib/prisma";
import { TemplateManager } from "@/components/admin/template-manager";

export default async function TemplatesPage() {
  // Fetch all published sites
  const sites = await prisma.site.findMany({
    where: {
      pages: {
        some: {
          lastPublishedAt: {
            not: null,
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      subdomain: true,
      customDomain: true,
      isTemplate: true,
      tenant: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          pages: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Format sites for the component (rename tenant to user for compatibility)
  const formattedSites = sites.map(site => ({
    ...site,
    user: {
      name: site.tenant.name,
      email: site.tenant.email,
    },
  }));

  // Fetch current templates
  const currentTemplates = await prisma.site.findMany({
    where: {
      isTemplate: true,
    },
    select: {
      id: true,
      name: true,
      subdomain: true,
      customDomain: true,
      templateCategory: true,
      templateDescription: true,
      thumbnailUrl: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Format templates for the component
  const formattedTemplates = currentTemplates.map(template => ({
    id: template.id,
    name: template.name,
    description: template.templateDescription || "",
    thumbnailUrl: template.thumbnailUrl,
    category: template.templateCategory || "other",
    site: {
      id: template.id,
      name: template.name,
      subdomain: template.subdomain,
      customDomain: template.customDomain,
    },
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Template Management</h1>
        <p className="text-muted-foreground">
          Convert published sites into reusable templates for users
        </p>
      </div>

      <TemplateManager sites={formattedSites} currentTemplates={formattedTemplates} />
    </div>
  );
}
