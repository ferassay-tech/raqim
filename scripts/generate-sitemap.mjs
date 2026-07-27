#!/usr/bin/env node
/**
 * Generates public/sitemap.xml from the site's real, current content.
 *
 * This app has no backend, so this script can't query live data — the
 * slugs/dates below are copied from the same seed files the app itself
 * ships (src/admin/data/booksData.ts, src/admin/data/articlesData.ts).
 * Re-run `npm run generate-sitemap` whenever a book/article is added,
 * removed, hidden, or its content changes, so this stays accurate.
 *
 * Deliberately excluded: /admin (private), and every noindex utility/
 * transactional page (/search, /checkout, /payment/:method,
 * /order-received, /download/:token) — a sitemap should only list what's
 * actually meant to be indexed.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const SITE_URL = "https://r-aqim.com";
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, "../public/sitemap.xml");

/** @type {{ path: string; lastmod: string; changefreq: string; priority: string }[]} */
const entries = [
  { path: "/", lastmod: "2026-07-27", changefreq: "daily", priority: "1.0" },
  { path: "/books", lastmod: "2026-07-27", changefreq: "weekly", priority: "0.8" },
  { path: "/books/kuni-hajar", lastmod: "2026-07-27", changefreq: "monthly", priority: "0.8" },
  { path: "/books/coming-soon-1", lastmod: "2026-07-27", changefreq: "monthly", priority: "0.6" },
  { path: "/books/coming-soon-2", lastmod: "2026-07-27", changefreq: "monthly", priority: "0.6" },
  { path: "/books/coming-soon-3", lastmod: "2026-07-27", changefreq: "monthly", priority: "0.6" },
  { path: "/future-releases", lastmod: "2026-07-27", changefreq: "weekly", priority: "0.6" },
  { path: "/about", lastmod: "2026-07-27", changefreq: "yearly", priority: "0.6" },
  { path: "/authors/maha-nasr", lastmod: "2026-07-27", changefreq: "monthly", priority: "0.6" },
  { path: "/blog", lastmod: "2026-06-12", changefreq: "weekly", priority: "0.7" },
  { path: "/blog/athar-la-yunsa", lastmod: "2026-06-12", changefreq: "monthly", priority: "0.6" },
  { path: "/blog/sabr-hajar", lastmod: "2026-05-28", changefreq: "monthly", priority: "0.6" },
  { path: "/blog/kitab-hadiya", lastmod: "2026-05-10", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", lastmod: "2026-07-27", changefreq: "yearly", priority: "0.5" },
  { path: "/faq", lastmod: "2026-07-27", changefreq: "monthly", priority: "0.6" },
  { path: "/privacy", lastmod: "2026-07-27", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", lastmod: "2026-07-27", changefreq: "yearly", priority: "0.3" },
];

const body = entries
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
console.log(`Sitemap written to ${OUTPUT_PATH} (${entries.length} URLs).`);
