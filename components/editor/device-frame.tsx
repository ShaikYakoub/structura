"use client";

import type { ReactNode } from "react";
import { DeviceMode } from "./device-toggle";

interface DeviceFrameProps {
  deviceMode: DeviceMode;
  children: ReactNode;
}

const DEVICE_WIDTHS: Record<DeviceMode, string> = {
  desktop: "w-full",
  tablet: "max-w-[768px]",
  mobile: "max-w-[375px]",
};

export function DeviceFrame({ deviceMode, children }: DeviceFrameProps) {
  const isFramed = deviceMode !== "desktop";

  return (
    <div className="editor-canvas flex-1 overflow-y-auto bg-muted/30 p-4 md:p-8">
      <div
        className={`device-frame mx-auto transition-all duration-300 ${
          DEVICE_WIDTHS[deviceMode]
        } ${
          isFramed
            ? "border border-border rounded-lg shadow-2xl bg-background"
            : ""
        }`}
      >
        {deviceMode === "mobile" && (
          <div className="h-6 bg-gray-900 rounded-t-lg flex items-center justify-center">
            <div className="w-20 h-1 bg-gray-700 rounded-full" />
          </div>
        )}

        <div className={deviceMode === "mobile" ? "rounded-b-lg overflow-hidden" : ""}>
          {children}
        </div>

        {deviceMode === "mobile" && (
          <div className="h-8 bg-gray-900 rounded-b-lg flex items-center justify-center">
            <div className="w-10 h-1 bg-gray-700 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
