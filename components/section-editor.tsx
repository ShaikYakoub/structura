"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SectionEditorProps {
  section: {
    type: string;
    data: any;
  };
  onChange: (data: any) => void;
}

export function SectionEditor({ section, onChange }: SectionEditorProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ ...section.data, [field]: value });
  };

  const handleFeatureChange = (index: number, field: string, value: string) => {
    const newFeatures = [...section.data.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    onChange({ ...section.data, features: newFeatures });
  };

  const addFeature = () => {
    const newFeatures = [
      ...section.data.features,
      { title: "New Feature", description: "Description" },
    ];
    onChange({ ...section.data, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = section.data.features.filter(
      (_: any, i: number) => i !== index,
    );
    onChange({ ...section.data, features: newFeatures });
  };

  if (section.type === "hero") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hero-title">Title</Label>
            <Input
              id="hero-title"
              value={section.data.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-subtitle">Subtitle</Label>
            <Textarea
              id="hero-subtitle"
              value={section.data.subtitle}
              onChange={(e) => handleChange("subtitle", e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero-image">Image URL</Label>
            <Input
              id="hero-image"
              value={section.data.image}
              onChange={(e) => handleChange("image", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (section.type === "features") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Features Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="features-title">Section Title</Label>
            <Input
              id="features-title"
              value={section.data.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>

          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <Label>Features</Label>
              <Button size="sm" onClick={addFeature}>
                Add Feature
              </Button>
            </div>

            {section.data.features.map((feature: any, index: number) => (
              <Card key={index} className="p-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={feature.title}
                      onChange={(e) =>
                        handleFeatureChange(index, "title", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={feature.description}
                      onChange={(e) =>
                        handleFeatureChange(
                          index,
                          "description",
                          e.target.value,
                        )
                      }
                      rows={2}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeFeature(index)}
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
