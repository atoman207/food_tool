"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";

interface SignUpOptions {
  email: string;
  password: string;
  name: string;
  username: string;
  avatarFile?: File | null;
}

interface SignUpResult {
  error: string | null;
  /** true when the user must click the confirmation link sent to their inbox */
  needsEmailConfirmation?: boolean;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (opts: SignUpOptions) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  uploadAvatar: (userId: string, file: File) => Promise<string | null>;
  resendConfirmationEmail: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  loading: false,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
  uploadAvatar: async () => null,
  resendConfirmationEmail: async () => ({ error: null }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const sb = getSupabase();
    if (!sb) return;
    const { data } = await sb
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data as Profile | null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }

    sb.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
        setLoading(false);
      })
      .catch(async (err) => {
        const msg = err?.message || "";
        if (msg.includes("Refresh Token") || msg.includes("refresh_token") || msg.includes("invalid") && msg.includes("token")) {
          await sb.auth.signOut();
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      });

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  /** Upload avatar to Storage and return the public URL (or null on failure) */
  const uploadAvatar = async (userId: string, file: File): Promise<string | null> => {
    const sb = getSupabase();
    if (!sb) return null;
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/avatar.${ext}`;
      const { error } = await sb.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) return null;
      const { data: urlData } = sb.storage.from("avatars").getPublicUrl(path);
      return urlData?.publicUrl ?? null;
    } catch {
      return null;
    }
  };

  /**
   * Register a new user.
   *
   * Priority order:
   *  1. POST /api/auth/register  — uses service-role key server-side,
   *     creates user with email already confirmed + inserts profile row.
   *  2. Client-side signUp (fallback when service-role key is not set):
   *     - sends Supabase confirmation email
   *     - tries to upsert profile with graceful column-missing fallback
   */
  const signUp = async ({
    email,
    password,
    name,
    username,
    avatarFile,
  }: SignUpOptions): Promise<SignUpResult> => {
    const sb = getSupabase();
    if (!sb)
      return { error: "Supabase is not configured. Please check .env.local." };

    // ── Step 1: try server-side registration ──────────────────────────────
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, username }),
      });
      const json = await res.json();

      if (!json.useClientFallback) {
        // Server handled it (success or hard error)
        if (json.error) return { error: json.error };

        // ── Sign in first so we have an authenticated session ──
        // Storage RLS requires auth.uid() != null; without this the upload
        // is rejected silently and avatar_url is never saved.
        await sb.auth.signInWithPassword({ email, password });

        // ── Upload avatar now that the session is established ──
        if (avatarFile && json.userId) {
          const avatarUrl = await uploadAvatar(json.userId, avatarFile);
          if (avatarUrl) {
            await sb
              .from("profiles")
              .update({ avatar_url: avatarUrl })
              .eq("id", json.userId);

            // Re-fetch profile so the header shows the avatar immediately
            const { data: fresh } = await sb
              .from("profiles")
              .select("*")
              .eq("id", json.userId)
              .single();
            if (fresh) setProfile(fresh as Profile);
          }
        }

        return { error: null, needsEmailConfirmation: false };
      }
      // fall through to client-side path
    } catch {
      // Network error reaching the API — fall through to client-side path
    }

    // ── Step 2: client-side fallback ──────────────────────────────────────

    // Check username uniqueness
    const { data: existing } = await sb
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    if (existing)
      return { error: "This username is already taken. Please try another." };

    const { data: authData, error: authError } = await sb.auth.signUp({
      email,
      password,
      options: { data: { name, username } },
    });
    if (authError) return { error: authError.message };
    if (!authData.user) return { error: "Failed to create user." };

    const userId = authData.user.id;

    // The session returned by signUp (if email confirmation is skipped) lets
    // us upload immediately. If confirmation IS required, the upload runs
    // without a session — but authData.session may still be set by Supabase
    // in some project configurations, so we try regardless.
    let avatarUrl = "";
    if (avatarFile) {
      avatarUrl = (await uploadAvatar(userId, avatarFile)) ?? "";
    }

    // Try full profile upsert; fall back gracefully if username column missing
    const fullRow = {
      id: userId,
      email,
      name,
      username,
      avatar_url: avatarUrl,
      role: "user" as const,
      whatsapp: "",
      company: "",
      banned: false,
    };

    const { error: upsertErr } = await sb.from("profiles").upsert(fullRow);
    if (upsertErr) {
      // Fallback: omit columns that may not exist yet
      await sb.from("profiles").upsert({
        id: userId,
        email,
        name,
        role: "user",
        whatsapp: "",
        company: "",
        banned: false,
      });
    }

    // If we already have a live session (no email confirmation needed),
    // force-refresh the profile so the header shows the avatar right away.
    if (authData.session) {
      const { data: fresh } = await sb
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (fresh) setProfile(fresh as Profile);
    }

    return { error: null, needsEmailConfirmation: !authData.session };
  };

  const signIn = async (email: string, password: string) => {
    const sb = getSupabase();
    if (!sb)
      return { error: "Supabase is not configured. Please check .env.local." };
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      // Translate common Supabase error messages to Japanese
      if (
        error.message.includes("Email not confirmed") ||
        error.message.includes("email_not_confirmed")
      ) {
        return { error: "EMAIL_NOT_CONFIRMED" };
      }
      if (
        error.message.includes("Invalid login credentials") ||
        error.message.includes("invalid_credentials")
      ) {
        return { error: "Invalid email or password." };
      }
      return { error: error.message };
    }
    return { error: null };
  };

  const signOut = async () => {
    const sb = getSupabase();
    if (!sb) return;
    await sb.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  /** Re-send the Supabase confirmation email */
  const resendConfirmationEmail = async (email: string) => {
    const sb = getSupabase();
    if (!sb) return { error: "Supabase is not configured." };
    const { error } = await sb.auth.resend({ type: "signup", email });
    return { error: error?.message ?? null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        uploadAvatar,
        resendConfirmationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
