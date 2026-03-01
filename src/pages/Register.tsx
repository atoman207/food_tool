"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/contexts/LanguageContext";
import { Camera, User, Mail, CheckCircle2 } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { signUp } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError(t.register.avatarError);
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t.register.errorPasswordMismatch);
      return;
    }
    if (username.length < 3) {
      setError(t.register.errorUsernameTooShort);
      return;
    }

    setLoading(true);
    const result = await signUp({ email, password, name, username, avatarFile });
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.needsEmailConfirmation) {
      setWaitingForConfirmation(true);
    } else {
      router.push("/dashboard");
    }
  };

  // ── Confirmation-pending screen ──────────────────────────────────────────
  if (waitingForConfirmation) {
    return (
      <Layout>
        <div className="container max-w-md py-16">
          <div className="bg-card border rounded-2xl p-8 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
              <Mail className="h-7 w-7 text-amber-600" />
            </div>
            <h1 className="text-xl font-bold">{t.register.confirmationSentTitle}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.register.confirmationSentBody.replace("{email}", email)}
            </p>
            <div className="rounded-xl bg-muted p-4 text-xs text-left space-y-1.5 text-muted-foreground">
              <p className="font-semibold text-foreground">{t.register.confirmationTips}</p>
              <p>{t.register.confirmationTip1}</p>
              <p>{t.register.confirmationTip2}</p>
            </div>
            <Button variant="outline" className="w-full h-11 rounded-xl" onClick={() => router.push("/login")}>
              {t.register.goToLogin}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // ── Registration form ────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="container max-w-md py-16">
        <div className="bg-card border rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold">食</span>
            </div>
            <h1 className="text-2xl font-bold">{t.register.title}</h1>
            <p className="text-sm text-muted-foreground mt-2">{t.register.subtitle}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 mb-2">
              <div
                className="relative w-24 h-24 rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted cursor-pointer hover:border-primary/50 transition-colors overflow-hidden group"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <Image src={avatarPreview} alt="avatar" fill className="object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-1">
                    <User className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                {/* Camera icon — always centred, overlaid on hover */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-7 w-7 text-white drop-shadow" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{t.register.avatarHint}</p>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">{t.register.name} <span className="text-destructive">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.register.namePlaceholder} className="w-full h-11 px-4 rounded-lg border bg-background text-sm" required />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">{t.register.username} <span className="text-destructive">*</span></label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">@</span>
                <input type="text" value={username} onChange={handleUsernameChange} placeholder={t.register.usernamePlaceholder} className="w-full h-11 pl-7 pr-4 rounded-lg border bg-background text-sm" required minLength={3} maxLength={30} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t.register.usernameHint}</p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">{t.register.email} <span className="text-destructive">*</span></label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="w-full h-11 px-4 rounded-lg border bg-background text-sm" required />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">{t.register.password} <span className="text-destructive">*</span></label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.register.passwordPlaceholder} className="w-full h-11 px-4 rounded-lg border bg-background text-sm" required minLength={8} />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">{t.register.confirmPassword} <span className="text-destructive">*</span></label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full h-11 px-4 rounded-lg border bg-background text-sm" required minLength={8} />
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>{t.register.confirmationNote}</p>
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl font-bold" disabled={loading}>
              {loading ? t.register.submitting : t.register.submit}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t.register.hasAccount}{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              {t.register.login}
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
