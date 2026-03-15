"use client";

import Image from "next/image";
import Link from "next/link";
import { useShortlist } from "@/context/ShortlistContext";
import type { ShortlistItem as ShortlistItemType } from "@/lib/types";

interface ShortlistItemProps {
  item: ShortlistItemType;
}

export function ShortlistItem({ item }: ShortlistItemProps) {
  const { removeItem } = useShortlist();

  return (
    <div className="flex gap-4 p-4 bg-white rounded-2xl border border-surface-200 shadow-card">
      <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-surface-100">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">
            No image
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <Link href={`/product/${item.id}`} className="font-medium text-zinc-900 hover:text-primary-600 transition-colors">
          {item.name}
        </Link>
        {item.price_range && (
          <p className="text-sm text-primary-600 font-medium mt-0.5">₹{item.price_range}</p>
        )}
      </div>
      <button
        onClick={() => removeItem(item.id)}
        className="text-red-500 hover:text-red-600 text-sm font-medium shrink-0 transition-colors"
      >
        Remove
      </button>
    </div>
  );
}
