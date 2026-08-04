#!/usr/bin/env node
/**
 * Generates public/sitemap.xml from the site's real content data.
 *
 * This app has no backend — INITIAL_BOOKS/INITIAL_ARTICLES in
 * src/admin/data are the actual source of truth BooksContext/
 * ArticlesContext hydrate from (admin edits only ever persist to a
 * visitor's own browser localStorage, which a build script cannot read).
 * Importing those same modules here — instead of hand-copying slugs/dates
 * into this file — means adding, removing, or hiding a book/article is
 * reflected automatically the next time this script runs, with the exact
 * same visibility rules the public pages themselves already use.
 *
 * Deliberately excluded: /admin (private), and every noindex utility/
 * transactional page (/search, /checkout, /payment/:method,
 * /order-received, /download/:token) — a sitemap should only list what's
 * actually meant to be indexed. robots.txt already disallows all of these;
 * this script doesn't touch robots.txt.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { INITIAL_BOOKS } from "../src/admin/data/booksData.ts";
import { INITIAL_ARTICLES } from "../src/admin/data/articlesData.ts";
import { isInLibraryGrid } from "../src/admin/lib/bookPlacement.ts";

const SITE_URL = "https://r-aqim.com";
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, "../public/sitemap.xml");

// Static marketing pages have no CMS "last modified" field to derive from —
// same fixed anchor date the hand-written sitemap already used, kept as a
// constant so regenerating doesn't manufacture a bogus lastmod bump on
// content that hasn't actually changed.
const STATIC_LASTMOD = "2026-07-27";

/** @type {{ path: string; lastmod: string; changefreq: string; priority: string }[]} */
const staticEntries = [
  { path: "/", lastmod: STATIC_LASTMOD, changefreq: "daily", priority: "1.0" },
  { path: "/books", lastmod: STATIC_LASTMOD, changefreq: "weekly", priority: "0.8" },
  { path: "/future-releases", lastmod: STATIC_LASTMOD, changefreq: "weekly", priority: "0.6" },
  { path: "/about", lastmod: STATIC_LASTMOD, changefreq: "yearly", priority: "0.6" },
];

const trailingStaticEntries = [
  { path: "/contact", lastmod: STATIC_LASTMOD, changefreq: "yearly", priority: "0.5" },
  { path: "/faq", lastmod: STATIC_LASTMOD, changefreq: "monthly", priority: "0.6" },
  { path: "/privacy", lastmod: STATIC_LASTMOD, changefreq: "yearly", priority: "0.3" },
  { path: "/terms", lastmod: STATIC_LASTMOD, changefreq: "yearly", priority: "0.3" },
];

// Same visibility rule as BooksIndexPage/HomePage/AuthorPage: soft-deleted
// and `hidden`-placement books never appear on the public site.
const visibleBooks = INITIAL_BOOKS.filter((b) => b.deletedAt === null && isInLibraryGrid(b.placement)).sort(
  (a, b) => a.displayOrder - b.displayOrder
);

// Same distinction BookPage.tsx itself makes (`hasFullContent`) between a
// fully published title and a coming-soon placeholder — reused here as the
// real, principled signal for priority, instead of a hand-picked number.
const bookEntries = visibleBooks.map((book) => ({
  path: `/books/${book.id}`,
  lastmod: book.updatedAt,
  changefreq: "monthly",
  priority: book.placement === "comingSoon" ? "0.6" : "0.8",
}));

// One entry per unique author reachable from a visible book — mirrors
// AuthorPage's own resolution (every visible book matching a slug, the
// earliest by displayOrder standing in as the representative record).
const authorSlugsInOrder = [...new Set(visibleBooks.map((b) => b.authorSlug))];
const authorEntries = authorSlugsInOrder.map((slug) => {
  const primaryBook = visibleBooks.find((b) => b.authorSlug === slug);
  return {
    path: `/authors/${slug}`,
    lastmod: primaryBook.updatedAt,
    changefreq: "monthly",
    priority: "0.6",
  };
});

// Same visibility rule as BlogIndexPage/BlogPostPage/SearchPage: only
// published posts are publicly reachable. Sorted newest-first, same as
// BlogIndexPage's own listing order.
const publishedArticles = [...INITIAL_ARTICLES]
  .filter((a) => a.status === "published")
  .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

const articleEntries = publishedArticles.map((article) => ({
  path: `/blog/${article.slug}`,
  lastmod: article.updatedAt,
  changefreq: "monthly",
  priority: "0.6",
}));

// The blog index's own content changes whenever the newest post is
// published/updated, so its lastmod tracks that post rather than the
// generic static-page date.
const blogIndexEntry = {
  path: "/blog",
  lastmod: publishedArticles[0]?.updatedAt ?? STATIC_LASTMOD,
  changefreq: "weekly",
  priority: "0.7",
};

// Assembled in the same reading order as the previous hand-written file
// (home, books, book detail pages, future-releases, about, authors, blog,
// blog posts, contact, faq, privacy, terms) purely for a clean diff — order
// has no effect on how a sitemap is crawled.
const entries = [
  staticEntries[0], // /
  staticEntries[1], // /books
  ...bookEntries,
  staticEntries[2], // /future-releases
  staticEntries[3], // /about
  ...authorEntries,
  blogIndexEntry,
  ...articleEntries,
  ...trailingStaticEntries, // /contact, /faq, /privacy, /terms
];

// Guard against any accidental duplicate path (e.g. two books sharing an id).
const seen = new Set();
const dedupedEntries = entries.filter((e) => {
  if (seen.has(e.path)) return false;
  seen.add(e.path);
  return true;
});

const body = dedupedEntries
  .map(
    (e) => `  <url>
    <loc>${SITE_URL}${e.path}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

writeFileSync(OUTPUT_PATH, xml, "utf-8");
console.log(`Sitemap written to ${OUTPUT_PATH} (${dedupedEntries.length} URLs).`);
