"use client";

import { PriceSlider } from "@/components/PriceSlider";

interface Props {
  categoryName: string;
  minPrice: number;
  maxPrice: number;
  currentMax: number;
  children: React.ReactNode;
}

export function CategoryPageClient({
  categoryName,
  minPrice,
  maxPrice,
  currentMax,
  children,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900">
          Category: {categoryName}
        </h1>
        <PriceSlider
          minPrice={minPrice}
          maxPrice={maxPrice}
          currentMax={currentMax}
        />
      </div>
      {children}
    </div>
  );
}
