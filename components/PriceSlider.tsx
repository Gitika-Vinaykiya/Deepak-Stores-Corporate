"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface PriceSliderProps {
  minPrice: number;
  maxPrice: number;
  currentMax?: number;
}

export function PriceSlider({
  minPrice,
  maxPrice,
  currentMax = maxPrice,
}: PriceSliderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (max: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (max < maxPrice) {
        params.set("priceMax", String(max));
      } else {
        params.delete("priceMax");
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, maxPrice]
  );

  return (
    <div className="space-y-3 p-4 bg-white rounded-2xl border border-surface-200 shadow-card shrink-0">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-600 font-medium">Price</span>
        <span className="font-semibold text-primary-600">
          Up to ₹{currentMax >= 99999 ? "∞" : currentMax}
        </span>
      </div>
      <input
        type="range"
        min={minPrice}
        max={maxPrice}
        value={currentMax}
        onChange={(e) => updateFilter(parseInt(e.target.value, 10))}
        className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
      />
    </div>
  );
}
