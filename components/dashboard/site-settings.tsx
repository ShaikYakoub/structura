"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CheckCircle2, ExternalLink, Globe, Loader2 } from "lucide-react";

interface SiteSettingsProps {
  siteId: string;
  currentSubdomain: string;
  currentCustomDomain?: string | null;
}

export function SiteSettings({
  siteId,
  currentSubdomain,
  currentCustomDomain,
}: SiteSettingsProps) {
  const [subdomain, setSubdomain] = useState(currentSubdomain);
  const [customDomain, setCustomDomain] = useState(currentCustomDomain || "");
  const [isSaving, setIsSaving] = useState(false);

  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "shaikyakoub.com";
  const fullSubdomain = `${subdomain}.${appDomain}`;

  const handleSaveSubdomain = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/sites/${siteId}/domain`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subdomain }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update subdomain");
      }

      toast.success("Subdomain updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update subdomain");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCustomDomain = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/sites/${siteId}/domain`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customDomain }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update custom domain");
      }

      toast.success("Custom domain updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update custom domain");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Tabs defaultValue="subdomain" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="subdomain">Subdomain</TabsTrigger>
        <TabsTrigger value="custom">Custom Domain</TabsTrigger>
      </TabsList>

      {/* Subdomain Tab */}
      <TabsContent value="subdomain" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Subdomain Settings</CardTitle>
            <CardDescription>
              Choose a unique subdomain for your site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomain</Label>
              <div className="flex gap-2">
                <Input
                  id="subdomain"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                  placeholder="my-awesome-site"
                  className="font-mono"
                />
                <span className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
                  .{appDomain}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Only lowercase letters, numbers, and hyphens allowed
              </p>
            </div>

            <Alert>
              <Globe className="h-4 w-4" />
              <AlertDescription>
                Your site will be available at:{" "}
                <a
                  href={`https://${fullSubdomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline inline-flex items-center gap-1"
                >
                  {fullSubdomain}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleSaveSubdomain}
              disabled={isSaving || subdomain === currentSubdomain}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Save Subdomain
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Custom Domain Tab */}
      <TabsContent value="custom" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Custom Domain</CardTitle>
            <CardDescription>
              Connect your own domain to your site
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customDomain">Domain Name</Label>
              <Input
                id="customDomain"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
                placeholder="www.yourdomain.com"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Enter your domain without https://
              </p>
            </div>

            <Button
              onClick={handleSaveCustomDomain}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Save Custom Domain
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>DNS Configuration</CardTitle>
            <CardDescription>
              Follow these steps to connect your domain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0">
                  1
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Add your domain to Cloudflare</p>
                  <p className="text-sm text-muted-foreground">
                    Sign up at{" "}
                    <a
                      href="https://www.cloudflare.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      cloudflare.com
                    </a>{" "}
                    and add your domain
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0">
                  2
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Create a CNAME record</p>
                  <div className="rounded-lg border p-3 bg-muted font-mono text-sm space-y-1">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="col-span-2">CNAME</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="col-span-2">@ or www</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Target:</span>
                      <span className="col-span-2">{appDomain}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-muted-foreground">Proxy:</span>
                      <span className="col-span-2 text-orange-600">Proxied (orange cloud)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0">
                  3
                </div>
                <div className="space-y-1">
                  <p className="font-medium">SSL/TLS Settings</p>
                  <p className="text-sm text-muted-foreground">
                    In Cloudflare, set SSL/TLS mode to <strong>Full</strong> or <strong>Full (Strict)</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0">
                  4
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Wait for DNS propagation</p>
                  <p className="text-sm text-muted-foreground">
                    It may take up to 24-48 hours for DNS changes to propagate worldwide
                  </p>
                </div>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Note:</strong> Using Cloudflare's proxy (orange cloud) is recommended as it provides automatic SSL certificates and DDoS protection.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
