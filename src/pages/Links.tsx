"use client";
import { ExternalLink, Globe } from "lucide-react";
import Layout from "@/components/Layout";
import { useTranslation } from "@/contexts/LanguageContext";

export const LINKS_DATA = [
  {
    category: "government",
    items: [
      {
        name: "Singapore Food Agency (SFA)",
        nameJa: "シンガポール食品庁（SFA）",
        description: "Official food safety regulations, licensing, and compliance information.",
        descriptionJa: "食品安全規制、ライセンス、コンプライアンス情報の公式サイト。",
        url: "https://www.sfa.gov.sg",
        icon: "🏛️",
      },
      {
        name: "National Environment Agency (NEA)",
        nameJa: "国家環境庁（NEA）",
        description: "Food hygiene grading, hawker centre management and environmental health.",
        descriptionJa: "食品衛生評価、ホーカーセンター管理および環境衛生に関する情報。",
        url: "https://www.nea.gov.sg",
        icon: "🌿",
      },
      {
        name: "Enterprise Singapore",
        nameJa: "エンタープライズ・シンガポール",
        description: "Business grants, support schemes, and export assistance for F&B companies.",
        descriptionJa: "F&B企業向けの補助金、支援制度、輸出支援に関する情報。",
        url: "https://www.enterprisesg.gov.sg",
        icon: "🇸🇬",
      },
      {
        name: "Singapore Customs",
        nameJa: "シンガポール税関",
        description: "Import/export licensing and regulations for food and beverage products.",
        descriptionJa: "食品・飲料製品の輸出入ライセンスと規制に関する情報。",
        url: "https://www.customs.gov.sg",
        icon: "📋",
      },
    ],
  },
  {
    category: "association",
    items: [
      {
        name: "Restaurant Association of Singapore (RAS)",
        nameJa: "シンガポール・レストラン協会（RAS）",
        description: "Industry body representing restaurants and food service businesses in Singapore.",
        descriptionJa: "シンガポールのレストランおよびフードサービス業界を代表する業界団体。",
        url: "https://www.ras.org.sg",
        icon: "🍽️",
      },
      {
        name: "Singapore Food Manufacturers' Association (SFMA)",
        nameJa: "シンガポール食品製造業者協会（SFMA）",
        description: "Representing food manufacturers and processing companies in Singapore.",
        descriptionJa: "シンガポールの食品メーカーと加工会社を代表する協会。",
        url: "https://sfma.org.sg",
        icon: "🏭",
      },
      {
        name: "Majlis Ugama Islam Singapura (MUIS)",
        nameJa: "シンガポール・イスラム宗教評議会（MUIS）",
        description: "Official halal certification body for Singapore's food and beverage industry.",
        descriptionJa: "シンガポールの食品・飲料業界の公式ハラール認証機関。",
        url: "https://www.muis.gov.sg",
        icon: "✅",
      },
      {
        name: "Singapore Tourism Board (STB)",
        nameJa: "シンガポール観光局（STB）",
        description: "Tourism development and food events including Singapore Food Festival.",
        descriptionJa: "シンガポール・フードフェスティバルを含む観光振興と食イベントに関する情報。",
        url: "https://www.stb.gov.sg",
        icon: "🗺️",
      },
    ],
  },
  {
    category: "platform",
    items: [
      {
        name: "F&B Portal Singapore",
        nameJa: "F&Bポータル・シンガポール",
        description: "Singapore's premier supplier discovery and chef networking platform.",
        descriptionJa: "シンガポールを代表するサプライヤー発見およびシェフネットワーキングプラットフォーム。",
        url: "/",
        icon: "🔗",
      },
      {
        name: "GrabFood for Merchants",
        nameJa: "GrabFood（加盟店向け）",
        description: "Register and manage your restaurant listing on GrabFood delivery platform.",
        descriptionJa: "GrabFoodデリバリープラットフォームへのレストラン登録・管理。",
        url: "https://merchant.grab.com",
        icon: "🛵",
      },
      {
        name: "Foodpanda Partners",
        nameJa: "フードパンダ（パートナー向け）",
        description: "Partner portal for restaurants and food businesses on Foodpanda.",
        descriptionJa: "フードパンダのレストラン・フードビジネス向けパートナーポータル。",
        url: "https://www.foodpanda.sg/contents/partner-with-us.htm",
        icon: "🐼",
      },
    ],
  },
  {
    category: "resource",
    items: [
      {
        name: "WSQ Food Safety Course",
        nameJa: "WSQ食品安全コース",
        description: "Mandatory food hygiene training courses for food handlers in Singapore.",
        descriptionJa: "シンガポールの食品取扱者向け必須食品衛生トレーニングコース。",
        url: "https://www.sfa.gov.sg/food-information/food-safety-education/food-safety-for-consumers",
        icon: "📚",
      },
      {
        name: "Singapore Standards (SS) for Food",
        nameJa: "食品に関するシンガポール規格（SS）",
        description: "Official food quality and safety standards published by Enterprise Singapore.",
        descriptionJa: "エンタープライズ・シンガポールが発行する公式食品品質・安全基準。",
        url: "https://www.singaporestandardseshop.sg",
        icon: "📐",
      },
      {
        name: "SkillsFuture for F&B",
        nameJa: "F&B向けスキルズフューチャー",
        description: "Subsidised training programmes for F&B industry professionals in Singapore.",
        descriptionJa: "シンガポールのF&B業界専門家向け補助金付きトレーニングプログラム。",
        url: "https://www.skillsfuture.gov.sg",
        icon: "🎓",
      },
      {
        name: "30 by 30 — Singapore Food Story",
        nameJa: "30 by 30 — シンガポード・フードストーリー",
        description: "Singapore's goal to produce 30% of nutritional needs locally by 2030.",
        descriptionJa: "2030年までに栄養ニーズの30%を国内で生産するシンガポールの目標。",
        url: "https://www.sfa.gov.sg/food-farming/singapore-food-story",
        icon: "🌾",
      },
    ],
  },
];

const Links = () => {
  const { t, lang } = useTranslation();
  const tl = t.links;

  return (
    <Layout>
      <div className="container py-10 md:py-14">
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Globe className="h-7 w-7 text-primary" />
            {tl.pageTitle}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{tl.pageSubtitle}</p>
        </div>

        <div className="space-y-12">
          {LINKS_DATA.map(({ category, items }) => (
            <section key={category}>
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-foreground">
                <span className="w-1 h-5 bg-primary rounded-full inline-block" />
                {tl.categories[category]}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target={link.url.startsWith("http") ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="group bg-card border border-border rounded-2xl p-5 card-hover flex flex-col gap-3 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-2xl leading-none">{link.icon}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">
                        {lang === "ja" ? link.nameJa : link.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-3">
                        {lang === "ja" ? link.descriptionJa : link.description}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-primary flex items-center gap-1 mt-auto">
                      {tl.visitSite} <ExternalLink className="h-3 w-3" />
                    </span>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Links;
