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
    <Link href={`/marketplace/${item.slug}`} className="group">
      <div className="bg-card border rounded-2xl overflow-hidden card-hover">
        <div className="aspect-square overflow-hidden">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="p-3.5">
          <p className="font-black text-base text-primary">S${item.price.toLocaleString()}</p>
          <p className="text-xs font-medium line-clamp-2 mt-1">{item.title}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-muted-foreground">{item.area}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{item.condition}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
