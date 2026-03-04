import Link from "next/link";
import { useTranslation } from "@/contexts/LanguageContext";

interface MarketplaceCardProps {
  item: {
    slug: string;
    image: string;
    title: string;
    title_en?: string;
    price: number;
    area: string;
    area_en?: string;
    condition: string;
    condition_en?: string;
  };
}

export function MarketplaceCard({ item }: MarketplaceCardProps) {
  const { t, lang } = useTranslation();
  const mkt = t.marketplace as {
    areaDisplay?: Record<string, string>;
    conditionDisplay?: Record<string, string>;
  };

  const displayTitle = lang === "en" && item.title_en ? item.title_en : item.title;
  const displayArea = lang === "en"
    ? (item.area_en?.trim() || mkt.areaDisplay?.[item.area] || item.area)
    : (mkt.areaDisplay?.[item.area] ?? item.area);
  const displayCondition = lang === "en"
    ? (item.condition_en?.trim() || mkt.conditionDisplay?.[item.condition] || item.condition)
    : (mkt.conditionDisplay?.[item.condition] ?? item.condition);

  return (
    <Link href={`/marketplace/${item.slug}`} className="group block">
      <div className="bg-card rounded-xl overflow-hidden shadow-card card-hover border border-border">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={item.image}
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-300 ease-smooth group-hover:scale-105"
          />
        </div>
        <div className="p-3">
          <p className="font-bold text-sm sm:text-base text-primary">S${item.price.toLocaleString()}</p>
          <p className="text-xs sm:text-[15px] font-medium text-foreground line-clamp-2 mt-1 leading-snug">{displayTitle}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] sm:text-xs text-muted-foreground">{displayArea}</span>
            <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{displayCondition}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
