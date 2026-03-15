import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { isAdminAuthenticated } from "@/lib/auth";
import { CategoryCard } from "@/components/CategoryCard";
import { EventCard } from "@/components/EventCard";
import { AllProductsCard } from "@/components/AllProductsCard";

export default async function HomePage() {
  const isAdmin = await isAdminAuthenticated();
  const [categoryRes, eventRes] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("events").select("id, name").order("name"),
  ]);

  const categories = categoryRes.data ?? [];
  const events = eventRes.data ?? [];

  return (
    <div className="space-y-16">
      <div className="text-center py-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
          Corporate Gifting Catalog
        </h1>
        <p className="mt-4 text-zinc-600 max-w-xl mx-auto text-lg leading-relaxed">
          Curated corporate gifts from Deepak Stores for every occasion. Quality assured, transparent bulk pricing, and direct vendor support for a seamless gifting experience.
        </p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900">
            All Products
          </h2>
          <Link
            href="/products"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <AllProductsCard />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900">
            Categories
          </h2>
          {categories.length > 0 && (
            <Link
              href="/products"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              View all →
            </Link>
          )}
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.length > 0 ? (
            categories.map((c) => (
              <div key={c.id} className="shrink-0 w-[180px]">
                <CategoryCard id={c.id} name={c.name} />
              </div>
            ))
          ) : (
            <p className="text-zinc-500 text-sm">
              No categories yet.
              {isAdmin && (
                <> Add them in the <Link href="/admin" className="text-primary-600 hover:underline">admin</Link>.</>
              )}
            </p>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900">
            Events
          </h2>
          {events.length > 0 && (
            <Link
              href="/products"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              View all →
            </Link>
          )}
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {events.length > 0 ? (
            events.map((e) => (
              <div key={e.id} className="shrink-0 w-[180px]">
                <EventCard id={e.id} name={e.name} />
              </div>
            ))
          ) : (
            <p className="text-zinc-500 text-sm">
              No events yet.
              {isAdmin && (
                <> Add them in the <Link href="/admin" className="text-primary-600 hover:underline">admin</Link>.</>
              )}
            </p>
          )}
        </div>
      </section>

      {isAdmin && (
        <p className="text-center text-sm text-zinc-500 pt-4">
          <Link href="/admin" className="text-primary-600 hover:text-primary-700 font-medium">
            Admin
          </Link>
        </p>
      )}
    </div>
  );
}
