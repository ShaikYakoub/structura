import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Globe, DollarSign, TrendingUp } from "lucide-react";

async function getAdminStats() {
  const [totalUsers, totalSites, proSubscriptions, recentUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.site.count(),
      prisma.user.count({
        where: {
          isPro: true,
          razorpayCurrentPeriodEnd: {
            gte: new Date(),
          },
        },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          isPro: true,
        },
      }),
    ]);

  // Calculate revenue (₹999 per Pro user)
  const monthlyRevenue = proSubscriptions * 999;
  const annualRevenue = monthlyRevenue * 12;

  return {
    totalUsers,
    totalSites,
    proSubscriptions,
    monthlyRevenue,
    annualRevenue,
    recentUsers,
  };
}

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Overview</h1>
        <p className="text-muted-foreground">
          Platform statistics and recent activity
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
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats.proSubscriptions} subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Annual Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.annualRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Projected ARR</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <p className="font-medium">{user.name || "Anonymous"}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="text-right">
                  {user.isPro && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      PRO
                    </span>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
