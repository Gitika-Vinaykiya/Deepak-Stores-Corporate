import { Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

async function SearchResults({ query }: { query: string }) {
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
    .ilike("name", `%${query}%`);

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

  if (items.length === 0) {
    return <p className="text-gray-500">No products found for &quot;{query}&quot;.</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">
        {query ? `Search: "${query}"` : "Search Products"}
      </h1>

      {!query ? (
        <p className="text-gray-500">Enter a search term in the header.</p>
      ) : (
        <Suspense
          fallback={
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <SearchResults query={query} />
        </Suspense>
      )}
    </div>
  );
}
