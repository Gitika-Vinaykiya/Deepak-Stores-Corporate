"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

interface PriceRange {
  id: string;
  name: string;
  min_price: number;
  max_price: number | null;
}

interface Category {
  id: string;
  name: string;
}

interface Event {
  id: string;
  name: string;
}

interface GeneratedImages {
  status?: string;
  variations?: { id: number; url: string; approved?: boolean }[];
}

interface Product {
  id: string;
  name: string;
  image_url: string | null;
  image_urls?: string[] | null;
  description?: string | null;
  price_range_id: string | null;
  category_id: string | null;
  event_ids?: string[];
  generated_images?: GeneratedImages | null;
}

interface Props {
  priceRanges: PriceRange[];
  categories: Category[];
  events: Event[];
  products: Product[];
}

export function AdminForm({
  priceRanges,
  categories,
  events,
  products,
}: Props) {
  const [activeTab, setActiveTab] = useState<"product" | "manage" | "price" | "category" | "event" | "images">("product");
  const [status, setStatus] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceRangeId, setPriceRangeId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [eventIds, setEventIds] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // New price range
  const [priceName, setPriceName] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // New category
  const [categoryName, setCategoryName] = useState("");

  // New event
  const [eventName, setEventName] = useState("");

  const toggleEvent = (id: string) => {
    setEventIds((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("description", description || "");
      formData.set("category_id", categoryId || "");
      formData.set("price_range_id", priceRangeId || "");
      formData.set("event_ids", JSON.stringify(eventIds));
      imageFiles.forEach((file, i) => {
        const hasValidName = file.name?.trim() && /\.(jpe?g|png|webp|gif)$/i.test(file.name);
        const fileToSend = hasValidName
          ? file
          : new File([file], `photo-${Date.now()}-${i}.jpg`, { type: file.type || "image/jpeg" });
        formData.append("images", fileToSend);
      });

      const res = await fetch("/webhook/new-product", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add product");

      setStatus("Product added!");
      setName("");
      setDescription("");
      setPriceRangeId("");
      setCategoryId("");
      setEventIds([]);
      setImageFiles([]);

      // Store webhook payload for n8n (copy to clipboard or display)
      if (typeof navigator?.clipboard?.writeText === "function") {
        await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setStatus("Product added! JSON copied to clipboard for n8n.");
      }
      window.location.reload();
    } catch (err: unknown) {
      setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    try {
      const min = parseInt(minPrice, 10);
      const max = maxPrice ? parseInt(maxPrice, 10) : null;
      const { data: ranges } = await supabase.from("price_ranges").select("id, min_price, max_price");
      const existing = (ranges ?? []).find((r) => r.min_price === min && (r.max_price ?? null) === max);
      if (existing) {
        setStatus("Price range already exists.");
        return;
      }
      const { error } = await supabase.from("price_ranges").insert({
        name: priceName,
        min_price: min,
        max_price: max,
      });
      if (error) throw error;
      setStatus("Price range added!");
      setPriceName("");
      setMinPrice("");
      setMaxPrice("");
      window.location.reload();
    } catch (err: unknown) {
      setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    try {
      const trimmed = categoryName.trim().toLowerCase();
      const { data: existing } = await supabase
        .from("categories")
        .select("id")
        .ilike("name", trimmed)
        .maybeSingle();
      if (existing) {
        setStatus("Category already exists.");
        return;
      }
      const { error } = await supabase.from("categories").insert({ name: categoryName.trim() });
      if (error) throw error;
      setStatus("Category added!");
      setCategoryName("");
      window.location.reload();
    } catch (err: unknown) {
      setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    try {
      const trimmed = eventName.trim().toLowerCase();
      const { data: existing } = await supabase
        .from("events")
        .select("id")
        .ilike("name", trimmed)
        .maybeSingle();
      if (existing) {
        setStatus("Event already exists.");
        return;
      }
      const { error } = await supabase.from("events").insert({ name: eventName.trim() });
      if (error) throw error;
      setStatus("Event added!");
      setEventName("");
      window.location.reload();
    } catch (err: unknown) {
      setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    setStatus(null);
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setStatus("Product deleted!");
      setEditingProduct(null);
      window.location.reload();
    } catch (err: unknown) {
      setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const startEditProduct = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description ?? "");
    setPriceRangeId(p.price_range_id ?? "");
    setCategoryId(p.category_id ?? "");
    setEventIds(p.event_ids ?? []);
    setImageFiles([]);
    setActiveTab("product");
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setName("");
    setDescription("");
    setPriceRangeId("");
    setCategoryId("");
    setEventIds([]);
    setImageFiles([]);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setStatus(null);
    try {
      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, file, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(path);
        imageUrls.push(urlData.publicUrl);
      }
      const existingUrls = (editingProduct.image_urls ?? (editingProduct.image_url ? [editingProduct.image_url] : [])) as string[];
      const allUrls = imageUrls.length > 0 ? [...existingUrls, ...imageUrls] : existingUrls;
      const imageUrl = allUrls[0] ?? null;

      const { error } = await supabase
        .from("products")
        .update({
          name,
          description: description || null,
          image_url: imageUrl,
          image_urls: allUrls.length > 0 ? allUrls : null,
          price_range_id: priceRangeId || null,
          category_id: categoryId || null,
        })
        .eq("id", editingProduct.id);

      if (error) throw error;

      await supabase.from("product_events").delete().eq("product_id", editingProduct.id);
      if (eventIds.length > 0) {
        await supabase.from("product_events").insert(
          eventIds.map((event_id) => ({ product_id: editingProduct.id, event_id }))
        );
      }

      setStatus("Product updated!");
      cancelEdit();
      window.location.reload();
    } catch (err: unknown) {
      setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const pendingApprovalProducts = products.filter(
    (p) => (p.generated_images?.status ?? "") === "pending_approval"
  );

  const handleApproveImage = async (productId: string, variationId: number) => {
    setStatus(null);
    try {
      const res = await fetch("/api/admin/approve-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, variation_id: variationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to approve");
      setStatus("Image approved!");
      window.location.reload();
    } catch (err: unknown) {
      setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleRejectImage = async (productId: string, action: "reject" | "regenerate") => {
    setStatus(null);
    try {
      const res = await fetch("/api/admin/reject-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setStatus(action === "regenerate" ? "Flagged for regeneration." : "Rejected.");
      window.location.reload();
    } catch (err: unknown) {
      setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const tabs = [
    { id: "product" as const, label: "Add Product" },
    { id: "manage" as const, label: "Manage Products" },
    { id: "images" as const, label: "Image Approval" },
    { id: "price" as const, label: "Add Price Range" },
    { id: "category" as const, label: "Add Category" },
    { id: "event" as const, label: "Add Event" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === t.id
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {status && (
        <p
          className={`text-sm ${
            status.startsWith("Error") ? "text-red-600" : "text-primary-600"
          }`}
        >
          {status}
        </p>
      )}

      {activeTab === "images" && (
        <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-medium text-gray-900">Image Approval</h3>
          {pendingApprovalProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">No products pending approval.</p>
          ) : (
            <div className="space-y-8">
              {pendingApprovalProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-gray-200 space-y-4"
                >
                  <h4 className="font-medium text-gray-900">{p.name}</h4>
                  <div className="flex flex-wrap gap-4 items-start">
                    {p.image_url && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Original</p>
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={p.image_url}
                            alt={`Original ${p.name}`}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        </div>
                      </div>
                    )}
                    {(p.generated_images?.variations ?? []).map((v) => {
                      const labels: Record<number, string> = { 1: "Hero", 2: "Lifestyle", 3: "Detail" };
                      const label = labels[v.id] ?? `#${v.id}`;
                      return (
                        <div key={v.id} className="space-y-1">
                          <p className="text-xs text-gray-500">{label}</p>
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={v.url}
                              alt={`Generated ${label}`}
                              fill
                              className="object-cover"
                              sizes="96px"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleApproveImage(p.id, v.id)}
                            className="text-xs text-primary-600 hover:underline font-medium"
                          >
                            Approve {label}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleRejectImage(p.id, "regenerate")}
                      className="text-sm text-amber-600 hover:underline font-medium"
                    >
                      Regenerate
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectImage(p.id, "reject")}
                      className="text-sm text-red-600 hover:underline font-medium"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "manage" && (
        <div className="space-y-3 bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-medium text-gray-900">Products</h3>
          {products.length === 0 ? (
            <p className="text-gray-500 text-sm">No products yet.</p>
          ) : (
            <ul className="space-y-2">
              {products.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg border border-gray-100"
                >
                  <span className="truncate">{p.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`/product/${p.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:underline"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => startEditProduct(p)}
                      className="text-sm text-primary-600 hover:underline font-medium"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(p.id)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === "product" && (
        <form onSubmit={editingProduct ? handleUpdateProduct : handleProductSubmit} className="space-y-4 bg-white p-6 rounded-xl border border-gray-100">
          {editingProduct && (
            <div className="flex items-center justify-between p-3 bg-primary-50 rounded-xl">
              <span className="text-sm font-medium text-primary-800">Editing: {editingProduct.name}</span>
              <button type="button" onClick={cancelEdit} className="text-sm text-primary-600 hover:underline">
                Cancel
              </button>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images</label>
            <p className="text-xs text-gray-500 mb-2">Supported: JPEG, PNG, WebP, GIF</p>
            <div className="flex flex-wrap gap-2">
              <label className="px-3 py-2 rounded-lg border border-gray-200 text-sm cursor-pointer hover:bg-gray-50">
                Upload from device
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={(e) => setImageFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])}
                />
              </label>
              <label className="px-3 py-2 rounded-lg border border-gray-200 text-sm cursor-pointer hover:bg-gray-50">
                Take photo
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files?.length) setImageFiles((prev) => [...prev, ...Array.from(files)]);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            {imageFiles.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">{imageFiles.length} image(s) selected</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
            <select
              value={priceRangeId}
              onChange={(e) => setPriceRangeId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200"
            >
              <option value="">Select</option>
              {priceRanges.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200"
            >
              <option value="">Select</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Events</label>
            <div className="flex flex-wrap gap-2">
              {events.map((ev) => (
                <label key={ev.id} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={eventIds.includes(ev.id)}
                    onChange={() => toggleEvent(ev.id)}
                  />
                  <span className="text-sm">{ev.name}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700"
          >
            {editingProduct ? "Update Product" : "Add Product"}
          </button>
        </form>
      )}

      {activeTab === "price" && (
        <form onSubmit={handlePriceSubmit} className="space-y-4 bg-white p-6 rounded-xl border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name (e.g. 0-150)</label>
            <input
              type="text"
              value={priceName}
              onChange={(e) => setPriceName(e.target.value)}
              placeholder="0-150"
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹)</label>
            <input
              type="number"
              min={0}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹) - optional</label>
            <input
              type="number"
              min={0}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Leave empty for 500+"
              className="w-full px-3 py-2 rounded-lg border border-gray-200"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700"
          >
            Add Price Range
          </button>
        </form>
      )}

      {activeTab === "category" && (
        <form onSubmit={handleCategorySubmit} className="space-y-4 bg-white p-6 rounded-xl border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Eco Friendly"
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-200"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700"
          >
            Add Category
          </button>
        </form>
      )}

      {activeTab === "event" && (
        <form onSubmit={handleEventSubmit} className="space-y-4 bg-white p-6 rounded-xl border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. Diwali"
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-200"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700"
          >
            Add Event
          </button>
        </form>
      )}
    </div>
  );
}
