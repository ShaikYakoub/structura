"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Globe,
  Link,
  Trash2,
  Upload,
  User,
  Clock,
  Edit,
} from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  details: any;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
}

interface SiteActivityProps {
  siteId: string;
}

const ACTION_ICONS: Record<string, any> = {
  PAGE_CREATE: FileText,
  PAGE_DELETE: Trash2,
  PAGE_PUBLISH: Upload,
  PAGE_UPDATE: Edit,
  SITE_CREATE: Globe,
  SITE_DELETE: Trash2,
  SITE_PUBLISH: Upload,
  SITE_UPDATE: Edit,
  DOMAIN_UPDATE: Link,
  DOMAIN_VERIFY: Link,
};

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
};

function formatActionMessage(log: AuditLog): string {
  const userName = log.user.name || log.user.email;

  switch (log.action) {
    case "PAGE_CREATE":
      return `${userName} created page "${log.details?.pageTitle || 'Untitled'}"`;
    case "PAGE_DELETE":
      return `${userName} deleted page "${log.details?.pageTitle || 'Untitled'}"`;
    case "PAGE_PUBLISH":
      return `${userName} published page "${log.details?.pageTitle || 'Untitled'}"`;
    case "PAGE_UPDATE":
      return `${userName} updated page "${log.details?.pageTitle || 'Untitled'}"`;
    case "SITE_CREATE":
      return `${userName} created the site`;
    case "SITE_DELETE":
      return `${userName} deleted the site`;
    case "SITE_PUBLISH":
      return `${userName} published ${log.details?.pageCount || 0} pages`;
    case "SITE_UPDATE":
      return `${userName} updated site settings`;
    case "DOMAIN_UPDATE":
      return `${userName} updated domain from "${log.details?.previousDomain || "none"}" to "${log.details?.newDomain || 'none'}"`;
    case "DOMAIN_VERIFY":
      return `${userName} verified domain "${log.details?.domain || 'domain'}"`;
    default:
      return `${userName} performed ${log.action}`;
  }
}

export function SiteActivity({ siteId }: SiteActivityProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActivity();
  }, [siteId]);

  const loadActivity = async () => {
    try {
      const response = await fetch(`/api/audit-logs/${siteId}`);
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Failed to load activity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No activity recorded yet
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const Icon = ACTION_ICONS[log.action] || User;
              const colorClass = ACTION_COLORS[log.action] || "bg-gray-500/10 text-gray-500";

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  {/* Icon */}
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{formatActionMessage(log)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Badge */}
                  <Badge variant="outline" className="text-xs">
                    {log.entityType}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
