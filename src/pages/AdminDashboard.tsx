"use client";
import { useState, useEffect } from "react";
import {
  Store, ShoppingBag, CheckCircle, XCircle, Plus, Trash2, Edit2, Link2,
  BarChart3, Tag, Image, AlertTriangle, Shield, Save, Eye, Newspaper
} from "lucide-react";
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
    { id: "news",       label: t.admin.tabNews,       icon: Newspaper },
    { id: "categories", label: t.admin.tabCategories, icon: Tag },
    { id: "terms",      label: t.admin.tabTerms,      icon: Shield },
    { id: "qr",         label: t.admin.tabQR,         icon: Link2 },
    { id: "reports",    label: t.admin.tabReports,    icon: AlertTriangle },
    { id: "analytics",  label: t.admin.tabAnalytics,  icon: BarChart3 },
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
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-6">
              {adminTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap ${
                    activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <tab.icon className="h-3 w-3" /> {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "suppliers" && <SupplierManager />}
            {activeTab === "approvals" && <ApprovalQueue />}
            {activeTab === "news" && <NewsManager />}
            {activeTab === "categories" && <CategoryManager />}
            {activeTab === "terms" && <TermsManager />}
            {activeTab === "qr" && <QRManager />}
            {activeTab === "reports" && <ReportManager />}
            {activeTab === "analytics" && <AnalyticsPanel />}
          </div>
        </div>
      </div>
    </Layout>
  );
};

const PLAN_BADGE: Record<string, string> = {
  premium: "bg-amber-100 text-amber-700 border border-amber-300",
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
  const [form, setForm] = useState({
    name: "", name_ja: "", slug: "", category: "seafood", category_ja: "海鮮・鮮魚",
    category_2: "", category_2_ja: "", category_3: "", category_3_ja: "",
    area: "central", area_ja: "中央エリア", tags: "", description: "", description_ja: "",
    whatsapp: "", whatsapp_contact_name: "", logo: "", catalog_url: "", image_2: "", image_3: "",
    certifications: "", about: "", about_ja: "", featured: false,
    plan: "basic" as "basic" | "standard" | "premium",
  });

  useEffect(() => { fetchSuppliers(); }, []);

  const fetchSuppliers = async () => {
    const res = await fetch("/api/suppliers");
    setSuppliers(await res.json());
  };

  const resetForm = () => {
    setForm({
      name: "", name_ja: "", slug: "", category: "seafood", category_ja: "海鮮・鮮魚",
      category_2: "", category_2_ja: "", category_3: "", category_3_ja: "",
      area: "central", area_ja: "中央エリア", tags: "", description: "", description_ja: "",
      whatsapp: "", whatsapp_contact_name: "", logo: "", catalog_url: "", image_2: "", image_3: "",
      certifications: "", about: "", about_ja: "", featured: false, plan: "basic",
    });
    setEditSlug(null);
  };

  const handleEdit = (s: any) => {
    setForm({
      name: s.name, name_ja: s.name_ja, slug: s.slug, category: s.category || "", category_ja: s.category_ja || "",
      category_2: s.category_2 || "", category_2_ja: s.category_2_ja || "", category_3: s.category_3 || "", category_3_ja: s.category_3_ja || "",
      area: s.area, area_ja: s.area_ja, tags: (s.tags || []).join(", "),
      description: s.description, description_ja: s.description_ja, whatsapp: s.whatsapp || "",
      whatsapp_contact_name: s.whatsapp_contact_name || "", logo: s.logo || "", catalog_url: s.catalog_url || "", image_2: s.image_2 || "", image_3: s.image_3 || "",
      certifications: (s.certifications || []).join(", "), about: s.about || "", about_ja: s.about_ja || "", featured: s.featured,
      plan: s.plan || "basic",
    });
    setEditSlug(s.slug);
    setShowForm(true);
  };

  const handleSave = async () => {
    const body = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      certifications: form.certifications.split(",").map((c) => c.trim()).filter(Boolean),
    };

    if (editSlug) {
      await fetch(`/api/suppliers/${editSlug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch("/api/suppliers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    setShowForm(false);
    resetForm();
    fetchSuppliers();
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
        <div className="bg-card border rounded-2xl p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label={t.admin.nameEn} value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
            <InputField label={t.admin.nameJa} value={form.name_ja} onChange={(v) => setForm((p) => ({ ...p, name_ja: v }))} />
          </div>
          <InputField label={t.admin.slug} value={form.slug} onChange={(v) => setForm((p) => ({ ...p, slug: v }))} />
          <div className="grid grid-cols-2 gap-4">
            <InputField label={t.admin.category1} value={form.category} onChange={(v) => setForm((p) => ({ ...p, category: v }))} />
            <InputField label={t.admin.category1Ja} value={form.category_ja} onChange={(v) => setForm((p) => ({ ...p, category_ja: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label={t.admin.category2} value={form.category_2} onChange={(v) => setForm((p) => ({ ...p, category_2: v }))} />
            <InputField label={t.admin.category2Ja} value={form.category_2_ja} onChange={(v) => setForm((p) => ({ ...p, category_2_ja: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label={t.admin.category3} value={form.category_3} onChange={(v) => setForm((p) => ({ ...p, category_3: v }))} />
            <InputField label={t.admin.category3Ja} value={form.category_3_ja} onChange={(v) => setForm((p) => ({ ...p, category_3_ja: v }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label={t.admin.area} value={form.area} onChange={(v) => setForm((p) => ({ ...p, area: v }))} />
            <InputField label={t.admin.areaJa} value={form.area_ja} onChange={(v) => setForm((p) => ({ ...p, area_ja: v }))} />
          </div>
          <InputField label={t.admin.tags} value={form.tags} onChange={(v) => setForm((p) => ({ ...p, tags: v }))} />
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
          <Button onClick={handleSave} className="rounded-xl gap-2"><Save className="h-4 w-4" /> {editSlug ? t.admin.update : t.admin.create}</Button>
        </div>
      )}

      <div className="space-y-3">
        {suppliers.map((s: any) => (
          <div key={s.id}>
            <div className="bg-card border rounded-2xl p-4 flex items-center gap-4">
              <img src={s.logo} alt="" className="w-12 h-12 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-bold text-sm truncate">{lang === "ja" ? s.name_ja : s.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${PLAN_BADGE[s.plan || "basic"]}`}>
                    {PLAN_LABEL[s.plan || "basic"]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{
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
              <div className="flex gap-2">
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
  const [form, setForm] = useState({ name: "", name_en: "", image: "", moq: "" });

  useEffect(() => { fetchProducts(); }, [slug]);

  const fetchProducts = async () => {
    const res = await fetch(`/api/suppliers/${slug}/products`);
    setProducts(await res.json());
  };

  const handleAdd = async () => {
    if (!form.name) return;
    await fetch(`/api/suppliers/${slug}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", name_en: "", image: "", moq: "" });
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
    <div className="ml-4 mt-2 bg-muted/50 border rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-bold">{t.admin.productManagement}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <InputField label={t.admin.productName} value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
        <InputField label={t.admin.productNameEn} value={form.name_en} onChange={(v) => setForm((p) => ({ ...p, name_en: v }))} />
        <InputField label={t.admin.productImage} value={form.image} onChange={(v) => setForm((p) => ({ ...p, image: v }))} placeholder="https://..." />
        <InputField label={t.admin.productMoq} value={form.moq} onChange={(v) => setForm((p) => ({ ...p, moq: v }))} />
      </div>
      <Button size="sm" className="rounded-xl gap-1" onClick={handleAdd}>
        <Plus className="h-3 w-3" /> {t.admin.addProduct}
      </Button>
      {products.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t.admin.noProducts}</p>
      ) : (
        <div className="space-y-2">
          {products.map((p: any) => (
            <div key={p.id} className="flex items-center gap-3 bg-card border rounded-lg p-2">
              {p.image && <img src={p.image} alt="" className="w-10 h-10 rounded object-cover" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                {p.name_en && <p className="text-xs text-muted-foreground">{p.name_en}</p>}
                {p.moq && <p className="text-xs text-muted-foreground">MOQ: {p.moq}</p>}
              </div>
              <Button variant="outline" size="sm" className="rounded-lg text-destructive" onClick={() => handleDelete(p.id)}>
                <Trash2 className="h-3 w-3" />
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
            <div key={item.id} className="bg-card border rounded-2xl p-5">
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

function NewsManager() {
  const [articles, setArticles] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", title_ja: "", slug: "", excerpt: "", excerpt_ja: "", content: "", content_ja: "",
    image: "", category: "industry", author: "", published: false,
  });

  useEffect(() => { fetchArticles(); }, []);

  const fetchArticles = async () => {
    const res = await fetch("/api/news?all=true");
    setArticles(await res.json());
  };

  const resetForm = () => {
    setForm({ title: "", title_ja: "", slug: "", excerpt: "", excerpt_ja: "", content: "", content_ja: "", image: "", category: "industry", author: "", published: false });
    setEditSlug(null);
  };

  const handleSave = async () => {
    if (editSlug) {
      await fetch(`/api/news/${editSlug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    } else {
      await fetch("/api/news", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    setShowForm(false);
    resetForm();
    fetchArticles();
  };

  const handleEdit = (a: any) => {
    setForm({
      title: a.title, title_ja: a.title_ja, slug: a.slug, excerpt: a.excerpt, excerpt_ja: a.excerpt_ja,
      content: a.content, content_ja: a.content_ja, image: a.image, category: a.category, author: a.author, published: a.published,
    });
    setEditSlug(a.slug);
    setShowForm(true);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("削除しますか？")) return;
    await fetch(`/api/news/${slug}`, { method: "DELETE" });
    fetchArticles();
  };

  const { lang } = useTranslation();
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
        <div className="bg-card border rounded-2xl p-6 mb-6 space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">
            {editSlug ? (lang === "ja" ? "記事を編集" : "Edit Article") : (lang === "ja" ? "新規記事を追加" : "Add New Article")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label={lang === "ja" ? "タイトル（英語）" : "Title (English)"} value={form.title} onChange={(v) => setForm((p) => ({ ...p, title: v }))} />
            <InputField label={lang === "ja" ? "タイトル（日本語）" : "Title (Japanese)"} value={form.title_ja} onChange={(v) => setForm((p) => ({ ...p, title_ja: v }))} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label={lang === "ja" ? "抜粋（英語）" : "Excerpt (English)"} value={form.excerpt} onChange={(v) => setForm((p) => ({ ...p, excerpt: v }))} />
            <InputField label={lang === "ja" ? "抜粋（日本語）" : "Excerpt (Japanese)"} value={form.excerpt_ja} onChange={(v) => setForm((p) => ({ ...p, excerpt_ja: v }))} />
          </div>
          <InputField label={lang === "ja" ? "スラッグ（URL）" : "Slug (URL)"} value={form.slug} onChange={(v) => setForm((p) => ({ ...p, slug: v }))} placeholder="my-article-slug" />
          <InputField label={lang === "ja" ? "画像URL" : "Image URL"} value={form.image} onChange={(v) => setForm((p) => ({ ...p, image: v }))} placeholder="https://..." />
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
            <div key={a.id} className="bg-card border rounded-2xl p-4 flex items-center gap-4">
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
  const [categories, setCategories] = useState<any[]>([]);
  const [newCat, setNewCat] = useState({ type: "supplier", value: "", label: "", sort_order: 0 });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
  };

  const handleAdd = async () => {
    if (!newCat.value || !newCat.label) return;
    await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newCat) });
    setNewCat({ type: "supplier", value: "", label: "", sort_order: 0 });
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("削除しますか？")) return;
    await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    fetchCategories();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">カテゴリー管理</h2>
      <div className="bg-card border rounded-2xl p-5 mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs font-medium block mb-1">タイプ</label>
          <select value={newCat.type} onChange={(e) => setNewCat((p) => ({ ...p, type: e.target.value }))} className="h-10 px-3 rounded-lg border bg-background text-sm">
            <option value="supplier">サプライヤー</option>
            <option value="marketplace">マーケットプレイス</option>
            <option value="news">ニュース</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">値</label>
          <input value={newCat.value} onChange={(e) => setNewCat((p) => ({ ...p, value: e.target.value }))} className="h-10 px-3 rounded-lg border bg-background text-sm w-32" />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">ラベル</label>
          <input value={newCat.label} onChange={(e) => setNewCat((p) => ({ ...p, label: e.target.value }))} className="h-10 px-3 rounded-lg border bg-background text-sm w-32" />
        </div>
        <Button onClick={handleAdd} size="sm" className="rounded-xl"><Plus className="h-4 w-4" /></Button>
      </div>
      {["supplier", "marketplace", "news"].map((type) => (
        <div key={type} className="mb-6">
          <h3 className="font-bold text-sm mb-3 capitalize">{type === "supplier" ? "サプライヤー" : type === "marketplace" ? "マーケットプレイス" : "ニュース"}</h3>
          <div className="flex flex-wrap gap-2">
            {categories.filter((c: any) => c.type === type).map((c: any) => (
              <div key={c.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm">
                {c.label}
                <button onClick={() => handleDelete(c.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </div>
      ))}
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
      <div className="bg-card border rounded-2xl p-6 max-w-2xl">
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

  useEffect(() => {
    fetch("/api/settings?key=qr_redirect_url").then((r) => r.json()).then((d) => setRedirectUrl(d?.value || "/suppliers"));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "qr_redirect_url", value: redirectUrl }) });
    setSaving(false);
    alert("保存しました。");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">QRリダイレクト管理</h2>
      <div className="bg-card border rounded-2xl p-6 max-w-lg">
        <p className="text-sm text-muted-foreground mb-4">
          <code className="bg-muted px-2 py-0.5 rounded text-xs">yourdomain.com/go</code> にアクセスした際のリダイレクト先URLを設定します。
          QRコードは常に /go を指すため、印刷の変更なしでリダイレクト先を変更できます。
        </p>
        <label className="text-sm font-medium block mb-1.5">リダイレクト先URL</label>
        <input value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} placeholder="/suppliers or https://..." className="w-full h-11 px-4 rounded-lg border bg-background text-sm mb-4" />
        <Button onClick={handleSave} className="rounded-xl gap-2" disabled={saving}><Save className="h-4 w-4" /> {saving ? "保存中..." : "保存"}</Button>
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
            <div key={r.id} className="bg-card border rounded-2xl p-4">
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
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/suppliers").then((r) => r.json()).then(setSuppliers);
    fetch("/api/marketplace?status=approved").then((r) => r.json()).then(setItems);
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">統計スナップショット</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border rounded-2xl p-5 text-center">
          <p className="text-3xl font-black text-primary">{suppliers.length}</p>
          <p className="text-xs text-muted-foreground mt-1">サプライヤー数</p>
        </div>
        <div className="bg-card border rounded-2xl p-5 text-center">
          <p className="text-3xl font-black text-accent">{items.length}</p>
          <p className="text-xs text-muted-foreground mt-1">マーケット出品数</p>
        </div>
        <div className="bg-card border rounded-2xl p-5 text-center">
          <p className="text-3xl font-black text-secondary">{suppliers.reduce((a: number, s: any) => a + (s.views || 0), 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">総閲覧数</p>
        </div>
        <div className="bg-card border rounded-2xl p-5 text-center">
          <p className="text-3xl font-black text-amber-500">{suppliers.filter((s: any) => s.plan === "premium").length}</p>
          <p className="text-xs text-muted-foreground mt-1">Premiumサプライヤー</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {(["premium", "standard", "basic"] as const).map((plan) => (
          <div key={plan} className={`rounded-2xl p-4 text-center border ${PLAN_BADGE[plan]}`}>
            <p className="text-2xl font-black">{suppliers.filter((s: any) => (s.plan || "basic") === plan).length}</p>
            <p className="text-xs font-semibold mt-1">{PLAN_LABEL[plan]}</p>
          </div>
        ))}
      </div>
      <h3 className="font-bold text-sm mb-3">閲覧数トップ</h3>
      <div className="space-y-2">
        {suppliers.sort((a: any, b: any) => b.views - a.views).slice(0, 5).map((s: any) => (
          <div key={s.id} className="flex items-center gap-3 bg-card border rounded-xl p-3">
            <img src={s.logo} alt="" className="w-10 h-10 rounded-lg object-cover" />
            <div className="flex-1"><p className="text-sm font-semibold">{s.name_ja}</p></div>
            <p className="text-sm font-bold text-primary">{s.views} views</p>
          </div>
        ))}
      </div>
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

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1.5">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full h-11 px-4 rounded-lg border bg-background text-sm" />
    </div>
  );
}

export default AdminDashboard;
