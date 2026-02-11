"use client";

import { Laptop, Tablet, Smartphone } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type DeviceMode = "desktop" | "tablet" | "mobile";

interface DeviceToggleProps {
  value: DeviceMode;
  onChange: (value: DeviceMode) => void;
}

export function DeviceToggle({ value, onChange }: DeviceToggleProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as DeviceMode)}>
      <TabsList>
        <TabsTrigger value="desktop" className="gap-2">
          <Laptop className="h-4 w-4" />
          <span className="hidden sm:inline">Desktop</span>
        </TabsTrigger>
        <TabsTrigger value="tablet" className="gap-2">
          <Tablet className="h-4 w-4" />
          <span className="hidden sm:inline">Tablet</span>
        </TabsTrigger>
        <TabsTrigger value="mobile" className="gap-2">
          <Smartphone className="h-4 w-4" />
          <span className="hidden sm:inline">Mobile</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
