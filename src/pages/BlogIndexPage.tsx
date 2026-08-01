import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PageShell, PageHeader } from "../components/page-shell";
import { Reveal } from "../components/motion-primitives";
import { Helmet } from "../components/Helmet";
import { StructuredData } from "../components/StructuredData";
import { useArticles } from "../admin/context/ArticlesContext";
import { formatArticleDate, formatReadTime } from "../admin/lib/articleStatus";
import { buildGraph, breadcrumbSchema } from "../lib/structuredData";
import { useLanguage } from "../context/LanguageContext";

export default function BlogIndexPage() {
  const { articles } = useArticles();
  const { t, language } = useLanguage();

  const blogJsonLd = buildGraph([
    breadcrumbSchema([
      { name: t("about.breadcrumb.home"), path: "/" },
      { name: t("blog.breadcrumb.title"), path: "/blog" },
    ]),
  ]);

  const publishedPosts = useMemo(
    () =>
      articles
        .filter((a) => a.status === "published")
        .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")),
    [articles]
  );

  return (
    <PageShell>
      <Helmet
        title={t("blog.seo.title")}
        description={t("blog.seo.description")}
        path="/blog"
      />
      <StructuredData json={blogJsonLd} />
      <PageHeader
        eyebrow={t("blog.eyebrow")}
        title={t("blog.title")}
        description={t("blog.description")}
      />

      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-5xl">
          {publishedPosts.length === 0 ? (
            <p className="text-center text-ink-soft">{t("blog.emptyState")}</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {publishedPosts.map((post, i) => (
                <Reveal key={post.slug} delay={i * 0.08} className={i === 0 ? "lg:col-span-2" : ""}>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group block rounded-[10px] border border-beige bg-cream/40 p-8 transition-shadow duration-300 hover:shadow-[0_20px_45px_-20px_rgba(44,36,32,0.25)]"
                  >
                    <div className="flex items-center gap-3 text-xs text-ink-soft">
                      <span className="text-gold">{post.category}</span>
                      <span>·</span>
                      <span>{formatReadTime(post.readTime, language)}</span>
                      <span>·</span>
                      <span>{formatArticleDate(post.publishedAt, language)}</span>
                    </div>
                    <h2 className="mt-4 font-display text-2xl leading-snug text-ink">{post.title}</h2>
                    <p className="mt-3 text-balance leading-relaxed text-ink-soft">{post.excerpt}</p>
                    <span className="mt-5 inline-block text-sm text-gold opacity-0 transition-opacity group-hover:opacity-100">
                      {t("blog.readMore")}
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
