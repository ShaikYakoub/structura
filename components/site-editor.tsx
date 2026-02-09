"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateSite } from "@/lib/actions";
import type { Site } from "@prisma/client";

const siteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  content: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, "Must be valid JSON"),
});

type SiteFormData = z.infer<typeof siteSchema>;

interface SiteEditorProps {
  site: Site;
}

export function SiteEditor({ site }: SiteEditorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      name: site.name,
      description: site.description || "",
      content: JSON.stringify(site.content, null, 2),
    },
  });

  const onSubmit = async (data: SiteFormData) => {
    setLoading(true);
    setError("");

    try {
      await updateSite(site.id, {
        name: data.name,
        description: data.description || null,
        content: JSON.parse(data.content),
      });

      router.refresh();
    } catch (err) {
      setError("Failed to update site");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Site Details</CardTitle>
          <CardDescription>Update your site information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Site Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="My Awesome Site"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="A brief description of your site"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content (JSON)</Label>
            <Textarea
              id="content"
              {...register("content")}
              placeholder='{"sections": []}'
              rows={15}
              className="font-mono text-sm"
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            window.open(`http://${site.subdomain}.localhost:3000`, "_blank")
          }
        >
          Preview Site
        </Button>
      </div>
    </form>
  );
}
