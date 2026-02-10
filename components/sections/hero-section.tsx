import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Action {
  label: string;
  href: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
}

interface HeroSectionProps {
  data?: {
    title: string;
    subtitle: string;
    image: string;
  };
  title?: string;
  subtitle?: string;
  actions?: Action[];
  imageUrl?: string;
  imagePosition?: "left" | "right";
  backgroundStyle?: "solid" | "gradient";
}

export function HeroSection({
  data,
  title: titleProp,
  subtitle: subtitleProp,
  actions = [],
  imageUrl: imageUrlProp,
  imagePosition = "right",
  backgroundStyle = "solid",
}: HeroSectionProps) {
  // Support both old data format and new props format
  const title = titleProp || data?.title || "Build Amazing Products Fast";
  const subtitle = subtitleProp || data?.subtitle || "";
  const imageUrl = imageUrlProp || data?.image;
  const isImageLeft = imagePosition === "left";

  return (
    <section
      className={`py-20 px-4 ${
        backgroundStyle === "gradient"
          ? "bg-gradient-to-br from-primary/10 via-background to-primary/5"
          : "bg-background"
      }`}
    >
      <div className="container mx-auto">
        <div
          className={`grid lg:grid-cols-2 gap-12 items-center ${
            isImageLeft ? "lg:flex-row-reverse" : ""
          }`}
        >
          {/* Content */}
          <div className={`${isImageLeft ? "lg:order-2" : ""}`}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                {subtitle}
              </p>
            )}

            {/* Dynamic Actions */}
            {actions.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    asChild
                    variant={action.variant || "default"}
                    size="lg"
                  >
                    <Link href={action.href}>{action.label}</Link>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Image */}
          {imageUrl && (
            <div className={`${isImageLeft ? "lg:order-1" : ""}`}>
              <div className="relative aspect-square rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
