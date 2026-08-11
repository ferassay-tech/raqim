#!/usr/bin/env node
/**
 * Generates public/sitemap.xml — run once at build time (see the
 * "generate-sitemap" step in package.json's build script), then served
 * as a static file. It is not regenerated at runtime or on a schedule.
 *
 * KNOWN LIMITATION (SEO Milestone 4 audit, confirmed current as of Phase
 * 6A): this script still derives its book/article entries from the
 * static INITIAL_BOOKS/INITIAL_ARTICLES arrays in src/admin/data. Those
 * arrays were the real source of truth when this script was first
 * written (SEO Phase 5), but Phase 6A moved the live runtime app
 * (BooksContext/ArticlesContext) onto Supabase — INITIAL_BOOKS/
 * INITIAL_ARTICLES are now only the synchronous placeholder shown before
 * that fetch resolves, not what visitors actually see.
 *
 * Practical effect: this sitemap's content and lastmod values reflect
 * whatever was in these seed files at the last code deploy, not whatever
 * currently exists in the live Supabase database. A book or article
 * added, edited, hidden, or deleted through the Admin dashboard has no
 * effect on sitemap.xml until someone updates these seed files and
 * redeploys. This is a known, intentionally deferred gap — making this
 * script fetch live from Supabase is a separate future milestone (it
 * would require build-time network access and credentials, and a new
 * build-failure mode to handle), not addressed here.
 *
 * Deliberately excluded: /admin (private), and every noindex utility/
 * transactional page (/search, /checkout, /payment/:method,
 * /order-received, /download/:token) — a sitemap should only list what's
 * actually meant to be indexed. robots.txt already disallows all of these;
 * this script doesn't touch robots.txt.
 *
 * SEO Milestone 2 — every entry below is built once in its bare/Arabic
 * shape, then expanded into an Arabic + English pair via the same
 * withLanguagePrefix() every other part of the SEO system uses (Helmet,
 * LanguageContext) — one source of truth for the /en mapping, not a
 * second hand-copied rule living only in this script.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { INITIAL_BOOKS } from "../src/admin/data/booksData.ts";
import { INITIAL_ARTICLES } from "../src/admin/data/articlesData.ts";
import { isInLibraryGrid } from "../src/admin/lib/bookPlacement.ts";
import { SITE_URL, withLanguagePrefix } from "../src/lib/seo.ts";

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

// Same distinction BookPage.tsx itself makes (`hasFullContent`): coming-soon
// records are placeholder-only (no real title/author/description yet) and
// BookPage.tsx now marks their route noindex,follow for that reason — a
// sitemap must never list a noindex URL (Search Console flags this as
// "Submitted URL marked noindex"), so they're excluded here entirely rather
// than just deprioritized. visibleBooks itself stays unfiltered — it also
// feeds authorEntries below, which is unaffected by this phase.
const bookEntries = visibleBooks
  .filter((book) => book.placement !== "comingSoon")
  .map((book) => ({
    path: `/books/${book.id}`,
    lastmod: book.updatedAt,
    changefreq: "monthly",
    priority: "0.8",
  }));

// One entry per unique author reachable from a visible book — mirrors
// AuthorPage's own resolution (every visible book matching a slug, the
// earliest by displayOrder standing in as the representative record).
// Same real-content signal AuthorPage.tsx itself now uses (its own
// `hasFullContent`): an author backed only by coming-soon placeholders
// (e.g. "raqim", where "author" is really just the publisher's own name
// reused as a stand-in) has no real bio/identity and is noindex,follow on
// the page itself — excluded here for the same reason a noindex page must
// never appear in the sitemap.
const authorSlugsInOrder = [...new Set(visibleBooks.map((b) => b.authorSlug))];
const authorEntries = authorSlugsInOrder
  .filter((slug) => visibleBooks.some((b) => b.authorSlug === slug && b.placement !== "comingSoon"))
  .map((slug) => {
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

// SEO Milestone 2 — every indexable Arabic entry gets a matching English
// entry at the same withLanguagePrefix() mapping Helmet/LanguageContext
// already use, same lastmod/changefreq/priority (they're the same
// content, just a different language URL for the same page).
const localizedEntries = dedupedEntries.flatMap((e) => [
  e,
  { ...e, path: withLanguagePrefix(e.path, "en") },
]);

const body = localizedEntries
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
console.log(`Sitemap written to ${OUTPUT_PATH} (${localizedEntries.length} URLs, ${dedupedEntries.length} pages × 2 languages).`);
