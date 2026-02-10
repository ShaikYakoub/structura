"use client";

import Image from "next/image";

interface Logo {
  name: string;
  imageUrl: string;
}

interface LogoGridProps {
  data: {
    title?: string;
    logos: Logo[];
  };
}

export function LogoGrid({ data }: LogoGridProps) {
  const { title, logos } = data;

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        {title && (
          <h2 className="text-2xl font-semibold text-center mb-12 text-muted-foreground">
            {title}
          </h2>
        )}

        {/* Logo Grid */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {logos.map((logo, index) => (
            <div
              key={index}
              className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
            >
              <div className="relative h-12 w-[150px]">
                <Image
                  src={logo.imageUrl}
                  alt={logo.name}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
