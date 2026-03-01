"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useTranslation } from "@/contexts/LanguageContext";

const NewItem = () => {
  const { user, profile, loading: authLoading } = useRequireAuth();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const conditions = [
    t.marketplace.conditions["like-new"],
    t.marketplace.conditions.good,
    t.marketplace.conditions.used,
    t.marketplace.conditions["needs-repair"],
  ];
  const areas = [
    t.marketplace.areas.central,
    t.marketplace.areas.east,
    t.marketplace.areas.west,
    t.marketplace.areas.north,
    t.marketplace.areas.south,
  ];
  const mpCategories = [
    t.marketplace.categories.kitchen,
    t.marketplace.categories.tableware,
    t.marketplace.categories.utensils,
    t.marketplace.categories.furniture,
    t.marketplace.categories.other,
  ];
  const deliveryOptions = [
    t.marketplace.deliveryOptions.pickup,
    t.marketplace.deliveryOptions.delivery,
    t.marketplace.deliveryOptions.both,
  ];

  const [form, setForm] = useState({
    title: "", category: mpCategories[0], price: "", condition: conditions[0],
    years_used: "0", description: "", area: areas[0], delivery: deliveryOptions[0],
    image: "", images: [] as string[],
  });

  const handleChange = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !agreed) return;
    setSubmitting(true);

    const slug = form.title.toLowerCase().replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now();

    const body = {
      ...form,
      slug,
      price: Number(form.price),
      years_used: Number(form.years_used),
      image: form.image || "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=450&fit=crop",
      images: form.image ? [form.image] : ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=450&fit=crop"],
      seller_id: user.id,
      seller_name: profile?.name || profile?.username || t.nav.user,
      seller_whatsapp: profile?.whatsapp || "",
    };

    const res = await fetch("/api/marketplace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setSubmitting(false);
    if (res.ok) {
      alert(t.newItem.successMsg);
      window.location.href = "/dashboard";
    } else {
      alert(t.newItem.errorMsg);
    }
  };

  if (authLoading || !user) {
    return <Layout><div className="container py-16 text-center text-muted-foreground">{t.common.loading}</div></Layout>;
  }

  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 font-medium">
          <ArrowLeft className="h-4 w-4" /> {t.newItem.backToDashboard}
        </Link>
        <h1 className="text-3xl font-black tracking-tight mb-8">{t.newItem.title}</h1>

        <form onSubmit={handleSubmit} className="bg-card border rounded-2xl p-6 space-y-5">
          <div>
            <label className="text-sm font-medium block mb-1.5">{t.newItem.fieldTitle}</label>
            <input type="text" value={form.title} onChange={(e) => handleChange("title", e.target.value)} className="w-full h-11 px-4 rounded-lg border bg-background text-sm" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">{t.newItem.fieldCategory}</label>
              <select value={form.category} onChange={(e) => handleChange("category", e.target.value)} className="w-full h-11 px-4 rounded-lg border bg-background text-sm">
                {mpCategories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">{t.newItem.fieldPrice}</label>
              <input type="number" value={form.price} onChange={(e) => handleChange("price", e.target.value)} className="w-full h-11 px-4 rounded-lg border bg-background text-sm" required min="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">{t.newItem.fieldCondition}</label>
              <select value={form.condition} onChange={(e) => handleChange("condition", e.target.value)} className="w-full h-11 px-4 rounded-lg border bg-background text-sm">
                {conditions.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">{t.newItem.fieldYearsUsed}</label>
              <input type="number" value={form.years_used} onChange={(e) => handleChange("years_used", e.target.value)} className="w-full h-11 px-4 rounded-lg border bg-background text-sm" required min="0" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">{t.newItem.fieldDescription}</label>
            <textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} className="w-full h-28 p-4 rounded-lg border bg-background text-sm resize-none" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">{t.newItem.fieldArea}</label>
              <select value={form.area} onChange={(e) => handleChange("area", e.target.value)} className="w-full h-11 px-4 rounded-lg border bg-background text-sm">
                {areas.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">{t.newItem.fieldDelivery}</label>
              <select value={form.delivery} onChange={(e) => handleChange("delivery", e.target.value)} className="w-full h-11 px-4 rounded-lg border bg-background text-sm">
                {deliveryOptions.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">{t.newItem.fieldImageUrl}</label>
            <input type="text" value={form.image} onChange={(e) => handleChange("image", e.target.value)} placeholder="https://..." className="w-full h-11 px-4 rounded-lg border bg-background text-sm" />
          </div>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} className="rounded border-border accent-primary" />
            {t.newItem.agreeTerms}
          </label>
          <Button type="submit" className="w-full h-12 rounded-xl font-bold text-base" disabled={submitting || !agreed}>
            {submitting ? t.newItem.submitting : t.newItem.submit}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default NewItem;
