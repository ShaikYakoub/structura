"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Sparkles } from "lucide-react";
import {
  getTemplates,
  getTemplateCategories,
  getTemplatePreviewUrl,
  type Template,
} from "@/app/actions/templates";
import { Skeleton } from "@/components/ui/skeleton";

interface TemplatePickerProps {
  onSelectTemplate: (template: Template) => void;
  selectedCategory?: string;
}

export function TemplatePicker({
  onSelectTemplate,
  selectedCategory = "all",
}: TemplatePickerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState(selectedCategory);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, [activeCategory]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const [fetchedTemplates, fetchedCategories] = await Promise.all([
        getTemplates(activeCategory === "all" ? undefined : activeCategory),
        getTemplateCategories(),
      ]);

      setTemplates(fetchedTemplates);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      {categories.length > 0 && (
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList>
            <TabsTrigger value="all">All Templates</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Template Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No templates found in this category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-muted">
                {template.thumbnailUrl ? (
                  <Image
                    src={template.thumbnailUrl}
                    alt={template.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Sparkles className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  {template.templateCategory && (
                    <Badge variant="secondary">
                      {template.templateCategory}
                    </Badge>
                  )}
                </div>
                {template.templateDescription && (
                  <CardDescription>
                    {template.templateDescription}
                  </CardDescription>
                )}
              </CardHeader>

              <CardFooter className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <a
                    href={getTemplatePreviewUrl(template.subdomain)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </a>
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => onSelectTemplate(template)}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
