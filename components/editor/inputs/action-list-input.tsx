"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";

export interface Action {
  label: string;
  href: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
}

interface ActionListInputProps {
  value: Action[];
  onChange: (actions: Action[]) => void;
  label?: string;
  maxActions?: number;
}

export function ActionListInput({
  value = [],
  onChange,
  label = "Actions",
  maxActions = 3,
}: ActionListInputProps) {
  const handleAddAction = () => {
    if (value.length >= maxActions) return;

    const newAction: Action = {
      label: "Button",
      href: "#",
      variant: "default",
    };

    onChange([...value, newAction]);
  };

  const handleRemoveAction = (index: number) => {
    const newActions = value.filter((_, i) => i !== index);
    onChange(newActions);
  };

  const handleUpdateAction = (
    index: number,
    field: keyof Action,
    newValue: string
  ) => {
    const newActions = value.map((action, i) => {
      if (i === index) {
        return { ...action, [field]: newValue };
      }
      return action;
    });
    onChange(newActions);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {value.length < maxActions && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddAction}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Button
          </Button>
        )}
      </div>

      {value.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            No buttons yet. Click "Add Button" to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {value.map((action, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                    Button {index + 1}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() => handleRemoveAction(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Label */}
                <div className="space-y-1">
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={action.label}
                    onChange={(e) =>
                      handleUpdateAction(index, "label", e.target.value)
                    }
                    placeholder="Button text"
                  />
                </div>

                {/* Link */}
                <div className="space-y-1">
                  <Label className="text-xs">Link</Label>
                  <Input
                    value={action.href}
                    onChange={(e) =>
                      handleUpdateAction(index, "href", e.target.value)
                    }
                    placeholder="/contact or https://..."
                  />
                </div>

                {/* Variant */}
                <div className="space-y-1">
                  <Label className="text-xs">Style</Label>
                  <Select
                    value={action.variant || "default"}
                    onValueChange={(value) =>
                      handleUpdateAction(index, "variant", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Primary (Solid)</SelectItem>
                      <SelectItem value="outline">Outline</SelectItem>
                      <SelectItem value="ghost">Ghost</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
