"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function TemplateManagementPage() {
  const [siteId, setSiteId] = useState("");
  const [isTemplate, setIsTemplate] = useState(false);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleMarkAsTemplate = async () => {
    if (!siteId) {
      toast.error("Please enter a site ID");
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/sites/${siteId}/template`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isTemplate,
          templateCategory: category || null,
          templateDescription: description || null,
          thumbnailUrl: thumbnailUrl || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update");
      }

      toast.success("Template settings updated successfully");
      
      // Reset form
      setSiteId("");
      setIsTemplate(false);
      setCategory("");
      setDescription("");
      setThumbnailUrl("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update template");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Template Management</h1>
        <p className="text-muted-foreground">
          Mark sites as templates and manage their metadata
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mark Site as Template</CardTitle>
          <CardDescription>
            Convert an existing site into a reusable template
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteId">Site ID</Label>
            <Input
              id="siteId"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              placeholder="Enter site UUID"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Get this from the database or site URL
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isTemplate"
              checked={isTemplate}
              onCheckedChange={setIsTemplate}
            />
            <Label htmlFor="isTemplate">Mark as Template</Label>
          </div>

          {isTemplate && (
            <>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="portfolio">Portfolio</SelectItem>
                    <SelectItem value="ecommerce">E-Commerce</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this template..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground">
                  Recommended size: 1200x630px
                </p>
              </div>
            </>
          )}

          <Button 
            onClick={handleMarkAsTemplate} 
            className="w-full"
            disabled={isUpdating || !siteId}
          >
            {isUpdating ? "Updating..." : "Update Template Settings"}
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ol className="list-decimal list-inside space-y-2">
            <li>Create a site with the desired design and content</li>
            <li>Publish the site so content is available</li>
            <li>Copy the site ID from the database</li>
            <li>Use this form to mark it as a template</li>
            <li>The template will appear in the onboarding flow</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
