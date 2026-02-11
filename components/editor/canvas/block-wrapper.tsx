"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
} from "lucide-react";

interface BlockWrapperProps {
  section: any;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onToggleVisibility?: () => void;
  isMobile?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  children: ReactNode;
}

export function BlockWrapper({
  section,
  isSelected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
  onToggleVisibility,
  isMobile = false,
  isFirst = false,
  isLast = false,
  children,
}: BlockWrapperProps) {
  const [isHovered, setIsHovered] = useState(false);

  const showToolbar = isMobile || isHovered || isSelected;

  return (
    <div
      className={`relative group ${
        isSelected ? "ring-2 ring-primary" : ""
      } ${
        section.visible === false ? "opacity-50" : ""
      }`}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onClick={() => onSelect(section.id)}
    >
      {showToolbar && (
        <div
          className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between gap-2 bg-primary text-primary-foreground px-2 py-1 ${
            isMobile ? "relative" : "-translate-y-full"
          }`}
        >
          <div className="flex items-center gap-2">
            {!isMobile && (
              <GripVertical className="h-4 w-4 cursor-grab" />
            )}
            <span className="text-xs font-medium">
              {section.type.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={(event) => {
                event.stopPropagation();
                onMoveUp();
              }}
              disabled={isFirst}
              title="Move up"
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={(event) => {
                event.stopPropagation();
                onMoveDown();
              }}
              disabled={isLast}
              title="Move down"
            >
              <ArrowDown className="h-3 w-3" />
            </Button>

            {onToggleVisibility && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleVisibility();
                }}
                title={section.visible === false ? "Show" : "Hide"}
              >
                {section.visible === false ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary-foreground hover:bg-destructive"
              onClick={(event) => {
                event.stopPropagation();
                if (confirm("Delete this section?")) {
                  onDelete();
                }
              }}
              title="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      <div>{children}</div>
    </div>
  );
}
