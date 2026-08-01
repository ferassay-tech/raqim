import { Link, useParams, Navigate } from "react-router-dom";
import { PageShell } from "../components/page-shell";
import { Reveal } from "../components/motion-primitives";
import { GoldDivider } from "../components/ornaments";
import { Helmet } from "../components/Helmet";
import { StructuredData } from "../components/StructuredData";
import { useArticles } from "../admin/context/ArticlesContext";
import { formatArticleDate, formatReadTime } from "../admin/lib/articleStatus";
import { buildGraph, articleSchema, breadcrumbSchema } from "../lib/structuredData";
import { useAssetDimensions } from "../lib/mediaDimensions";
import { useLanguage } from "../context/LanguageContext";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { articles } = useArticles();
  const post = articles.find((a) => a.slug === slug && a.status === "published");
  const getDimensions = useAssetDimensions();
  const { t, language } = useLanguage();

  if (!post) return <Navigate to="/blog" replace />;

  const coverDims = getDimensions(post.coverImage);
  const paragraphs = post.content.split(/\n{2,}/).filter((p) => p.trim().length > 0);

  const postJsonLd = buildGraph([
    articleSchema(post, language),
    breadcrumbSchema([
      { name: t("about.breadcrumb.home"), path: "/" },
      { name: t("blog.breadcrumb.title"), path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
  ]);

  return (
    <PageShell>
      <Helmet
        title={post.seoTitle || `${post.title}${t("blog.post.seoTitleSuffix")}`}
        description={post.seoDescription || post.excerpt}
        path={`/blog/${post.slug}`}
        image={post.coverImage ?? undefined}
        imageWidth={coverDims?.width}
        imageHeight={coverDims?.height}
        type="article"
        publishedTime={post.publishedAt ?? undefined}
        modifiedTime={post.updatedAt}
      />
      <StructuredData json={postJsonLd} />
      <article className="px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <div className="flex items-center justify-center gap-3 text-xs text-ink-soft">
              <span className="text-gold">{post.category}</span>
              <span>·</span>
              <span>{formatReadTime(post.readTime, language)}</span>
              <span>·</span>
              <span>{formatArticleDate(post.publishedAt, language)}</span>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="mt-5 text-balance text-center font-display text-4xl leading-tight text-ink md:text-5xl">
              {post.title}
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="mt-6 flex justify-center">
              <GoldDivider className="h-4 w-44 text-gold" />
            </div>
          </Reveal>

          {post.coverImage && (
            <Reveal delay={0.16}>
              <img
                src={post.coverImage}
                alt={post.title}
                className="mt-10 w-full rounded-[10px] object-cover"
                loading="lazy"
                decoding="async"
              />
            </Reveal>
          )}

          <div className="mt-12 space-y-6">
            {paragraphs.map((para, i) => (
              <Reveal key={i} delay={0.05 * i}>
                <p className="text-balance text-lg leading-loose text-ink-soft">{para}</p>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 border-t border-beige pt-8 text-center space-y-4">
            <Link to="/blog" className="block text-sm text-gold hover:underline">
              {t("blog.post.backToBlog")}
            </Link>

            <Link to="/books" className="block text-sm text-ink hover:text-gold transition-colors">
              {t("blog.post.browseBooks")}
            </Link>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
