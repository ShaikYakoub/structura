"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { componentRegistry } from "@/lib/registry";

interface ComponentLibraryProps {
  onSelectComponent: (type: string) => void;
}

export function ComponentLibrary({ onSelectComponent }: ComponentLibraryProps) {
  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2">Add Section</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(componentRegistry).map(([key, entry]) => (
            <Button
              key={key}
              size="sm"
              variant="outline"
              onClick={() => onSelectComponent(key)}
              className="justify-start text-xs"
            >
              <PlusCircle className="h-3 w-3 mr-1" />
              {entry.schema.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
