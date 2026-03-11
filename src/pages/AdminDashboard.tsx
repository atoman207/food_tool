"use client";
import { useState, useEffect } from "react";
import {
  Store, ShoppingBag, CheckCircle, XCircle, Plus, Trash2, Edit2, Link2,
  BarChart3, Tag, Image, AlertTriangle, Shield, Save, Eye, Newspaper, Globe, ExternalLink, FileText, Palette
} from "lucide-react";
import { FONT_OPTIONS, COLOR_OPTIONS, applyTheme } from "@/components/ThemeProvider";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
  LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useTranslation } from "@/contexts/LanguageContext";

const AdminDashboard = () => {
  const { user, profile, loading: authLoading } = useRequireAuth(true);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("suppliers");

  const adminTabs = [
    { id: "suppliers",  label: t.admin.tabSuppliers,  icon: Store },
    { id: "approvals",  label: t.admin.tabApprovals,  icon: CheckCircle },
    { id: "marketplace", label: t.admin.tabMarketplace, icon: ShoppingBag },
    { id: "news",       label: t.admin.tabNews,       icon: Newspaper },
    { id: "links",      label: t.admin.tabLinks,      icon: Globe },
    { id: "categories", label: t.admin.tabCategories, icon: Tag },
    { id: "about",      label: t.admin.tabAbout,     icon: FileText },
    { id: "terms",      label: t.admin.tabTerms,      icon: Shield },
    { id: "qr",         label: t.admin.tabQR,         icon: Link2 },
    { id: "reports",    label: t.admin.tabReports,    icon: AlertTriangle },
    { id: "analytics",  label: t.admin.tabAnalytics,  icon: BarChart3 },
    { id: "appearance", label: t.admin.tabAppearance,  icon: Palette },
  ];

  if (authLoading || !user || profile?.role !== "admin") {
    return <Layout><div className="container py-16 text-center text-muted-foreground">{t.common.loading}</div></Layout>;
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-black tracking-tight">{t.admin.title}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{t.admin.subtitle}</p>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24 space-y-1">
              {adminTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <tab.icon className="h-4 w-4" /> {tab.label}
                </button>
              ))}
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="lg:hidden flex gap-2 overflow-x-auto scrollbar-hide pb-4 mb-6 -mx-1 px-1">
              {adminTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-full text-xs font-medium whitespace-nowrap ${
                    activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" /> {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "suppliers" && <SupplierManager />}
            {activeTab === "approvals" && <ApprovalQueue />}
            {activeTab === "marketplace" && <MarketplaceManager />}
            {activeTab === "news" && <NewsManager />}
            {activeTab === "links" && <LinksManager />}
            {activeTab === "categories" && <CategoryManager />}
            {activeTab === "about" && <AboutSiteManager />}
            {activeTab === "terms" && <TermsManager />}
            {activeTab === "qr" && <QRManager />}
            {activeTab === "reports" && <ReportManager />}
            {activeTab === "analytics" && <AnalyticsPanel />}
            {activeTab === "appearance" && <AppearanceManager />}
          </div>
        </div>
      </div>
    </Layout>
  );
};

const PLAN_BADGE: Record<string, string> = {
  premium: "bg-primary/10 text-primary border border-primary/40",
  standard: "bg-sky-100 text-sky-700 border border-sky-300",
  basic: "bg-muted text-muted-foreground border border-border",
};
const PLAN_LABEL: Record<string, string> = { premium: "Premium", standard: "Standard", basic: "Basic" };

function SupplierManager() {
  const { t, lang } = useTranslation();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [productSlug, setProductSlug] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "", name_ja: "", slug: "", category: "", category_ja: "",
    category_2: "", category_2_ja: "", category_3: "", category_3_ja: "",
    area: "central", area_ja: "中央エリア", tags: "", description: "", description_ja: "",
    whatsapp: "", whatsapp_contact_name: "", logo: "", catalog_url: "", image_2: "", image_3: "",
    certifications: "", about: "", about_ja: "", featured: false,
    plan: "basic" as "basic" | "standard" | "premium",
  });

  useEffect(() => { fetchSuppliers(); }, []);
  useEffect(() => {
    fetch("/api/categories?type=supplier").then((r) => r.json()).then(setAvailableCategories).catch(() => {});
    fetch("/api/categories?type=tag").then((r) => r.json()).then(setAvailableTags).catch(() => {});
  }, []);

  const fetchSuppliers = async () => {
    const res = await fetch("/api/suppliers");
    setSuppliers(await res.json());
  };

  /** Select a category from the dropdown and auto-fill the matching label_ja */
  const handleCategorySelect = (slot: 1 | 2 | 3, value: string) => {
    const cat = availableCategories.find((c: any) => c.value === value);
    const enKey = slot === 1 ? "category" : slot === 2 ? "category_2" : "category_3";
    const jaKey = slot === 1 ? "category_ja" : slot === 2 ? "category_2_ja" : "category_3_ja";
    setForm((p) => ({ ...p, [enKey]: value, [jaKey]: cat?.label_ja || p[jaKey as keyof typeof p] }));
  };

  /** Toggle a tag checkbox */
  const toggleTag = (tagValue: string) => {
    const current = new Set(form.tags.split(",").map((s) => s.trim()).filter(Boolean));
    if (current.has(tagValue)) current.delete(tagValue); else current.add(tagValue);
    setForm((p) => ({ ...p, tags: Array.from(current).join(", ") }));
  };

  const resetForm = () => {
    setForm({
      name: "", name_ja: "", slug: "", category: "", category_ja: "",
      category_2: "", category_2_ja: "", category_3: "", category_3_ja: "",
      area: "central", area_ja: "中央エリア", tags: "", description: "", description_ja: "",
      whatsapp: "", whatsapp_contact_name: "", logo: "", catalog_url: "", image_2: "", image_3: "",
      certifications: "", about: "", about_ja: "", featured: false, plan: "basic",
    });
    setEditSlug(null);
  };

  const handleEdit = (s: any) => {
    setForm({
      name: s.name || "", name_ja: s.name_ja || "", slug: s.slug, category: s.category || "", category_ja: s.category_ja || "",
      category_2: s.category_2 || "", category_2_ja: s.category_2_ja || "", category_3: s.category_3 || "", category_3_ja: s.category_3_ja || "",
      area: s.area || "", area_ja: s.area_ja || "", tags: (s.tags || []).join(", "),
      // Always fall back to "" so undefined values don't accidentally clear saved text on re-open
      description: s.description ?? "", description_ja: s.description_ja ?? "", whatsapp: s.whatsapp || "",
      whatsapp_contact_name: s.whatsapp_contact_name || "", logo: s.logo || "", catalog_url: s.catalog_url || "", image_2: s.image_2 || "", image_3: s.image_3 || "",
      certifications: (s.certifications || []).join(", "), about: s.about ?? "", about_ja: s.about_ja ?? "", featured: !!s.featured,
      plan: s.plan || "basic",
    });
    setEditSlug(s.slug);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (isSaving) return;
    const slugTrimmed = (form.slug || "").trim();
    const nameTrimmed = (form.name || "").trim();
    const nameJaTrimmed = (form.name_ja || "").trim();
    if (!slugTrimmed) {
      alert((lang === "ja" ? "スラッグは必須です。" : "Slug is required. ") + (t.admin.slugRequiredPlaceholder ?? ""));
      return;
    }
    if (!nameTrimmed && !nameJaTrimmed) {
      alert(lang === "ja" ? "名前（英語または日本語）のいずれかを入力してください。" : "Please enter either name (EN) or name (JA).");
      return;
    }
    setIsSaving(true);
    try {
      const body = {
        ...form,
        slug: slugTrimmed,
        name: nameTrimmed || form.name,
        name_ja: nameJaTrimmed || form.name_ja,
        tags: form.tags.split(",").map((tt) => tt.trim()).filter(Boolean),
        certifications: form.certifications.split(",").map((c) => c.trim()).filter(Boolean),
      };

      const res = editSlug
        ? await fetch(`/api/suppliers/${editSlug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/suppliers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(lang === "ja"
          ? `保存に失敗しました。\n${err?.error ?? res.statusText}`
          : `Save failed.\n${err?.error ?? res.statusText}`);
        return;
      }

      setShowForm(false);
      resetForm();
      fetchSuppliers();
    } catch (e) {
      alert(lang === "ja" ? "ネットワークエラーが発生しました。" : "Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(t.admin.deleteSupplierConfirm)) return;
    await fetch(`/api/suppliers/${slug}`, { method: "DELETE" });
    fetchSuppliers();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{t.admin.supplierManagement}</h2>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }} className="rounded-xl gap-2">
          <Plus className="h-4 w-4" /> {showForm ? t.admin.close : t.admin.add}
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label={t.admin.nameEn} value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} required />
            <InputField label={t.admin.nameJa} value={form.name_ja} onChange={(v) => setForm((p) => ({ ...p, name_ja: v }))} required />
          </div>
          <InputField label={t.admin.slug} value={form.slug} onChange={(v) => setForm((p) => ({ ...p, slug: v }))} required placeholder={t.admin.slugRequiredPlaceholder} />
          {/* Category 1 — select from CategoryManager */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">{t.admin.category1}</label>
              <select value={form.category} onChange={(e) => handleCategorySelect(1, e.target.value)} className="h-11 px-4 rounded-lg border bg-background text-sm w-full">
                <option value="">—</option>
                {availableCategories.map((c: any) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">{t.admin.category1Ja}</label>
              <input value={form.category_ja} onChange={(e) => setForm((p) => ({ ...p, category_ja: e.target.value }))} placeholder={availableCategories.find((c: any) => c.value === form.category)?.label_ja ?? ""} className="h-11 px-4 rounded-lg border bg-background text-sm w-full" />
            </div>
          </div>
          {/* Category 2 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">{t.admin.category2}</label>
              <select value={form.category_2} onChange={(e) => handleCategorySelect(2, e.target.value)} className="h-11 px-4 rounded-lg border bg-background text-sm w-full">
                <option value="">—</option>
                {availableCategories.map((c: any) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">{t.admin.category2Ja}</label>
              <input value={form.category_2_ja} onChange={(e) => setForm((p) => ({ ...p, category_2_ja: e.target.value }))} placeholder={availableCategories.find((c: any) => c.value === form.category_2)?.label_ja ?? ""} className="h-11 px-4 rounded-lg border bg-background text-sm w-full" />
            </div>
          </div>
          {/* Category 3 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">{t.admin.category3}</label>
              <select value={form.category_3} onChange={(e) => handleCategorySelect(3, e.target.value)} className="h-11 px-4 rounded-lg border bg-background text-sm w-full">
                <option value="">—</option>
                {availableCategories.map((c: any) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">{t.admin.category3Ja}</label>
              <input value={form.category_3_ja} onChange={(e) => setForm((p) => ({ ...p, category_3_ja: e.target.value }))} placeholder={availableCategories.find((c: any) => c.value === form.category_3)?.label_ja ?? ""} className="h-11 px-4 rounded-lg border bg-background text-sm w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label={t.admin.area} value={form.area} onChange={(v) => setForm((p) => ({ ...p, area: v }))} />
            <InputField label={t.admin.areaJa} value={form.area_ja} onChange={(v) => setForm((p) => ({ ...p, area_ja: v }))} />
          </div>
          {/* Tags — multi-select from category management (type=tag) */}
          <div>
            <label className="text-sm font-medium block mb-1.5">{t.admin.tags}</label>
            {availableTags.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-background">
                {availableTags.map((tag: any) => {
                  const selected = form.tags.split(",").map((s) => s.trim()).includes(tag.value);
                  return (
                    <button key={tag.value} type="button" onClick={() => toggleTag(tag.value)}
                      className={`px-3 py-1 rounded-full text-xs border transition-colors ${selected ? "bg-primary text-white border-primary" : "bg-muted border-border text-muted-foreground hover:border-primary hover:text-primary"}`}>
                      {lang === "ja" ? (tag.label_ja || tag.label) : tag.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <InputField label="" value={form.tags} onChange={(v) => setForm((p) => ({ ...p, tags: v }))} />
            )}
            {form.tags && <p className="text-xs text-muted-foreground mt-1">{form.tags}</p>}
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">{lang === "ja" ? "説明（英語・カード用）" : "Description (EN, for cards)"}</label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="w-full h-20 p-3 rounded-lg border bg-background text-sm resize-none" placeholder={lang === "ja" ? "カードに表示する短い説明" : "Short description for cards"} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">{lang === "ja" ? "説明（日本語・カード用）" : "Description (JA, for cards)"}</label>
            <textarea value={form.description_ja} onChange={(e) => setForm((p) => ({ ...p, description_ja: e.target.value }))} className="w-full h-20 p-3 rounded-lg border bg-background text-sm resize-none" placeholder={lang === "ja" ? "カードに表示する短い説明" : "Short description for cards"} />
          </div>
          <InputField label="WhatsApp" value={form.whatsapp} onChange={(v) => setForm((p) => ({ ...p, whatsapp: v }))} />
          <InputField label={t.admin.contactNameWhatsApp} value={form.whatsapp_contact_name} onChange={(v) => setForm((p) => ({ ...p, whatsapp_contact_name: v }))} />
          <ImageField label={t.admin.image1} value={form.logo} onChange={(v) => setForm((p) => ({ ...p, logo: v }))} hint={t.admin.imageHint} uploadLabel={t.admin.imageUploadOrUrl} />
          <InputField label={t.admin.catalogUrl} value={form.catalog_url} onChange={(v) => setForm((p) => ({ ...p, catalog_url: v }))} placeholder="https://..." />
          <ImageField label={t.admin.image2} value={form.image_2} onChange={(v) => setForm((p) => ({ ...p, image_2: v }))} hint={t.admin.imageHint} uploadLabel={t.admin.imageUploadOrUrl} />
          <ImageField label={t.admin.image3} value={form.image_3} onChange={(v) => setForm((p) => ({ ...p, image_3: v }))} hint={t.admin.imageHint} uploadLabel={t.admin.imageUploadOrUrl} />
          <InputField label={t.admin.certifications} value={form.certifications} onChange={(v) => setForm((p) => ({ ...p, certifications: v }))} />
          <div>
            <label className="text-sm font-medium block mb-1.5">{t.admin.aboutEn}</label>
            <textarea value={form.about} onChange={(e) => setForm((p) => ({ ...p, about: e.target.value }))} className="w-full h-20 p-3 rounded-lg border bg-background text-sm resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">{t.admin.aboutJa}</label>
            <textarea value={form.about_ja} onChange={(e) => setForm((p) => ({ ...p, about_ja: e.target.value }))} className="w-full h-20 p-3 rounded-lg border bg-background text-sm resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">{t.admin.planLabel}</label>
            <select
              value={form.plan}
              onChange={(e) => setForm((p) => ({ ...p, plan: e.target.value as "basic" | "standard" | "premium" }))}
              className="h-11 px-4 rounded-lg border bg-background text-sm w-full"
            >
              <option value="basic">{t.admin.planBasic}</option>
              <option value="standard">{t.admin.planStandard}</option>
              <option value="premium">{t.admin.planPremium}</option>
            </select>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="rounded-xl gap-2">
            <Save className="h-4 w-4" /> {isSaving ? (lang === "ja" ? "保存中…" : "Saving…") : (editSlug ? t.admin.update : t.admin.create)}
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {suppliers.map((s: any) => (
          <div key={s.id}>
            <div className="bg-card border p-4 space-y-3">
              {/* Row 1: image + text */}
              <div className="flex items-start gap-3 min-w-0">
                <img src={s.logo} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-bold text-sm break-words">{lang === "ja" ? s.name_ja : s.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${PLAN_BADGE[s.plan || "basic"]}`}>
                      {PLAN_LABEL[s.plan || "basic"]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground break-words">{
                    (lang === "ja"
                      ? [s.category_ja, s.category_2_ja, s.category_3_ja]
                      : [
                          (t.suppliers as { categories?: Record<string, string> }).categories?.[s.category] ?? s.category,
                          (t.suppliers as { categories?: Record<string, string> }).categories?.[s.category_2] ?? s.category_2,
                          (t.suppliers as { categories?: Record<string, string> }).categories?.[s.category_3] ?? s.category_3,
                        ]
                    ).filter(Boolean).join(" · ") || "—"
                  } · {lang === "ja" ? s.area_ja : ((t.suppliers as { areas?: Record<string, string> }).areas?.[s.area] ?? s.area)} · {s.views} views</p>
                </div>
              </div>
              {/* Row 2: action buttons */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setProductSlug(productSlug === s.slug ? null : s.slug)}>
                  <ShoppingBag className="h-3 w-3 mr-1" /> {t.admin.manageProducts}
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handleEdit(s)}><Edit2 className="h-3 w-3" /></Button>
                <Button variant="outline" size="sm" className="rounded-xl text-destructive" onClick={() => handleDelete(s.slug)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
            {productSlug === s.slug && <ProductManager slug={s.slug} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductManager({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "", name_en: "", image: "",
    country_of_origin: "", weight: "", quantity: "",
    storage_condition: "", temperature: "",
  });

  useEffect(() => { fetchProducts(); }, [slug]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/suppliers/${slug}/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    }
  };

  const handleAdd = async () => {
    if (!(form.name || "").trim()) {
      alert(t.common.requiredField);
      return;
    }
    await fetch(`/api/suppliers/${slug}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", name_en: "", image: "", country_of_origin: "", weight: "", quantity: "", storage_condition: "", temperature: "" });
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.admin.deleteProductConfirm)) return;
    await fetch(`/api/suppliers/${slug}/products`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchProducts();
  };

  return (
    <div className="mt-2 bg-muted/50 border p-3 sm:p-4 space-y-4 overflow-x-hidden">
      <h3 className="text-sm font-bold">{t.admin.productManagement}</h3>

      {/* Row 1: Name (JA) + Name (EN) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InputField label={t.admin.productName} value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} required />
        <InputField label={t.admin.productNameEn} value={form.name_en} onChange={(v) => setForm((p) => ({ ...p, name_en: v }))} />
      </div>

      {/* Row 2: Image (full width on mobile) */}
      <ImageField label={t.admin.productImage} value={form.image} onChange={(v) => setForm((p) => ({ ...p, image: v }))} hint={t.admin.imageHint} uploadLabel={t.admin.imageUploadOrUrl} />

      {/* Row 3: Origin + Weight + Quantity */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <InputField label={t.admin.productCountryOfOrigin} value={form.country_of_origin} onChange={(v) => setForm((p) => ({ ...p, country_of_origin: v }))} />
        <InputField label={t.admin.productWeight} value={form.weight} onChange={(v) => setForm((p) => ({ ...p, weight: v }))} />
        <InputField label={t.admin.productQuantity} value={form.quantity} onChange={(v) => setForm((p) => ({ ...p, quantity: v }))} />
      </div>

      {/* Row 4: Storage + Temperature */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InputField label={t.admin.productStorageCondition} value={form.storage_condition} onChange={(v) => setForm((p) => ({ ...p, storage_condition: v }))} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">{t.admin.productTemperature}</label>
          <select
            value={form.temperature}
            onChange={(e) => setForm((p) => ({ ...p, temperature: e.target.value }))}
            className="h-12 px-3 rounded-lg border bg-background text-sm"
          >
            <option value="">—</option>
            <option value="Frozen">{t.admin.productTemperatureFrozen}</option>
            <option value="Chilled">{t.admin.productTemperatureChilled}</option>
            <option value="Fresh">{t.admin.productTemperatureFresh}</option>
          </select>
        </div>
      </div>

      <Button className="w-full sm:w-auto rounded-xl gap-2 h-12 text-base" onClick={handleAdd}>
        <Plus className="h-4 w-4" /> {t.admin.addProduct}
      </Button>

      {!Array.isArray(products) || products.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t.admin.noProducts}</p>
      ) : (
        <div className="space-y-2">
          {products.map((p: any) => (
            <div key={p.id} className="flex items-center gap-3 bg-card border p-3">
              {p.image
                ? <img src={p.image} alt="" className="w-12 h-12 rounded object-cover flex-shrink-0" />
                : <div className="w-12 h-12 rounded bg-muted flex-shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{p.name}</p>
                {p.name_en && <p className="text-xs text-muted-foreground truncate">{p.name_en}</p>}
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                  {p.temperature && <span className="text-xs font-medium text-primary">{p.temperature}</span>}
                  {p.country_of_origin && <span className="text-xs text-muted-foreground">{p.country_of_origin}</span>}
                  {p.weight && <span className="text-xs text-muted-foreground">{p.weight}</span>}
                  {p.quantity && <span className="text-xs text-muted-foreground">{p.quantity}</span>}
                  {p.storage_condition && <span className="text-xs text-muted-foreground">{p.storage_condition}</span>}
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg text-destructive flex-shrink-0 h-10 w-10 p-0" onClick={() => handleDelete(p.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ApprovalQueue() {
  const [items, setItems] = useState<any[]>([]);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const { t } = useTranslation();

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const res = await fetch("/api/marketplace?status=pending&noFallback=true");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  };

  const handleApprove = async (slug: string) => {
    await fetch(`/api/marketplace/${slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "approved" }) });
    fetchItems();
  };

  const handleReject = async (slug: string) => {
    await fetch(`/api/marketplace/${slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "rejected", reject_reason: rejectReason }) });
    setRejectId(null);
    setRejectReason("");
    fetchItems();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">{t.admin.approvalQueueTitle}</h2>
      {items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p>{t.admin.approvalEmpty}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item: any) => (
            <div key={item.id} className="bg-card border p-5">
              <div className="flex gap-4">
                <img src={item.image} alt="" className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm">{item.title}</h3>
                  <p className="text-lg font-black text-primary">S${Number(item.price).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.seller_name} · {item.area} · {item.condition}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" className="rounded-xl gap-1" onClick={() => handleApprove(item.slug)}>
                    <CheckCircle className="h-3 w-3" /> {t.admin.approvalApprove}
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl gap-1 text-destructive" onClick={() => setRejectId(item.id)}>
                    <XCircle className="h-3 w-3" /> {t.admin.approvalReject}
                  </Button>
                </div>
              </div>
              {rejectId === item.id && (
                <div className="mt-4 flex gap-2">
                  <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder={t.admin.approvalRejectPlaceholder} className="flex-1 h-10 px-3 rounded-lg border bg-background text-sm" />
                  <Button size="sm" className="rounded-xl" onClick={() => handleReject(item.slug)}>{t.admin.approvalSend}</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MarketplaceManager() {
  const { t, lang } = useTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const EMPTY_FORM = {
    title: "", title_en: "",
    slug: "", price: "", image: "",
    area: "", area_en: "",
    condition: "", condition_en: "",
    years_used: "0",
    description: "", description_en: "",
    category: "",
    seller_name: "", seller_whatsapp: "",
    delivery: "", delivery_en: "",
    status: "approved" as "approved" | "pending" | "rejected",
  };
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    const res = await fetch("/api/marketplace?all=true");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  };

  const resetForm = () => { setForm(EMPTY_FORM); setEditSlug(null); };

  const handleEdit = (item: any) => {
    setForm({
      title: item.title ?? "",
      title_en: item.title_en ?? "",
      slug: item.slug ?? "",
      price: String(item.price ?? ""),
      image: item.image ?? "",
      area: item.area ?? "",
      area_en: item.area_en ?? "",
      condition: item.condition ?? "",
      condition_en: item.condition_en ?? "",
      years_used: String(item.years_used ?? 0),
      description: item.description ?? "",
      description_en: item.description_en ?? "",
      category: item.category ?? "",
      seller_name: item.seller_name ?? "",
      seller_whatsapp: item.seller_whatsapp ?? "",
      delivery: item.delivery ?? "",
      delivery_en: item.delivery_en ?? "",
      status: item.status ?? "pending",
    });
    setEditSlug(item.slug);
    setShowForm(true);
  };

  const handleSave = async () => {
    const titleTrimmed = (form.title || "").trim();
    const slugTrimmed = (form.slug || "").trim();
    const priceNum = Number(form.price);
    if (!titleTrimmed) {
      alert(lang === "ja" ? "タイトル（日本語）は必須です。" : "Title (JA) is required.");
      return;
    }
    if (!slugTrimmed) {
      alert(lang === "ja" ? "スラッグは必須です。" : "Slug is required.");
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) {
      alert(lang === "ja" ? "価格を正しく入力してください。" : "Please enter a valid price.");
      return;
    }
    const body = { ...form, title: titleTrimmed, slug: slugTrimmed, price: priceNum, years_used: Number(form.years_used) };
    if (editSlug) {
      await fetch(`/api/marketplace/${editSlug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch("/api/marketplace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    setShowForm(false);
    resetForm();
    fetchItems();
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(lang === "ja" ? `「${slug}」を削除しますか？` : `Delete "${slug}"?`)) return;
    await fetch(`/api/marketplace/${slug}`, { method: "DELETE" });
    fetchItems();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "marketplace");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const json = await res.json();
    if (json.url) setForm((p) => ({ ...p, image: json.url }));
    setImageUploading(false);
  };

  const label = (en: string, ja: string) => lang === "ja" ? ja : en;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{t.admin.tabMarketplace}</h2>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }} className="rounded-xl gap-2">
          <Plus className="h-4 w-4" /> {showForm ? t.admin.close : t.admin.add}
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label={label("Title (JA)", "タイトル（日本語）")} value={form.title} onChange={(v) => setForm((p) => ({ ...p, title: v }))} required />
            <InputField label={label("Title (EN)", "タイトル（英語）")} value={form.title_en} onChange={(v) => setForm((p) => ({ ...p, title_en: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label={label("Slug (URL key)", "スラッグ（URLキー）")} value={form.slug} onChange={(v) => setForm((p) => ({ ...p, slug: v }))} required placeholder={t.admin.slugRequiredPlaceholder} />
            <InputField label={label("Price (SGD)", "価格（SGD）")} value={form.price} onChange={(v) => setForm((p) => ({ ...p, price: v }))} type="number" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label={label("Area (JA)", "エリア（日本語）")} value={form.area} onChange={(v) => setForm((p) => ({ ...p, area: v }))} />
            <InputField label={label("Area (EN)", "エリア（英語）")} value={form.area_en} onChange={(v) => setForm((p) => ({ ...p, area_en: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label={label("Condition (JA)", "状態（日本語）")} value={form.condition} onChange={(v) => setForm((p) => ({ ...p, condition: v }))} />
            <InputField label={label("Condition (EN)", "状態（英語）")} value={form.condition_en} onChange={(v) => setForm((p) => ({ ...p, condition_en: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label={label("Delivery (JA)", "配送方法（日本語）")} value={form.delivery} onChange={(v) => setForm((p) => ({ ...p, delivery: v }))} />
            <InputField label={label("Delivery (EN)", "配送方法（英語）")} value={form.delivery_en} onChange={(v) => setForm((p) => ({ ...p, delivery_en: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label={label("Years Used", "使用年数")} value={form.years_used} onChange={(v) => setForm((p) => ({ ...p, years_used: v }))} type="number" />
            <InputField label={label("Category", "カテゴリー")} value={form.category} onChange={(v) => setForm((p) => ({ ...p, category: v }))} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">{label("Description (JA)", "説明（日本語）")}</label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="w-full h-20 p-3 rounded-lg border bg-background text-sm resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">
              {label("Description (EN)", "説明（英語）")}
              <span className="ml-2 text-[10px] font-normal text-primary bg-primary/10 border border-primary/30 px-1.5 py-0.5 rounded-full">
                {label("English only", "英語のみ入力")}
              </span>
            </label>
            <textarea
              value={form.description_en}
              onChange={(e) => {
                // Strip any non-Latin characters (CJK, Arabic, etc.) in real time
                const filtered = e.target.value.replace(/[\u3000-\u9FFF\uF900-\uFAFF\uAC00-\uD7AF\u0400-\u04FF\u0600-\u06FF]/g, "");
                setForm((p) => ({ ...p, description_en: filtered }));
              }}
              placeholder="Describe the item in English…"
              className="w-full h-20 p-3 rounded-lg border bg-background text-sm resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label={label("Seller Name", "出品者名")} value={form.seller_name} onChange={(v) => setForm((p) => ({ ...p, seller_name: v }))} />
            <InputField label="WhatsApp" value={form.seller_whatsapp} onChange={(v) => setForm((p) => ({ ...p, seller_whatsapp: v }))} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">{label("Image", "画像")}</label>
            <div className="flex gap-3 items-center">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
              {imageUploading && <span className="text-xs text-muted-foreground">{label("Uploading…", "アップロード中…")}</span>}
            </div>
            {form.image && <img src={form.image} alt="" className="mt-2 h-24 rounded-lg object-cover" />}
            <InputField label={label("or Image URL", "または画像URL")} value={form.image} onChange={(v) => setForm((p) => ({ ...p, image: v }))} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">{label("Status", "ステータス")}</label>
            <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as any }))} className="h-10 px-3 rounded-lg border bg-background text-sm w-full">
              <option value="approved">{label("Approved", "承認済み")}</option>
              <option value="pending">{label("Pending", "審査中")}</option>
              <option value="rejected">{label("Rejected", "却下")}</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} className="rounded-xl gap-2"><Save className="h-4 w-4" />{t.admin.save}</Button>
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }} className="rounded-xl">{t.admin.close}</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>{label("No items found.", "アイテムがありません。")}</p>
          </div>
        )}
        {items.map((item: any) => (
          <div key={item.id ?? item.slug} className="bg-card border p-4 flex gap-4 items-center">
            {item.image && <img src={item.image} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{lang === "en" && item.title_en ? item.title_en : item.title}</p>
              <p className="text-xs text-muted-foreground">S${Number(item.price).toLocaleString()} · {lang === "en" && item.area_en ? item.area_en : item.area} · {lang === "en" && item.condition_en ? item.condition_en : item.condition}</p>
              <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${item.status === "approved" ? "bg-green-100 text-green-700" : item.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                {item.status === "approved" ? label("Approved", "承認済み") : item.status === "rejected" ? label("Rejected", "却下") : label("Pending", "審査中")}
              </span>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" className="rounded-xl gap-1" onClick={() => handleEdit(item)}>
                <Edit2 className="h-3 w-3" /> {t.admin.edit}
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl gap-1 text-destructive" onClick={() => handleDelete(item.slug)}>
                <Trash2 className="h-3 w-3" /> {t.admin.delete}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewsManager() {
  const [articles, setArticles] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [form, setForm] = useState({
    title: "", title_ja: "", slug: "", excerpt: "", excerpt_ja: "", content: "", content_ja: "",
    image: "", category: "industry", author: "", published: false, published_at: "",
  });

  useEffect(() => { fetchArticles(); }, []);

  const fetchArticles = async () => {
    const res = await fetch("/api/news?all=true");
    setArticles(await res.json());
  };

  const resetForm = () => {
    setForm({ title: "", title_ja: "", slug: "", excerpt: "", excerpt_ja: "", content: "", content_ja: "", image: "", category: "industry", author: "", published: false, published_at: "" });
    setEditSlug(null);
  };

  const handleSave = async () => {
    const titleTrimmed = (form.title || "").trim();
    const titleJaTrimmed = (form.title_ja || "").trim();
    const slugTrimmed = (form.slug || "").trim();
    if (!titleTrimmed && !titleJaTrimmed) {
      alert(lang === "ja" ? "タイトル（英語または日本語）のいずれかを入力してください。" : "Please enter either Title (EN) or Title (JA).");
      return;
    }
    if (!slugTrimmed) {
      alert(lang === "ja" ? "スラッグは必須です。" : "Slug is required.");
      return;
    }
    const body: Record<string, unknown> = { ...form, title: titleTrimmed || form.title, title_ja: titleJaTrimmed || form.title_ja, slug: slugTrimmed };
    body.published_at = form.published_at ? new Date(form.published_at).toISOString() : null;
    if (editSlug) {
      await fetch(`/api/news/${editSlug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch("/api/news", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    setShowForm(false);
    resetForm();
    fetchArticles();
  };

  const handleEdit = (a: any) => {
    const pub = a.published_at ? new Date(a.published_at).toISOString().slice(0, 16) : "";
    setForm({
      title: a.title, title_ja: a.title_ja, slug: a.slug, excerpt: a.excerpt, excerpt_ja: a.excerpt_ja,
      content: a.content, content_ja: a.content_ja, image: a.image, category: a.category, author: a.author, published: a.published,
      published_at: pub,
    });
    setEditSlug(a.slug);
    setShowForm(true);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(t.admin.deleteConfirm)) return;
    await fetch(`/api/news/${slug}`, { method: "DELETE" });
    fetchArticles();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("folder", "news");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setForm((p) => ({ ...p, image: data.url }));
      else throw new Error(data.error || "Upload failed");
    } catch (err) {
      console.error(err);
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  };

  const { t, lang } = useTranslation();
  const categoryOptions = ["industry", "regulation", "trend", "event"];
  const categoryLabels: Record<string, { en: string; ja: string }> = {
    industry: { en: "Industry", ja: "業界ニュース" },
    regulation: { en: "Regulation", ja: "規制・法律" },
    trend: { en: "Trend", ja: "トレンド" },
    event: { en: "Event", ja: "イベント" },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">{t.admin.tabNews}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{articles.length} {lang === "ja" ? "件" : "articles"}</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }} className="rounded-xl gap-2">
          <Plus className="h-4 w-4" /> {showForm ? t.admin.close : t.admin.add}
        </Button>
      </div>
      {showForm && (
        <div className="bg-card border p-6 mb-6 space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">
            {editSlug ? (lang === "ja" ? "記事を編集" : "Edit Article") : (lang === "ja" ? "新規記事を追加" : "Add New Article")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label={lang === "ja" ? "タイトル（英語）" : "Title (English)"} value={form.title} onChange={(v) => setForm((p) => ({ ...p, title: v }))} required />
            <InputField label={lang === "ja" ? "タイトル（日本語）" : "Title (Japanese)"} value={form.title_ja} onChange={(v) => setForm((p) => ({ ...p, title_ja: v }))} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label={lang === "ja" ? "抜粋（英語）" : "Excerpt (English)"} value={form.excerpt} onChange={(v) => setForm((p) => ({ ...p, excerpt: v }))} />
            <InputField label={lang === "ja" ? "抜粋（日本語）" : "Excerpt (Japanese)"} value={form.excerpt_ja} onChange={(v) => setForm((p) => ({ ...p, excerpt_ja: v }))} />
          </div>
          <InputField label={lang === "ja" ? "スラッグ（URL）" : "Slug (URL)"} value={form.slug} onChange={(v) => setForm((p) => ({ ...p, slug: v }))} required placeholder={t.admin.slugRequiredPlaceholder} />
          <div>
            <label className="text-sm font-medium block mb-1.5">{lang === "ja" ? "画像" : "Image"}</label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                id="news-image-upload"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setImageUploading(true);
                  try {
                    const fd = new FormData();
                    fd.set("file", f);
                    fd.set("folder", "news");
                    const res = await fetch("/api/upload", { method: "POST", body: fd });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Upload failed");
                    setForm((p) => ({ ...p, image: data.url }));
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setImageUploading(false);
                    e.target.value = "";
                  }
                }}
              />
              <label htmlFor="news-image-upload">
                <Button type="button" variant="outline" size="sm" className="rounded-xl gap-2 cursor-pointer" disabled={imageUploading} asChild>
                  <span>
                    <Image className="h-4 w-4" />
                    {imageUploading ? (lang === "ja" ? "アップロード中..." : "Uploading...") : (lang === "ja" ? "画像をアップロード" : "Upload image")}
                  </span>
                </Button>
              </label>
              <span className="text-xs text-muted-foreground">{(lang === "ja" ? "または" : "or")}</span>
            </div>
            <InputField label={lang === "ja" ? "画像URL" : "Image URL"} value={form.image} onChange={(v) => setForm((p) => ({ ...p, image: v }))} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">{lang === "ja" ? "カテゴリー" : "Category"}</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full h-11 px-3 rounded-lg border bg-background text-sm"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>{lang === "ja" ? categoryLabels[c].ja : categoryLabels[c].en}</option>
                ))}
              </select>
            </div>
            <InputField label={lang === "ja" ? "著者" : "Author"} value={form.author} onChange={(v) => setForm((p) => ({ ...p, author: v }))} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">{lang === "ja" ? "表示日付（管理者設定）" : "Display Date (admin override)"}</label>
            <input
              type="datetime-local"
              value={form.published_at}
              onChange={(e) => setForm((p) => ({ ...p, published_at: e.target.value }))}
              className="w-full h-11 px-3 rounded-lg border bg-background text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {lang === "ja" ? "空欄の場合は作成日時を表示します。" : "Leave empty to use creation date."}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">{lang === "ja" ? "本文（英語）" : "Content (English)"}</label>
            <textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} rows={4} className="w-full p-3 rounded-lg border bg-background text-sm resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">{lang === "ja" ? "本文（日本語）" : "Content (Japanese)"}</label>
            <textarea value={form.content_ja} onChange={(e) => setForm((p) => ({ ...p, content_ja: e.target.value }))} rows={4} className="w-full p-3 rounded-lg border bg-background text-sm resize-none" />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={() => setForm((p) => ({ ...p, published: !p.published }))} className="accent-primary" />
            {lang === "ja" ? "公開する" : "Publish"}
          </label>
          <div className="flex gap-3">
            <Button onClick={handleSave} className="rounded-xl gap-2">
              <Save className="h-4 w-4" /> {editSlug ? t.admin.update : t.admin.create}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }} className="rounded-xl">
              {t.admin.close}
            </Button>
          </div>
        </div>
      )}
      {articles.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>{lang === "ja" ? "記事がまだありません" : "No articles yet"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((a: any) => (
            <div key={a.id} className="bg-card border p-4 flex items-center gap-4">
              {a.image && (
                <img src={a.image} alt="" className="w-16 h-12 rounded-lg object-cover flex-shrink-0 hidden sm:block" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{lang === "ja" ? (a.title_ja || a.title) : (a.title || a.title_ja)}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${a.published ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                    {a.published ? (lang === "ja" ? "公開中" : "Published") : (lang === "ja" ? "下書き" : "Draft")}
                  </span>
                  <span className="text-[10px] tag-badge">{lang === "ja" ? (categoryLabels[a.category]?.ja ?? a.category) : (categoryLabels[a.category]?.en ?? a.category)}</span>
                  <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString(lang === "ja" ? "ja-JP" : "en-SG")}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handleEdit(a)}>
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl text-destructive hover:bg-destructive/10" onClick={() => handleDelete(a.slug)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryManager() {
  const { t, lang } = useTranslation();
  const [categories, setCategories] = useState<any[]>([]);
  const [newCat, setNewCat] = useState({ type: "supplier", value: "", label: "", label_ja: "", sort_order: 0 });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
  };

  const handleAdd = async () => {
    const valueTrimmed = (newCat.value || "").trim();
    const labelTrimmed = (newCat.label || "").trim();
    if (!valueTrimmed) {
      alert(lang === "ja" ? "値は必須です。" : "Value is required.");
      return;
    }
    if (!labelTrimmed) {
      alert(lang === "ja" ? "ラベルは必須です。" : "Label is required.");
      return;
    }
    await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newCat, value: valueTrimmed, label: labelTrimmed }) });
    setNewCat({ type: "supplier", value: "", label: "", label_ja: "", sort_order: 0 });
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.admin.deleteConfirm)) return;
    await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    fetchCategories();
  };

  const typeLabels: Record<string, string> = {
    supplier: t.admin.typeSupplier,
    marketplace: t.admin.typeMarketplace,
    news: t.admin.typeNews,
    tag: lang === "ja" ? "タグ（サプライヤー用）" : "Tags (for suppliers)",
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">{t.admin.categoryManagement}</h2>
      <div className="bg-card border p-5 mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs font-medium block mb-1">{t.admin.typeLabel}</label>
          <select value={newCat.type} onChange={(e) => setNewCat((p) => ({ ...p, type: e.target.value }))} className="h-10 px-3 rounded-lg border bg-background text-sm">
            <option value="supplier">{t.admin.typeSupplier}</option>
            <option value="marketplace">{t.admin.typeMarketplace}</option>
            <option value="news">{t.admin.typeNews}</option>
            <option value="tag">{lang === "ja" ? "タグ" : "Tag"}</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">{t.admin.valueLabel} (EN key) <span className="text-destructive">*</span></label>
          <input value={newCat.value} onChange={(e) => setNewCat((p) => ({ ...p, value: e.target.value }))} className="h-10 px-3 rounded-lg border bg-background text-sm w-32" placeholder={lang === "ja" ? "必須 (例: halal)" : "Required (e.g. halal)"} />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">{t.admin.labelLabel} (EN) <span className="text-destructive">*</span></label>
          <input value={newCat.label} onChange={(e) => setNewCat((p) => ({ ...p, label: e.target.value }))} className="h-10 px-3 rounded-lg border bg-background text-sm w-36" placeholder={lang === "ja" ? "必須 (例: Halal)" : "Required (e.g. Halal)"} />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">{lang === "ja" ? "ラベル（日本語）" : "Label (JA)"}</label>
          <input value={newCat.label_ja} onChange={(e) => setNewCat((p) => ({ ...p, label_ja: e.target.value }))} className="h-10 px-3 rounded-lg border bg-background text-sm w-36" placeholder="日本語ラベル" />
        </div>
        <Button onClick={handleAdd} size="sm" className="rounded-xl"><Plus className="h-4 w-4" /></Button>
      </div>
      {["supplier", "tag", "marketplace", "news"].map((type) => (
        <div key={type} className="mb-6">
          <h3 className="font-bold text-sm mb-3">{typeLabels[type] ?? type}</h3>
          <div className="flex flex-wrap gap-2">
            {categories.filter((c: any) => c.type === type).map((c: any) => (
              <div key={c.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm">
                <span className="font-medium">{c.label}</span>
                {c.label_ja && <span className="text-muted-foreground text-xs">/ {c.label_ja}</span>}
                <span className="text-xs text-muted-foreground">({c.value})</span>
                <button onClick={() => handleDelete(c.id)} className="text-muted-foreground hover:text-destructive ml-1"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export type AboutSiteContent = {
  hero_title_en?: string;
  hero_title_ja?: string;
  hero_sub_en?: string;
  hero_sub_ja?: string;
  hero_image?: string;
  intro_text_en?: string;
  intro_text_ja?: string;
  feature_image_1?: string;
  feature_image_2?: string;
  feature_image_3?: string;
  feature_image_4?: string;
};

const DEFAULT_ABOUT: AboutSiteContent = {};

function AboutSiteManager() {
  const { t, lang } = useTranslation();
  const [form, setForm] = useState<AboutSiteContent>(DEFAULT_ABOUT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings?key=about_site")
      .then((r) => r.json())
      .then((d) => {
        if (d?.value) {
          try {
            const parsed = typeof d.value === "string" ? JSON.parse(d.value) : d.value;
            setForm({ ...DEFAULT_ABOUT, ...parsed });
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "about_site", value: JSON.stringify(form) }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">{t.admin.tabAbout}</h2>
      <p className="text-sm text-muted-foreground mb-6">
        {lang === "ja"
          ? "「このサイトについて」ページのヒーロー・紹介文・画像を編集できます。空欄の場合はデフォルトの表示になります。"
          : "Edit the About page hero, introduction text, and images. Leave blank to use default content."}
      </p>
      <div className="bg-card border p-6 max-w-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Hero title (EN)</label>
            <textarea value={form.hero_title_en ?? ""} onChange={(e) => setForm((p) => ({ ...p, hero_title_en: e.target.value }))} placeholder={t.about.heroTitle} rows={2} className="w-full p-3 rounded-lg border bg-background text-sm resize-none" />
            <p className="text-xs text-muted-foreground mt-1">Enterキーで改行できます / Press Enter to add a line break</p>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Hero title (JA)</label>
            <textarea value={form.hero_title_ja ?? ""} onChange={(e) => setForm((p) => ({ ...p, hero_title_ja: e.target.value }))} placeholder="つながる。取引する。成長する。" rows={2} className="w-full p-3 rounded-lg border bg-background text-sm resize-none" />
            <p className="text-xs text-muted-foreground mt-1">Enterキーで改行できます / Press Enter to add a line break</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Hero subtitle (EN)</label>
            <textarea value={form.hero_sub_en ?? ""} onChange={(e) => setForm((p) => ({ ...p, hero_sub_en: e.target.value }))} placeholder={t.about.heroSub} rows={2} className="w-full p-3 rounded-lg border bg-background text-sm resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Hero subtitle (JA)</label>
            <textarea value={form.hero_sub_ja ?? ""} onChange={(e) => setForm((p) => ({ ...p, hero_sub_ja: e.target.value }))} placeholder="シンガポールのF&B業界向け…" rows={2} className="w-full p-3 rounded-lg border bg-background text-sm resize-none" />
          </div>
        </div>
        <div>
          <ImageField
            label="Hero image"
            value={form.hero_image ?? ""}
            onChange={(v) => setForm((p) => ({ ...p, hero_image: v }))}
            hint={lang === "ja" ? "推奨サイズ：横1440px × 縦600px（16:7比率）、JPG/PNG、2MB以下" : "Recommended: 1440 × 600 px (16:7 ratio), JPG/PNG, under 2 MB"}
            uploadLabel={t.admin.imageUploadOrUrl}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Intro paragraph (EN)</label>
            <textarea value={form.intro_text_en ?? ""} onChange={(e) => setForm((p) => ({ ...p, intro_text_en: e.target.value }))} placeholder="Optional intro below hero" rows={3} className="w-full p-3 rounded-lg border bg-background text-sm resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Intro paragraph (JA)</label>
            <textarea value={form.intro_text_ja ?? ""} onChange={(e) => setForm((p) => ({ ...p, intro_text_ja: e.target.value }))} placeholder="任意の紹介文" rows={3} className="w-full p-3 rounded-lg border bg-background text-sm resize-none" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">
            Feature images (1–4)
            <span className="text-xs font-normal text-muted-foreground ml-2">
              {lang === "ja" ? "推奨サイズ：横800px × 縦600px（4:3）、JPG/PNG、2MB以下" : "Recommended: 800 × 600 px (4:3), JPG/PNG, under 2 MB"}
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            {([1, 2, 3, 4] as const).map((i) => (
              <ImageField
                key={i}
                label={`Feature ${i}`}
                value={(form as Record<string, string>)[`feature_image_${i}`] ?? ""}
                onChange={(v) => setForm((p) => ({ ...p, [`feature_image_${i}`]: v }))}
                hint={lang === "ja" ? `特集画像 ${i}（推奨：800×600px）` : `Feature image ${i} (recommended: 800×600 px)`}
                uploadLabel={t.admin.imageUploadOrUrl}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} className="rounded-xl gap-2" disabled={saving}>
            <Save className="h-4 w-4" /> {saving ? t.common.saving : t.common.save}
          </Button>
          {saved && <span className="text-sm text-emerald-600 font-medium">{lang === "ja" ? "保存しました" : "Saved"}</span>}
        </div>
      </div>
    </div>
  );
}

function TermsManager() {
  const [termsText, setTermsText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetch("/api/settings?key=terms_of_service").then((r) => r.json()).then((d) => setTermsText(d?.value || ""));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "terms_of_service", value: termsText }) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">{t.admin.tabTerms}</h2>
      <div className="bg-card border p-6 max-w-2xl">
        <label className="text-sm font-medium block mb-1.5">{t.admin.termsLabel}</label>
        <textarea
          value={termsText}
          onChange={(e) => setTermsText(e.target.value)}
          rows={12}
          className="w-full p-3 rounded-lg border bg-background text-sm resize-y font-mono mb-4"
          placeholder="Enter terms of service content here..."
        />
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} className="rounded-xl gap-2" disabled={saving}>
            <Save className="h-4 w-4" /> {saving ? t.common.saving : t.admin.termsSave}
          </Button>
          {saved && <span className="text-sm text-emerald-600 font-medium">{t.admin.termsSaved}</span>}
        </div>
      </div>
    </div>
  );
}

function QRManager() {
  const [redirectUrl, setRedirectUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetch("/api/settings?key=qr_redirect_url").then((r) => r.json()).then((d) => setRedirectUrl(d?.value || "/suppliers"));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "qr_redirect_url", value: redirectUrl }) });
    setSaving(false);
    alert(t.admin.qrSaved);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">{t.admin.qrTitle}</h2>
      <div className="bg-card border p-6 max-w-lg">
        <p className="text-sm text-muted-foreground mb-4">
          {t.admin.qrDescription}
        </p>
        <label className="text-sm font-medium block mb-1.5">{t.admin.qrRedirectLabel}</label>
        <input value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} placeholder="/suppliers or https://..." className="w-full h-11 px-4 rounded-lg border bg-background text-sm mb-4" />
        <Button onClick={handleSave} className="rounded-xl gap-2" disabled={saving}><Save className="h-4 w-4" /> {saving ? t.admin.qrSaving : t.admin.qrSave}</Button>
      </div>
    </div>
  );
}

function ReportManager() {
  const [reports, setReports] = useState<any[]>([]);
  const { t, lang } = useTranslation();

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    const res = await fetch("/api/reports");
    setReports(await res.json());
  };

  const handleStatus = async (id: string, status: string) => {
    await fetch("/api/reports", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    fetchReports();
  };

  const handleDeleteItem = async (r: any) => {
    if (!confirm(t.admin.reportDeleteConfirm)) return;
    if (r.item_type === "marketplace_item" && r.item_id) {
      const itemRes = await fetch(`/api/marketplace/${r.item_id}?byId=true`);
      if (itemRes.ok) {
        const item = await itemRes.json();
        if (item?.slug) {
          await fetch(`/api/marketplace/${item.slug}`, { method: "DELETE" });
        }
      }
    }
    await handleStatus(r.id, "reviewed");
    alert(t.admin.reportNotifyMsg);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">{t.admin.reportManagerTitle}</h2>
      {reports.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><p>{t.admin.reportEmpty}</p></div>
      ) : (
        <div className="space-y-3">
          {reports.map((r: any) => (
            <div key={r.id} className="bg-card border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{r.item_type} · {new Date(r.created_at).toLocaleDateString(lang === "ja" ? "ja-JP" : "en-SG")}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === "pending" ? "bg-yellow-100 text-yellow-700" : r.status === "reviewed" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>{r.status}</span>
              </div>
              <p className="text-sm font-medium mb-0.5">{r.item_type} · ID: {r.item_id}</p>
              <p className="text-sm text-muted-foreground">{r.reason}</p>
              {r.status === "pending" && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button size="sm" className="rounded-xl" onClick={() => handleStatus(r.id, "reviewed")}>{t.admin.reportReviewed}</Button>
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handleStatus(r.id, "dismissed")}>{t.admin.reportDismiss}</Button>
                  {r.item_type === "marketplace_item" && (
                    <Button variant="outline" size="sm" className="rounded-xl text-destructive border-destructive/40 hover:bg-destructive/10" onClick={() => handleDeleteItem(r)}>
                      <Trash2 className="h-3 w-3 mr-1" /> {t.admin.reportDelete}
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyticsPanel() {
  const { t, lang } = useTranslation();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [monthlyVisits, setMonthlyVisits] = useState<{ month: string; visits: number }[]>([]);
  const [monthlySupplierViews, setMonthlySupplierViews] = useState<{ month: string; views: number }[]>([]);
  const [monthlyMarketplaceViews, setMonthlyMarketplaceViews] = useState<{ month: string; views: number }[]>([]);
  const [topMarketplaceItems, setTopMarketplaceItems] = useState<{ slug: string; views: number }[]>([]);
  const [pvMonths, setPvMonths] = useState(6);
  const [svMonths, setSvMonths] = useState(6);
  const [mvMonths, setMvMonths] = useState(6);

  useEffect(() => {
    fetch("/api/suppliers").then((r) => r.json()).then(setSuppliers).catch(() => {});
    fetch("/api/marketplace?status=approved").then((r) => r.json()).then(setItems).catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/analytics/pageview?months=${pvMonths}`)
      .then((r) => r.json()).then(setMonthlyVisits).catch(() => {});
  }, [pvMonths]);

  useEffect(() => {
    fetch(`/api/analytics/supplier-views?months=${svMonths}`)
      .then((r) => r.json()).then(setMonthlySupplierViews).catch(() => {});
  }, [svMonths]);

  useEffect(() => {
    fetch(`/api/analytics/marketplace-views?months=${mvMonths}`)
      .then((r) => r.json())
      .then((d) => {
        setMonthlyMarketplaceViews(d.monthly ?? []);
        setTopMarketplaceItems(d.topItems ?? []);
      })
      .catch(() => {});
  }, [mvMonths]);

  const monthOptions = [3, 6, 12];
  const formatMonth = (key: string) => {
    const [y, m] = key.split("-");
    return lang === "ja" ? `${y}年${parseInt(m)}月` : new Date(parseInt(y), parseInt(m) - 1).toLocaleString("en", { month: "short", year: "2-digit" });
  };

  return (
    <div className="space-y-10">
      <h2 className="text-xl font-bold">{t.admin.analytics.title}</h2>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border p-5 text-center">
          <p className="text-3xl font-black text-primary">{suppliers.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{t.admin.analytics.suppliersCount}</p>
        </div>
        <div className="bg-card border p-5 text-center">
          <p className="text-3xl font-black text-accent">{items.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{t.admin.analytics.marketplaceCount}</p>
        </div>
        <div className="bg-card border p-5 text-center">
          <p className="text-3xl font-black text-secondary">{suppliers.reduce((a: number, s: any) => a + (s.views || 0), 0).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{t.admin.analytics.totalViews}</p>
        </div>
        <div className="bg-card border p-5 text-center">
          <p className="text-3xl font-black text-primary">{monthlyMarketplaceViews.reduce((a, d) => a + d.views, 0).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{t.admin.analytics.totalMarketplaceViews}</p>
        </div>
      </div>

      {/* ── Monthly site visits chart ── */}
      <div className="bg-card border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">{t.admin.analytics.monthlyVisits}</h3>
          <div className="flex gap-1">
            {monthOptions.map((m) => (
              <button key={m} onClick={() => setPvMonths(m)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${pvMonths === m ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
                {m}{lang === "ja" ? "ヶ月" : "mo"}
              </button>
            ))}
          </div>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyVisits.map((d) => ({ ...d, month: formatMonth(d.month) }))} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => [v.toLocaleString(), t.admin.analytics.visitsLabel]} />
              <Line type="monotone" dataKey="visits" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{t.admin.analytics.monthlyVisitsNote}</p>
      </div>

      {/* ── Monthly supplier views chart ── */}
      <div className="bg-card border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">{t.admin.analytics.monthlySupplierViews}</h3>
          <div className="flex gap-1">
            {monthOptions.map((m) => (
              <button key={m} onClick={() => setSvMonths(m)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${svMonths === m ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
                {m}{lang === "ja" ? "ヶ月" : "mo"}
              </button>
            ))}
          </div>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlySupplierViews.map((d) => ({ ...d, month: formatMonth(d.month) }))} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => [v.toLocaleString(), t.admin.analytics.viewsLabel]} />
              <Line type="monotone" dataKey="views" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{t.admin.analytics.monthlySupplierViewsNote}</p>
      </div>

      {/* ── Monthly marketplace item views chart ── */}
      <div className="bg-card border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">{t.admin.analytics.monthlyMarketplaceViews}</h3>
          <div className="flex gap-1">
            {monthOptions.map((m) => (
              <button key={m} onClick={() => setMvMonths(m)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${mvMonths === m ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
                {m}{lang === "ja" ? "ヶ月" : "mo"}
              </button>
            ))}
          </div>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyMarketplaceViews.map((d) => ({ ...d, month: formatMonth(d.month) }))} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => [v.toLocaleString(), t.admin.analytics.viewsLabel]} />
              <Line type="monotone" dataKey="views" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{t.admin.analytics.monthlyMarketplaceViewsNote}</p>
      </div>

      {/* ── Top marketplace items by views ── */}
      <div>
        <h3 className="font-bold text-sm mb-1">{t.admin.analytics.topMarketplaceItems}</h3>
        <p className="text-xs text-muted-foreground mb-3">{t.admin.analytics.marketplaceCumulativeNote}</p>
        {topMarketplaceItems.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t.admin.noProducts}</p>
        ) : (
          <>
            <div className="h-52 w-full max-w-xl mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={topMarketplaceItems.slice(0, 5).map((i) => {
                    const item = items.find((it: any) => it.slug === i.slug);
                    return { name: item ? (lang === "ja" ? (item.title_ja || item.title) : (item.title || item.title_ja)) : i.slug, views: i.views };
                  })}
                  margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
                >
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value: number) => [value.toLocaleString(), t.admin.analytics.viewsLabel]} />
                  <Bar dataKey="views" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {topMarketplaceItems.slice(0, 5).map((i) => {
                const item = items.find((it: any) => it.slug === i.slug);
                const displayTitle = item ? (lang === "ja" ? (item.title_ja || item.title) : (item.title || item.title_ja)) : i.slug;
                return (
                  <div key={i.slug} className="flex items-center gap-3 bg-card border p-3">
                    {item?.image && <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                    <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{displayTitle}</p></div>
                    <p className="text-sm font-bold text-accent">{i.views.toLocaleString()} {t.admin.analytics.viewsLabel}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Plan breakdown ── */}
      <div>
        <h3 className="font-bold text-sm mb-3">{t.admin.analytics.planBreakdown}</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {(["premium", "standard", "basic"] as const).map((plan) => (
            <div key={plan} className={`rounded-2xl p-4 text-center border ${PLAN_BADGE[plan]}`}>
              <p className="text-2xl font-black">{suppliers.filter((s: any) => (s.plan || "basic") === plan).length}</p>
              <p className="text-xs font-semibold mt-1">{PLAN_LABEL[plan]}</p>
            </div>
          ))}
        </div>
        <div className="h-44 w-full max-w-md">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { plan: PLAN_LABEL.premium, count: suppliers.filter((s: any) => (s.plan || "basic") === "premium").length },
                { plan: PLAN_LABEL.standard, count: suppliers.filter((s: any) => (s.plan || "basic") === "standard").length },
                { plan: PLAN_LABEL.basic, count: suppliers.filter((s: any) => (s.plan || "basic") === "basic").length },
              ]}
              margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
            >
              <XAxis dataKey="plan" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: number) => [value, t.admin.analytics.suppliersCount]} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                <Cell fill="#FF2636" />
                <Cell fill="hsl(var(--primary))" />
                <Cell fill="hsl(var(--muted-foreground))" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Top suppliers by cumulative views ── */}
      <div>
        <h3 className="font-bold text-sm mb-1">{t.admin.analytics.topByViews}</h3>
        <p className="text-xs text-muted-foreground mb-3">{t.admin.analytics.cumulativeNote}</p>
        <div className="h-52 w-full max-w-xl mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={[...suppliers]
                .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
                .slice(0, 5)
                .map((s: any) => ({ name: lang === "ja" ? (s.name_ja || s.name) : (s.name || s.name_ja), views: s.views || 0 }))}
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value: number) => [value.toLocaleString(), t.admin.analytics.viewsLabel]} />
              <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {[...suppliers].sort((a: any, b: any) => (b.views || 0) - (a.views || 0)).slice(0, 5).map((s: any) => (
            <div key={s.id} className="flex items-center gap-3 bg-card border p-3">
              <img src={s.logo} alt="" className="w-10 h-10 rounded-lg object-cover" />
              <div className="flex-1"><p className="text-sm font-semibold">{lang === "ja" ? (s.name_ja || s.name) : (s.name || s.name_ja)}</p></div>
              <p className="text-sm font-bold text-primary">{(s.views || 0).toLocaleString()} {t.admin.analytics.viewsLabel}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppearanceManager() {
  const { t, lang } = useTranslation();
  const [fontKey, setFontKey]   = useState("inter");
  const [colorKey, setColorKey] = useState("red");
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((rows: { key: string; value: string }[]) => {
        const f = rows.find((r) => r.key === "site_font");
        const c = rows.find((r) => r.key === "site_color");
        if (f?.value) setFontKey(f.value);
        if (c?.value) setColorKey(c.value);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await Promise.all([
        fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "site_font",  value: fontKey  }) }),
        fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "site_color", value: colorKey }) }),
      ]);
      applyTheme(fontKey, colorKey);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const selectedColor = COLOR_OPTIONS.find((c) => c.key === colorKey) ?? COLOR_OPTIONS[0];

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold">{t.admin.tabAppearance}</h2>

      {/* ── Font picker ── */}
      <div className="bg-card border p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <span className="text-lg">🔤</span>
          {lang === "ja" ? "フォント設定" : "Font Settings"}
        </h3>
        <p className="text-sm text-muted-foreground mb-5">
          {lang === "ja"
            ? "サイト全体に適用されるフォントを選択してください。"
            : "Choose the font applied across the whole site."}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFontKey(f.key)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                fontKey === f.key
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary/40 hover:bg-muted/50"
              }`}
            >
              <p className="font-semibold text-sm" style={{ fontFamily: f.css }}>
                {lang === "ja" ? f.labelJa : f.labelEn}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: f.css }}>
                {lang === "ja" ? "あいうえお ABCdef 123" : "ABCdef 123 — The quick brown fox"}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Color picker ── */}
      <div className="bg-card border p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <span className="text-lg">🎨</span>
          {lang === "ja" ? "メインカラー設定" : "Primary Color Settings"}
        </h3>
        <p className="text-sm text-muted-foreground mb-5">
          {lang === "ja"
            ? "ヘッダー・ボタン・アクセントカラーとして使われる色を選択してください。"
            : "Choose the accent color used for the header, buttons, and highlights."}
        </p>
        <div className="flex flex-wrap gap-4">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setColorKey(c.key)}
              title={lang === "ja" ? c.labelJa : c.labelEn}
              className={`relative w-14 h-14 rounded-2xl border-4 transition-all hover:scale-105 ${
                colorKey === c.key ? "border-foreground scale-110 shadow-lg" : "border-transparent"
              }`}
              style={{ backgroundColor: c.hex }}
            >
              {colorKey === c.key && (
                <span className="absolute inset-0 flex items-center justify-center text-white font-black text-lg">✓</span>
              )}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          {lang === "ja" ? `選択中: ${selectedColor.labelJa}` : `Selected: ${selectedColor.labelEn}`}
        </p>
      </div>

      {/* ── Live preview ── */}
      <div className="bg-card border p-6">
        <h3 className="font-bold mb-4">
          {lang === "ja" ? "プレビュー" : "Preview"}
        </h3>
        <div
          style={{
            fontFamily: FONT_OPTIONS.find((f) => f.key === fontKey)?.css,
            "--preview-color": selectedColor.hex,
          } as React.CSSProperties}
          className="space-y-3 p-4 rounded-xl border bg-background"
        >
          <p className="text-2xl font-bold" style={{ color: selectedColor.hex }}>
            {lang === "ja" ? "F&Bポータル・シンガポール" : "F&B Portal Singapore"}
          </p>
          <p className="text-base">
            {lang === "ja"
              ? "信頼できるサプライヤーを見つけ、すぐにつながり、スマートに取引しましょう。"
              : "Find trusted suppliers, connect instantly, trade smart."}
          </p>
          <div className="flex gap-3">
            <span className="px-4 py-2 rounded-xl text-white text-sm font-semibold" style={{ backgroundColor: selectedColor.hex }}>
              {lang === "ja" ? "詳細を見る" : "View Details"}
            </span>
            <span className="px-4 py-2 rounded-xl text-sm font-semibold border-2" style={{ borderColor: selectedColor.hex, color: selectedColor.hex }}>
              {lang === "ja" ? "お問い合わせ" : "Contact"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Save button ── */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2 px-6">
          <Save className="h-4 w-4" />
          {saving
            ? (lang === "ja" ? "保存中…" : "Saving…")
            : (lang === "ja" ? "設定を保存" : "Save Settings")}
        </Button>
        {saved && (
          <p className="text-sm text-green-600 font-medium">
            {lang === "ja" ? "保存しました ✓ — 変更はすぐに反映されます。" : "Saved ✓ — Changes applied immediately."}
          </p>
        )}
      </div>
    </div>
  );
}

function LinksManager() {
  const { lang } = useTranslation();
  const [links, setLinks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const emptyForm = {
    name: "", name_ja: "", description: "", description_ja: "",
    url: "", icon: "🔗", bg_image: "", category: "government", sort_order: 0, active: true,
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchLinks(); }, []);

  const fetchLinks = async () => {
    const res = await fetch("/api/links");
    if (res.ok) setLinks(await res.json());
  };

  const resetForm = () => { setForm(emptyForm); setEditId(null); };

  const handleEdit = (l: any) => {
    setForm({
      name: l.name || "", name_ja: l.name_ja || "",
      description: l.description || "", description_ja: l.description_ja || "",
      url: l.url || "", icon: l.icon || "🔗",
      bg_image: l.bg_image || l.bgImage || "",
      category: l.category || "government",
      sort_order: l.sort_order ?? 0,
      active: l.active !== false,
    });
    setEditId(l.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.url) return;
    const body = { ...form, sort_order: Number(form.sort_order) };
    if (editId) {
      await fetch("/api/links", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editId, ...body }) });
    } else {
      await fetch("/api/links", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    setShowForm(false);
    resetForm();
    fetchLinks();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(lang === "ja" ? "このリンクを削除しますか？" : "Delete this link?")) return;
    await fetch(`/api/links?id=${id}`, { method: "DELETE" });
    fetchLinks();
  };

  const categoryOptions = ["government", "association", "platform", "resource"];
  const categoryLabel = (c: string) => ({ government: "Government", association: "Association", platform: "Platform", resource: "Resource" }[c] ?? c);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">{lang === "ja" ? "リンク管理" : "Links Manager"}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{links.length} {lang === "ja" ? "件" : "links"}</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }} className="rounded-xl gap-2">
          <Plus className="h-4 w-4" /> {showForm ? (lang === "ja" ? "閉じる" : "Close") : (lang === "ja" ? "追加" : "Add")}
        </Button>
      </div>

      {showForm && (
        <div className="bg-card border p-6 mb-6 space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">
            {editId ? (lang === "ja" ? "リンクを編集" : "Edit Link") : (lang === "ja" ? "新規リンクを追加" : "Add New Link")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label={lang === "ja" ? "名前（英語）" : "Name (English)"} value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
            <InputField label={lang === "ja" ? "名前（日本語）" : "Name (Japanese)"} value={form.name_ja} onChange={(v) => setForm((p) => ({ ...p, name_ja: v }))} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label={lang === "ja" ? "説明（英語）" : "Description (English)"} value={form.description} onChange={(v) => setForm((p) => ({ ...p, description: v }))} />
            <InputField label={lang === "ja" ? "説明（日本語）" : "Description (Japanese)"} value={form.description_ja} onChange={(v) => setForm((p) => ({ ...p, description_ja: v }))} />
          </div>
          <InputField label="URL" value={form.url} onChange={(v) => setForm((p) => ({ ...p, url: v }))} placeholder="https://..." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InputField label={lang === "ja" ? "アイコン（絵文字）" : "Icon (emoji)"} value={form.icon} onChange={(v) => setForm((p) => ({ ...p, icon: v }))} placeholder="🔗" />
            <div>
              <label className="text-sm font-medium block mb-1.5">{lang === "ja" ? "カテゴリー" : "Category"}</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full h-11 px-3 rounded-lg border bg-background text-sm"
              >
                {categoryOptions.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
              </select>
            </div>
            <InputField label={lang === "ja" ? "表示順" : "Sort Order"} value={String(form.sort_order)} onChange={(v) => setForm((p) => ({ ...p, sort_order: Number(v) || 0 }))} placeholder="0" />
            <div className="flex flex-col justify-end pb-0.5">
              <label className="flex items-center gap-2 text-sm cursor-pointer h-11">
                <input type="checkbox" checked={form.active} onChange={() => setForm((p) => ({ ...p, active: !p.active }))} className="accent-primary w-4 h-4" />
                {lang === "ja" ? "表示する" : "Active"}
              </label>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">{lang === "ja" ? "背景画像URL" : "Background Image URL"}</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={form.bg_image}
                onChange={(e) => setForm((p) => ({ ...p, bg_image: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 h-11 px-4 rounded-lg border bg-background text-sm"
              />
              {form.bg_image && (
                <img src={form.bg_image} alt="" className="w-16 h-11 rounded-lg object-cover border flex-shrink-0" />
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} className="rounded-xl gap-2">
              <Save className="h-4 w-4" /> {editId ? (lang === "ja" ? "更新" : "Update") : (lang === "ja" ? "作成" : "Create")}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }} className="rounded-xl">
              {lang === "ja" ? "キャンセル" : "Cancel"}
            </Button>
          </div>
        </div>
      )}

      {links.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Globe className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>{lang === "ja" ? "リンクがまだありません" : "No links yet"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((l: any) => (
            <div key={l.id} className="bg-card border p-4 flex items-center gap-4">
              {l.bg_image || l.bgImage ? (
                <img src={l.bg_image || l.bgImage} alt="" className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl flex-shrink-0">{l.icon}</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{lang === "ja" ? (l.name_ja || l.name) : l.name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${l.active !== false ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                    {l.active !== false ? (lang === "ja" ? "表示中" : "Active") : (lang === "ja" ? "非表示" : "Hidden")}
                  </span>
                  <span className="text-[10px] tag-badge">{categoryLabel(l.category)}</span>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-0.5 hover:underline truncate max-w-[200px]">
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />{l.url}
                  </a>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handleEdit(l)}>
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl text-destructive hover:bg-destructive/10" onClick={() => handleDelete(l.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ImageField({
  label,
  value,
  onChange,
  hint,
  uploadLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint: string;
  uploadLabel: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="file"
          accept="image/*,.pdf"
          className="text-sm"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            const j = await res.json();
            if (j?.url) onChange(j.url);
          }}
        />
        <span className="text-xs text-muted-foreground">{uploadLabel}</span>
      </div>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
        className="mt-1 w-full h-10 px-3 rounded-lg border bg-background text-sm"
      />
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1.5">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full h-11 px-4 rounded-lg border bg-background text-sm" />
    </div>
  );
}

export default AdminDashboard;
