"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MapPin, ArrowLeft, Award, Phone, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
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
  const labels = lang === "ja"
    ? { origin: "原産国", weight: "重量", quantity: "入数", storage: "保存方法", temp: "温度帯" }
    : { origin: "Country of Origin", weight: "Weight", quantity: "Quantity", storage: "Storage Condition", temp: "Temperature" };

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
        <div className="bg-card p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Gallery */}
            {galleryImages.length > 0 && (
              <div className="flex-shrink-0 w-full lg:w-[28rem]">
                {/* Main image */}
                <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
                  <img
                    src={galleryImages[activeImageIndex]}
                    alt={`${displayName} ${activeImageIndex + 1}`}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                  {galleryImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImageIndex((activeImageIndex - 1 + galleryImages.length) % galleryImages.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setActiveImageIndex((activeImageIndex + 1) % galleryImages.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {galleryImages.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImageIndex(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeImageIndex ? "bg-white" : "bg-white/50"}`}
                            aria-label={`Go to image ${i + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {/* Thumbnails */}
                {galleryImages.length > 1 && (
                  <div className="flex gap-2 mt-2">
                    {galleryImages.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIndex(i)}
                        className={`flex-1 rounded-xl overflow-hidden border-2 transition-colors ${i === activeImageIndex ? "border-primary" : "border-transparent"}`}
                        style={{ aspectRatio: "1/1" }}
                        aria-label={`View image ${i + 1}`}
                      >
                        <img src={src} alt={`${displayName} ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
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
                  <button key={p.id} onClick={() => setSelectedProduct(p.id)} className="bg-card border overflow-hidden text-left card-hover">
                    {p.image && <div className="aspect-[4/3] overflow-hidden"><img src={p.image} alt={p.name} className="w-full h-full object-cover" /></div>}
                    <div className="p-4">
                      <p className="text-sm font-semibold">{p.name}</p>
                      {p.country_of_origin && <p className="text-xs text-muted-foreground mt-1">{labels.origin}: {p.country_of_origin}</p>}
                      {p.weight && <p className="text-xs text-muted-foreground">{labels.weight}: {p.weight}</p>}
                      {p.quantity && <p className="text-xs text-muted-foreground">{labels.quantity}: {p.quantity}</p>}
                      {p.storage_condition && <p className="text-xs text-muted-foreground">{labels.storage}: {p.storage_condition}</p>}
                      {p.temperature && <p className="text-xs text-muted-foreground">{labels.temp}: {p.temperature}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {activeTab === "certifications" && (
            <div className="space-y-3 max-w-md">
              {(supplier.certifications || []).map((cert: string) => (
                <div key={cert} className="flex items-center gap-3 p-4 bg-card border">
                  <Award className="h-5 w-5 text-secondary" /><span className="text-sm font-semibold">{cert}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === "contact" && (
            <div className="max-w-md space-y-4">
              <div className="flex items-center gap-3 p-5 bg-card border">
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
              {product.image && <img src={product.image} alt={product.name} className="w-full aspect-video object-cover" />}
              <div className="p-6">
                <h3 className="text-lg font-bold">{product.name}</h3>
                <div className="mt-2 space-y-1">
                  {product.country_of_origin && <p className="text-sm text-muted-foreground">{labels.origin}: <span className="font-medium text-foreground">{product.country_of_origin}</span></p>}
                  {product.weight && <p className="text-sm text-muted-foreground">{labels.weight}: <span className="font-medium text-foreground">{product.weight}</span></p>}
                  {product.quantity && <p className="text-sm text-muted-foreground">{labels.quantity}: <span className="font-medium text-foreground">{product.quantity}</span></p>}
                  {product.storage_condition && <p className="text-sm text-muted-foreground">{labels.storage}: <span className="font-medium text-foreground">{product.storage_condition}</span></p>}
                  {product.temperature && <p className="text-sm text-muted-foreground">{labels.temp}: <span className="font-medium text-foreground">{product.temperature}</span></p>}
                </div>
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
