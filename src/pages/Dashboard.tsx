"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus, Trash2, Package, User, Settings,
  Eye, Clock, Camera, CalendarDays, BadgeCheck, ChevronRight,
} from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useTranslation } from "@/contexts/LanguageContext";
import { getSupabase } from "@/lib/supabase";
import type { MarketplaceItemRow } from "@/types/database";

const Dashboard = () => {
  const { user, profile, loading: authLoading } = useRequireAuth();
  const { refreshProfile, uploadAvatar } = useAuth();
  const { t, lang } = useTranslation();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("mypage");
  const [listings, setListings] = useState<MarketplaceItemRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile edit state
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [company, setCompany] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read ?tab= from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "profile") setActiveTab("profile");
  }, []);

  const tabs = [
    { id: "mypage",  label: t.dashboard.tabMyPage,    icon: User },
    { id: "profile", label: t.dashboard.tabEditProfile, icon: Settings },
  ];

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setUsername(profile.username || "");
      setWhatsapp(profile.whatsapp || "");
      setCompany(profile.company || "");
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetch(`/api/marketplace?seller_id=${user.id}`)
        .then((r) => r.json())
        .then((data) => { setListings(data || []); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert(t.dashboard.avatarError); return; }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDeleteListing = async (slug: string) => {
    if (!confirm(t.dashboard.deleteListingConfirm)) return;
    await fetch(`/api/marketplace/${slug}`, { method: "DELETE" });
    setListings((prev) => prev.filter((l) => l.slug !== slug));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const sb = getSupabase();
      if (!sb) { setSaveMsg(t.dashboard.notConnected); setSaving(false); return; }
      let avatarUrl = profile?.avatar_url || "";
      if (avatarFile) { avatarUrl = (await uploadAvatar(user.id, avatarFile)) ?? avatarUrl; }
      await sb.from("profiles")
        .update({ name, username: username || null, whatsapp, company, avatar_url: avatarUrl })
        .eq("id", user.id);
      await refreshProfile();
      setSaveMsg(t.dashboard.savedMsg);
      setAvatarFile(null);
      setAvatarPreview(null);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <Layout>
        <div className="container py-16 text-center text-muted-foreground">{t.common.loading}</div>
      </Layout>
    );
  }

  const currentAvatar = avatarPreview || profile?.avatar_url || null;

  const statusBadge = (status: string) => {
    const cfg: Record<string, { cls: string; label: string }> = {
      approved: { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", label: t.dashboard.statusApproved },
      pending:  { cls: "bg-amber-50 text-amber-700 border border-amber-200",   label: t.dashboard.statusPending },
      rejected: { cls: "bg-red-50 text-red-700 border border-red-200",         label: t.dashboard.statusRejected },
    };
    const c = cfg[status] || { cls: "bg-muted text-muted-foreground", label: status };
    return <span className={`text-[11px] px-2 py-0.5 font-semibold ${c.cls}`}>{c.label}</span>;
  };

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString(lang === "ja" ? "ja-JP" : "en-SG", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  return (
    <Layout>
      <div className="bg-muted/40 min-h-screen">
        <div className="container py-8">

          {/* Tab navigation */}
          <div className="border-b-2 border-border mb-8 bg-background">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── MY PAGE tab ─────────────────────────────────────────────────── */}
          {activeTab === "mypage" && (
            <div className="space-y-6">

              {/* Profile summary card */}
              <div className="bg-background border-2 border-border">
                {/* Top accent bar */}
                <div className="h-2 bg-primary" />
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    {/* Avatar */}
                    <div className="relative w-20 h-20 overflow-hidden bg-muted flex-shrink-0 border-2 border-primary/20">
                      {currentAvatar ? (
                        <Image src={currentAvatar} alt="avatar" fill className="object-cover" unoptimized />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <User className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h1 className="text-2xl font-black tracking-tight">{profile?.name || "—"}</h1>
                      {profile?.username && (
                        <p className="text-sm text-primary font-bold mt-0.5">@{profile.username}</p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {lang === "ja" ? "登録日：" : "Member since: "}{memberSince}
                        </span>
                        {profile?.company && (
                          <span className="flex items-center gap-1">
                            <BadgeCheck className="h-3.5 w-3.5" />
                            {profile.company}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Edit profile link */}
                    <button
                      onClick={() => setActiveTab("profile")}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors border px-3 py-1.5"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      {lang === "ja" ? "プロフィール編集" : "Edit Profile"}
                    </button>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-0 mt-6 border-t-2 pt-6 divide-x-2">
                    <div className="text-center px-4 py-2">
                      <p className="text-3xl font-black text-primary tabular-nums">{listings.length}</p>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">
                        {lang === "ja" ? "出品数" : "Listings"}
                      </p>
                    </div>
                    <div className="text-center px-4 py-2">
                      <p className="text-3xl font-black text-emerald-600 tabular-nums">
                        {listings.filter((l) => l.status === "approved").length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">
                        {lang === "ja" ? "承認済み" : "Approved"}
                      </p>
                    </div>
                    <div className="text-center px-4 py-2">
                      <p className="text-3xl font-black text-amber-600 tabular-nums">
                        {listings.filter((l) => l.status === "pending").length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">
                        {lang === "ja" ? "審査中" : "Pending"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* My Listings section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black section-accent">
                    {lang === "ja" ? "出品リスト" : "My Listings"}
                  </h2>
                  <Link href="/dashboard/new-item">
                    <Button size="sm" className="gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      {lang === "ja" ? "新規出品" : t.dashboard.newListing}
                    </Button>
                  </Link>
                </div>

                {loading ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">{t.common.loading}</div>
                ) : listings.length > 0 ? (
                  <div className="space-y-3">
                    {listings.map((item) => (
                      <div key={item.id} className="bg-background border-2 border-border flex flex-col sm:flex-row gap-0 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full sm:w-24 h-32 sm:h-auto object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-bold text-sm truncate">{item.title}</h3>
                              {statusBadge(item.status)}
                            </div>
                            <p className="text-xl font-black text-primary">S${Number(item.price).toLocaleString()}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />{item.area}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(item.created_at).toLocaleDateString(lang === "ja" ? "ja-JP" : "en-SG")}
                              </span>
                            </div>
                            {item.reject_reason && (
                              <p className="text-xs text-destructive mt-1 font-medium">
                                {t.dashboard.rejectReason}{item.reject_reason}
                              </p>
                            )}
                          </div>
                          <div className="flex sm:flex-col gap-2 flex-shrink-0">
                            <Link href={`/marketplace/${item.slug}`}>
                              <Button variant="outline" size="sm" className="gap-1 w-full">
                                <Eye className="h-3 w-3" /> {t.common.view}
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 text-destructive hover:bg-destructive/10 hover:border-destructive w-full"
                              onClick={() => handleDeleteListing(item.slug)}
                            >
                              <Trash2 className="h-3 w-3" /> {t.common.delete}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-background border-2 border-dashed border-border text-center py-16 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="font-bold">{t.dashboard.noListings}</p>
                    <Link href="/dashboard/new-item">
                      <Button className="mt-4 gap-2">
                        <Plus className="h-4 w-4" /> {t.dashboard.firstListing}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── PROFILE CHANGE tab ──────────────────────────────────────────── */}
          {activeTab === "profile" && (
            <div className="max-w-xl">
              <h2 className="text-xl font-black mb-6 section-accent">
                {lang === "ja" ? "プロフィール変更" : "Edit Profile"}
              </h2>

              <div className="bg-background border-2 border-border p-6 space-y-5">

                {/* Avatar upload */}
                <div className="flex flex-col items-center gap-3 pb-5 border-b-2">
                  <div
                    className="relative w-28 h-28 overflow-hidden border-2 border-primary/20 bg-muted cursor-pointer hover:opacity-90 transition-opacity group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {currentAvatar ? (
                      <Image src={currentAvatar} alt="avatar" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <User className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.dashboard.avatarHint}</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                      {t.dashboard.fieldName}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 px-4 border-2 border-border bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                      {t.dashboard.fieldUsername}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())}
                        placeholder="username"
                        className="w-full h-11 pl-7 pr-4 border-2 border-border bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                        maxLength={30}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                      {t.dashboard.fieldEmail}
                    </label>
                    <input
                      type="email"
                      value={user.email || ""}
                      disabled
                      className="w-full h-11 px-4 border-2 border-border bg-muted text-sm text-muted-foreground"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                      {t.dashboard.fieldWhatsapp}
                    </label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="65XXXXXXXX"
                      className="w-full h-11 px-4 border-2 border-border bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">
                      {t.dashboard.fieldCompany}
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full h-11 px-4 border-2 border-border bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {saveMsg && (
                  <div className="px-4 py-3 bg-emerald-50 border-l-4 border-emerald-500 text-sm text-emerald-700 font-medium">
                    {saveMsg}
                  </div>
                )}

                <Button
                  onClick={handleSaveProfile}
                  className="w-full h-12 font-bold text-base"
                  disabled={saving}
                >
                  {saving ? t.common.saving : t.dashboard.saveProfile}
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
