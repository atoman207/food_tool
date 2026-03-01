import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const all = searchParams.get("all");

  if (!supabase) {
    return NextResponse.json([]);
  }

  let query = supabase.from("news_articles").select("*").order("created_at", { ascending: false });
  if (!all) query = query.eq("published", true);
  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) return NextResponse.json([]);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createAdminSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  const body = await req.json();
  const { data, error } = await supabase.from("news_articles").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
