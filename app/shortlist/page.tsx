"use client";

import Link from "next/link";
import { useShortlist } from "@/context/ShortlistContext";
import { ShortlistItem } from "@/components/ShortlistItem";

const VENDOR_PHONE = process.env.NEXT_PUBLIC_VENDOR_PHONE || "919876543210";
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210";

export default function ShortlistPage() {
  const { items } = useShortlist();

  const productList = items.map((i) => i.name).join("\n- ");
  const quantity = 100;
  const whatsappMessage = `Hi, I'm interested in the following products from Deepak Stores:
- ${productList}

Quantity approx: ${quantity}.
Can you share the best bulk price?`;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-zinc-900">Your Shortlist</h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-12 text-center">
          <p className="text-zinc-500">Your shortlist is empty.</p>
          <Link
            href="/"
            className="mt-4 inline-block text-primary-600 font-medium hover:text-primary-700 transition-colors"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <ShortlistItem key={item.id} item={item} />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <a
              href={`tel:+${VENDOR_PHONE.replace(/\D/g, "")}`}
              className="flex-1 py-3.5 px-6 rounded-xl bg-primary-600 text-white font-medium text-center hover:bg-primary-700 transition-colors shadow-sm"
            >
              Call Vendor
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3.5 px-6 rounded-xl bg-emerald-600 text-white font-medium text-center hover:bg-emerald-700 transition-colors shadow-sm"
            >
              WhatsApp Vendor
            </a>
          </div>
        </>
      )}
    </div>
  );
}
