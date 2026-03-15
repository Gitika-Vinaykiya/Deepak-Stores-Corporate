import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { Suspense } from "react";
import { CategoryPageClient } from "./CategoryPageClient";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ priceMax?: string }>;
}

async function getPriceBounds() {
  const { data } = await supabase
    .from("price_ranges")
    .select("min_price, max_price")
    .order("min_price");
  const min = data?.[0]?.min_price ?? 0;
  const max = data?.reduce((acc, pr) => Math.max(acc, pr.max_price ?? 99999), 0) ?? 5000;
  return { min, max };
}

async function ProductList({
  categoryId,
  priceMaxParam,
}: {
  categoryId: string;
  priceMaxParam: number | null;
}) {
  let query = supabase
    .from("products")
    .select(
      `
      *,
      price_ranges:price_range_id(id, name, min_price, max_price),
      categories:category_id(id, name),
      product_events(product_id, event_id, events(id, name))
    `
    )
    .eq("category_id", categoryId);

  if (priceMaxParam != null) {
    const { data: ranges } = await supabase
      .from("price_ranges")
      .select("id")
      .lte("min_price", priceMaxParam);
    const rangeIds = (ranges ?? []).map((r) => r.id);
    if (rangeIds.length > 0) {
      query = query.in("price_range_id", rangeIds);
    }
  }

  const { data: products, error } = await query;

  if (error) throw error;
  const items = (products ?? []) as Array<{
    id: string;
    name: string;
    image_url: string | null;
    image_urls?: string[] | null;
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

export default async function CategoryPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const priceMaxParam = sp.priceMax ? parseInt(sp.priceMax, 10) : null;

  const { data: category, error } = await supabase
    .from("categories")
    .select("id, name")
    .eq("id", id)
    .single();

  if (error || !category) notFound();

  const { min: minPrice, max: maxPrice } = await getPriceBounds();
  const currentMax = priceMaxParam ?? maxPrice;

  return (
    <CategoryPageClient
      categoryName={category.name}
      minPrice={minPrice}
      maxPrice={maxPrice}
      currentMax={currentMax}
    >
      <Suspense
        fallback={
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <ProductList categoryId={id} priceMaxParam={priceMaxParam} />
      </Suspense>
    </CategoryPageClient>
  );
}
