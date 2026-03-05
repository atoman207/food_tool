import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase-server";
import { suppliers as mockSuppliers } from "@/data/mockData";

function normaliseMock(s: any) {
  return {
    ...s,
    name_ja: s.nameJa ?? s.name_ja ?? s.name,
    category_ja: s.categoryJa ?? s.category_ja ?? s.category,
    area_ja: s.areaJa ?? s.area_ja ?? s.area,
    description_ja: s.descriptionJa ?? s.description_ja ?? s.description,
    products: s.products ?? [],
  };
}

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = createServerSupabaseClient();

  if (!supabase) {
    const mock = mockSuppliers.find((s) => s.slug === params.slug);
    if (!mock) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(normaliseMock(mock));
  }

  const { data: supplier, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (error || !supplier || !supplier.id) {
    const mock = mockSuppliers.find((s) => s.slug === params.slug);
    if (!mock) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(normaliseMock(mock));
  }

  // Increment view count and log a timestamped row for monthly stats
  const admin = createAdminSupabaseClient();
  if (admin) {
    await Promise.all([
      admin.from("suppliers").update({ views: (supplier.views ?? 0) + 1 }).eq("id", supplier.id),
      admin.from("supplier_view_logs").insert({ supplier_id: supplier.id }),
    ]);
  }

  const { data: products } = await supabase
    .from("supplier_products")
    .select("*")
    .eq("supplier_id", supplier.id);

  return NextResponse.json({ ...supplier, products: products || [] });
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = createAdminSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const body = await req.json();
  // 説明文を含む全フィールドを明示的に渡す（欠落で上書きされないようにする）
  const updatePayload: Record<string, unknown> = { ...body };
  if (typeof body.description !== "undefined") updatePayload.description = body.description;
  if (typeof body.description_ja !== "undefined") updatePayload.description_ja = body.description_ja;
  const { data, error } = await supabase
    .from("suppliers")
    .update(updatePayload)
    .eq("slug", params.slug)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = createAdminSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const { error } = await supabase.from("suppliers").delete().eq("slug", params.slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
