import { useMemo } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { PageShell } from "../components/page-shell";
import { GoldDivider } from "../components/ornaments";
import { UnderlineLink } from "../components/cta";
import { Reveal } from "../components/motion-primitives";
import { Helmet } from "../components/Helmet";
import { StructuredData } from "../components/StructuredData";
import { buildGraph, breadcrumbSchema, personSchema } from "../lib/structuredData";
import { useAssetDimensions } from "../lib/mediaDimensions";
import { useBooks } from "../admin/context/BooksContext";
import { isInLibraryGrid } from "../admin/lib/bookPlacement";
import { useLanguage } from "../context/LanguageContext";
import { localizeProperName } from "../lib/properNames";

export default function AuthorPage() {
  const { slug } = useParams<{ slug: string }>();
  const { books } = useBooks();
  const getDimensions = useAssetDimensions();
  const { t, language } = useLanguage();

  // There is no separate Author record — author identity lives on AdminBook
  // itself (author/authorSlug/authorBio). Every visible book matching this
  // slug is derived here, same visibility rule as BooksIndexPage/HomePage/
  // SearchPage (excludes deleted + hidden, includes comingSoon). The first
  // book by displayOrder is the representative record for name/bio.
  const authorBooks = useMemo(() => {
    if (!slug) return [];
    return books
      .filter((b) => b.authorSlug === slug && b.deletedAt === null && isInLibraryGrid(b.placement))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [books, slug]);

  const primaryBook = authorBooks[0];
  if (!primaryBook) return <Navigate to="/books" replace />;

  const authorName = primaryBook.author;
  const authorBio = primaryBook.authorBio;
  const displayName = localizeProperName(authorName, language);

  const authorJsonLd = buildGraph([
    personSchema({ name: authorName, slug: primaryBook.authorSlug, description: authorBio, language }),
    breadcrumbSchema([
      { name: t("about.breadcrumb.home"), path: "/" },
      { name: displayName, path: `/authors/${primaryBook.authorSlug}` },
    ]),
  ]);

  return (
    <PageShell>
      <Helmet
        title={`${displayName}${t("author.seoTitleSuffix")}`}
        description={authorBio}
        path={`/authors/${primaryBook.authorSlug}`}
      />
      <StructuredData json={authorJsonLd} />
      <section className="px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-[0.6fr_1.4fr]">
          <Reveal className="flex justify-center">
            <div className="flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-cream to-lavender/40 font-logotype text-7xl text-gold">
              {displayName.trim().charAt(0) || t("book.author.fallbackInitial")}
            </div>
          </Reveal>
          <Reveal delay={0.1} className="text-center lg:text-start">
            <h1 className="mt-4 font-display text-4xl text-ink md:text-5xl">{displayName}</h1>
            <div className="mt-5 flex max-lg:justify-center lg:justify-start">
              <GoldDivider className="h-4 w-44 text-gold" />
            </div>
            {authorBio && (
              <p className="mx-auto mt-6 max-w-2xl text-balance leading-loose text-ink-soft lg:mx-0">
                {authorBio}
              </p>
            )}
          </Reveal>
        </div>
      </section>

      <section className="bg-cream px-6 py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <p className="text-sm uppercase tracking-[0.25em] text-gold">{t("author.releasesEyebrow")}</p>
            <h2 className="mt-4 font-display text-3xl text-ink md:text-4xl">
              {t("author.worksTitlePrefix")}
              {displayName}
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {authorBooks.map((book, i) => (
              <Reveal key={book.id} delay={i * 0.08}>
                <Link
                  to={`/books/${book.id}`}
                  className="group block overflow-hidden rounded-[10px] border border-beige bg-ivory"
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-cream to-beige p-8">
                    {book.cover && (
                      <img
                        src={book.cover}
                        alt={book.title}
                        width={getDimensions(book.cover)?.width}
                        height={getDimensions(book.cover)?.height}
                        className="mx-auto h-full w-auto object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </div>
                  <div className="p-5 text-start">
                    <h3 className="font-display text-lg text-ink">{book.title}</h3>
                    <div className="mt-3">
                      <UnderlineLink to={`/books/${book.id}`} interactive={false}>
                        {book.placement === "comingSoon" ? t("author.comingSoonLink") : t("author.viewBook")}
                      </UnderlineLink>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

