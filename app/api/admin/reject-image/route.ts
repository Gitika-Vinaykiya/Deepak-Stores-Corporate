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
    const action = body.action as "reject" | "regenerate";

    if (!productId || !action || !["reject", "regenerate"].includes(action)) {
      return NextResponse.json(
        { error: "product_id and action (reject|regenerate) required" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("id, generated_images")
      .eq("id", productId)
      .single();

    if (fetchError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const gen = product.generated_images as { status?: string; variations?: unknown[] } | null;

    if (gen?.status !== "pending_approval") {
      return NextResponse.json(
        { error: "Product not pending approval" },
        { status: 400 }
      );
    }

    const newStatus = action === "regenerate" ? "regenerate_requested" : "rejected";
    const updatedGen = {
      ...gen,
      status: newStatus,
    };

    const { error: updateError } = await supabase
      .from("products")
      .update({ generated_images: updatedGen })
      .eq("id", productId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Reject image error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
