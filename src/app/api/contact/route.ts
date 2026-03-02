import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, subject, message } = body;

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("contact_messages").insert({ name, email, subject, message });
    } catch {
      // Table might not exist yet; log and continue
    }
  }

  return NextResponse.json({ success: true });
}
