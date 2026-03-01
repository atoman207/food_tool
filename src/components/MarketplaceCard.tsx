import Link from "next/link";

interface MarketplaceCardProps {
  item: {
    slug: string;
    image: string;
    title: string;
    price: number;
    area: string;
    condition: string;
  };
}

export function MarketplaceCard({ item }: MarketplaceCardProps) {
  return (
    <Link href={`/marketplace/${item.slug}`} className="group block">
      <div className="bg-card rounded-xl overflow-hidden shadow-card card-hover border border-border">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 ease-smooth group-hover:scale-105"
          />
        </div>
        <div className="p-3">
          <p className="font-bold text-base text-primary">S${item.price.toLocaleString()}</p>
          <p className="text-[15px] font-medium text-foreground line-clamp-2 mt-1 leading-snug">{item.title}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">{item.area}</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{item.condition}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
