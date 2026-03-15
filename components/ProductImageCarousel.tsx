"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImageCarouselProps {
  images: string[];
  alt: string;
}

export function ProductImageCarousel({ images, alt }: ProductImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const displayImages = images.length > 0 ? images : [];

  if (displayImages.length === 0) {
    return (
      <div className="aspect-square bg-surface-100 flex items-center justify-center text-zinc-400 rounded-2xl">
        No image
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-square relative bg-surface-50 rounded-2xl overflow-hidden">
        <Image
          src={displayImages[activeIndex]!}
          alt={`${alt} - image ${activeIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
          priority
        />
      </div>
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {displayImages.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                activeIndex === i
                  ? "border-primary-500 ring-2 ring-primary-500/30"
                  : "border-surface-200 hover:border-surface-300"
              }`}
            >
              <Image
                src={url}
                alt={`${alt} thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
