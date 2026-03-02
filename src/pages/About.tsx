"use client";
import Link from "next/link";
import { Search, ShoppingBag, Newspaper, Globe, ArrowRight, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/LanguageContext";

const features = [
  {
    icon: Search,
    titleKey: "feature1Title" as const,
    descKey: "feature1Desc" as const,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&h=450&fit=crop",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    icon: ShoppingBag,
    titleKey: "feature2Title" as const,
    descKey: "feature2Desc" as const,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&h=450&fit=crop",
    color: "bg-green-50",
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
  },
  {
    icon: Newspaper,
    titleKey: "feature3Title" as const,
    descKey: "feature3Desc" as const,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&h=450&fit=crop",
    color: "bg-amber-50",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100",
  },
  {
    icon: Globe,
    titleKey: "feature4Title" as const,
    descKey: "feature4Desc" as const,
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=700&h=450&fit=crop",
    color: "bg-purple-50",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
  },
];

const stats = [
  { value: "500+", labelKey: "stat1" as const },
  { value: "1,200+", labelKey: "stat2" as const },
  { value: "12", labelKey: "stat3" as const },
  { value: "2", labelKey: "stat4" as const },
];

const About = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      {/* Hero section */}
      <section className="relative min-h-[400px] flex items-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">{t.about.pageSubtitle}</p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              {t.about.heroTitle}
            </h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-lg leading-relaxed">
              {t.about.heroSub}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link href="/suppliers">
                <Button className="h-12 px-6 rounded-xl font-bold gap-2">
                  {t.about.ctaButton} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="h-12 px-6 rounded-xl font-bold">
                  {t.about.ctaButton2}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border bg-white">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.labelKey} className="text-center">
                <p className="text-3xl md:text-4xl font-black text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1 font-medium">{t.about[stat.labelKey]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features alternating layout */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-black">{t.about.pageTitle}</h2>
          </div>

          <div className="space-y-16 md:space-y-24">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              const isEven = idx % 2 === 0;
              return (
                <div key={feature.titleKey} className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center ${!isEven ? "md:[&>*:first-child]:order-2" : ""}`}>
                  {/* Text side */}
                  <div className="space-y-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${feature.color} ${feature.iconColor}`}>
                      <div className={`w-6 h-6 rounded-full ${feature.iconBg} flex items-center justify-center`}>
                        <Icon className={`h-3.5 w-3.5 ${feature.iconColor}`} />
                      </div>
                      0{idx + 1}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black">{t.about[feature.titleKey]}</h3>
                    <p className="text-muted-foreground leading-relaxed">{t.about[feature.descKey]}</p>
                    <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                      <CheckCircle className="h-4 w-4" />
                      <span>{idx === 0 ? (t.common.viewAll + " →") : ""}</span>
                    </div>
                  </div>
                  {/* Image side */}
                  <div className={`rounded-2xl overflow-hidden shadow-lg ${feature.color}`}>
                    <img
                      src={feature.image}
                      alt={t.about[feature.titleKey]}
                      className="w-full h-64 md:h-80 object-cover"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-primary py-16 md:py-20">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">{t.about.ctaTitle}</h2>
          <p className="text-white/80 mb-8 text-lg">{t.about.ctaSub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/suppliers">
              <Button className="h-12 px-8 rounded-xl font-bold bg-white text-primary hover:bg-white/90 gap-2">
                {t.about.ctaButton} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="h-12 px-8 rounded-xl font-bold border-2 border-white bg-transparent text-white hover:bg-white/10 hover:text-white">
                {t.about.ctaButton2}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
