"use client";

import { useState } from "react";
import type { Site } from "@prisma/client";
import { Renderer } from "@/components/renderer";
import { SectionEditor } from "@/components/section-editor";
import { Button } from "@/components/ui/button";
import { updateSite } from "@/lib/actions";
import { toast } from "sonner";
import { PlusCircle, Save } from "lucide-react";
import Link from "next/link";

interface VisualEditorProps {
  site: Site;
}

interface Section {
  type: string;
  data: any;
}

const DEFAULT_SECTIONS: Record<string, Section> = {
  hero: {
    type: "hero",
    data: {
      title: "New Hero Section",
      subtitle: "Add your subtitle here",
      image: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800",
    },
  },
  features: {
    type: "features",
    data: {
      title: "Features",
      features: [
        { title: "Feature 1", description: "Description here" },
        { title: "Feature 2", description: "Description here" },
        { title: "Feature 3", description: "Description here" },
      ],
    },
  },
};

export function VisualEditor({ site }: VisualEditorProps) {
  const initialContent = site.content as { sections: Section[] } | null;
  const [sections, setSections] = useState<Section[]>(
    initialContent?.sections || [],
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSectionUpdate = (index: number, updatedData: any) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], data: updatedData };
    setSections(newSections);
  };

  const handleAddSection = (type: string) => {
    setSections([...sections, DEFAULT_SECTIONS[type]]);
    setSelectedIndex(sections.length);
  };

  const handleDeleteSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
    setSelectedIndex(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSite(site.id, {
        name: site.name,
        description: site.description,
        content: { sections },
      });
      toast.success("Site saved successfully!");
    } catch (error) {
      toast.error("Failed to save site");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Visual Editor</h1>
          <p className="text-sm text-gray-500">{site.name}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/app/site/${site.id}`}>
            <Button variant="outline">Back</Button>
          </Link>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden grid grid-cols-12 gap-0">
        {/* Left Column - Controls */}
        <div className="col-span-4 bg-gray-50 border-r border-gray-200 overflow-y-auto">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Sections</h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddSection("hero")}
                >
                  <PlusCircle className="w-4 h-4 mr-1" />
                  Hero
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddSection("features")}
                >
                  <PlusCircle className="w-4 h-4 mr-1" />
                  Features
                </Button>
              </div>
            </div>

            {sections.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-4">No sections yet</p>
                <Button onClick={() => handleAddSection("hero")}>
                  Add your first section
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedIndex === index
                        ? "border-blue-500 bg-white shadow"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">{section.type}</p>
                        <p className="text-xs text-gray-500">
                          {section.type === "hero" && section.data.title}
                          {section.type === "features" && section.data.title}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(index);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Section Editor */}
            {selectedIndex !== null && sections[selectedIndex] && (
              <div className="mt-6">
                <SectionEditor
                  section={sections[selectedIndex]}
                  onChange={(data) => handleSectionUpdate(selectedIndex, data)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Canvas */}
        <div className="col-span-8 bg-gray-100 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
              {/* Browser Chrome */}
              <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-600">
                  {site.subdomain}.localhost:3000
                </div>
              </div>

              {/* Preview */}
              <div className="bg-white">
                <Renderer sections={sections} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
