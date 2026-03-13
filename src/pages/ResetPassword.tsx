"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { useTranslation } from "@/contexts/LanguageContext";
import { Mail, KeyRound, CheckCircle2, ArrowLeft, AlertTriangle, Eye, EyeOff } from "lucide-react";

type Mode = "request" | "verifying" | "update" | "done" | "invalid";

const ResetPassword = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;

    // Subscribe to PASSWORD_RECOVERY event — fires when Supabase auto-exchanges
    // the PKCE code or processes the implicit flow token.
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("update");
      }
    });

    // ── Implicit flow: token is in the URL hash ──────────────────────────────
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash.includes("type=recovery") || hash.includes("access_token")) {
      setMode("update");
      return () => subscription.unsubscribe();
    }

    // ── PKCE flow: ?code= is in the URL query string ─────────────────────────
    const params =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    const code = params?.get("code");

    if (code) {
      setMode("verifying");
      sb.auth
        .exchangeCodeForSession(code)
        .then(({ data, error: err }) => {
          // Clean up the one-time code from the address bar
          if (typeof window !== "undefined") {
            window.history.replaceState({}, "", window.location.pathname);
          }

          if (err) {
            // The code may have already been exchanged by the AuthProvider's
            // getSession() call — check whether a live session already exists.
            sb.auth.getSession().then(({ data: { session } }) => {
              if (session) {
                setMode("update");
              } else {
                setMode("invalid");
              }
            });
          } else if (data.session) {
            setMode("update");
          } else {
            setMode("invalid");
          }
        })
        .catch(() => setMode("invalid"));

      return () => subscription.unsubscribe();
    }

    return () => subscription.unsubscribe();
  }, []);

  // ── Send password-reset email ────────────────────────────────────────────
  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const sb = getSupabase();
    if (!sb) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    const { error: err } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  };

  // ── Set the new password ─────────────────────────────────────────────────
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError(t.register.errorPasswordMismatch);
      return;
    }
    if (password.length < 8) {
      setError(t.reset.passwordTooShort);
      return;
    }
    setLoading(true);
    const sb = getSupabase();
    if (!sb) {
      setError("Supabase is not configured.");
      setLoading(false);
      return;
    }

    const { error: err } = await sb.auth.updateUser({ password });
    if (err) {
      setLoading(false);
      setError(err.message);
      return;
    }

    // Sign out so the user re-authenticates with their new password
    await sb.auth.signOut();
    setLoading(false);
    setMode("done");
  };

  return (
    <Layout>
      <div className="container max-w-md py-8 sm:py-16">
        <div className="bg-card border p-6 sm:p-8 rounded-2xl shadow-sm">
          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <KeyRound className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">
              {mode === "update" ? t.reset.newPasswordTitle : t.reset.title}
            </h1>
            {mode !== "invalid" && mode !== "verifying" && (
              <p className="text-sm text-muted-foreground mt-2">
                {mode === "update"
                  ? t.reset.newPasswordSubtitle
                  : t.reset.subtitle}
              </p>
            )}
          </div>

          {/* ── Error banner ────────────────────────────────────────────── */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* ── Verifying link ──────────────────────────────────────────── */}
          {mode === "verifying" && (
            <div className="text-center py-6 text-muted-foreground text-sm animate-pulse">
              {t.reset.verifying}
            </div>
          )}

          {/* ── Invalid / expired link ──────────────────────────────────── */}
          {mode === "invalid" && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <p className="font-semibold">{t.reset.invalidTitle}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {t.reset.invalidBody}
              </p>
              <Button
                className="w-full h-11 rounded-xl font-bold"
                onClick={() => {
                  setError("");
                  setSent(false);
                  setMode("request");
                }}
              >
                {t.reset.requestNewLink}
              </Button>
            </div>
          )}

          {/* ── Request mode: enter email ────────────────────────────────── */}
          {mode === "request" && !sent && (
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  {t.login.email}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full h-11 px-4 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-bold"
                disabled={loading}
              >
                {loading ? t.reset.sending : t.reset.sendButton}
              </Button>
            </form>
          )}

          {/* ── Sent confirmation ────────────────────────────────────────── */}
          {mode === "request" && sent && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Mail className="h-5 w-5" />
                <p className="font-semibold">{t.reset.sentTitle}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {t.reset.sentBody.replace("{email}", email)}
              </p>
            </div>
          )}

          {/* ── Update mode: enter new password ─────────────────────────── */}
          {mode === "update" && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  {t.reset.newPassword}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="8 characters or more"
                    className="w-full h-11 px-4 pr-11 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  {t.reset.confirmPassword}
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-4 pr-11 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-bold"
                disabled={loading}
              >
                {loading ? t.reset.updating : t.reset.updateButton}
              </Button>
            </form>
          )}

          {/* ── Done ────────────────────────────────────────────────────── */}
          {mode === "done" && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-primary">
                <CheckCircle2 className="h-6 w-6" />
                <p className="font-semibold text-lg">{t.reset.doneTitle}</p>
              </div>
              <p className="text-sm text-muted-foreground">{t.reset.doneBody}</p>
              <Button
                className="w-full h-11 rounded-xl font-bold"
                onClick={() => router.push("/login")}
              >
                {t.reset.goToLogin}
              </Button>
            </div>
          )}

          {/* ── Back to login link (request mode only) ──────────────────── */}
          {(mode === "request" || mode === "invalid") && (
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t.reset.backToLogin}
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;
