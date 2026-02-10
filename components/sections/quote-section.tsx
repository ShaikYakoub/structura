"use client";

import { Quote } from "lucide-react";

interface QuoteSectionProps {
  data: {
    quote: string;
    author: string;
    role?: string;
    company?: string;
  };
}

export function QuoteSection({ data }: QuoteSectionProps) {
  const { quote, author, role, company } = data;

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <div className="relative">
          {/* Large Quote Mark */}
          <Quote className="absolute -top-4 -left-4 h-16 w-16 text-primary/20" />

          <div className="relative text-center">
            {/* Quote Text */}
            <blockquote className="text-2xl md:text-3xl lg:text-4xl font-serif italic leading-relaxed text-foreground mb-8">
              "{quote}"
            </blockquote>

            {/* Author Info */}
            <div className="flex flex-col items-center">
              <cite className="not-italic">
                <p className="text-xl font-semibold mb-1">{author}</p>
                {(role || company) && (
                  <p className="text-sm text-muted-foreground">
                    {role}
                    {role && company && ", "}
                    {company}
                  </p>
                )}
              </cite>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
