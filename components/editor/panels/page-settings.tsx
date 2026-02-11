"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

interface PageSettingsProps {
  pageId: string;
  initialData: {
    name: string;
    slug: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoKeywords?: string | null;
    seoImage?: string | null;
  };
}

export function PageSettings({ pageId, initialData }: PageSettingsProps) {
  const [name, setName] = useState(initialData.name);
  const [slug, setSlug] = useState(initialData.slug);
  const [seoTitle, setSeoTitle] = useState(initialData.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialData.seoDescription || "");
  const [seoKeywords, setSeoKeywords] = useState(initialData.seoKeywords || "");
  const [seoImage, setSeoImage] = useState(initialData.seoImage || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
          seoKeywords: seoKeywords || null,
          seoImage: seoImage || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      toast.success("Page settings saved");
    } catch (error) {
      toast.error("Failed to save page settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Basic page information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Page Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Home"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="home"
            />
            <p className="text-xs text-muted-foreground">
              URL: yoursite.com/{slug || "home"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
          <CardDescription>
            Optimize your page for search engines and social sharing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seoTitle">SEO Title</Label>
            <Input
              id="seoTitle"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="My Awesome Page | Site Name"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">
              {seoTitle.length}/60 characters • Shown in search results
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoDescription">SEO Description</Label>
            <Textarea
              id="seoDescription"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="A brief description of your page..."
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">
              {seoDescription.length}/160 characters • Shown in search results
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoKeywords">Keywords</Label>
            <Input
              id="seoKeywords"
              value={seoKeywords}
              onChange={(e) => setSeoKeywords(e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated keywords for SEO
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoImage">Social Share Image (OG Image)</Label>
            <Input
              id="seoImage"
              value={seoImage}
              onChange={(e) => setSeoImage(e.target.value)}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 1200x630px • Used when sharing on social media
            </p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Save Settings
      </Button>
    </div>
  );
}
