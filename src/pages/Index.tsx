"use client";
import Link from "next/link";
import { Search, ArrowRight, ShoppingBag, TrendingUp, Sparkles, Newspaper, Globe, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { SupplierCard } from "@/components/SupplierCard";
import { MarketplaceCard } from "@/components/MarketplaceCard";
import { useFetch } from "@/hooks/useSupabaseData";
import { useTranslation } from "@/contexts/LanguageContext";
import { sortSuppliersByPlan } from "@/lib/plans";
import type { SupplierRow, MarketplaceItemRow, CategoryRow, NewsArticleRow } from "@/types/database";

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
  const { t, lang } = useTranslation();

  const { data: suppliers, loading: suppliersLoading } = useFetch<SupplierRow[]>("/api/suppliers");
  const { data: marketplaceItems } = useFetch<MarketplaceItemRow[]>("/api/marketplace");
  const { data: categories } = useFetch<CategoryRow[]>("/api/categories?type=supplier");
  const { data: newsArticles } = useFetch<NewsArticleRow[]>("/api/news");

  const sortedSuppliers = useMemo(() => sortSuppliersByPlan(suppliers || []), [suppliers]);
  const popularSuppliers = sortedSuppliers.slice(0, 3);
  const recentItems = (marketplaceItems || []).slice(0, 6);
  const latestNews = (newsArticles || []).slice(0, 5);

  const { data: linksData } = useFetch<any[]>("/api/links");
  const featuredLinks = linksData || [];
  const VISIBLE = 3;
  const [linksIndex, setLinksIndex] = useState(0);
  const maxLinksIndex = Math.max(0, featuredLinks.length - VISIBLE);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoTimer = useCallback(() => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    autoTimerRef.current = setInterval(() => {
      setLinksIndex((i) => (i >= maxLinksIndex ? 0 : i + 1));
    }, 2000);
  }, [maxLinksIndex]);

  useEffect(() => {
    startAutoTimer();
    return () => { if (autoTimerRef.current) clearInterval(autoTimerRef.current); };
  }, [startAutoTimer]);

  const goLeft = () => {
    setLinksIndex((i) => Math.max(0, i - 1));
    startAutoTimer();
  };
  const goRight = () => {
    setLinksIndex((i) => Math.min(maxLinksIndex, i + 1));
    startAutoTimer();
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCategory) params.set("category", selectedCategory);
    window.location.href = `/suppliers?${params.toString()}`;
  };

  return (
    <Layout>
      {/* Hero */}
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

      {/* News section */}
      {latestNews.length > 0 && (
        <section className="container py-10 md:py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" />
              {t.news.homeSection}
            </h2>
            <Link href="/news" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1 transition-opacity duration-200">
              {t.news.viewAllNews} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="bg-card rounded-2xl overflow-hidden shadow-sm">
            <div className="max-h-64 overflow-y-auto">
              {latestNews.map((article, index) => {
                const isCurrent = index === 0;
                const d = new Date(article.created_at);
                const dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
                const categoryLabel = (t.news as { categories?: Record<string, string> }).categories?.[article.category] ?? article.category;
                const title = lang === "ja" ? (article.title_ja || article.title) : (article.title || article.title_ja);
                return (
                  <Link
                    key={article.id}
                    href={`/news/${article.slug}`}
                    className={`flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors group ${index % 2 === 1 ? "bg-muted/20" : "bg-transparent"}`}
                  >
                    <span className={`text-sm tabular-nums flex-shrink-0 w-24 ${isCurrent ? "font-bold text-primary" : "font-medium text-muted-foreground"}`}>
                      {dateStr}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-white flex-shrink-0">
                      {categoryLabel}
                    </span>
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors truncate">
                      {title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 3-column feature section: Search by Category · Popular Suppliers · Buy & Sell ── */}
      <section className="bg-[#F8F9FA] py-10 md:py-12">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Card 1: Search by Category */}
            <Link href="/suppliers" className="group block">
              <div className="bg-card border border-border rounded-xl p-6 shadow-card card-hover text-center h-full">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-200">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-base">{t.home.card1Title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{t.home.card1Sub}</p>
              </div>
            </Link>

            {/* Card 2: Popular Suppliers */}
            <Link href="/suppliers" className="group block">
              <div className="bg-card border border-border rounded-xl p-6 shadow-card card-hover text-center h-full">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-200">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-base">{t.home.popularSuppliers}</h3>
                <p className="text-sm text-muted-foreground mt-2">{t.home.card2Sub}</p>
              </div>
            </Link>

            {/* Card 3: Buy & Sell */}
            <Link href="/marketplace" className="group block">
              <div className="bg-card border border-border rounded-xl p-6 shadow-card card-hover text-center h-full">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-200">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-base">{t.home.card3Title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{t.home.card3Sub}</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Suppliers */}
      <section className="container py-10 md:py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> {t.home.popularSuppliers}
          </h2>
          <Link href="/suppliers" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1 transition-opacity duration-200">
            {t.common.viewAll} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {suppliersLoading
            ? Array.from({ length: 3 }).map((_, i) => <SupplierSkeleton key={i} />)
            : popularSuppliers.map((s) => <SupplierCard key={s.id} supplier={s} />)
          }
        </div>
      </section>

      {/* Our Links section — full width, 3 items at a time, auto-advance every 2s */}
      {featuredLinks.length > 0 && (
        <section className="bg-[#F8F9FA] py-10 md:py-12 w-full overflow-hidden">
          <div className="container">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                {t.links.homeSectionTitle}
              </h2>
              <Link href="/links" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1 transition-opacity duration-200">
                {t.common.viewAll} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              {t.links.homeSectionSubtitle}
            </p>
          </div>

          <div className="relative w-full">
            {/* Left arrow */}
            <button
              type="button"
              onClick={goLeft}
              disabled={linksIndex === 0}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 shadow-card border border-border flex items-center justify-center text-foreground hover:bg-white hover:border-primary/40 hover:text-primary transition-all duration-200 disabled:opacity-30 disabled:cursor-default"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {/* Right arrow */}
            <button
              type="button"
              onClick={goRight}
              disabled={linksIndex >= maxLinksIndex}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 shadow-card border border-border flex items-center justify-center text-foreground hover:bg-white hover:border-primary/40 hover:text-primary transition-all duration-200 disabled:opacity-30 disabled:cursor-default"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Viewport — clipped window showing exactly 3 cards */}
            <div className="overflow-hidden px-14 md:px-16">
              {/*
                Track math (gap-free, using padding on card wrappers):
                  track width  = N/3 × 100% of viewport
                  card slot    = 100%/N of track = viewport/3 ✓
                  per-step     = translateX(-100%/N) of track = viewport/3 ✓
              */}
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{
                  width: `${(featuredLinks.length / VISIBLE) * 100}%`,
                  transform: `translateX(${-linksIndex * (100 / featuredLinks.length)}%)`,
                }}
              >
                {featuredLinks.map((link: any) => (
                  <div
                    key={link.id ?? link.url}
                    style={{ width: `${100 / featuredLinks.length}%`, flexShrink: 0, padding: "0 0.5rem" }}
                  >
                    <a
                      href={link.url}
                      target={link.url.startsWith("http") ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className="group relative block w-full aspect-[208/144] rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300"
                    >
                      <img
                        src={link.bg_image || link.bgImage}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10 transition-opacity duration-300 group-hover:from-black/85 group-hover:via-black/45" />
                      <div className="absolute inset-0 p-3.5 flex flex-col justify-between">
                        <div className="self-end">
                          <ExternalLink className="h-3.5 w-3.5 text-white/60 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <h3 className="text-white text-xs font-bold leading-snug line-clamp-2 drop-shadow-sm">
                            {lang === "ja" ? (link.name_ja || link.nameJa || link.name) : link.name}
                          </h3>
                        </div>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Dot indicators */}
            {maxLinksIndex > 0 && (
              <div className="flex justify-center gap-1.5 mt-4">
                {Array.from({ length: maxLinksIndex + 1 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setLinksIndex(i); startAutoTimer(); }}
                    className={`rounded-full transition-all duration-200 ${i === linksIndex ? "w-5 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"}`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Recent Buy & Sell */}
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
