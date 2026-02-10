import { getComponent } from "@/lib/registry";

interface Section {
  type: string;
  data: any;
}

interface RendererProps {
  sections: Section[];
}

export function Renderer({ sections }: RendererProps) {
  return (
    <>
      {sections.map((section, index) => {
        const Component = getComponent(section.type);

        if (!Component) {
          console.warn(`Unknown component type: ${section.type}`);
          return null;
        }

        return <Component key={index} data={section.data} />;
      })}
    </>
  );
}
