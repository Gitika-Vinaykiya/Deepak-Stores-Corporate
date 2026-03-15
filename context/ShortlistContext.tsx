"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { ShortlistItem } from "@/lib/types";

const STORAGE_KEY = "corporate-gifting-shortlist";

interface ShortlistContextType {
  items: ShortlistItem[];
  addItem: (item: ShortlistItem) => void;
  removeItem: (id: string) => void;
  isInShortlist: (id: string) => boolean;
  clearShortlist: () => void;
}

const ShortlistContext = createContext<ShortlistContextType | undefined>(
  undefined
);

export function ShortlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        setItems([]);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, mounted]);

  const addItem = (item: ShortlistItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const isInShortlist = (id: string) => items.some((i) => i.id === id);

  const clearShortlist = () => setItems([]);

  return (
    <ShortlistContext.Provider
      value={{ items, addItem, removeItem, isInShortlist, clearShortlist }}
    >
      {children}
    </ShortlistContext.Provider>
  );
}

export function useShortlist() {
  const ctx = useContext(ShortlistContext);
  if (!ctx) throw new Error("useShortlist must be used within ShortlistProvider");
  return ctx;
}
