"use client";

import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import type { Site, Page } from "@prisma/client";
import { Renderer } from "@/components/renderer";
import { SectionEditor } from "@/components/section-editor";
import { Button } from "@/components/ui/button";
import { updatePageContent } from "@/lib/actions/pages";
import { saveDraft } from "@/app/actions/publish";
import { toast } from "sonner";
import { Save, PlusCircle } from "lucide-react";
import Link from "next/link";
import { componentRegistry, getDefaultData } from "@/lib/registry";
import { PageManager } from "@/components/editor/page-manager";
import { LayerManager } from "@/components/editor/sidebar/layer-manager";
import { ActionListInput } from "@/components/editor/inputs/action-list-input";

interface VisualEditorProps {
  site: Site;
  initialPage: Page | null;
}

interface Section {
  id: string;
  type: string;
  data: any;
  visible?: boolean;
}

export function VisualEditor({ site, initialPage }: VisualEditorProps) {
  const [currentPage, setCurrentPage] = useState<Page | null>(initialPage);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  // Load sections when page changes
  useEffect(() => {
    if (currentPage) {
      const content = currentPage.draftContent as { sections: Section[] } | null;
      const loadedSections = content?.sections || [];
      
      // Ensure all sections have IDs
      const sectionsWithIds = loadedSections.map(section => ({
        ...section,
        id: section.id || nanoid(),
        visible: section.visible !== false,
      }));
      
      setSections(sectionsWithIds);
      setSelectedSectionId(undefined);
    }
  }, [currentPage?.id]);

  const handleSectionUpdate = (id: string, updatedData: any) => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === id ? { ...section, data: updatedData } : section
      )
    );
  };

  const handleAddSection = (type: string) => {
    const defaultData = getDefaultData(type);
    const newSection: Section = {
      id: nanoid(),
      type,
      data: defaultData,
      visible: true,
    };
    setSections(prevSections => [...prevSections, newSection]);
    setSelectedSectionId(newSection.id);
  };

  const handleDeleteSection = (id: string) => {
    setSections(prevSections => prevSections.filter(section => section.id !== id));
    if (selectedSectionId === id) {
      setSelectedSectionId(undefined);
    }
    toast.success("Section deleted");
  };

  const handleReorder = async (reorderedSections: Section[]) => {
    setSections(reorderedSections);
    
    // Auto-save to draft
    if (currentPage) {
      await saveDraft(currentPage.id, { sections: reorderedSections });
      toast.success("Section order updated");
    }
  };

  const handleToggleVisibility = (id: string) => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === id
          ? { ...section, visible: section.visible !== false ? false : true }
          : section
      )
    );
  };

  const handleSave = async () => {
    if (!currentPage) {
      toast.error("No page selected");
      return;
    }

    setSaving(true);
    try {
      await updatePageContent(currentPage.id, { sections });
      toast.success("Page saved successfully!");
    } catch (error) {
      toast.error("Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
  };

  const selectedSection = sections.find(s => s.id === selectedSectionId);

  // Get available component types from registry
  const availableComponents = Object.entries(componentRegistry).map(
    ([key, entry]) => ({
      key,
      name: entry.schema.name,
      category: entry.schema.category,
    }),
  );

  if (!currentPage) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Visual Editor</h1>
            <p className="text-sm text-gray-500">{site.name}</p>
          </div>
          <PageManager
            siteId={site.id}
            currentPageId={currentPage.id}
            onPageChange={handlePageChange}
          />
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

      {/* Main Content - Three Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Layer Manager */}
        <div className="w-64 border-r bg-background overflow-y-auto">
          <LayerManager
            sections={sections}
            onReorder={handleReorder}
            onToggleVisibility={handleToggleVisibility}
            onDelete={handleDeleteSection}
            onSelectSection={setSelectedSectionId}
            selectedSectionId={selectedSectionId}
          />
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
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
                  {site.subdomain}.localhost:3000{currentPage.path}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-white">
                {sections.filter(section => section.visible !== false).map((section) => {
                  const Component = componentRegistry[section.type]?.component;
                  if (!Component) return null;
                  
                  return (
                    <div
                      key={section.id}
                      className={`${
                        selectedSectionId === section.id
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedSectionId(section.id)}
                    >
                      <Component {...section.data} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties Panel */}
        <div className="w-80 border-l bg-background overflow-y-auto">
          <div className="p-4">
            {/* Add Section Button */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Add Section</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(componentRegistry).map(([key, entry]) => (
                  <Button
                    key={key}
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddSection(key)}
                    className="justify-start text-xs"
                  >
                    <PlusCircle className="h-3 w-3 mr-1" />
                    {entry.schema.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Section Properties */}
            {selectedSection ? (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">
                  {componentRegistry[selectedSection.type]?.schema?.name}
                </h3>

                <SectionEditor
                  section={selectedSection}
                  onChange={(data) => handleSectionUpdate(selectedSection.id, data)}
                />
              </div>
            ) : (
              <div className="border-t pt-4 text-center text-muted-foreground text-sm">
                Select a section to edit its properties
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
