"use client";
import Link from "next/link";
import { Search, ArrowRight, ShoppingBag, TrendingUp, Sparkles, Newspaper, Calendar, Globe, ExternalLink } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { SupplierCard } from "@/components/SupplierCard";
import { MarketplaceCard } from "@/components/MarketplaceCard";
import { useFetch } from "@/hooks/useSupabaseData";
import { useTranslation } from "@/contexts/LanguageContext";
import { sortSuppliersByPlan } from "@/lib/plans";
import type { SupplierRow, MarketplaceItemRow, CategoryRow, NewsArticleRow } from "@/types/database";
import { LINKS_DATA } from "@/pages/Links";

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
  const featuredLinks = LINKS_DATA.flatMap((g) => g.items).slice(0, 6);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {latestNews.map((article) => (
              <Link key={article.id} href={`/news/${article.slug}`} className="group">
                <div className="bg-card border border-border rounded-2xl overflow-hidden card-hover h-full flex flex-col">
                  <div className="aspect-[16/9] overflow-hidden flex-shrink-0">
                    <img
                      src={article.image || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=225&fit=crop"}
                      alt={lang === "ja" ? (article.title_ja || article.title) : article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="tag-badge text-[10px]">
                        {(t.news as { categories?: Record<string, string> }).categories?.[article.category] ?? article.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Calendar className="h-2.5 w-2.5" />
                        {new Date(article.created_at).toLocaleDateString(lang === "ja" ? "ja-JP" : "en-SG")}
                      </span>
                    </div>
                    <h3 className="font-semibold text-xs leading-snug line-clamp-3 group-hover:text-primary transition-colors flex-1">
                      {lang === "ja" ? (article.title_ja || article.title) : (article.title || article.title_ja)}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
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

      {/* Our Links section */}
      <section className="bg-[#F8F9FA] py-10 md:py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              {t.links.homeSectionTitle}
            </h2>
            <Link href="/links" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1 transition-opacity duration-200">
              {t.common.viewAll} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mb-6 -mt-3">
            {t.links.homeSectionSubtitle}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {featuredLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target={link.url.startsWith("http") ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="group bg-card border border-border rounded-2xl p-4 card-hover flex flex-col items-center text-center gap-2 hover:border-primary/40 transition-colors"
              >
                <span className="text-2xl">{link.icon}</span>
                <h3 className="text-xs font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {lang === "ja" ? link.nameJa : link.name}
                </h3>
                <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </section>

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
