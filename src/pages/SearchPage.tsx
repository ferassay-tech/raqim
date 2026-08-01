import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell, PageHeader } from "../components/page-shell";
import { Reveal } from "../components/motion-primitives";
import { Helmet } from "../components/Helmet";
import { useBooks } from "../admin/context/BooksContext";
import { useArticles } from "../admin/context/ArticlesContext";
import { isInLibraryGrid } from "../admin/lib/bookPlacement";
import { useLanguage } from "../context/LanguageContext";
import { localizeProperName } from "../lib/properNames";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { books } = useBooks();
  const { articles } = useArticles();
  const { t, language } = useLanguage();

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return { books: [], posts: [] };

    // Same visibility rule as BooksIndexPage/HomePage: excludes deleted and
    // hidden books, includes comingSoon — search must never surface what the
    // public catalog itself wouldn't show.
    const visibleBooks = books.filter((b) => b.deletedAt === null && isInLibraryGrid(b.placement));
    // Same rule as BlogIndexPage — only published articles are public.
    const publishedPosts = articles.filter((a) => a.status === "published");

    const matchedBooks = visibleBooks.filter(
      (b) => b.title.includes(q) || b.author.includes(q) || b.category.includes(q) || b.description.includes(q),
    );
    const matchedPosts = publishedPosts.filter(
      (p) => p.title.includes(q) || p.excerpt.includes(q) || p.category.includes(q),
    );
    return { books: matchedBooks, posts: matchedPosts };
  }, [query, books, articles]);

  const hasQuery = query.trim().length > 0;
  const hasResults = results.books.length > 0 || results.posts.length > 0;

  return (
    <PageShell>
      <Helmet
        title={t("search.seo.title")}
        description={t("search.seo.description")}
        path="/search"
        noindex
      />
      <PageHeader eyebrow={t("search.eyebrow")} title={t("search.title")} />

      <section className="px-6 pb-24 lg:px-10">
        <div className="mx-auto max-w-2xl">
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.inputPlaceholder")}
            className="w-full rounded-full border border-beige bg-cream/40 px-6 py-4 text-center text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
          />

          {hasQuery && !hasResults && (
            <p className="mt-10 text-center text-ink-soft">
              {t("search.noResultsPrefix")}
              {query}
              {t("search.noResultsSuffix")}
            </p>
          )}

          {results.books.length > 0 && (
            <div className="mt-12">
              <p className="text-xs uppercase tracking-[0.2em] text-gold">{t("search.booksLabel")}</p>
              <div className="mt-4 space-y-3">
                {results.books.map((b, i) => (
                  <Reveal key={b.id} delay={i * 0.04}>
                    <Link
                      to={`/books/${b.id}`}
                      className="flex items-center justify-between rounded-[10px] border border-beige bg-ivory px-5 py-4 transition-colors hover:border-gold"
                    >
                      <span className="font-display text-lg text-ink">{b.title}</span>
                      <span className="text-xs text-ink-soft">{localizeProperName(b.author, language)}</span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {results.posts.length > 0 && (
            <div className="mt-10">
              <p className="text-xs uppercase tracking-[0.2em] text-gold">{t("search.blogLabel")}</p>
              <div className="mt-4 space-y-3">
                {results.posts.map((p, i) => (
                  <Reveal key={p.slug} delay={i * 0.04}>
                    <Link
                      to={`/blog/${p.slug}`}
                      className="flex items-center justify-between rounded-[10px] border border-beige bg-ivory px-5 py-4 transition-colors hover:border-gold"
                    >
                      <span className="text-ink">{p.title}</span>
                      <span className="text-xs text-ink-soft">{p.category}</span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}

