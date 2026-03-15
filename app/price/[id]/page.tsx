import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { Suspense } from "react";

interface Props {
  params: Promise<{ id: string }>;
}

async function ProductList({ priceRangeId }: { priceRangeId: string }) {
  const { data: products, error } = await supabase
    .from("products")
    .select(
      `
      *,
      price_ranges:price_range_id(id, name, min_price, max_price),
      categories:category_id(id, name),
      product_events(product_id, event_id, events(id, name))
    `
    )
    .eq("price_range_id", priceRangeId);

  if (error) throw error;
  const items = (products ?? []) as Array<{
    id: string;
    name: string;
    image_url: string | null;
    description: string | null;
    price_range_id: string;
    category_id: string;
    created_at: string;
    price_ranges: { id: string; name: string; min_price: number; max_price: number | null };
    categories: { id: string; name: string };
    product_events: Array<{ events: { id: string; name: string } }>;
  }>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((p) => (
        <ProductCard
          key={p.id}
          product={{
            ...p,
            price_ranges: p.price_ranges,
            categories: p.categories,
            product_events: p.product_events,
          }}
        />
      ))}
    </div>
  );
}

export default async function PricePage({ params }: Props) {
  const { id } = await params;
  const { data: priceRange, error } = await supabase
    .from("price_ranges")
    .select("id, name")
    .eq("id", id)
    .single();

  if (error || !priceRange) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">
        Price Range: ₹{priceRange.name}
      </h1>
      <Suspense
        fallback={
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <ProductList priceRangeId={id} />
      </Suspense>
    </div>
  );
}
