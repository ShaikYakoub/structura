import { HeroSection } from "./sections/hero-section";
import { FeaturesSection } from "./sections/features-section";

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
        switch (section.type) {
          case "hero":
            return <HeroSection key={index} data={section.data} />;
          case "features":
            return <FeaturesSection key={index} data={section.data} />;
          default:
            return null;
        }
      })}
    </>
  );
}
