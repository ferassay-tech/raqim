import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell, PageHeader } from "../components/page-shell";
import { books, blogPosts } from "../lib/content";
import { Reveal } from "../components/motion-primitives";
import { Helmet } from "../components/Helmet";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return { books: [], posts: [] };
    const matchedBooks = books.filter(
      (b) => b.title.includes(q) || b.author.includes(q) || b.category.includes(q) || b.excerpt.includes(q),
    );
    const matchedPosts = blogPosts.filter(
      (p) => p.title.includes(q) || p.excerpt.includes(q) || p.category.includes(q),
    );
    return { books: matchedBooks, posts: matchedPosts };
  }, [query]);

  const hasQuery = query.trim().length > 0;
  const hasResults = results.books.length > 0 || results.posts.length > 0;

  return (
    <PageShell>
      <Helmet
        title="بحث — رقيم"
        description="ابحثي في مكتبة رقيم عن الكتب والمقالات."
        path="/search"
        noindex
      />
      <PageHeader eyebrow="بحث" title="ابحثي في مكتبة رقيم" />

      <section className="px-6 pb-24 lg:px-10">
        <div className="mx-auto max-w-2xl">
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحثي عن كتاب، منتج، مقالة، أو موضوع..."
            className="w-full rounded-full border border-beige bg-cream/40 px-6 py-4 text-center text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none"
          />

          {hasQuery && !hasResults && (
            <p className="mt-10 text-center text-ink-soft">لا توجد نتائج مطابقة لـ "{query}"</p>
          )}

          {results.books.length > 0 && (
            <div className="mt-12">
              <p className="text-xs uppercase tracking-[0.2em] text-gold">الكتب</p>
              <div className="mt-4 space-y-3">
                {results.books.map((b, i) => (
                  <Reveal key={b.slug} delay={i * 0.04}>
                    <Link
                      to={`/books/${b.slug}`}
                      className="flex items-center justify-between rounded-[10px] border border-beige bg-ivory px-5 py-4 transition-colors hover:border-gold"
                    >
                      <span className="font-display text-lg text-ink">{b.title}</span>
                      <span className="text-xs text-ink-soft">{b.author}</span>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {results.posts.length > 0 && (
            <div className="mt-10">
              <p className="text-xs uppercase tracking-[0.2em] text-gold">المدونة</p>
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

