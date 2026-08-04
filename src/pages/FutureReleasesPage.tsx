import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PageShell, PageHeader } from "../components/page-shell";
import { Reveal } from "../components/motion-primitives";
import { GoldDivider } from "../components/ornaments";
import { Helmet } from "../components/Helmet";
import { StructuredData } from "../components/StructuredData";
import { useBooks } from "../admin/context/BooksContext";
import { useCategories } from "../admin/context/CategoriesContext";
import { useAssetDimensions } from "../lib/mediaDimensions";
import { useLanguage } from "../context/LanguageContext";
import { localizeProperName } from "../lib/properNames";
import { buildGraph, breadcrumbSchema, webPageSchema } from "../lib/structuredData";

export default function FutureReleasesPage() {
  const { books } = useBooks();
  const { getCategoryLabel } = useCategories();
  const getDimensions = useAssetDimensions();
  const { t, language } = useLanguage();
  const upcoming = useMemo(
    () =>
      books
        .filter((b) => b.deletedAt === null && b.placement === "comingSoon")
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [books]
  );

  const futureReleasesJsonLd = buildGraph([
    webPageSchema({
      name: t("futureReleases.seo.title"),
      description: t("futureReleases.seo.description"),
      path: "/future-releases",
      language,
    }),
    breadcrumbSchema([
      { name: t("about.breadcrumb.home"), path: "/" },
      { name: t("futureReleases.title"), path: "/future-releases" },
    ]),
  ]);

  return (
    <PageShell>
      <Helmet
        title={t("futureReleases.seo.title")}
        description={t("futureReleases.seo.description")}
        path="/future-releases"
      />
      <StructuredData json={futureReleasesJsonLd} />
      <PageHeader
        eyebrow={t("futureReleases.eyebrow")}
        title={t("futureReleases.title")}
        description={t("futureReleases.description")}
      />

      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-4xl space-y-8">
          {upcoming.map((book, i) => (
            <Reveal key={book.id} delay={i * 0.08}>
              <div className="flex flex-col items-center gap-8 rounded-[10px] border border-beige bg-cream/40 p-8 sm:flex-row-reverse sm:text-start">
                <div className="w-40 shrink-0 rounded-[10px] bg-gradient-to-br from-cream to-beige p-4">
                  {book.cover && (
                    <img
                      src={book.cover}
                      alt={book.title}
                      width={getDimensions(book.cover)?.width}
                      height={getDimensions(book.cover)?.height}
                      className="w-full object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-gold">{getCategoryLabel(book.category)}</p>
                  <h2 className="mt-2 font-display text-2xl text-ink">{book.title}</h2>
                  <p className="mt-1 text-sm text-ink-soft">{localizeProperName(book.author, language)}</p>
                  <p className="mt-3 text-balance leading-relaxed text-ink-soft">{book.description}</p>
                  <span className="mt-4 inline-block rounded-full bg-lavender/50 px-4 py-1.5 text-xs text-ink">
                    {t("home.booksGrid.comingSoon")}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3} className="mx-auto mt-16 max-w-2xl text-center">
          <GoldDivider className="mx-auto h-4 w-44 text-gold" />
          <p className="mt-6 text-balance leading-loose text-ink-soft">{t("futureReleases.newsletterNote")}</p>
          <Link to="/" className="mt-4 inline-block text-sm text-gold hover:underline">
            {t("notFound.backHome")}
          </Link>
        </Reveal>
      </section>
    </PageShell>
  );
}
