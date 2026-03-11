import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase-server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug: slugParam } = await params;
  const slug = decodeURIComponent(slugParam);
  const supabase = createServerSupabaseClient();
  const admin = createAdminSupabaseClient();
  const client = admin ?? supabase;
  if (!client) return NextResponse.json([]);

  const { data: supplier } = await client
    .from("suppliers")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!supplier) return NextResponse.json([]);

  const { data: products } = await client
    .from("supplier_products")
    .select("*")
    .eq("supplier_id", supplier.id);

  return NextResponse.json(products || []);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug: slugParam } = await params;
  const slug = decodeURIComponent(slugParam);
  const admin = createAdminSupabaseClient();
  if (!admin) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const { data: supplier } = await admin
    .from("suppliers")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!supplier) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });

  const body = await req.json();
  const payload = {
    supplier_id: supplier.id,
    name: (body.name ?? "").toString().trim() || "",
    image: (body.image ?? "").toString().trim() || "",
    moq: (body.moq ?? "").toString().trim() || "",
  };

  const { data, error } = await admin
    .from("supplier_products")
    .insert(payload)
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
