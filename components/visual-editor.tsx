"use client";

import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import type { Site, Page } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { updatePageContent } from "@/lib/actions/pages";
import { saveDraft } from "@/app/actions/publish";
import { toast } from "sonner";
import { Save } from "lucide-react";
import Link from "next/link";
import { componentRegistry, getDefaultData } from "@/lib/registry";
import { PageManager } from "@/components/editor/page-manager";
import { LayerManager } from "@/components/editor/sidebar/layer-manager";
import { ComponentLibrary } from "@/components/editor/sidebar/component-library";
import { PropertiesPanel } from "@/components/editor/sidebar/properties-panel";
import { useMediaQuery } from "@/hooks/use-media-query";
import { DeviceToggle, DeviceMode } from "@/components/editor/device-toggle";
import { DeviceFrame } from "@/components/editor/device-frame";
import { MobileSidebar } from "@/components/editor/mobile-sidebar";
import { MobileFAB } from "@/components/editor/mobile-fab";
import { MobileRecommendationBanner } from "@/components/editor/mobile-recommendation-banner";
import { BlockWrapper } from "@/components/editor/canvas/block-wrapper";

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
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [showLayersSidebar, setShowLayersSidebar] = useState(false);
  const [showPropertiesSidebar, setShowPropertiesSidebar] = useState(false);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const isMobileDevice = useMediaQuery("(max-width: 768px)");

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

  useEffect(() => {
    if (isMobileDevice && deviceMode !== "mobile") {
      setDeviceMode("mobile");
    }
  }, [isMobileDevice, deviceMode]);

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

  const handleMoveSection = (sectionId: string, direction: "up" | "down") => {
    setSections((prevSections) => {
      const index = prevSections.findIndex((section) => section.id === sectionId);
      if (index === -1) return prevSections;

      if (direction === "up" && index === 0) return prevSections;
      if (direction === "down" && index === prevSections.length - 1) return prevSections;

      const newSections = [...prevSections];
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      [newSections[index], newSections[targetIndex]] = [
        newSections[targetIndex],
        newSections[index],
      ];

      if (currentPage) {
        void saveDraft(currentPage.id, { sections: newSections });
        toast.success(`Section moved ${direction}`);
      }

      return newSections;
    });
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
  const handleSelectedSectionUpdate = (data: any) => {
    if (!selectedSection) return;
    handleSectionUpdate(selectedSection.id, data);
  };

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
      {isMobileDevice && <MobileRecommendationBanner />}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
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

          {!isMobileDevice && (
            <DeviceToggle value={deviceMode} onChange={setDeviceMode} />
          )}

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
      </header>

      {/* Main Content - Three Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {!isMobileDevice && (
          <aside className="w-64 border-r bg-background overflow-y-auto">
            <LayerManager
              sections={sections}
              onReorder={handleReorder}
              onToggleVisibility={handleToggleVisibility}
              onDelete={handleDeleteSection}
              onSelectSection={setSelectedSectionId}
              selectedSectionId={selectedSectionId}
            />
          </aside>
        )}

        <DeviceFrame deviceMode={deviceMode}>
          <div className="w-full mx-auto">
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
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

              <div className="bg-white">
                {sections.map((section, index) => {
                  const Component = componentRegistry[section.type]?.component;
                  if (!Component) return null;

                  return (
                    <BlockWrapper
                      key={section.id}
                      section={section}
                      isSelected={selectedSectionId === section.id}
                      onSelect={setSelectedSectionId}
                      onMoveUp={() => handleMoveSection(section.id, "up")}
                      onMoveDown={() => handleMoveSection(section.id, "down")}
                      onDelete={() => handleDeleteSection(section.id)}
                      onToggleVisibility={() => handleToggleVisibility(section.id)}
                      isMobile={isMobileDevice}
                      isFirst={index === 0}
                      isLast={index === sections.length - 1}
                    >
                      <Component {...section.data} />
                    </BlockWrapper>
                  );
                })}
              </div>
            </div>
          </div>
        </DeviceFrame>

        {!isMobileDevice && (
          <aside className="w-80 border-l bg-background overflow-y-auto">
            <ComponentLibrary onSelectComponent={handleAddSection} />
            <div className="border-t">
              <PropertiesPanel
                selectedSection={selectedSection}
                onUpdateProps={handleSelectedSectionUpdate}
              />
            </div>
          </aside>
        )}

        {isMobileDevice && (
          <MobileFAB
            onLayersClick={() => setShowLayersSidebar(true)}
            onPropertiesClick={() => setShowPropertiesSidebar(true)}
            onAddClick={() => setShowComponentLibrary(true)}
          />
        )}

        {isMobileDevice && (
          <>
            <MobileSidebar
              isOpen={showLayersSidebar}
              onClose={() => setShowLayersSidebar(false)}
              title="Layers"
            >
              <LayerManager
                sections={sections}
                onReorder={handleReorder}
                onToggleVisibility={handleToggleVisibility}
                onDelete={handleDeleteSection}
                onSelectSection={(id) => {
                  setSelectedSectionId(id);
                  setShowLayersSidebar(false);
                }}
                selectedSectionId={selectedSectionId}
              />
            </MobileSidebar>

            <MobileSidebar
              isOpen={showPropertiesSidebar}
              onClose={() => setShowPropertiesSidebar(false)}
              title="Properties"
            >
              <PropertiesPanel
                selectedSection={selectedSection}
                onUpdateProps={handleSelectedSectionUpdate}
              />
            </MobileSidebar>

            <MobileSidebar
              isOpen={showComponentLibrary}
              onClose={() => setShowComponentLibrary(false)}
              title="Add Component"
            >
              <ComponentLibrary
                onSelectComponent={(type) => {
                  handleAddSection(type);
                  setShowComponentLibrary(false);
                }}
              />
            </MobileSidebar>
          </>
        )}
      </div>
    </div>
  );
}
