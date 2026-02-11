"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ExternalLink, ShieldAlert, CheckCircle } from "lucide-react";
import { takedownSite, restoreSite } from "@/app/actions/admin";

interface Site {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  createdAt: Date;
  banned: boolean;
  bannedAt: Date | null;
  banReason: string | null;
  isPublished: boolean;
  pageCount: number;
}

export function SiteManagementTable({ sites }: { sites: Site[] }) {
  const [showTakedownDialog, setShowTakedownDialog] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [takedownReason, setTakedownReason] = useState("");

  const handleTakedown = async () => {
    if (!selectedSite) return;

    const result = await takedownSite(selectedSite.id, takedownReason);
    
    if (result.success) {
      toast.success(result.message);
      setShowTakedownDialog(false);
      setTakedownReason("");
    } else {
      toast.error(result.message);
    }
  };

  const handleRestore = async (siteId: string) => {
    const result = await restoreSite(siteId);
    toast.success(result.message);
  };

  const getSiteUrl = (site: Site) => {
    const domain = site.customDomain || `${site.subdomain}.shaikyakoub.com`;
    return `https://${domain}`;
  };

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Site</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Pages</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sites.map((site) => (
              <TableRow key={site.id}>
                <TableCell>
                  <p className="font-medium">{site.name}</p>
                </TableCell>
                <TableCell>
                  <p className="font-mono text-sm">
                    {site.customDomain || `${site.subdomain}.shaikyakoub.com`}
                  </p>
                </TableCell>
                <TableCell>{site.pageCount}</TableCell>
                <TableCell>
                  {new Date(site.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {site.banned ? (
                    <Badge variant="destructive">Banned</Badge>
                  ) : site.isPublished ? (
                    <Badge>Published</Badge>
                  ) : (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      disabled={site.banned}
                    >
                      <a
                        href={getSiteUrl(site)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </a>
                    </Button>
                    {site.banned ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(site.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Restore
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSite(site);
                          setShowTakedownDialog(true);
                        }}
                      >
                        <ShieldAlert className="h-4 w-4 mr-1" />
                        Takedown
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Takedown Dialog */}
      <Dialog open={showTakedownDialog} onOpenChange={setShowTakedownDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Take Down Site
            </DialogTitle>
            <DialogDescription>
              This will immediately ban the site and make it inaccessible.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for takedown</Label>
              <Input
                id="reason"
                value={takedownReason}
                onChange={(e) => setTakedownReason(e.target.value)}
                placeholder="Spam, phishing, illegal content, etc."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTakedownDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleTakedown}>
              Take Down Site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
