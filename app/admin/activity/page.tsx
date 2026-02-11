import { Suspense } from "react";
import { getRecentActivity } from "@/lib/audit-logger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Activity } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  PAGE_CREATE: "bg-blue-500/10 text-blue-500",
  PAGE_DELETE: "bg-red-500/10 text-red-500",
  PAGE_PUBLISH: "bg-green-500/10 text-green-500",
  PAGE_UPDATE: "bg-yellow-500/10 text-yellow-500",
  SITE_CREATE: "bg-blue-500/10 text-blue-500",
  SITE_DELETE: "bg-red-500/10 text-red-500",
  SITE_PUBLISH: "bg-green-500/10 text-green-500",
  SITE_UPDATE: "bg-yellow-500/10 text-yellow-500",
  DOMAIN_UPDATE: "bg-purple-500/10 text-purple-500",
  DOMAIN_VERIFY: "bg-purple-500/10 text-purple-500",
  SUBSCRIPTION_START: "bg-green-500/10 text-green-500",
  SUBSCRIPTION_CANCEL: "bg-red-500/10 text-red-500",
};

async function ActivityList() {
  const activities = await getRecentActivity(100);

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => {
        const colorClass =
          ACTION_COLORS[activity.action] || "bg-gray-500/10 text-gray-500";

        return (
          <div
            key={activity.id}
            className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            {/* User & Site Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm">
                  {activity.user.name || activity.user.email}
                </p>
                <Badge variant="outline" className={`text-xs ${colorClass}`}>
                  {activity.action}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                on {activity.entityType}{" "}
                <span className="font-medium">{activity.entityId}</span>
              </p>

              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(activity.createdAt).toLocaleString()}
                </div>
                {activity.site && (
                  <div>
                    Site: {activity.site.name} ({activity.site.subdomain})
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}

export default function AdminActivityPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Platform Activity</h1>
        <p className="text-muted-foreground mt-2">
          Monitor recent actions across all sites and users
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity (Last 100)</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ActivitySkeleton />}>
            <ActivityList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
