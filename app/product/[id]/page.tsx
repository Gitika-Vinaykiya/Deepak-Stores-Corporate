import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { AddToShortlistButton } from "./AddToShortlistButton";
import { ProductImageCarousel } from "@/components/ProductImageCarousel";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
      *,
      price_ranges:price_range_id(id, name, min_price, max_price),
      categories:category_id(id, name),
      product_events(product_id, event_id, events(id, name))
    `
    )
    .eq("id", id)
    .single();

  if (error || !product) notFound();

  const priceRange = product.price_ranges as { name: string } | null;
  const category = product.categories as { name: string } | null;
  const productEvents = (product.product_events ?? []) as Array<{
    events: { name: string };
  }>;
  const eventNames = productEvents.map((pe) => pe.events?.name).filter(Boolean);

  const approvedUrl = (product.generated_images as { final_selection_url?: string | null } | null)?.final_selection_url;
  const baseImages = (product.image_urls as string[] | null)?.filter(Boolean) ?? 
    (product.image_url ? [product.image_url] : []);
  const images = approvedUrl
    ? [approvedUrl, ...baseImages.filter((u) => u !== approvedUrl)]
    : baseImages;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <ProductImageCarousel images={images} alt={product.name} />
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-zinc-900">{product.name}</h1>
          {product.description && (
            <p className="text-zinc-600 leading-relaxed">{product.description}</p>
          )}
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-zinc-500">Price Range</dt>
            <dd className="font-semibold text-primary-600">₹{priceRange?.name ?? "—"}</dd>
            <dt className="text-zinc-500">Category</dt>
            <dd className="font-medium">{category?.name ?? "—"}</dd>
            {eventNames.length > 0 && (
              <>
                <dt className="text-zinc-500">Events</dt>
                <dd className="font-medium">{eventNames.join(", ")}</dd>
              </>
            )}
          </dl>
          <AddToShortlistButton
            product={{
              id: product.id,
              name: product.name,
              image_url: images[0] ?? product.image_url,
              price_range: priceRange?.name,
              category: category?.name,
            }}
          />
        </div>
      </div>
      <p className="mt-10">
        <Link href="/products" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
          ← Back to catalog
        </Link>
      </p>
    </div>
  );
}
