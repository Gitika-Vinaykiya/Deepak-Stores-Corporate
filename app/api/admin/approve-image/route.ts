import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminAuthenticated } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Missing Supabase env vars" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const productId = body.product_id as string;
    const variationId = body.variation_id as number;

    if (!productId || !variationId) {
      return NextResponse.json(
        { error: "product_id and variation_id required" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("id, image_url, image_urls, generated_images")
      .eq("id", productId)
      .single();

    if (fetchError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const gen = product.generated_images as {
      status?: string;
      variations?: { id: number; url: string }[];
    } | null;

    if (gen?.status !== "pending_approval" || !gen.variations?.length) {
      return NextResponse.json(
        { error: "Product not pending approval" },
        { status: 400 }
      );
    }

    const variation = gen.variations.find((v) => v.id === variationId);
    if (!variation?.url) {
      return NextResponse.json(
        { error: "Invalid variation_id" },
        { status: 400 }
      );
    }

    const imageRes = await fetch(variation.url);
    if (!imageRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: 500 }
      );
    }

    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
    const path = `${productId}-approved-${Date.now()}.png`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, imageBuffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(path);
    const finalUrl = urlData.publicUrl;

    const existingUrls = (product.image_urls as string[] | null) ?? (product.image_url ? [product.image_url] : []);
    const newImageUrls = [finalUrl, ...existingUrls.filter((u) => u !== finalUrl)].slice(0, 10);

    const updatedGen = {
      ...gen,
      status: "approved" as const,
      final_selection_url: finalUrl,
      approved_at: new Date().toISOString(),
      variations: gen.variations.map((v) =>
        v.id === variationId ? { ...v, approved: true } : v
      ),
    };

    const { error: updateError } = await supabase
      .from("products")
      .update({
        image_url: finalUrl,
        image_urls: newImageUrls,
        generated_images: updatedGen,
      })
      .eq("id", productId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, final_selection_url: finalUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Approve image error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
