"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Card } from "@/components/ui/card";

interface GalleryImage {
  url: string;
  alt: string;
}

interface ImageGalleryProps {
  data: {
    title?: string;
    images: GalleryImage[];
    columns?: number;
  };
}

export function ImageGallery({ data }: ImageGalleryProps) {
  const { title, images, columns = 3 } = data;
  const [open, setOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Convert images to lightbox format
  const lightboxSlides = images.map((img) => ({
    src: img.url,
    alt: img.alt,
  }));

  const gridColsClass =
    {
      2: "md:grid-cols-2",
      3: "md:grid-cols-3",
      4: "md:grid-cols-4",
    }[columns] || "md:grid-cols-3";

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        {title && (
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
            {title}
          </h2>
        )}

        {/* Image Grid */}
        <div className={`grid grid-cols-1 ${gridColsClass} gap-4`}>
          {images.map((image, index) => (
            <Card
              key={index}
              className="overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow"
              onClick={() => {
                setPhotoIndex(index);
                setOpen(true);
              }}
            >
              <div className="relative aspect-square">
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </Card>
          ))}
        </div>

        {/* Lightbox */}
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          index={photoIndex}
          slides={lightboxSlides}
          carousel={{ finite: true }}
        />
      </div>
    </section>
  );
}
