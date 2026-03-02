"use client";
import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, LayoutGrid, List } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Layout from "@/components/Layout";
import { SupplierCard } from "@/components/SupplierCard";
import { useFetch } from "@/hooks/useSupabaseData";
import { useTranslation } from "@/contexts/LanguageContext";
import { sortSuppliersByPlan } from "@/lib/plans";
import type { SupplierRow, CategoryRow } from "@/types/database";

const Suppliers = () => {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams?.get("q") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams?.get("category") ? [searchParams.get("category")!] : []
  );
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [tagFilters, setTagFilters] = useState({ smallLot: false, japanese: false, halal: false });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { t } = useTranslation();

  const { data: suppliers } = useFetch<SupplierRow[]>("/api/suppliers");
  const { data: categories } = useFetch<CategoryRow[]>("/api/categories?type=supplier");

  const areas = [
    { value: "central", label: t.suppliers.areas.central },
    { value: "east",    label: t.suppliers.areas.east },
    { value: "west",    label: t.suppliers.areas.west },
    { value: "north",   label: t.suppliers.areas.north },
    { value: "south",   label: t.suppliers.areas.south },
  ];

  const toggleCategory = (val: string) =>
    setSelectedCategories((prev) => prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]);
  const toggleArea = (val: string) =>
    setSelectedAreas((prev) => prev.includes(val) ? prev.filter((a) => a !== val) : [...prev, val]);

  const supplierCategories = (s: SupplierRow) => [s.category, s.category_2, s.category_3].filter(Boolean);
  const filtered = useMemo(() => {
    const base = (suppliers || []).filter((s) => {
      if (query) {
        const q = query.toLowerCase();
        const matchName = s.name_ja?.includes(query) || s.name?.toLowerCase().includes(q);
        const matchDesc = s.description_ja?.includes(query) || s.description?.toLowerCase().includes(q);
        const matchCat = [s.category_ja, s.category_2_ja, s.category_3_ja, s.category, s.category_2, s.category_3].some((c) => c && (String(c).includes(query) || String(c).toLowerCase().includes(q)));
        if (!matchName && !matchDesc && !matchCat) return false;
      }
      if (selectedCategories.length && !selectedCategories.some((c) => supplierCategories(s).includes(c))) return false;
      if (selectedAreas.length && !selectedAreas.includes(s.area)) return false;
      if (tagFilters.smallLot && !s.tags.includes("少量対応")) return false;
      if (tagFilters.japanese && !s.tags.includes("日本語対応")) return false;
      if (tagFilters.halal && !s.tags.includes("ハラール")) return false;
      return true;
    });
    // Sort by plan tier, shuffle within each tier with a daily seed
    return sortSuppliersByPlan(base);
  }, [suppliers, query, selectedCategories, selectedAreas, tagFilters]);

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-sm mb-3">{t.suppliers.category}</h3>
        <div className="space-y-2.5">
          {(categories || []).map((cat) => (
            <label key={cat.value} className="flex items-center gap-2.5 text-sm cursor-pointer hover:text-foreground transition-colors">
              <input type="checkbox" checked={selectedCategories.includes(cat.value)} onChange={() => toggleCategory(cat.value)} className="rounded border-border accent-primary" />
              {(t.suppliers as { categories?: Record<string, string> }).categories?.[cat.value] ?? cat.label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-bold text-sm mb-3">{t.suppliers.area}</h3>
        <div className="space-y-2.5">
          {areas.map((area) => (
            <label key={area.value} className="flex items-center gap-2.5 text-sm cursor-pointer hover:text-foreground transition-colors">
              <input type="checkbox" checked={selectedAreas.includes(area.value)} onChange={() => toggleArea(area.value)} className="rounded border-border accent-primary" />
              {area.label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-bold text-sm mb-3">{t.suppliers.tags}</h3>
        <div className="space-y-2.5">
          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <input type="checkbox" checked={tagFilters.smallLot} onChange={() => setTagFilters((p) => ({ ...p, smallLot: !p.smallLot }))} className="rounded border-border accent-primary" />
            {t.suppliers.smallLot}
          </label>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <input type="checkbox" checked={tagFilters.japanese} onChange={() => setTagFilters((p) => ({ ...p, japanese: !p.japanese }))} className="rounded border-border accent-primary" />
            {t.suppliers.japanese}
          </label>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <input type="checkbox" checked={tagFilters.halal} onChange={() => setTagFilters((p) => ({ ...p, halal: !p.halal }))} className="rounded border-border accent-primary" />
            {t.suppliers.halal}
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight">{t.suppliers.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.suppliers.subtitle}</p>
        </div>
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder={t.suppliers.searchPlaceholder} value={query} onChange={(e) => setQuery(e.target.value)} className="w-full h-12 pl-10 pr-4 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="md:hidden h-12 px-4 rounded-xl border bg-background flex items-center gap-2 text-sm font-medium">
            <SlidersHorizontal className="h-4 w-4" />
            {t.common.filter}
          </button>
        </div>
        <div className="flex gap-8">
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="sticky top-24 bg-card border rounded-2xl p-5">
              <FilterPanel />
            </div>
          </aside>
          {showFilters && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-background p-6 overflow-y-auto shadow-2xl animate-slide-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-lg">{t.common.filters}</h2>
                  <button onClick={() => setShowFilters(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
                </div>
                <FilterPanel />
              </div>
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between gap-4 mb-4">
              <p className="text-sm text-muted-foreground font-medium">{t.suppliers.resultCount(filtered.length)}</p>
              <div className="flex border border-border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`}
                  title={t.suppliers.viewGrid}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`}
                  title={t.suppliers.viewList}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className={viewMode === "list" ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"}>
              {filtered.map((s) => <SupplierCard key={s.id} supplier={s} variant={viewMode} />)}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg font-medium">{t.suppliers.noResults}</p>
                <p className="text-sm mt-2">{t.suppliers.noResultsSub}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Suppliers;
