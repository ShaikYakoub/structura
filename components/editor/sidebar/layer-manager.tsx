"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Eye, EyeOff, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { componentRegistry } from "@/lib/registry";
import { useMediaQuery } from "@/hooks/use-media-query";

interface Section {
  id: string;
  type: string;
  data: any;
  visible?: boolean;
}

interface SortableItemProps {
  section: Section;
  index: number;
  totalItems: number;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isSelected: boolean;
  isMobile: boolean;
}

function SortableItem({
  section,
  index,
  totalItems,
  onToggleVisibility,
  onDelete,
  onSelect,
  onMoveUp,
  onMoveDown,
  isSelected,
  isMobile,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: section.id,
    disabled: isMobile,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const componentInfo =
    componentRegistry[section.type as keyof typeof componentRegistry];
  const componentName = componentInfo?.schema?.name || section.type;

  const isFirst = index === 0;
  const isLast = index === totalItems - 1;

  return (
    <Card
      ref={setNodeRef}
      style={isMobile ? undefined : style}
      className={`mb-2 ${
        isSelected ? "ring-2 ring-primary" : ""
      } ${isDragging ? "shadow-lg" : ""}`}
    >
      <div className="flex items-center gap-2 p-3">
        {/* Drag Handle - Only show on Desktop */}
        {!isMobile && (
          <button
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}

        {/* Mobile: Show Move Buttons */}
        {isMobile && (
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp(section.id);
              }}
              disabled={isFirst}
              title="Move up"
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown(section.id);
              }}
              disabled={isLast}
              title="Move down"
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Layer Info */}
        <div
          className="flex-1 cursor-pointer"
          onClick={() => onSelect(section.id)}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{componentName}</span>
            <Badge variant="secondary" className="text-xs">
              #{index + 1}
            </Badge>
          </div>
          {section.data.title && (
            <p className="text-xs text-muted-foreground truncate">
              {section.data.title}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Desktop: Show Move Buttons on Hover */}
          {!isMobile && (
            <div className="hidden group-hover:flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp(section.id);
                }}
                disabled={isFirst}
                title="Move up"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown(section.id);
                }}
                disabled={isLast}
                title="Move down"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Visibility Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onToggleVisibility(section.id)}
          >
            {section.visible !== false ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => onDelete(section.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface LayerManagerProps {
  sections: Section[];
  onReorder: (sections: Section[]) => void;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
  onSelectSection: (id: string) => void;
  selectedSectionId?: string;
}

export function LayerManager({
  sections,
  onReorder,
  onToggleVisibility,
  onDelete,
  onSelectSection,
  selectedSectionId,
}: LayerManagerProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevents accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      const reorderedSections = arrayMove(sections, oldIndex, newIndex);
      onReorder(reorderedSections);
    }
  };

  const handleMoveUp = (id: string) => {
    const index = sections.findIndex((s) => s.id === id);
    if (index <= 0) return;

    const newSections = [...sections];
    [newSections[index], newSections[index - 1]] = 
      [newSections[index - 1], newSections[index]];
    
    onReorder(newSections);
  };

  const handleMoveDown = (id: string) => {
    const index = sections.findIndex((s) => s.id === id);
    if (index >= sections.length - 1) return;

    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = 
      [newSections[index + 1], newSections[index]];
    
    onReorder(newSections);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-1">Layers</h3>
        <p className="text-xs text-muted-foreground">
          {isMobile 
            ? "Use arrow buttons to reorder" 
            : "Drag to reorder sections"
          }
        </p>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          No sections yet. Add a component to get started.
        </div>
      ) : (
        <>
          {!isMobile ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {sections.map((section, index) => (
                  <SortableItem
                    key={section.id}
                    section={section}
                    index={index}
                    totalItems={sections.length}
                    onToggleVisibility={onToggleVisibility}
                    onDelete={onDelete}
                    onSelect={onSelectSection}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    isSelected={selectedSectionId === section.id}
                    isMobile={false}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            <div className="space-y-2">
              {sections.map((section, index) => (
                <Card
                  key={section.id}
                  className={`${
                    selectedSectionId === section.id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2 p-3">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveUp(section.id);
                        }}
                        disabled={index === 0}
                        title="Move up"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveDown(section.id);
                        }}
                        disabled={index === sections.length - 1}
                        title="Move down"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>

                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => onSelectSection(section.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {componentRegistry[section.type as keyof typeof componentRegistry]?.schema?.name || section.type}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                      {section.data.title && (
                        <p className="text-xs text-muted-foreground truncate">
                          {section.data.title}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onToggleVisibility(section.id)}
                      >
                        {section.visible !== false ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => onDelete(section.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
