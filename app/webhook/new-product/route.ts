import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Missing Supabase env vars. Add SUPABASE_SERVICE_ROLE_KEY to .env.local (bypasses RLS for server-side admin ops)." },
        { status: 500 }
      );
    }
    const contentType = request.headers.get("content-type") ?? "";
    let productName: string;
    let description: string | null = null;
    let categoryId: string | null = null;
    let priceRangeId: string | null = null;
    let eventIds: string[] = [];
    let imageUrl: string | null = null;
    let imageFiles: File[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      productName = (formData.get("name") as string) ?? "";
      description = (formData.get("description") as string) || null;
      categoryId = (formData.get("category_id") as string) || null;
      priceRangeId = (formData.get("price_range_id") as string) || null;
      const eventIdsStr = formData.get("event_ids") as string | null;
      try {
        eventIds = eventIdsStr ? JSON.parse(eventIdsStr) : [];
      } catch {
        eventIds = [];
      }
      imageUrl = (formData.get("image_url") as string) || null;

      const files = formData.getAll("images") as File[];
      imageFiles = files.filter((f) => f && f.size > 0);
    } else {
      const body = await request.json();
      productName = body.product_name ?? body.name ?? "";
      description = body.description ?? null;
      categoryId = body.category_id ?? null;
      priceRangeId = body.price_range_id ?? null;
      eventIds = Array.isArray(body.event_ids) ? body.event_ids : [];
      imageUrl = body.image_url ?? null;
    }

    if (!productName.trim()) {
      return NextResponse.json(
        { error: "product_name is required" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Upload images if provided as files
    const uploadedUrls: string[] = [];
    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, file, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(path);
        uploadedUrls.push(urlData.publicUrl);
      }
      imageUrl = uploadedUrls[0] ?? imageUrl;
    }

    const generatedImagesInitial = {
      status: "pending_generation" as const,
      variations: [] as { id: number; url: string; approved: boolean }[],
      final_selection_url: null as string | null,
    };

    // Insert product
    const { data: product, error } = await supabase
      .from("products")
      .insert({
        name: productName.trim(),
        description,
        image_url: imageUrl,
        image_urls: uploadedUrls.length > 0 ? uploadedUrls : null,
        price_range_id: priceRangeId || null,
        category_id: categoryId || null,
        generated_images: generatedImagesInitial,
      })
      .select("id")
      .single();

    if (error) throw error;

    // Link events
    if (eventIds.length > 0 && product) {
      await supabase.from("product_events").insert(
        eventIds.map((event_id) => ({ product_id: product.id, event_id }))
      );
    }

    // Fetch category, price range, and events for response
    let categoryName = "";
    let priceRangeStr = "";
    let eventNames: string[] = [];

    if (categoryId) {
      const { data: cat } = await supabase
        .from("categories")
        .select("name")
        .eq("id", categoryId)
        .single();
      categoryName = cat?.name ?? "";
    }

    if (priceRangeId) {
      const { data: pr } = await supabase
        .from("price_ranges")
        .select("min_price, max_price")
        .eq("id", priceRangeId)
        .single();
      if (pr) {
        priceRangeStr = pr.max_price
          ? `₹${pr.min_price}-₹${pr.max_price}`
          : `₹${pr.min_price}+`;
      }
    }

    if (eventIds.length > 0) {
      const { data: evs } = await supabase
        .from("events")
        .select("name")
        .in("id", eventIds);
      eventNames = (evs ?? []).map((e) => e.name);
    }

    const webhookPayload = {
      product_id: product!.id,
      product_name: productName.trim(),
      category: categoryName || "uncategorized",
      price_range: priceRangeStr || "N/A",
      events: eventNames,
      image_url: imageUrl ?? "",
      generated_images: generatedImagesInitial,
    };

    return NextResponse.json(webhookPayload, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Webhook new-product error:", err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
