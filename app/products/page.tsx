import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { ProductsPageClient } from "./ProductsPageClient";

interface Props {
  searchParams: Promise<{ priceMin?: string; priceMax?: string }>;
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

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const priceMaxParam = params.priceMax ? parseInt(params.priceMax, 10) : null;

  const { min: minPrice, max: maxPrice } = await getPriceBounds();
  const currentMax = priceMaxParam ?? maxPrice;

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
    .order("created_at", { ascending: false });

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
    <ProductsPageClient
      products={items}
      minPrice={minPrice}
      maxPrice={maxPrice}
      currentMax={currentMax}
    />
  );
}
