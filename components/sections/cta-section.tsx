import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Action {
  label: string;
  href: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
}

interface CTASectionProps {
  data?: {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    variant: "primary" | "outline";
  };
  title?: string;
  subtitle?: string;
  actions?: Action[];
  backgroundStyle?: "solid" | "gradient";
}

export function CTASection({
  data,
  title: titleProp,
  subtitle: subtitleProp,
  actions = [],
  backgroundStyle = "gradient",
}: CTASectionProps) {
  // Support both old data format and new props format
  const title = titleProp || data?.title || "Ready to Get Started?";
  const subtitle = subtitleProp || data?.subtitle || "";
  
  // Convert old format to new if needed
  const finalActions = actions.length > 0 
    ? actions 
    : data?.buttonText 
    ? [{
        label: data.buttonText,
        href: data.buttonLink,
        variant: data.variant === "outline" ? "outline" : "secondary" as const,
      }]
    : [];

  return (
    <section
      className={`py-20 px-4 ${
        backgroundStyle === "gradient"
          ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
          : "bg-primary text-primary-foreground"
      }`}
    >
      <div className="container mx-auto text-center max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        {subtitle && <p className="text-lg mb-8 opacity-90">{subtitle}</p>}

        {/* Dynamic Actions */}
        {finalActions.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4">
            {finalActions.map((action, index) => (
              <Button
                key={index}
                asChild
                variant={action.variant || "secondary"}
                size="lg"
              >
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
