"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useShortlist } from "@/context/ShortlistContext";
import { useAdminAuth } from "@/context/AdminAuthContext";

export function Header() {
  const router = useRouter();
  const { items } = useShortlist();
  const isAdmin = useAdminAuth();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-surface-200">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link href="/" className="text-xl font-semibold text-zinc-900 tracking-tight">
            Corporate Gifts
          </Link>
          <form onSubmit={handleSearch} className="flex-1 sm:max-w-sm">
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
            />
          </form>
          <div className="flex items-center gap-6">
            <Link
              href="/shortlist"
              className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-primary-600 transition-colors"
            >
              <span>Shortlist</span>
              {items.length > 0 && (
                <span className="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
                  {items.length}
                </span>
              )}
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
