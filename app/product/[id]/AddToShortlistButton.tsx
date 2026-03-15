"use client";

import { useShortlist } from "@/context/ShortlistContext";
import type { ShortlistItem } from "@/lib/types";

interface Props {
  product: ShortlistItem;
}

export function AddToShortlistButton({ product }: Props) {
  const { addItem, isInShortlist } = useShortlist();
  const inShortlist = isInShortlist(product.id);

  return (
    <button
      onClick={() => addItem(product)}
      disabled={inShortlist}
      className={`w-full py-3 rounded-xl font-medium transition-colors ${
        inShortlist
          ? "bg-surface-100 text-zinc-500 cursor-not-allowed"
          : "bg-primary-600 text-white hover:bg-primary-700"
      }`}
    >
      {inShortlist ? "In Shortlist" : "Add to Shortlist"}
    </button>
  );
}
