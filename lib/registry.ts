import { ComponentType } from "react";
import { HeroSection } from "@/components/sections/hero-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { CTASection } from "@/components/sections/cta-section";

// Field types supported in the editor
export type FieldType =
  | "text"
  | "textarea"
  | "url"
  | "select"
  | "image"
  | "array";

// Schema for a single field
export interface FieldSchema {
  label: string;
  type: FieldType;
  defaultValue: any;
  options?: string[]; // For select fields
  arrayItemSchema?: Record<string, Omit<FieldSchema, "arrayItemSchema">>; // For array fields
}

// Schema for a component
export interface ComponentSchema {
  name: string;
  description: string;
  category: string;
  fields: Record<string, FieldSchema>;
  defaultData: Record<string, any>;
}

// Registry entry combining component and schema
export interface RegistryEntry {
  component: ComponentType<{ data: any }>;
  schema: ComponentSchema;
}

// The main registry
export const componentRegistry: Record<string, RegistryEntry> = {
  hero: {
    component: HeroSection,
    schema: {
      name: "Hero",
      description: "Large banner section with image and text",
      category: "headers",
      fields: {
        title: {
          label: "Title",
          type: "text",
          defaultValue: "Welcome to Our Site",
        },
        subtitle: {
          label: "Subtitle",
          type: "textarea",
          defaultValue: "Your journey starts here",
        },
        image: {
          label: "Background Image",
          type: "image",
          defaultValue:
            "https://images.unsplash.com/photo-1557683316-973673baf926?w=800",
        },
      },
      defaultData: {
        title: "Welcome to Our Site",
        subtitle: "Your journey starts here",
        image:
          "https://images.unsplash.com/photo-1557683316-973673baf926?w=800",
      },
    },
  },

  features: {
    component: FeaturesSection,
    schema: {
      name: "Features",
      description: "Grid of feature cards",
      category: "content",
      fields: {
        title: {
          label: "Section Title",
          type: "text",
          defaultValue: "Our Features",
        },
        features: {
          label: "Features",
          type: "array",
          defaultValue: [
            { title: "Feature 1", description: "Description here" },
            { title: "Feature 2", description: "Description here" },
            { title: "Feature 3", description: "Description here" },
          ],
          arrayItemSchema: {
            title: {
              label: "Feature Title",
              type: "text",
              defaultValue: "Feature Title",
            },
            description: {
              label: "Feature Description",
              type: "textarea",
              defaultValue: "Feature description",
            },
          },
        },
      },
      defaultData: {
        title: "Our Features",
        features: [
          { title: "Feature 1", description: "Description here" },
          { title: "Feature 2", description: "Description here" },
          { title: "Feature 3", description: "Description here" },
        ],
      },
    },
  },

  cta: {
    component: CTASection,
    schema: {
      name: "Call to Action",
      description: "Prominent call-to-action section with button",
      category: "marketing",
      fields: {
        title: {
          label: "Title",
          type: "text",
          defaultValue: "Ready to Get Started?",
        },
        subtitle: {
          label: "Subtitle",
          type: "textarea",
          defaultValue: "Join thousands of satisfied customers today",
        },
        buttonText: {
          label: "Button Text",
          type: "text",
          defaultValue: "Get Started",
        },
        buttonLink: {
          label: "Button Link",
          type: "url",
          defaultValue: "#",
        },
        variant: {
          label: "Style",
          type: "select",
          defaultValue: "primary",
          options: ["primary", "outline"],
        },
      },
      defaultData: {
        title: "Ready to Get Started?",
        subtitle: "Join thousands of satisfied customers today",
        buttonText: "Get Started",
        buttonLink: "#",
        variant: "primary",
      },
    },
  },
};

// Helper functions
export function getComponent(
  type: string,
): ComponentType<{ data: any }> | null {
  return componentRegistry[type]?.component || null;
}

export function getSchema(type: string): ComponentSchema | null {
  return componentRegistry[type]?.schema || null;
}

export function getDefaultData(type: string): Record<string, any> {
  return componentRegistry[type]?.schema.defaultData || {};
}

export function getAllComponentTypes(): string[] {
  return Object.keys(componentRegistry);
}

export function getComponentsByCategory(category: string): string[] {
  return Object.entries(componentRegistry)
    .filter(([_, entry]) => entry.schema.category === category)
    .map(([key]) => key);
}
