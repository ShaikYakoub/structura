import { Button } from "@/components/ui/button";

interface CTASectionProps {
  data: {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    variant: "primary" | "outline";
  };
}

export function CTASection({ data }: CTASectionProps) {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {data.title}
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          {data.subtitle}
        </p>
        <a href={data.buttonLink}>
          <Button
            size="lg"
            variant={data.variant === "outline" ? "outline" : "default"}
            className={
              data.variant === "outline"
                ? "text-white border-white hover:bg-white hover:text-blue-600"
                : "bg-white text-blue-600 hover:bg-gray-100"
            }
          >
            {data.buttonText}
          </Button>
        </a>
      </div>
    </section>
  );
}
