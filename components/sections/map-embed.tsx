"use client";

import { generateMapEmbedUrl, isGoogleMapsEmbedUrl } from "@/lib/map-utils";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface MapEmbedProps {
  data: {
    title?: string;
    address?: string;
    embedUrl?: string;
    height?: number;
  };
}

export function MapEmbed({ data }: MapEmbedProps) {
  const { title, address, embedUrl, height = 450 } = data;

  // Determine the final embed URL
  let finalEmbedUrl = embedUrl;

  if (!finalEmbedUrl && address) {
    finalEmbedUrl = generateMapEmbedUrl(address);
  }

  if (!finalEmbedUrl) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-8 text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Please provide either an address or embed URL to display the map.
            </p>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        {title && (
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">{title}</h2>
            {address && (
              <p className="text-muted-foreground flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4" />
                {address}
              </p>
            )}
          </div>
        )}

        {/* Map Container */}
        <div className="rounded-lg overflow-hidden shadow-lg border">
          <iframe
            src={finalEmbedUrl}
            width="100%"
            height={height}
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={title || "Map location"}
          />
        </div>
      </div>
    </section>
  );
}
