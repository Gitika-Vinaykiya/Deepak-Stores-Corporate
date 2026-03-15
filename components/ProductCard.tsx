"use client";

import Image from "next/image";
import Link from "next/link";
import { useShortlist } from "@/context/ShortlistContext";
import type { ProductWithRelations } from "@/lib/types";

interface ProductCardProps {
  product: ProductWithRelations & {
    image_urls?: string[] | null;
    generated_images?: { final_selection_url?: string | null } | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, isInShortlist } = useShortlist();
  const inShortlist = isInShortlist(product.id);
  const priceLabel = product.price_ranges?.name ?? "—";
  const categoryLabel = product.categories?.name ?? "—";

  const approvedUrl = product.generated_images?.final_selection_url;
  const baseImages = product.image_urls?.filter(Boolean) ?? (product.image_url ? [product.image_url] : []);
  const images = approvedUrl
    ? [approvedUrl, ...baseImages.filter((u) => u !== approvedUrl)]
    : baseImages;
  const primaryImage = images[0] ?? product.image_url;

  const shortlistItem = {
    id: product.id,
    name: product.name,
    image_url: primaryImage ?? null,
    price_range: priceLabel,
    category: categoryLabel,
  };

  return (
    <div className="group bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-card hover:shadow-card-hover hover:border-primary-200/50 transition-all duration-200">
      <Link href={`/product/${product.id}`} className="block">
        <div className="flex flex-row sm:flex-col">
          <div className="w-28 sm:w-full aspect-square sm:aspect-[4/5] relative bg-surface-100 shrink-0">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 112px, (max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">
                No image
              </div>
            )}
            {images.length > 1 && (
              <span className="absolute bottom-2 right-2 bg-zinc-900/70 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                +{images.length - 1}
              </span>
            )}
          </div>
          <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
            <div>
              <h3 className="font-medium text-zinc-900 line-clamp-2 text-sm sm:text-base">
                {product.name}
              </h3>
              <p className="text-sm text-primary-600 font-semibold mt-1.5">₹{priceLabel}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{categoryLabel}</p>
            </div>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <button
          onClick={(e) => {
            e.preventDefault();
            addItem(shortlistItem);
          }}
          disabled={inShortlist}
          className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            inShortlist
              ? "bg-surface-100 text-zinc-500 cursor-not-allowed"
              : "bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
          }`}
        >
          {inShortlist ? "In Shortlist" : "Add to Shortlist"}
        </button>
      </div>
    </div>
  );
}
