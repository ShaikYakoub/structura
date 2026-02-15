import prisma from "@/lib/prisma";
import { SiteManagementTable } from "@/components/admin/site-management-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Phone, HelpCircle } from "lucide-react";

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

      {/* Support Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <HelpCircle className="h-5 w-5" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-700 mb-4">
            If you need assistance with site management or have questions about the platform.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100" asChild>
              <a href="mailto:support@structura.com">
                <Mail className="mr-2 h-4 w-4" />
                Email Support
              </a>
            </Button>
            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100" asChild>
              <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </a>
            </Button>
            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100" asChild>
              <a href="tel:+1234567890">
                <Phone className="mr-2 h-4 w-4" />
                Call Support
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <SiteManagementTable sites={sitesWithStatus} />
    </div>
  );
}
