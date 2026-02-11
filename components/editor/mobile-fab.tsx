"use client";

import { Button } from "@/components/ui/button";
import { Layers, Settings, Plus } from "lucide-react";

interface MobileFABProps {
  onLayersClick: () => void;
  onPropertiesClick: () => void;
  onAddClick: () => void;
}

export function MobileFAB({
  onLayersClick,
  onPropertiesClick,
  onAddClick,
}: MobileFABProps) {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      <Button
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg"
        onClick={onAddClick}
      >
        <Plus className="h-5 w-5" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        className="h-12 w-12 rounded-full shadow-lg"
        onClick={onPropertiesClick}
      >
        <Settings className="h-5 w-5" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        className="h-12 w-12 rounded-full shadow-lg"
        onClick={onLayersClick}
      >
        <Layers className="h-5 w-5" />
      </Button>
    </div>
  );
}
