import { Link, useParams } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";
import { PageShell } from "../components/page-shell";
import { Reveal } from "../components/motion-primitives";
import { GoldDivider } from "../components/ornaments";
import { Helmet } from "../components/Helmet";
import { StructuredData } from "../components/StructuredData";
import { useArticles } from "../admin/context/ArticlesContext";
import { useBooks } from "../admin/context/BooksContext";
import { useSettings } from "../admin/context/SettingsContext";
import { formatArticleDate, formatReadTime } from "../admin/lib/articleStatus";
import { buildGraph, articleSchema, breadcrumbSchema, organizationSchema } from "../lib/structuredData";
import { useAssetDimensions } from "../lib/mediaDimensions";
import { useLanguage } from "../context/LanguageContext";
import { DEFAULT_OG_IMAGE, resolveArticleSeoTitle, resolveArticleSeoDescription } from "../lib/seo";
import { BRAND_ASSETS } from "../config/brandAssets";

/** The one author every current article is by — same real, non-fabricated
 * data BookPage/AuthorPage already use (AdminBook.author/.authorSlug).
 * Articles have no dedicated author field of their own beyond a plain
 * name string, so the byline link only applies when that name matches this
 * known author; a future second author would need a real authorSlug field
 * on AdminArticle to link correctly, not a hardcoded guess. */
const KNOWN_AUTHOR_SLUG: Record<string, string> = { "مها نصر": "maha-nasr" };

/** Articles genuinely about the book's own subject get one natural,
 * contextual link to it — not forced into every article (an article about
 * a mother's daily legacy, for instance, is only loosely related and gets
 * no link). Keyed by slug rather than a new admin-editable field: only 2 of
 * the 3 current articles are directly on-topic, so a full CMS field isn't
 * justified yet — promote this if more articles need it later. */
const RELATED_BOOK_BY_SLUG: Record<string, string> = {
  "sabr-hajar": "kuni-hajar",
  "kitab-hadiya": "kuni-hajar",
};

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { articles } = useArticles();
  const { getBook } = useBooks();
  const post = articles.find((a) => a.slug === slug && a.status === "published");
  const getDimensions = useAssetDimensions();
  const { settings } = useSettings();
  const { t, language, localizePath } = useLanguage();

  if (!post) return <NotFoundPage />;

  const coverDims = getDimensions(post.coverImage);
  const paragraphs = post.content.split(/\n{2,}/).filter((p) => p.trim().length > 0);
  const authorSlug = KNOWN_AUTHOR_SLUG[post.author];
  const relatedBookId = RELATED_BOOK_BY_SLUG[post.slug];
  const relatedBook = relatedBookId ? getBook(relatedBookId) : undefined;

  const postJsonLd = buildGraph([
    articleSchema(post, language, authorSlug),
    // articleSchema's `publisher` references the sitewide Organization node
    // by `@id` — that node only actually exists in this document's own
    // graph if it's included here too, so every page that uses articleSchema
    // must also include this, exactly as HomePage already does for its own
    // Organization/WebSite references.
    organizationSchema({
      logo: settings.brand.logo ?? BRAND_ASSETS.logo,
      image: settings.seo.socialImage ?? DEFAULT_OG_IMAGE,
      language,
    }),
    breadcrumbSchema([
      { name: t("about.breadcrumb.home"), path: "/" },
      { name: t("blog.breadcrumb.title"), path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ], language),
  ]);

  return (
    <PageShell>
      <Helmet
        title={resolveArticleSeoTitle(post, t("blog.post.seoTitleSuffix"))}
        description={resolveArticleSeoDescription(post)}
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
          <Reveal delay={0.09}>
            <p className="mt-3 text-center text-sm text-ink-soft">
              {t("blog.post.byPrefix")}
              {authorSlug ? (
                <Link to={localizePath(`/authors/${authorSlug}`)} className="text-gold hover:underline">
                  {post.author}
                </Link>
              ) : (
                post.author
              )}
            </p>
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

          {relatedBook && (
            <Reveal>
              <p className="mt-14 text-center text-base leading-loose text-ink-soft">
                {t("blog.post.relatedBookPrefix")}
                <Link
                  to={localizePath(`/books/${relatedBook.id}`)}
                  className="font-medium text-gold hover:underline"
                >
                  {relatedBook.title}
                </Link>
              </p>
            </Reveal>
          )}

          <div className="mt-16 border-t border-beige pt-8 text-center space-y-4">
            <Link to={localizePath("/blog")} className="block text-sm text-gold hover:underline">
              {t("blog.post.backToBlog")}
            </Link>

            <Link to={localizePath("/books")} className="block text-sm text-ink hover:text-gold transition-colors">
              {t("blog.post.browseBooks")}
            </Link>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
