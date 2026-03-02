"use client";
import Link from "next/link";
import { Search, ArrowRight, ShoppingBag, TrendingUp, Sparkles } from "lucide-react";
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
      <section className="relative min-h-[480px] md:min-h-[520px] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0">
          <img src="/hero-bg.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25" />
        </div>
        <div className="container relative z-10 py-16 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium mb-6 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5" />
              {t.home.badge}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-[1.15] tracking-tight animate-fade-in">
              {t.home.heroTitle1}<br />
              <span className="text-primary">{t.home.heroTitle2}</span><br />
              {t.home.heroTitle3}
            </h1>
            <p className="mt-4 text-white/85 text-base md:text-lg animate-fade-in max-w-lg" style={{ animationDelay: "0.1s" }}>
              {t.home.heroSub}
            </p>
            <div className="mt-8 bg-white rounded-2xl p-4 md:p-5 shadow-card-hover animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-12 px-4 rounded-xl border border-border bg-white text-sm font-medium text-foreground sm:w-48 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                >
                  <option value="">{t.home.categoryPlaceholder}</option>
                  {(categories || []).map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {(t.suppliers as { categories?: Record<string, string> }).categories?.[cat.value] ?? cat.label}
                    </option>
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
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  />
                </div>
                <Button onClick={handleSearch} className="h-12 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 active:scale-[0.97]">
                  {t.common.search}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category chips — horizontal scroll */}
      {categories && categories.length > 0 && (
        <section className="border-b border-border bg-white overflow-hidden">
          <div className="container py-3">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              <Link
                href="/suppliers"
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              >
                {t.common.all}
              </Link>
              {(categories || []).map((cat) => (
                <Link
                  key={cat.value}
                  href={`/suppliers?category=${encodeURIComponent(cat.value)}`}
                  className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                >
                  {(t.suppliers as { categories?: Record<string, string> }).categories?.[cat.value] ?? cat.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ① 人気サプライヤー first */}
      <section className="bg-[#F8F9FA] py-10 md:py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> {t.home.popularSuppliers}
            </h2>
            <Link href="/suppliers" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1 transition-opacity duration-200">
              {t.common.viewAll} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {suppliersLoading
              ? Array.from({ length: 4 }).map((_, i) => <SupplierSkeleton key={i} />)
              : popularSuppliers.map((s) => <SupplierCard key={s.id} supplier={s} />)
            }
          </div>
        </div>
      </section>

      {/* ② カテゴリーで探す・シェフマーケット — two cards only */}
      <section className="container py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link href="/suppliers" className="group block">
            <div className="bg-card border border-border rounded-xl p-6 shadow-card card-hover text-center h-full">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-200">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{t.home.card1Title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5">{t.home.card1Sub}</p>
            </div>
          </Link>
          <Link href="/marketplace" className="group block">
            <div className="bg-card border border-border rounded-xl p-6 shadow-card card-hover text-center h-full">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-200">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{t.home.card3Title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5">{t.home.card3Sub}</p>
            </div>
          </Link>
        </div>
      </section>

      <section className="container py-10 md:py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" /> {t.home.recentMarketplace}
          </h2>
          <Link href="/marketplace" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1 transition-opacity duration-200">
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
