"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Palette, Type } from "lucide-react";

interface ThemeSettingsProps {
  siteId: string;
  currentStyles: {
    primary?: string;
    background?: string;
    foreground?: string;
    muted?: string;
    mutedForeground?: string;
    fontHeading?: string;
    fontBody?: string;
    radius?: string;
  };
}

const AVAILABLE_FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Playfair Display",
  "Poppins",
  "Raleway",
  "Merriweather",
  "Source Sans Pro",
] as const;

export function ThemeSettings({ siteId, currentStyles }: ThemeSettingsProps) {
  const [styles, setStyles] = useState(currentStyles);
  const [isSaving, setIsSaving] = useState(false);

  const handleColorChange = (key: string, value: string) => {
    setStyles(prev => ({ ...prev, [key]: value }));
  };

  const handleFontChange = (key: string, value: string) => {
    setStyles(prev => ({ ...prev, [key]: value }));
  };

  const handleRadiusChange = (value: number[]) => {
    setStyles(prev => ({ ...prev, radius: (value[0] / 10).toString() }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/sites/${siteId}/styles`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ styles }),
      });

      if (!response.ok) throw new Error("Failed to save theme");

      toast.success("Theme saved successfully");
      
      // Refresh the preview iframe if exists
      window.dispatchEvent(new CustomEvent('theme-updated', { detail: styles }));
    } catch (error) {
      toast.error("Failed to save theme");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Theme Settings</h2>
          <p className="text-sm text-muted-foreground">
            Customize your site&apos;s appearance
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} size="sm">
          {isSaving ? "Saving..." : "Save Theme"}
        </Button>
      </div>

      {/* Colors Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            Colors
          </CardTitle>
          <CardDescription>
            Choose your brand colors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primary">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="primary"
                type="color"
                value={styles.primary || "#000000"}
                onChange={(e) => handleColorChange("primary", e.target.value)}
                className="h-10 w-20 cursor-pointer"
              />
              <Input
                type="text"
                value={styles.primary || "#000000"}
                onChange={(e) => handleColorChange("primary", e.target.value)}
                placeholder="#000000"
                className="flex-1 font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="background">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="background"
                type="color"
                value={styles.background || "#ffffff"}
                onChange={(e) => handleColorChange("background", e.target.value)}
                className="h-10 w-20 cursor-pointer"
              />
              <Input
                type="text"
                value={styles.background || "#ffffff"}
                onChange={(e) => handleColorChange("background", e.target.value)}
                placeholder="#ffffff"
                className="flex-1 font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="foreground">Text Color</Label>
            <div className="flex gap-2">
              <Input
                id="foreground"
                type="color"
                value={styles.foreground || "#000000"}
                onChange={(e) => handleColorChange("foreground", e.target.value)}
                className="h-10 w-20 cursor-pointer"
              />
              <Input
                type="text"
                value={styles.foreground || "#000000"}
                onChange={(e) => handleColorChange("foreground", e.target.value)}
                placeholder="#000000"
                className="flex-1 font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="muted">Muted Background</Label>
            <div className="flex gap-2">
              <Input
                id="muted"
                type="color"
                value={styles.muted || "#f1f5f9"}
                onChange={(e) => handleColorChange("muted", e.target.value)}
                className="h-10 w-20 cursor-pointer"
              />
              <Input
                type="text"
                value={styles.muted || "#f1f5f9"}
                onChange={(e) => handleColorChange("muted", e.target.value)}
                placeholder="#f1f5f9"
                className="flex-1 font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Type className="h-4 w-4" />
            Typography
          </CardTitle>
          <CardDescription>
            Select fonts for your site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fontHeading">Heading Font</Label>
            <Select
              value={styles.fontHeading || "Inter"}
              onValueChange={(value) => handleFontChange("fontHeading", value)}
            >
              <SelectTrigger id="fontHeading">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_FONTS.map((font) => (
                  <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontBody">Body Font</Label>
            <Select
              value={styles.fontBody || "Inter"}
              onValueChange={(value) => handleFontChange("fontBody", value)}
            >
              <SelectTrigger id="fontBody">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_FONTS.map((font) => (
                  <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Preview */}
          <div className="rounded-lg border p-4 space-y-2">
            <p
              className="text-sm font-semibold"
              style={{ fontFamily: styles.fontHeading || "Inter" }}
            >
              This is a heading preview
            </p>
            <p
              className="text-sm"
              style={{ fontFamily: styles.fontBody || "Inter" }}
            >
              This is body text preview. The quick brown fox jumps over the lazy dog.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Border Radius */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Border Radius</CardTitle>
          <CardDescription>
            Adjust the roundness of elements (0px - 20px)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Radius</Label>
              <span className="text-sm text-muted-foreground">
                {((parseFloat(styles.radius || "0.5") * 10) || 5).toFixed(0)}px
              </span>
            </div>
            <Slider
              value={[(parseFloat(styles.radius || "0.5") * 10) || 5]}
              onValueChange={handleRadiusChange}
              min={0}
              max={20}
              step={1}
              className="w-full"
            />
          </div>

          {/* Radius Preview */}
          <div className="grid grid-cols-3 gap-2">
            {[0, 8, 16].map((r) => (
              <div
                key={r}
                className="h-16 border-2 border-primary"
                style={{
                  borderRadius: `${r}px`,
                  backgroundColor: styles.primary || "#000000",
                  opacity: 0.1,
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
