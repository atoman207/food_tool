import { Suspense } from "react";
import Suppliers from "@/pages/Suppliers";

export default function SuppliersPage() {
  return (
    <Suspense fallback={<div className="container py-16 text-center text-muted-foreground">読み込み中...</div>}>
      <Suppliers />
    </Suspense>
  );
}
