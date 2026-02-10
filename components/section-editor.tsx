"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/editor/fields/image-upload";
import { getSchema } from "@/lib/registry";
import type { FieldSchema } from "@/lib/registry";

interface SectionEditorProps {
  section: {
    type: string;
    data: any;
  };
  onChange: (data: any) => void;
}

export function SectionEditor({ section, onChange }: SectionEditorProps) {
  const schema = getSchema(section.type);

  if (!schema) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-500">
            Unknown component type: {section.type}
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleChange = (field: string, value: any) => {
    onChange({ ...section.data, [field]: value });
  };

  const handleArrayItemChange = (
    arrayField: string,
    index: number,
    itemField: string,
    value: any,
  ) => {
    const newArray = [...section.data[arrayField]];
    newArray[index] = { ...newArray[index], [itemField]: value };
    onChange({ ...section.data, [arrayField]: newArray });
  };

  const addArrayItem = (
    arrayField: string,
    itemSchema: Record<string, Omit<FieldSchema, "arrayItemSchema">>,
  ) => {
    const newItem: any = {};
    Object.entries(itemSchema).forEach(([key, field]) => {
      newItem[key] = field.defaultValue;
    });
    const newArray = [...(section.data[arrayField] || []), newItem];
    onChange({ ...section.data, [arrayField]: newArray });
  };

  const removeArrayItem = (arrayField: string, index: number) => {
    const newArray = section.data[arrayField].filter(
      (_: any, i: number) => i !== index,
    );
    onChange({ ...section.data, [arrayField]: newArray });
  };

  const renderField = (fieldKey: string, fieldSchema: FieldSchema) => {
    const value = section.data[fieldKey];

    // Array field - render nested items
    if (fieldSchema.type === "array" && fieldSchema.arrayItemSchema) {
      return (
        <div className="space-y-4" key={fieldKey}>
          <div className="flex items-center justify-between">
            <Label>{fieldSchema.label}</Label>
            <Button
              size="sm"
              onClick={() =>
                addArrayItem(fieldKey, fieldSchema.arrayItemSchema!)
              }
            >
              Add Item
            </Button>
          </div>

          {(value || []).map((item: any, index: number) => (
            <Card key={index} className="p-4">
              <div className="space-y-3">
                {Object.entries(fieldSchema.arrayItemSchema!).map(
                  ([itemFieldKey, itemFieldSchema]) => (
                    <div key={itemFieldKey} className="space-y-2">
                      <Label>{itemFieldSchema.label}</Label>
                      {itemFieldSchema.type === "text" && (
                        <Input
                          value={item[itemFieldKey] || ""}
                          onChange={(e) =>
                            handleArrayItemChange(
                              fieldKey,
                              index,
                              itemFieldKey,
                              e.target.value,
                            )
                          }
                        />
                      )}
                      {itemFieldSchema.type === "textarea" && (
                        <Textarea
                          value={item[itemFieldKey] || ""}
                          onChange={(e) =>
                            handleArrayItemChange(
                              fieldKey,
                              index,
                              itemFieldKey,
                              e.target.value,
                            )
                          }
                          rows={2}
                        />
                      )}
                    </div>
                  ),
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeArrayItem(fieldKey, index)}
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      );
    }

    // Regular fields
    return (
      <div className="space-y-2" key={fieldKey}>
        <Label htmlFor={`field-${fieldKey}`}>{fieldSchema.label}</Label>

        {fieldSchema.type === "text" && (
          <Input
            id={`field-${fieldKey}`}
            value={value || ""}
            onChange={(e) => handleChange(fieldKey, e.target.value)}
          />
        )}

        {fieldSchema.type === "textarea" && (
          <Textarea
            id={`field-${fieldKey}`}
            value={value || ""}
            onChange={(e) => handleChange(fieldKey, e.target.value)}
            rows={3}
          />
        )}

        {fieldSchema.type === "url" && (
          <Input
            id={`field-${fieldKey}`}
            type="url"
            value={value || ""}
            onChange={(e) => handleChange(fieldKey, e.target.value)}
            placeholder="https://..."
          />
        )}

        {fieldSchema.type === "select" && fieldSchema.options && (
          <Select
            value={value || fieldSchema.defaultValue}
            onValueChange={(newValue) => handleChange(fieldKey, newValue)}
          >
            <SelectTrigger id={`field-${fieldKey}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fieldSchema.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {fieldSchema.type === "image" && (
          <ImageUpload
            value={value || ""}
            onChange={(url) => handleChange(fieldKey, url)}
            label={fieldSchema.label}
          />
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{schema.name}</CardTitle>
        <p className="text-sm text-gray-500">{schema.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(schema.fields).map(([fieldKey, fieldSchema]) =>
          renderField(fieldKey, fieldSchema),
        )}
      </CardContent>
    </Card>
  );
}
