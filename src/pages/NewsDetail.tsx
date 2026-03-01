"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import Layout from "@/components/Layout";
import { useFetch } from "@/hooks/useSupabaseData";
import { useTranslation } from "@/contexts/LanguageContext";

const NewsDetail = () => {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const { data: article, loading } = useFetch<any>(`/api/news/${slug}`, [slug]);
  const { t, lang } = useTranslation();

  if (loading) return <Layout><div className="container py-16 text-center text-muted-foreground">{t.common.loading}</div></Layout>;

  if (!article || article.error) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">{t.newsDetail.notFound}</p>
          <Link href="/news" className="text-primary hover:underline mt-4 inline-block">{t.newsDetail.backToList}</Link>
        </div>
      </Layout>
    );
  }

  const title = lang === "ja" ? (article.title_ja || article.title) : (article.title || article.title_ja);
  const content = lang === "ja" ? (article.content_ja || article.content || "") : (article.content || article.content_ja || "");

  return (
    <Layout>
      <div className="container max-w-3xl py-6">
        <Link href="/news" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 font-medium">
          <ArrowLeft className="h-4 w-4" /> {t.newsDetail.backToList}
        </Link>

        {article.image && (
          <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-8">
            <img src={article.image} alt={title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <span className="tag-badge">{article.category}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(article.created_at).toLocaleDateString(lang === "ja" ? "ja-JP" : "en-SG")}
          </span>
          {article.author && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              {article.author}
            </span>
          )}
        </div>

        <h1 className="text-3xl font-black tracking-tight mb-6">{title}</h1>

        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          {content.split("\n").map((p: string, i: number) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default NewsDetail;
