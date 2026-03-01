import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase-server";
import { marketplaceItems as mockItems } from "@/data/mockData";

function normaliseMock(item: any) {
  return {
    ...item,
    years_used: item.yearsUsed ?? item.years_used ?? 0,
    seller_id: item.sellerId ?? item.seller_id ?? null,
    seller_name: item.sellerName ?? item.seller_name ?? "",
    seller_whatsapp: item.sellerWhatsapp ?? item.seller_whatsapp ?? "",
    created_at: item.createdAt ?? item.created_at ?? new Date().toISOString(),
  };
}

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = createServerSupabaseClient();

  if (!supabase) {
    const mock = mockItems.find((i) => i.slug === params.slug);
    if (!mock) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(normaliseMock(mock));
  }

  const { data, error } = await supabase
    .from("marketplace_items")
    .select("*")
    .eq("slug", params.slug)
    .single();
  if (error || !data) {
    const mock = mockItems.find((i) => i.slug === params.slug);
    if (!mock) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(normaliseMock(mock));
  }
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = createAdminSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const body = await req.json();
  const { data, error } = await supabase
    .from("marketplace_items")
    .update(body)
    .eq("slug", params.slug)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = createAdminSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const { error } = await supabase.from("marketplace_items").delete().eq("slug", params.slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
