import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { Suspense } from "react";
import { EventPageClient } from "./EventPageClient";

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
  eventId,
  priceMaxParam,
}: {
  eventId: string;
  priceMaxParam: number | null;
}) {
  const { data: productEvents, error } = await supabase
    .from("product_events")
    .select("product_id")
    .eq("event_id", eventId);

  if (error) throw error;
  const productIds = (productEvents ?? []).map((pe) => pe.product_id);
  if (productIds.length === 0) {
    return <p className="text-gray-500 col-span-full py-8 text-center">No products for this event.</p>;
  }

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
    .in("id", productIds);

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

  const { data: products, error: productsError } = await query;

  if (productsError) throw productsError;
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
      {items.length === 0 ? (
        <p className="col-span-full text-gray-500 py-8 text-center">
          No products in this price range.
        </p>
      ) : (
        items.map((p) => (
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
  );
}

export default async function EventPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const priceMaxParam = sp.priceMax ? parseInt(sp.priceMax, 10) : null;

  const { data: event, error } = await supabase
    .from("events")
    .select("id, name")
    .eq("id", id)
    .single();

  if (error || !event) notFound();

  const { min: minPrice, max: maxPrice } = await getPriceBounds();
  const currentMax = priceMaxParam ?? maxPrice;

  return (
    <EventPageClient
      eventName={event.name}
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
        <ProductList eventId={id} priceMaxParam={priceMaxParam} />
      </Suspense>
    </EventPageClient>
  );
}
