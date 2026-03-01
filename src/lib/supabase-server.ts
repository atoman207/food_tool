import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Anon key client — respects RLS. Use for public reads. */
export function createServerSupabaseClient(): SupabaseClient | null {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
  } catch {
    return null;
  }
}

/** Service-role key client — bypasses RLS. Use only in server-side admin routes. */
export function createAdminSupabaseClient(): SupabaseClient | null {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Prefer the dedicated service role key; fall back to anon key so basic reads still work.
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  } catch {
    return null;
  }
}
