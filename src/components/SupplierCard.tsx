import Link from "next/link";
import { MapPin, Crown, Star } from "lucide-react";
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
}

function PlanBadge({ plan, lang }: { plan?: string | null; lang: string }) {
  const cfg = getPlanConfig(plan);
  if (cfg.tier === "basic") return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.badgeClass}`}>
      {cfg.tier === "premium" ? <Crown className="h-2.5 w-2.5" /> : <Star className="h-2.5 w-2.5" />}
      {lang === "ja" ? cfg.labelJa : cfg.labelEn}
    </span>
  );
}

export function SupplierCard({ supplier, variant = "grid" }: SupplierCardProps) {
  const { t, lang } = useTranslation();
  const cfg = getPlanConfig(supplier.plan);

  const nameEn = supplier.name || supplier.name_ja || supplier.nameJa || "";
  const nameJa = supplier.name_ja || supplier.nameJa || supplier.name || "";
  const displayName = lang === "ja" ? nameJa : nameEn;
  const contactName = supplier.whatsapp_contact_name?.trim();

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
  const isPremium = supplier.plan === "premium";
  const imageSizeClass = isList ? "w-12 h-12" : cfg.cardImageSize;
  const borderClass = isPremium ? "border-amber-400 shadow-amber-100/50 dark:shadow-amber-900/20" : (cfg.borderClass || "border-border");

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
              <h3 className={`font-medium leading-snug line-clamp-2 ${isList ? "text-sm" : supplier.plan === "premium" ? "text-[16px]" : "text-[15px]"}`}>{displayName}</h3>
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
          <span key={tag} className="tag-badge">{tag}</span>
        ))}
      </div>
      <div className={`flex gap-2 ${isList ? "flex-shrink-0" : ""}`}>
        <Link href={`/suppliers/${supplier.slug}`} className={isList ? "" : "flex-1"}>
          <button className={`rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all duration-200 active:scale-[0.98] ${isList ? "h-8 px-3" : "w-full h-9"}`}>
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
      </div>
    </div>
  );

  return (
    <div className={`group bg-card rounded-xl overflow-hidden shadow-card card-hover border ${borderClass} ${isList ? "flex flex-row items-center" : ""}`}>
      {cardContent}
    </div>
  );
}
