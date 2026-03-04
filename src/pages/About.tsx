"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Newspaper, Globe, ArrowRight, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/LanguageContext";

type AboutSiteContent = {
  hero_title_en?: string;
  hero_title_ja?: string;
  hero_sub_en?: string;
  hero_sub_ja?: string;
  hero_image?: string;
  intro_text_en?: string;
  intro_text_ja?: string;
  feature_image_1?: string;
  feature_image_2?: string;
  feature_image_3?: string;
  feature_image_4?: string;
};

const DEFAULT_FEATURE_IMAGES = [
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&h=450&fit=crop",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&h=450&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&h=450&fit=crop",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=700&h=450&fit=crop",
];

const features = [
  {
    icon: Search,
    titleKey: "feature1Title" as const,
    descKey: "feature1Desc" as const,
    defaultImage: DEFAULT_FEATURE_IMAGES[0],
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    icon: ShoppingBag,
    titleKey: "feature2Title" as const,
    descKey: "feature2Desc" as const,
    defaultImage: DEFAULT_FEATURE_IMAGES[1],
    color: "bg-green-50",
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
  },
  {
    icon: Newspaper,
    titleKey: "feature3Title" as const,
    descKey: "feature3Desc" as const,
    defaultImage: DEFAULT_FEATURE_IMAGES[2],
    color: "bg-amber-50",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100",
  },
  {
    icon: Globe,
    titleKey: "feature4Title" as const,
    descKey: "feature4Desc" as const,
    defaultImage: DEFAULT_FEATURE_IMAGES[3],
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
  const { t, lang } = useTranslation();
  const [content, setContent] = useState<AboutSiteContent | null>(null);

  useEffect(() => {
    fetch("/api/settings?key=about_site")
      .then((r) => r.json())
      .then((d) => {
        if (d?.value) {
          try {
            const parsed = typeof d.value === "string" ? JSON.parse(d.value) : d.value;
            setContent(parsed);
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const heroTitle = lang === "ja" ? (content?.hero_title_ja || t.about.heroTitle) : (content?.hero_title_en || t.about.heroTitle);
  const heroSub = lang === "ja" ? (content?.hero_sub_ja || t.about.heroSub) : (content?.hero_sub_en || t.about.heroSub);
  const introText = lang === "ja" ? content?.intro_text_ja : content?.intro_text_en;
  const featureImages = [
    content?.feature_image_1 ?? DEFAULT_FEATURE_IMAGES[0],
    content?.feature_image_2 ?? DEFAULT_FEATURE_IMAGES[1],
    content?.feature_image_3 ?? DEFAULT_FEATURE_IMAGES[2],
    content?.feature_image_4 ?? DEFAULT_FEATURE_IMAGES[3],
  ];

  return (
    <Layout>
      {/* Hero section */}
      <section
        className="relative min-h-[400px] flex items-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10"
        style={content?.hero_image ? { backgroundImage: `url(${content.hero_image})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        {content?.hero_image && <div className="absolute inset-0 bg-black/40" />}
        <div className="container py-16 md:py-20 relative z-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">{t.about.pageSubtitle}</p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              {heroTitle}
            </h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-lg leading-relaxed">
              {heroSub}
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

      {/* Optional intro paragraph from admin */}
      {introText && (
        <section className="border-b border-border bg-muted/30">
          <div className="container py-8">
            <p className="text-muted-foreground leading-relaxed max-w-3xl">{introText}</p>
          </div>
        </section>
      )}

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
                      src={featureImages[idx]}
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
