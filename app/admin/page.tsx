import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Globe, DollarSign, LayoutTemplate } from "lucide-react";
import { UserManagementTable } from "@/components/admin/user-management-table";

async function getAdminStats() {
  const [totalUsers, totalSites, totalTemplates, proSubscriptions, allUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.site.count(),
      prisma.site.count({
        where: {
          isTemplate: true,
        },
      }),
      prisma.user.count({
        where: {
          isPro: true,
          razorpayCurrentPeriodEnd: {
            gte: new Date(),
          },
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          isPro: true,
          createdAt: true,
          bannedAt: true,
          banReason: true,
          tenant: {
            select: {
              sites: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      }),
    ]);

  // Calculate revenue (₹999 per Pro user)
  const monthlyRevenue = proSubscriptions * 999;
  const annualRevenue = monthlyRevenue * 12;

  return {
    totalUsers,
    totalSites,
    totalTemplates,
    proSubscriptions,
    monthlyRevenue,
    annualRevenue,
    allUsers,
  };
}

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  // Transform users to match expected shape
  const transformedUsers = stats.allUsers.map((user) => ({
    ...user,
    _count: {
      sites: user.tenant?.sites.length || 0,
    },
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Overview</h1>
        <p className="text-muted-foreground">
          Platform statistics and user management
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.proSubscriptions} Pro users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalSites.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Published websites</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Templates
            </CardTitle>
            <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalTemplates.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Available templates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="text-lg font-bold">
                  ₹{stats.monthlyRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Monthly</p>
              </div>
              <div>
                <div className="text-lg font-bold">
                  ₹{stats.annualRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Annual</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <UserManagementTable users={transformedUsers} />
    </div>
  );
}
