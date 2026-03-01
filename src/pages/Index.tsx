"use client";
import Link from "next/link";
import { Search, ArrowRight, Store, ShoppingBag, TrendingUp, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { SupplierCard } from "@/components/SupplierCard";
import { MarketplaceCard } from "@/components/MarketplaceCard";
import { useFetch } from "@/hooks/useSupabaseData";
import { useTranslation } from "@/contexts/LanguageContext";
import { sortSuppliersByPlan } from "@/lib/plans";
import type { SupplierRow, MarketplaceItemRow, CategoryRow } from "@/types/database";

function SupplierSkeleton() {
  return (
    <div className="bg-card border rounded-2xl p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-14 h-14 rounded-xl bg-muted flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-1.5 mb-3">
        <div className="h-2.5 bg-muted rounded w-full" />
        <div className="h-2.5 bg-muted rounded w-4/5" />
      </div>
      <div className="flex gap-1.5 mb-4">
        <div className="h-5 bg-muted rounded-full w-16" />
        <div className="h-5 bg-muted rounded-full w-12" />
      </div>
      <div className="h-9 bg-muted rounded-xl" />
    </div>
  );
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { t } = useTranslation();

  const { data: suppliers, loading: suppliersLoading } = useFetch<SupplierRow[]>("/api/suppliers");
  const { data: marketplaceItems } = useFetch<MarketplaceItemRow[]>("/api/marketplace");
  const { data: categories } = useFetch<CategoryRow[]>("/api/categories?type=supplier");

  // Sort by plan tier (premium → standard → basic) then shuffle within each
  // tier using a daily seed so every supplier in a tier gets fair rotation.
  const sortedSuppliers = useMemo(() => sortSuppliersByPlan(suppliers || []), [suppliers]);
  const popularSuppliers = sortedSuppliers.slice(0, 4);
  const recentItems = (marketplaceItems || []).slice(0, 6);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCategory) params.set("category", selectedCategory);
    window.location.href = `/suppliers?${params.toString()}`;
  };

  return (
    <Layout>
      <section className="relative min-h-[560px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/hero-bg.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/30" />
        </div>
        <div className="container relative z-10 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary-foreground text-xs font-medium mb-6 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5" />
              {t.home.badge}
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-primary-foreground leading-[1.1] tracking-tight animate-fade-in">
              {t.home.heroTitle1}<br />
              <span className="text-secondary">{t.home.heroTitle2}</span><br />
              {t.home.heroTitle3}
            </h1>
            <p className="mt-5 text-primary-foreground/80 text-base md:text-lg animate-fade-in max-w-lg" style={{ animationDelay: "0.1s" }}>
              {t.home.heroSub}
            </p>
            <div className="mt-8 bg-background/95 backdrop-blur-md rounded-2xl p-5 shadow-2xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-12 px-4 rounded-xl border bg-background text-sm sm:w-48"
                >
                  <option value="">{t.home.categoryPlaceholder}</option>
                  {(categories || []).map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t.home.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <Button onClick={handleSearch} className="h-12 px-6 rounded-xl font-bold">
                  {t.common.search}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Link href="/suppliers" className="group">
            <div className="bg-card border rounded-2xl p-6 card-hover text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold">{t.home.card1Title}</h3>
              <p className="text-xs text-muted-foreground mt-1.5">{t.home.card1Sub}</p>
            </div>
          </Link>
          <Link href="/suppliers" className="group">
            <div className="bg-card border rounded-2xl p-6 card-hover text-center">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                <Store className="h-5 w-5 text-secondary" />
              </div>
              <h3 className="font-bold">{t.home.card2Title}</h3>
              <p className="text-xs text-muted-foreground mt-1.5">{t.home.card2Sub}</p>
            </div>
          </Link>
          <Link href="/marketplace" className="group">
            <div className="bg-card border rounded-2xl p-6 card-hover text-center">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                <ShoppingBag className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-bold">{t.home.card3Title}</h3>
              <p className="text-xs text-muted-foreground mt-1.5">{t.home.card3Sub}</p>
            </div>
          </Link>
        </div>
      </section>

      <section className="container pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> {t.home.popularSuppliers}
          </h2>
          <Link href="/suppliers" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
            {t.common.viewAll} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {suppliersLoading
            ? Array.from({ length: 4 }).map((_, i) => <SupplierSkeleton key={i} />)
            : popularSuppliers.map((s) => <SupplierCard key={s.id} supplier={s} />)
          }
        </div>
      </section>

      <section className="container pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-accent" /> {t.home.recentMarketplace}
          </h2>
          <Link href="/marketplace" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
            {t.common.viewAll} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {recentItems.map((item) => <MarketplaceCard key={item.id} item={item} />)}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
