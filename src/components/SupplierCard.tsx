"use client";
import Link from "next/link";
import { MapPin, Crown, Star, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { WhatsAppButton } from "./WhatsAppButton";
import { useTranslation } from "@/contexts/LanguageContext";
import { getPlanConfig } from "@/lib/plans";

interface SupplierCardProps {
  supplier: {
    id: string;
    slug: string;
    name?: string;
    name_ja?: string;
    nameJa?: string;
    logo: string;
    category?: string;
    category_ja?: string;
    categoryJa?: string;
    category_2?: string;
    category_2_ja?: string;
    category_3?: string;
    category_3_ja?: string;
    tags: string[];
    area?: string;
    area_ja?: string;
    areaJa?: string;
    description?: string;
    description_ja?: string;
    descriptionJa?: string;
    whatsapp: string;
    whatsapp_contact_name?: string;
    plan?: string | null;
  };
  variant?: "grid" | "list";
  rank?: number;
}

function PlanBadge({ plan, lang }: { plan?: string | null; lang: string }) {
  const cfg = getPlanConfig(plan);
  if (cfg.tier === "basic") return null;
  const label = (lang === "ja" ? cfg.badgeLabelJa ?? cfg.labelJa : cfg.badgeLabelEn ?? cfg.labelEn);
  return (
    <Link
      href="/plans"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] hover:opacity-80 transition-opacity ${cfg.badgeClass}`}
    >
      {cfg.tier === "premium" ? <Crown className="h-2.5 w-2.5" /> : <Star className="h-2.5 w-2.5" />}
      {label}
    </Link>
  );
}

function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("favorite_suppliers");
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
  }, []);

  const toggle = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      try { localStorage.setItem("favorite_suppliers", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return { favorites, toggle };
}

export function SupplierCard({ supplier, variant = "grid", rank }: SupplierCardProps) {
  const { t, lang } = useTranslation();
  const cfg = getPlanConfig(supplier.plan);
  const { favorites, toggle } = useFavorites();
  const isFav = favorites.includes(supplier.id);

  const nameEn = supplier.name || supplier.name_ja || supplier.nameJa || "";
  const nameJa = supplier.name_ja || supplier.nameJa || supplier.name || "";
  const displayName = lang === "ja" ? nameJa : nameEn;
  const contactName = supplier.whatsapp_contact_name?.trim();

  const tagMap = (t.suppliers as { tagMap?: Record<string, string> }).tagMap ?? {};
  const translateTag = (tag: string) => tagMap[tag] ?? tag;

  const categories = (lang === "ja"
    ? [supplier.category_ja || supplier.categoryJa, supplier.category_2_ja, supplier.category_3_ja]
    : [
        (t.suppliers as { categories?: Record<string, string> }).categories?.[supplier.category ?? ""] ?? supplier.category ?? "",
        (t.suppliers as { categories?: Record<string, string> }).categories?.[supplier.category_2 ?? ""] ?? supplier.category_2 ?? "",
        (t.suppliers as { categories?: Record<string, string> }).categories?.[supplier.category_3 ?? ""] ?? supplier.category_3 ?? "",
      ]
  ).filter(Boolean) as string[];
  const areaLabel =
    lang === "ja"
      ? (supplier.area_ja || supplier.areaJa || "")
      : ((t.suppliers as { areas?: Record<string, string> }).areas?.[supplier.area ?? ""] ?? supplier.area ?? "");
  const description =
    lang === "ja"
      ? (supplier.description_ja || supplier.descriptionJa || "")
      : (supplier.description || supplier.description_ja || "");

  const isList = variant === "list";
  const imageSizeClass = isList ? "w-12 h-12" : cfg.cardImageSize;
  const wrapperClass = `${cfg.borderClass} ${cfg.cardWrapperClass}`;

  const cardContent = (
    <div className={`p-3 ${isList ? "flex flex-row items-center gap-4 w-full" : ""}`}>
      <div className={`flex items-start gap-3 ${isList ? "flex-1 min-w-0 flex-row" : "mb-3"}`}>
        <div className={`rounded-lg overflow-hidden flex-shrink-0 bg-muted ${imageSizeClass}`}>
          <img
            src={supplier.logo}
            alt={displayName}
            className="w-full h-full object-cover transition-transform duration-300 ease-smooth group-hover:scale-105"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1 mb-0.5">
            <Link href={`/suppliers/${supplier.slug}`} className="hover:underline min-w-0">
              <h3 className={`leading-snug line-clamp-2 ${isList ? "text-sm font-medium" : cfg.titleClass}`}>{displayName}</h3>
            </Link>
            <PlanBadge plan={supplier.plan} lang={lang} />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
            <MapPin className="h-3 w-3 flex-shrink-0" /> {areaLabel}
            {contactName && (
              <span className="truncate"> · {t.supplierCard.contactLabel}{contactName}</span>
            )}
          </div>
        </div>
      </div>
      {!isList && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{description}</p>
      )}
      <div className={`flex flex-wrap gap-1.5 ${isList ? "order-last flex-shrink-0" : "mb-4"}`}>
        {categories.slice(0, 3).map((cat) => (
          <span key={cat} className="tag-badge">{cat}</span>
        ))}
        {!isList && supplier.tags?.slice(0, 2).map((tag) => (
          <span key={tag} className="tag-badge">{translateTag(tag)}</span>
        ))}
      </div>
      <div className={`flex gap-2 ${isList ? "flex-shrink-0" : ""}`}>
        <Link href={`/suppliers/${supplier.slug}`} className={isList ? "" : "flex-1"}>
          <button className={`rounded-xl border transition-all duration-200 active:scale-[0.98] ${isList ? "h-8 px-3" : "w-full"} ${cfg.ctaClass}`}>
            {t.supplierCard.viewDetail}
          </button>
        </Link>
        {cfg.showWhatsApp && (
          <WhatsAppButton
            phone={supplier.whatsapp}
            message={lang === "ja" ? `${displayName}${t.supplierCard.inquire}` : `I'd like to inquire about ${displayName}.`}
            size="sm"
          />
        )}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); toggle(supplier.id); }}
          title={isFav ? (lang === "ja" ? "お気に入りから削除" : "Remove from favorites") : (lang === "ja" ? "お気に入りに追加" : "Add to favorites")}
          className={`h-9 w-9 flex items-center justify-center rounded-xl border transition-colors flex-shrink-0 ${
            isFav ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100" : "border-border text-muted-foreground hover:text-red-400 hover:border-red-200"
          }`}
        >
          <Heart className={`h-4 w-4 ${isFav ? "fill-red-500" : ""}`} />
        </button>
      </div>
    </div>
  );

  return (
    <div className={`group bg-card rounded-xl overflow-hidden shadow-card card-hover border relative ${wrapperClass} ${isList ? "flex flex-row items-center" : ""}`}>
      {cfg.tier === "premium" && !isList && (
        <div className="h-1.5 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500" />
      )}
      {cfg.featuredLabelEn && !isList && (
        <Link
          href="/plans"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold shadow-sm z-10 transition-colors"
        >
          {lang === "ja" ? cfg.featuredLabelJa : cfg.featuredLabelEn}
        </Link>
      )}
      {rank != null && (
        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-sm z-10">
          {rank}
        </div>
      )}
      {cardContent}
    </div>
  );
}
