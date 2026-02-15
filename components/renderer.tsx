import { getComponent } from "@/lib/registry";

interface Section {
  id: string;
  type: string;
  content: any;
}

interface RendererProps {
  sections: Section[];
}

export function Renderer({ sections }: RendererProps) {
  return (
    <>
      {sections.map((section, index) => {
        try {
          const Component = getComponent(section.type);

          if (!Component) {
            console.warn(`Unknown component type: ${section.type}`);
            return null;
          }

          return <Component key={section.id || index} {...section.content} />;
        } catch (error) {
          console.error(`Error rendering component ${section.type}:`, error);
          return (
            <div
              key={section.id || index}
              className="p-4 border border-red-300 bg-red-50 rounded"
            >
              <p className="text-red-600">
                Error rendering component: {section.type}
              </p>
            </div>
          );
        }
      })}
    </>
  );
}
