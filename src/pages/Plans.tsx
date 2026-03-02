"use client";
import { Check } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/LanguageContext";

const planData = [
  {
    tier: "basic" as const,
    features: ["featureListing"] as const,
  },
  {
    tier: "standard" as const,
    features: ["featureListing", "featureWhatsapp", "featureProducts"] as const,
    popular: false,
  },
  {
    tier: "premium" as const,
    features: [
      "featureListing",
      "featureWhatsapp",
      "featureFeatured",
      "featureProducts",
      "featureAnalytics",
      "featurePriority",
    ] as const,
    popular: true,
  },
];

const Plans = () => {
  const { t } = useTranslation();
  const p = t.plans;

  return (
    <Layout>
      <div className="container py-12 md:py-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            {p.pageTitle}
          </h1>
          <p className="text-muted-foreground mt-2">{p.pageSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {planData.map(({ tier, features, popular }) => {
            const name = p[tier];
            const desc = p[`${tier}Desc` as keyof typeof p] as string;
            const isPremium = tier === "premium";

            return (
              <div
                key={tier}
                className={`relative rounded-2xl border p-6 md:p-8 flex flex-col ${
                  isPremium
                    ? "border-2 border-amber-400 shadow-xl shadow-amber-200/40 md:scale-105 md:-mt-2 md:-mb-2"
                    : "border-border shadow-sm"
                }`}
              >
                {popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow">
                    {p.mostPopular}
                  </div>
                )}
                <h2 className="text-xl font-bold mt-2">{name}</h2>
                <p className="text-sm text-muted-foreground mt-1 mb-6">
                  {desc}
                </p>
                <ul className="space-y-3 flex-1">
                  {features.map((fKey) => (
                    <li key={fKey} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      {p[fKey as keyof typeof p] as string}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`mt-8 rounded-xl w-full font-bold ${
                    isPremium
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                  asChild
                >
                  <a href="mailto:contact@fnbportal.sg">{p.contactUs}</a>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Plans;
