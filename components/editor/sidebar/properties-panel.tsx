"use client";

import { SectionEditor } from "@/components/section-editor";
import { componentRegistry } from "@/lib/registry";

interface Section {
  id: string;
  type: string;
  data: any;
  visible?: boolean;
}

interface PropertiesPanelProps {
  selectedSection?: Section;
  onUpdateProps: (data: any) => void;
}

export function PropertiesPanel({
  selectedSection,
  onUpdateProps,
}: PropertiesPanelProps) {
  if (!selectedSection) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        Select a section to edit its properties
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">
        {componentRegistry[selectedSection.type]?.schema?.name}
      </h3>
      <SectionEditor
        section={selectedSection}
        onChange={(data) => onUpdateProps(data)}
      />
    </div>
  );
}
