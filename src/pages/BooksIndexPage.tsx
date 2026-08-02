import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell, PageHeader } from "../components/page-shell";
import { Reveal } from "../components/motion-primitives";
import { Helmet } from "../components/Helmet";
import { StructuredData } from "../components/StructuredData";
import { useBooks } from "../admin/context/BooksContext";
import { useCategories } from "../admin/context/CategoriesContext";
import { isInLibraryGrid } from "../admin/lib/bookPlacement";
import { buildGraph, breadcrumbSchema } from "../lib/structuredData";
import { useAssetDimensions } from "../lib/mediaDimensions";
import { useLanguage } from "../context/LanguageContext";
import { localizeProperName } from "../lib/properNames";

export default function BooksIndexPage() {
  const { books } = useBooks();
  const { categories, getCategoryMatchName, getCategoryLabel } = useCategories();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const getDimensions = useAssetDimensions();
  const { t, language } = useLanguage();

  const booksJsonLd = buildGraph([
    breadcrumbSchema([
      { name: t("about.breadcrumb.home"), path: "/" },
      { name: t("books.breadcrumb.title"), path: "/books" },
    ]),
  ]);

  const libraryBooks = useMemo(
    () =>
      books
        .filter((b) => b.deletedAt === null && isInLibraryGrid(b.placement))
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [books]
  );

  const visibleBooks = useMemo(
    () => (activeCategory ? libraryBooks.filter((b) => b.category === activeCategory) : libraryBooks),
    [libraryBooks, activeCategory]
  );

  // Only offer categories that actually have a book in them right now —
  // an empty filter pill would just be a dead end for the reader.
  // AdminBook.category always stores a category's raw Arabic name (Books
  // wasn't converted), so matching must go through getCategoryMatchName(id)
  // rather than the resolved (active-language) display name below.
  const availableCategories = useMemo(
    () => categories.filter((c) => libraryBooks.some((b) => b.category === getCategoryMatchName(c.id))),
    [categories, libraryBooks, getCategoryMatchName]
  );

  return (
    <PageShell>
      <Helmet
        title={t("books.seo.title")}
        description={t("books.seo.description")}
        path="/books"
      />
      <StructuredData json={booksJsonLd} />
      <PageHeader
        eyebrow={t("books.header.eyebrow")}
        title={t("books.header.title")}
        description={t("books.header.description")}
      />

      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {availableCategories.length > 1 && (
            <div className="mb-12 flex flex-wrap justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  activeCategory === null
                    ? "border-ink bg-ink text-ivory"
                    : "border-beige text-ink-soft hover:border-gold hover:text-ink"
                }`}
              >
                {t("books.filters.all")}
              </button>
              {availableCategories.map((category) => {
                const matchName = getCategoryMatchName(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCategory(matchName)}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                      activeCategory === matchName
                        ? "border-ink bg-ink text-ivory"
                        : "border-beige text-ink-soft hover:border-gold hover:text-ink"
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          )}

          {visibleBooks.length === 0 ? (
            <p className="text-center text-ink-soft">{t("books.emptyState")}</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleBooks.map((book, i) => (
                <Reveal key={book.id} delay={i * 0.05}>
                  <Link
                    to={`/books/${book.id}`}
                    className="group block h-full overflow-hidden rounded-[10px] border border-beige bg-cream/40 transition-shadow duration-300 hover:shadow-[0_20px_45px_-20px_rgba(44,36,32,0.25)]"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-cream to-beige p-8">
                      {book.cover && (
                        <img
                          src={book.cover}
                          alt={book.title}
                          width={getDimensions(book.cover)?.width}
                          height={getDimensions(book.cover)?.height}
                          className="mx-auto h-full w-auto object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      {book.placement === "comingSoon" && (
                        <span className="absolute end-4 top-4 rounded-full bg-lavender/80 px-3 py-1 text-xs text-ink">
                          {t("home.booksGrid.comingSoon")}
                        </span>
                      )}
                    </div>
                    <div className="p-6 text-start">
                      <p className="text-xs text-gold">{getCategoryLabel(book.category)}</p>
                      <h2 className="mt-2 font-display text-xl text-ink">{book.title}</h2>
                      <p className="mt-1.5 text-sm text-ink-soft">{localizeProperName(book.author, language)}</p>
                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-soft">{book.description}</p>
                      <div className="mt-4 flex items-center justify-between border-t border-beige pt-4">
                        <span className="text-sm text-ink">
                          {book.placement === "comingSoon"
                            ? t("home.booksGrid.comingSoon")
                            : book.prices.USD
                              ? `$${book.prices.USD.price}`
                              : "—"}
                        </span>
                        <span className="text-xs text-gold opacity-0 transition-opacity group-hover:opacity-100">
                          {book.placement === "comingSoon" ? t("books.card.learnMore") : t("books.card.viewDetails")}
                        </span>
                      </div>
                    </div>
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
