import SupplierDetail from "@/pages/SupplierDetail";

export default function SupplierDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <SupplierDetail />;
}
