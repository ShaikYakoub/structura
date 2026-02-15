import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIGenerator } from "@/components/dashboard/ai-generator";
import { SiteCard } from "@/components/dashboard/site-card";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">
            Please sign in to access your dashboard.
          </p>
        </div>
      </div>
    );
  }

  const tenantId = (session?.user as any)?.tenantId;

  if (!tenantId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Setup Required</h1>
          <p className="text-muted-foreground mb-4">
            Your account needs to be set up. Please complete the onboarding
            process.
          </p>
          <Button asChild>
            <Link href="/onboarding">Start Setup</Link>
          </Button>
        </div>
      </div>
    );
  }

  const sites = await prisma.site.findMany({
    where: { tenantId },
    include: {
      tenant: true,
      _count: {
        select: { pages: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Sites</h1>
          <p className="text-gray-600 mt-2">Manage your multi-tenant sites</p>
        </div>
        <AIGenerator />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
      </div>

      {sites.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">No sites yet</h2>
              <p className="text-gray-500">
                Get started by creating your first site with AI or browse
                templates
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <AIGenerator />
              <Button variant="outline" asChild>
                <Link href="/templates">Browse Templates</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
