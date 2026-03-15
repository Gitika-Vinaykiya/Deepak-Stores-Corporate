import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { isAdminAuthenticated } from "@/lib/auth";
import { AdminForm } from "./AdminForm";
import { logout } from "./actions";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) redirect("/admin/login");

  const [priceRes, categoryRes, eventRes, productsRes] = await Promise.all([
    supabase.from("price_ranges").select("id, name, min_price, max_price").order("min_price"),
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("events").select("id, name").order("name"),
    supabase.from("products").select(`
      id,
      name,
      image_url,
      image_urls,
      description,
      price_range_id,
      category_id,
      generated_images,
      product_events(event_id)
    `).order("created_at", { ascending: false }),
  ]);

  const priceRanges = priceRes.data ?? [];
  const categories = categoryRes.data ?? [];
  const events = eventRes.data ?? [];
  const products = (productsRes.data ?? []).map((p: {
    id: string;
    name: string;
    image_url: string | null;
    image_urls?: string[] | null;
    description?: string | null;
    price_range_id: string | null;
    category_id: string | null;
    generated_images?: { status?: string; variations?: { id: number; url: string }[] } | null;
    product_events?: { event_id: string }[];
  }) => ({
    id: p.id,
    name: p.name,
    image_url: p.image_url,
    image_urls: p.image_urls,
    description: p.description,
    price_range_id: p.price_range_id,
    category_id: p.category_id,
    generated_images: p.generated_images,
    event_ids: (p.product_events ?? []).map((pe) => pe.event_id),
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Admin</h1>
        <form action={logout}>
          <button type="submit" className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors">
            Logout
          </button>
        </form>
      </div>
      <AdminForm
        priceRanges={priceRanges}
        categories={categories}
        events={events}
        products={products}
      />
    </div>
  );
}
