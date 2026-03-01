import MarketplaceItemPage from "@/pages/MarketplaceItem";

export default function MarketplaceItemRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <MarketplaceItemPage />;
}
