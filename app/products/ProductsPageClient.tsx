"use client";

import { PriceSlider } from "@/components/PriceSlider";
import { ProductCard } from "@/components/ProductCard";
import type { ProductWithRelations } from "@/lib/types";

interface Product extends ProductWithRelations {
  image_urls?: string[] | null;
}

interface Props {
  products: Product[];
  minPrice: number;
  maxPrice: number;
  currentMax: number;
}

export function ProductsPageClient({
  products,
  minPrice,
  maxPrice,
  currentMax,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900">All Corporate Gifts</h1>
        <PriceSlider
          minPrice={minPrice}
          maxPrice={maxPrice}
          currentMax={currentMax}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.length === 0 ? (
          <p className="col-span-full text-gray-500 py-8 text-center">
            No products in this price range.
          </p>
        ) : (
          products.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                ...p,
                price_ranges: p.price_ranges,
                categories: p.categories,
                product_events: p.product_events,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
