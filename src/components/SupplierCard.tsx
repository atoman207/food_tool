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
    category_ja?: string;
    categoryJa?: string;
    tags: string[];
    area_ja?: string;
    areaJa?: string;
    description_ja?: string;
    descriptionJa?: string;
    whatsapp: string;
    plan?: string | null;
  };
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

export function SupplierCard({ supplier }: SupplierCardProps) {
  const { t, lang } = useTranslation();
  const cfg = getPlanConfig(supplier.plan);

  const nameEn = supplier.name || supplier.name_ja || supplier.nameJa || "";
  const nameJa = supplier.name_ja || supplier.nameJa || supplier.name || "";
  const displayName = lang === "ja" ? nameJa : nameEn;

  const categoryJa = supplier.category_ja || supplier.categoryJa || "";
  const areaJa = supplier.area_ja || supplier.areaJa || "";
  const descJa = supplier.description_ja || supplier.descriptionJa || "";

  return (
    <div className={`bg-card border-2 rounded-2xl overflow-hidden card-hover ${cfg.borderClass || "border-border"}`}>
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <img
            src={supplier.logo}
            alt={displayName}
            className="w-14 h-14 rounded-xl object-cover border flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-1 mb-0.5">
              <Link href={`/suppliers/${supplier.slug}`} className="hover:underline min-w-0">
                <h3 className="font-bold text-sm line-clamp-1">{displayName}</h3>
              </Link>
              <PlanBadge plan={supplier.plan} lang={lang} />
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 flex-shrink-0" /> {areaJa}
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{descJa}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="tag-badge">{categoryJa}</span>
          {supplier.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="tag-badge">{tag}</span>
          ))}
        </div>
        <div className="flex gap-2">
          <Link href={`/suppliers/${supplier.slug}`} className="flex-1">
            <button className="w-full h-9 rounded-xl border text-xs font-semibold hover:bg-muted transition-colors">
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
    </div>
  );
}
