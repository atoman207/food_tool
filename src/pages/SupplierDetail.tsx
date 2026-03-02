"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MapPin, ArrowLeft, Award, Phone } from "lucide-react";
import { useState } from "react";
import Layout from "@/components/Layout";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useFetch } from "@/hooks/useSupabaseData";
import { useTranslation } from "@/contexts/LanguageContext";

const SupplierDetail = () => {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const { data: supplier, loading } = useFetch<any>(`/api/suppliers/${slug}`, [slug]);
  const [activeTab, setActiveTab] = useState("about");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const { t, lang } = useTranslation();

  const tabs = [
    { id: "about",          label: t.supplierDetail.tabAbout },
    { id: "products",       label: t.supplierDetail.tabProducts },
    { id: "certifications", label: t.supplierDetail.tabCertifications },
    { id: "contact",        label: t.supplierDetail.tabContact },
  ];

  const displayName = lang === "ja" ? (supplier?.name_ja || supplier?.name) : (supplier?.name || supplier?.name_ja);
  const catLabels = (t.suppliers as { categories?: Record<string, string> }).categories;
  const displayCategories = [
    lang === "ja" ? (supplier?.category_ja || supplier?.category) : (catLabels?.[supplier?.category ?? ""] ?? supplier?.category ?? ""),
    lang === "ja" ? (supplier?.category_2_ja || supplier?.category_2) : (catLabels?.[supplier?.category_2 ?? ""] ?? supplier?.category_2 ?? ""),
    lang === "ja" ? (supplier?.category_3_ja || supplier?.category_3) : (catLabels?.[supplier?.category_3 ?? ""] ?? supplier?.category_3 ?? ""),
  ].filter(Boolean) as string[];
  const displayArea = lang === "ja" ? (supplier?.area_ja || supplier?.area) : (supplier?.area || supplier?.area_ja);
  const tagMap = (t.suppliers as { tagMap?: Record<string, string> }).tagMap ?? {};
  const translateTag = (tag: string) => tagMap[tag] ?? tag;
  const galleryImages = [supplier?.logo, supplier?.image_2, supplier?.image_3].filter(Boolean) as string[];
  const catalogUrl = supplier?.catalog_url?.trim();
  const contactName = supplier?.whatsapp_contact_name?.trim();
  const contactMsg = lang === "ja"
    ? `${displayName}について問い合わせです。`
    : `I'd like to inquire about ${displayName}.`;
  const moqLabel = lang === "ja" ? "最小注文: " : "MOQ: ";
  const moqDetailLabel = lang === "ja" ? "最小注文数量: " : "Minimum order: ";

  if (loading) {
    return <Layout><div className="container py-16 text-center text-muted-foreground">{t.common.loading}</div></Layout>;
  }

  if (!supplier || supplier.error) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">{t.supplierDetail.notFound}</p>
          <Link href="/suppliers" className="text-primary hover:underline mt-4 inline-block">{t.supplierDetail.backToList}</Link>
        </div>
      </Layout>
    );
  }

  const products = supplier.products || [];
  const product = products.find((p: any) => p.id === selectedProduct);

  return (
    <Layout>
      <div className="container py-6">
        <Link href="/suppliers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 font-medium">
          <ArrowLeft className="h-4 w-4" /> {t.supplierDetail.backToList}
        </Link>
        <div className="bg-card border rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex gap-3 flex-shrink-0">
              {galleryImages.slice(0, 3).map((src, i) => (
                <img key={i} src={src} alt={`${displayName} ${i + 1}`} className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border shadow-sm" />
              ))}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-black tracking-tight">{displayName}</h1>
              <p className="text-sm text-muted-foreground mt-1">{lang === "ja" ? supplier.name : supplier.name_ja}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {displayCategories.map((cat) => (
                  <span key={cat} className="tag-badge">{cat}</span>
                ))}
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {displayArea}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(supplier.tags || []).map((tag: string) => <span key={tag} className="tag-badge">{translateTag(tag)}</span>)}
              </div>
              {contactName && <p className="text-xs text-muted-foreground mt-1">{t.supplierDetail.contactLabel}{contactName}</p>}
            </div>
            <div className="hidden sm:block">
              <WhatsAppButton phone={supplier.whatsapp} message={contactMsg} size="lg" />
            </div>
          </div>
        </div>

        <div className="mt-8 border-b">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="py-8">
          {activeTab === "about" && (
            <div className="max-w-2xl">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {lang === "ja" ? (supplier.about_ja || supplier.about) : (supplier.about || supplier.about_ja)}
              </p>
            </div>
          )}
          {activeTab === "products" && (
            <div className="space-y-6">
              {catalogUrl && (
                <div className="p-4 bg-muted/50 rounded-2xl border">
                  <a href={catalogUrl} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline inline-flex items-center gap-2">
                    {t.supplierDetail.catalogLink} ↗
                  </a>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {products.map((p: any) => (
                  <button key={p.id} onClick={() => setSelectedProduct(p.id)} className="bg-card border rounded-2xl overflow-hidden text-left card-hover">
                    <div className="aspect-[4/3] overflow-hidden"><img src={p.image} alt={p.name} className="w-full h-full object-cover" /></div>
                    <div className="p-4">
                      <p className="text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{moqLabel}{p.moq}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {activeTab === "certifications" && (
            <div className="space-y-3 max-w-md">
              {(supplier.certifications || []).map((cert: string) => (
                <div key={cert} className="flex items-center gap-3 p-4 bg-card border rounded-2xl">
                  <Award className="h-5 w-5 text-secondary" /><span className="text-sm font-semibold">{cert}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === "contact" && (
            <div className="max-w-md space-y-4">
              <div className="flex items-center gap-3 p-5 bg-card border rounded-2xl">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  {contactName && <p className="text-xs text-muted-foreground">{t.supplierDetail.contactLabel}</p>}
                  {contactName && <p className="text-sm font-semibold">{contactName}</p>}
                  <p className="text-xs text-muted-foreground mt-1">WhatsApp</p>
                  <p className="text-sm font-semibold">+{supplier.whatsapp}</p>
                </div>
              </div>
              <WhatsAppButton phone={supplier.whatsapp} message={contactMsg} fullWidth size="lg" />
            </div>
          )}
        </div>

        {selectedProduct && product && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
            <div className="relative bg-background rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-fade-in">
              <img src={product.image} alt={product.name} className="w-full aspect-video object-cover" />
              <div className="p-6">
                <h3 className="text-lg font-bold">{product.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{moqDetailLabel}{product.moq}</p>
                <div className="mt-5">
                  <WhatsAppButton phone={supplier.whatsapp} message={lang === "ja" ? `${product.name}について問い合わせです。` : `I'd like to inquire about ${product.name}.`} fullWidth />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t sm:hidden z-40">
        <WhatsAppButton phone={supplier.whatsapp} message={contactMsg} fullWidth size="lg" />
      </div>
    </Layout>
  );
};

export default SupplierDetail;
