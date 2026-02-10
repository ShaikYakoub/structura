"use client";

import { convertToEmbedUrl, getVideoPlatform } from "@/lib/video-utils";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface VideoEmbedProps {
  data: {
    title?: string;
    url: string;
    caption?: string;
  };
}

export function VideoEmbed({ data }: VideoEmbedProps) {
  const { title, url, caption } = data;
  const embedUrl = convertToEmbedUrl(url);
  const platform = getVideoPlatform(url);

  if (!embedUrl) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Invalid video URL. Please provide a valid YouTube or Vimeo link.
            </p>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        {title && (
          <h2 className="text-3xl font-bold tracking-tight text-center mb-8">
            {title}
          </h2>
        )}

        {/* Video Container - 16:9 Aspect Ratio */}
        <div className="relative w-full rounded-lg overflow-hidden shadow-lg bg-black">
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              title={title || "Video player"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>

        {caption && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            {caption}
          </p>
        )}
      </div>
    </section>
  );
}
