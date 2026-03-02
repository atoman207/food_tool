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

export async function GET(req: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status") || "approved";
  const sort = searchParams.get("sort") || "newest";
  const seller_id = searchParams.get("seller_id");

  if (!supabase) {
    let data = mockItems.map(normaliseMock);
    if (seller_id) data = data.filter((i) => i.seller_id === seller_id);
    else data = data.filter((i) => i.status === status);
    if (category) data = data.filter((i) => i.category === category);
    if (sort === "price-asc") data.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") data.sort((a, b) => b.price - a.price);
    return NextResponse.json(data);
  }

  let query = supabase.from("marketplace_items").select("*");
  if (seller_id) {
    query = query.eq("seller_id", seller_id);
  } else {
    query = query.eq("status", status);
  }
  if (category) query = query.eq("category", category);
  if (sort === "price-asc") query = query.order("price", { ascending: true });
  else if (sort === "price-desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  // Only fall back to mock data on actual error, not on empty result set
  if (error) {
    let fallback = mockItems.map(normaliseMock).filter((i) => i.status === status);
    if (seller_id) fallback = mockItems.map(normaliseMock).filter((i) => i.seller_id === seller_id);
    if (category) fallback = fallback.filter((i) => i.category === category);
    if (sort === "price-asc") fallback.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") fallback.sort((a, b) => b.price - a.price);
    return NextResponse.json(fallback);
  }
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = createAdminSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const body = await req.json();
  body.status = "pending";
  const { data, error } = await supabase.from("marketplace_items").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
