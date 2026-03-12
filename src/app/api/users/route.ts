import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

/** GET /api/users — List all registered users (admin only). */
export async function GET(_req: NextRequest) {
  const admin = createAdminSupabaseClient();
  if (!admin) return NextResponse.json({ error: "Database not configured" }, { status: 503 });

  const { data, error } = await admin
    .from("profiles")
    .select("id, email, name, username, avatar_url, role, whatsapp, company, created_at, banned")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
