import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min for batch

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Missing Supabase env vars" },
      { status: 500 }
    );
  }
  if (!geminiKey) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY" },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const ai = new GoogleGenAI({ apiKey: geminiKey });

    const { data: allProducts, error: fetchError } = await supabase
      .from("products")
      .select(`
        id,
        name,
        description,
        generated_images,
        categories:category_id(name)
      `);

    if (fetchError) throw fetchError;

    const products = (allProducts ?? []).filter((p) => {
      const status = (p.generated_images as { status?: string } | null)?.status;
      return (
        !p.generated_images ||
        status === "pending_generation" ||
        status === "regenerate_requested"
      );
    });

    if (products.length === 0) {
      return NextResponse.json({ processed: 0, message: "No products to process" });
    }

    let processed = 0;
    const errors: string[] = [];

    const buildPrompt = (productName: string, categoryName: string, description: string, imageType: "hero" | "lifestyle" | "detail") => {
      const base = `Product: ${productName}${categoryName ? ` (${categoryName})` : ""}. ${description ? `${description}. ` : ""}Maintain the exact same product design and colors.

STYLE: Premium modern corporate product photography similar to Apple or luxury office brands.
LIGHTING: Soft diffused studio lighting from top-left. Subtle realistic shadows. High contrast but natural.
BACKGROUND: Minimal modern office setting with light stone, wood, or neutral surfaces. Clean professional aesthetic.`;

      const compositions = {
        hero: "Full gift set clearly visible. Front-facing angle. Minimal neutral background. Product centered. Clean catalog style. Website ready.",
        lifestyle: "Gift set arranged on a modern office desk. Include subtle environment elements like stone surface, wood desk, or neutral office background. Premium brand aesthetic. Slight angled camera view.",
        detail: "Close-up shot highlighting materials and craftsmanship. Focus on texture such as leather, bamboo, or metal. Shallow depth of field. Premium macro photography style.",
      };

      return `${base}\n\nIMAGE: ${compositions[imageType]}\n\nSquare format 1024x1024, website-ready e-commerce image.`;
    };

    for (const product of products) {
      try {
        const categoryName = (product.categories as { name?: string } | null)?.name ?? "";
        const productName = product.name ?? "";
        const description = product.description ?? "";

        const imageTypes: ("hero" | "lifestyle" | "detail")[] = ["hero", "lifestyle", "detail"];
        const generatedImages: { id: number; buffer: Buffer }[] = [];

        for (let i = 0; i < imageTypes.length; i++) {
          const prompt = buildPrompt(productName, categoryName, description, imageTypes[i]);
          const response = await ai.models.generateImages({
            model: "imagen-3.0-generate-002",
            prompt,
            config: { numberOfImages: 1, aspectRatio: "1:1" },
          });

          const img = response.generatedImages?.[0];
          const imageBytes = img?.image?.imageBytes;
          if (imageBytes) {
            generatedImages.push({ id: i + 1, buffer: Buffer.from(imageBytes, "base64") });
          }
        }

        if (generatedImages.length === 0) {
          errors.push(`${product.id}: No images generated`);
          continue;
        }

        const variations: { id: number; url: string; approved: boolean }[] = [];
        const productId = product.id;

        for (let i = 0; i < generatedImages.length; i++) {
          const { id, buffer } = generatedImages[i];
          const path = `temp-review/${productId}/${id}.png`;

          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(path, buffer, {
              contentType: "image/png",
              upsert: true,
            });

          if (uploadError) {
            errors.push(`${product.id}: Upload failed - ${uploadError.message}`);
            continue;
          }

          const { data: urlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(path);

          variations.push({ id, url: urlData.publicUrl, approved: false });
        }

        if (variations.length === 0) {
          errors.push(`${product.id}: No images uploaded`);
          continue;
        }

        const { error: updateError } = await supabase
          .from("products")
          .update({
            generated_images: {
              status: "pending_approval",
              variations,
              final_selection_url: null,
            },
          })
          .eq("id", productId);

        if (updateError) throw updateError;
        processed++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${product.id}: ${msg}`);
      }
    }

    return NextResponse.json({
      processed,
      total: products.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Cron generate-images error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
