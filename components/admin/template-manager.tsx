"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  Search,
} from "lucide-react";
import Image from "next/image";

interface Site {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  isTemplate: boolean;
  user: {
    name: string | null;
    email: string;
  };
  _count: {
    pages: number;
  };
}

interface Template {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string | null;
  category: string;
  site: {
    id: string;
    name: string;
    subdomain: string;
    customDomain: string | null;
  };
}

interface TemplateManagerProps {
  sites: Site[];
  currentTemplates: Template[];
}

export function TemplateManager({
  sites,
  currentTemplates,
}: TemplateManagerProps) {
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "business",
    thumbnailUrl: "",
  });

  // Helper function to validate URLs
  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Filter sites based on search
  const filteredSites = sites.filter(
    (site) =>
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.subdomain.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle site selection
  const handleSiteSelect = (siteId: string) => {
    setSelectedSiteId(siteId);
    const site = sites.find((s) => s.id === siteId);
    if (site) {
      setFormData({
        ...formData,
        name: site.name,
        description: `A beautiful ${site.name} template`,
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSiteId) {
      toast.error("Please select a site");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Template name is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: selectedSiteId,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          thumbnailUrl: formData.thumbnailUrl || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Template created successfully!");
        // Reset form
        setSelectedSiteId("");
        setFormData({
          name: "",
          description: "",
          category: "business",
          thumbnailUrl: "",
        });
        // Refresh page to show new template
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to create template");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle template deletion
  const handleDelete = async (templateId: string) => {
    if (!confirm("Are you sure you want to remove this template?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/templates/${templateId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Template removed successfully!");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to remove template");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Create Template Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Template</CardTitle>
          <CardDescription>
            Select a published site and convert it into a reusable template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Site Selection with Search */}
            <div className="space-y-2">
              <Label htmlFor="site">Select Site</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedSiteId} onValueChange={handleSiteSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a site to convert" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {filteredSites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                          <span className="font-medium">{site.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {site.subdomain} • {site._count.pages} pages •{" "}
                            {site.user.name || site.user.email}
                          </span>
                        </div>
                        {site.isTemplate && (
                          <Badge variant="secondary" className="ml-2">
                            Template
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                  {filteredSites.length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No sites found
                    </div>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only sites with published pages are shown
              </p>
            </div>

            {/* Template Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Modern Business Landing Page"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what this template is best for..."
                rows={3}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="portfolio">Portfolio</SelectItem>
                  <SelectItem value="ecommerce">E-Commerce</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="landing">Landing Page</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Thumbnail URL */}
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              {formData.thumbnailUrl && isValidUrl(formData.thumbnailUrl) ? (
                <div className="relative aspect-video rounded-lg overflow-hidden border">
                  <Image
                    src={formData.thumbnailUrl}
                    alt="Template thumbnail"
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() =>
                      setFormData({ ...formData, thumbnailUrl: "" })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Input
                  id="thumbnail"
                  value={formData.thumbnailUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnailUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              )}
              <p className="text-xs text-muted-foreground">
                Recommended: 1200x630px (16:9 ratio)
              </p>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!isLoading && <Plus className="mr-2 h-4 w-4" />}
              Create Template
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Current Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Templates ({currentTemplates.length})</CardTitle>
          <CardDescription>
            Currently available templates for users to choose from
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentTemplates.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No templates yet. Create your first template to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors"
                >
                  {/* Thumbnail */}
                  {template.thumbnailUrl &&
                    isValidUrl(template.thumbnailUrl) && (
                      <div className="relative aspect-video rounded-md overflow-hidden">
                        <Image
                          src={template.thumbnailUrl}
                          alt={template.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                  {/* Template Info */}
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        Source: {template.site.subdomain}.structura.com
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <a
                        href={`http://${template.site.subdomain}.localhost:3000`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-3 w-3" />
                        Preview
                      </a>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
