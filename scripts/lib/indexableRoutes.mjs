/**
 * Single source of truth for "what public, indexable routes does this site
 * have" — both scripts/generate-sitemap.mjs and scripts/prerender-seo.mjs
 * import this instead of each independently re-deriving the same
 * visibility/exclusion rules (comingSoon books, unpublished articles,
 * authors with no real book) from INITIAL_BOOKS/INITIAL_ARTICLES. Returns
 * routes in their bare/Arabic shape with the raw, still-bilingual
 * ({ar, en}) entity attached where relevant — callers resolve language and
 * build their own output shape (a sitemap <url> entry, a prerendered HTML
 * file) from that.
 *
 * KNOWN LIMITATION (inherited from the sitemap generator this was
 * extracted from): reads INITIAL_BOOKS/INITIAL_ARTICLES, the build-time
 * seed data — not live Supabase. A book/article only edited through the
 * Admin dashboard since the last deploy won't be reflected here until a
 * redeploy with updated seed files. Fetching live at build time is a
 * separate future milestone (network access + credentials + a new
 * build-failure mode), not addressed here.
 */
import { INITIAL_BOOKS } from "../../src/admin/data/booksData.ts";
import { INITIAL_ARTICLES } from "../../src/admin/data/articlesData.ts";
import { isInLibraryGrid } from "../../src/admin/lib/bookPlacement.ts";

// Static marketing pages have no CMS "last modified" field to derive from.
export const STATIC_LASTMOD = "2026-07-27";

export function getIndexableRoutes() {
  // Same visibility rule as BooksIndexPage/HomePage/AuthorPage: soft-deleted
  // and `hidden`-placement books never appear on the public site.
  const visibleBooks = INITIAL_BOOKS.filter((b) => b.deletedAt === null && isInLibraryGrid(b.placement)).sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  // Same distinction BookPage.tsx makes (`hasFullContent`): coming-soon
  // records are placeholder-only and marked noindex,follow on their own
  // page — never listed as an indexable route.
  const books = visibleBooks.filter((book) => book.placement !== "comingSoon");

  // One entry per unique author reachable from a visible, real (non
  // coming-soon) book — mirrors AuthorPage's own resolution and its
  // matching noindex,follow rule for an author with no real book yet.
  const authorSlugsInOrder = [...new Set(visibleBooks.map((b) => b.authorSlug))];
  const authors = authorSlugsInOrder
    .filter((slug) => visibleBooks.some((b) => b.authorSlug === slug && b.placement !== "comingSoon"))
    .map((slug) => ({
      slug,
      primaryBook: visibleBooks.find((b) => b.authorSlug === slug),
    }));

  // Same visibility rule as BlogIndexPage/BlogPostPage/SearchPage: only
  // published posts are publicly reachable. Newest-first, same as
  // BlogIndexPage's own listing order.
  const articles = [...INITIAL_ARTICLES]
    .filter((a) => a.status === "published")
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

  return { books, authors, articles, blogIndexLastmod: articles[0]?.updatedAt ?? STATIC_LASTMOD };
}
