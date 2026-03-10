import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase-server";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);
  const supabase = createServerSupabaseClient();
  if (!supabase) return NextResponse.json([]);

  const { data: supplier } = await supabase
    .from("suppliers")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!supplier) return NextResponse.json([]);

  const { data: products } = await supabase
    .from("supplier_products")
    .select("*")
    .eq("supplier_id", supplier.id)
    .order("created_at", { ascending: false });

  return NextResponse.json(products || []);
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);
  const admin = createAdminSupabaseClient();
  if (!admin) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const { data: supplier } = await admin
    .from("suppliers")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!supplier) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });

  const body = await req.json();
  const { data, error } = await admin
    .from("supplier_products")
    .insert({ ...body, supplier_id: supplier.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const admin = createAdminSupabaseClient();
  if (!admin) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Product id required" }, { status: 400 });

  const { error } = await admin.from("supplier_products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
