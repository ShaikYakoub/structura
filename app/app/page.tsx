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

export default async function AdminDashboard() {
  const session = await auth();
  const tenantId = (session?.user as any)?.tenantId;

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
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Sites</h1>
        <p className="text-gray-600 mt-2">Manage your multi-tenant sites</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => (
          <Card key={site.id}>
            <CardHeader>
              <CardTitle>{site.name}</CardTitle>
              <CardDescription>{site.subdomain}.localhost:3000</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {site.description && (
                <p className="text-sm text-gray-600">{site.description}</p>
              )}
              <div className="flex gap-2">
                <Link href={`/app/site/${site.id}`}>
                  <Button size="sm">Edit</Button>
                </Link>
                <a
                  href={`http://${site.subdomain}.localhost:3000`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sites.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              No sites yet. Get started by running the seed script.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
