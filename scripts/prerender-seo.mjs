#!/usr/bin/env node
/**
 * Writes a correctly-populated static index.html for every indexable route
 * (both languages) into dist/, run once at build time AFTER `vite build`
 * (see the "build" script in package.json) — the fix for this project's
 * dominant SEO problem: a plain Vite SPA serves the exact same index.html
 * for every route, so any crawler that doesn't execute JavaScript sees the
 * homepage's title/description/canonical on every page (SEO audit,
 * 2026-08-14, confirmed live via curl on /books/kuni-hajar, /en,
 * /blog/athar-la-yunsa, /authors/maha-nasr).
 *
 * This does NOT replace Helmet.tsx or React Router. It writes additional
 * static files; the app's own JS still mounts normally on top of whichever
 * one Vercel serves and Helmet still runs and keeps the client-side
 * navigation experience exactly as it already was. This only changes what
 * the FIRST HTTP response contains, for crawlers and any consumer that
 * doesn't run JS at all (link-preview bots, some secondary crawlers).
 *
 * Deliberately reuses, not reimplements, the site's real SEO logic:
 *   - route enumeration: scripts/lib/indexableRoutes.mjs (same module
 *     scripts/generate-sitemap.mjs uses — one list of indexable routes).
 *   - title/description formulas: resolveBookSeoTitle/resolveBookSeoDescription/
 *     resolveArticleSeoTitle/resolveArticleSeoDescription/resolveAuthorSeoTitle
 *     in src/lib/seo.ts — the exact same functions BookPage.tsx/
 *     BlogPostPage.tsx/AuthorPage.tsx call for the client-side <Helmet>.
 *   - structured data: buildGraph/organizationSchema/websiteSchema/
 *     bookSchema/articleSchema/personSchema/breadcrumbSchema/webPageSchema/
 *     faqPageSchema in src/lib/structuredData.ts — the exact same functions
 *     each page's own <StructuredData> already uses.
 * If either of those change, this script's output changes with them —
 * there is no second, hand-copied SEO system to keep in sync.
 *
 * KNOWN LIMITATION (inherited from scripts/lib/indexableRoutes.mjs, same
 * one scripts/generate-sitemap.mjs has always had): reads the build-time
 * seed data (INITIAL_BOOKS/INITIAL_ARTICLES/INITIAL_SETTINGS), not live
 * Supabase — a book/article/setting only edited through the Admin
 * dashboard since the last deploy won't be reflected here until a
 * redeploy with updated seed files.
 *
 * Vercel serving note: requires "cleanUrls": true in vercel.json (added
 * alongside this script) so a request to /books/kuni-hajar resolves the
 * static dist/books/kuni-hajar/index.html this script writes, instead of
 * always falling through to the SPA catch-all rewrite. This can only be
 * conclusively confirmed against Vercel's actual routing after a real
 * deploy — see the SEO report for what was verified locally vs. what
 * still needs a post-deploy check.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_WIDTH,
  DEFAULT_OG_IMAGE_HEIGHT,
  absoluteUrl,
  withLanguagePrefix,
  resolveBookSeoTitle,
  resolveBookSeoDescription,
  resolveArticleSeoTitle,
  resolveArticleSeoDescription,
  resolveAuthorSeoTitle,
} from "../src/lib/seo.ts";
import {
  buildGraph,
  organizationSchema,
  websiteSchema,
  webPageSchema,
  breadcrumbSchema,
  personSchema,
  bookSchema,
  articleSchema,
  faqPageSchema,
} from "../src/lib/structuredData.ts";
import { localizeProperName } from "../src/lib/properNames.ts";
import { getIndexableRoutes } from "./lib/indexableRoutes.mjs";
import { INITIAL_SETTINGS } from "../src/admin/data/settingsData.ts";
import { INITIAL_GLOBAL_FAQS } from "../src/admin/data/siteContentData.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = resolve(__dirname, "../dist");
const TEMPLATE = readFileSync(join(DIST_DIR, "index.html"), "utf-8");

const AR_STRINGS = JSON.parse(readFileSync(resolve(__dirname, "../src/i18n/ar.json"), "utf-8"));
const EN_STRINGS = JSON.parse(readFileSync(resolve(__dirname, "../src/i18n/en.json"), "utf-8"));
const STRINGS = { ar: AR_STRINGS, en: EN_STRINGS };
const t = (lang, key) => STRINGS[lang][key] ?? key;

const FALLBACK_LANG = "ar";
const resolveText = (value, lang) => (value ? value[lang] || value[FALLBACK_LANG] || "" : "");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Per-language plain-string view of a raw bilingual book — same shape
 * BooksContext's own (private, unexported) resolveBook() produces, just
 * reimplemented here since importing BooksContext.tsx would pull in its
 * Supabase client. Only the fields bookSchema()/resolveBookSeoTitle() /
 * resolveBookSeoDescription() actually read. */
function resolveBookForLang(raw, lang) {
  return {
    id: raw.id,
    title: resolveText(raw.title, lang),
    description: resolveText(raw.description, lang),
    author: localizeProperName(raw.author, lang),
    authorSlug: raw.authorSlug,
    seoTitle: resolveText(raw.seoTitle, lang),
    seoDescription: resolveText(raw.seoDescription, lang),
    cover: raw.cover,
    pages: raw.pages,
    updatedAt: raw.updatedAt,
    sku: raw.sku,
    prices: raw.prices,
    reviews: (raw.reviews ?? []).map((r) => ({
      quote: resolveText(r.quote, lang),
      name: resolveText(r.name, lang),
      role: resolveText(r.role, lang),
      rating: r.rating,
    })),
  };
}

function resolveArticleForLang(raw, lang) {
  return {
    slug: raw.slug,
    title: resolveText(raw.title, lang),
    excerpt: resolveText(raw.excerpt, lang),
    author: localizeProperName(raw.author, lang),
    coverImage: raw.coverImage,
    publishedAt: raw.publishedAt,
    updatedAt: raw.updatedAt,
    seoTitle: resolveText(raw.seoTitle, lang),
    seoDescription: resolveText(raw.seoDescription, lang),
  };
}

function homeCrumb(lang) {
  return { name: t(lang, "about.breadcrumb.home"), path: "/" };
}

/**
 * Replaces the language-dependent parts of the built index.html template
 * (title, description, canonical, OG/Twitter, robots, hreflang, JSON-LD,
 * html lang/dir) via targeted string replacement — deliberately not a full
 * HTML parse, matching this project's existing build-script style
 * (generate-sitemap.mjs has no HTML/XML parser dependency either). Every
 * regex targets a uniquely-identifying attribute so tag attribute order
 * doesn't matter; everything else in the template (GTM script, favicon
 * links, font preloads, the built hashed <script>/<link> tags, <body>) is
 * left completely untouched.
 */
function renderHead({
  lang,
  dir,
  title,
  description,
  canonicalUrl,
  ogType,
  image,
  imageWidth,
  imageHeight,
  imageAlt,
  robots,
  hreflang,
  jsonLd,
  publishedTime,
  modifiedTime,
}) {
  let html = TEMPLATE;

  html = html.replace(/<html[^>]*>/, `<html lang="${lang}" dir="${dir}">`);
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
  html = html.replace(
    /<meta\s+name=["']robots["'][^>]*>/i,
    `<meta name="robots" content="${robots}" />`
  );
  html = html.replace(
    /<meta\s+property=["']og:site_name["'][^>]*>/i,
    `<meta property="og:site_name" content="${escapeHtml(localizeProperName(SITE_NAME, lang))}" />`
  );
  html = html.replace(/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`);
  html = html.replace(
    /<meta\s+property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  );
  html = html.replace(/<meta\s+property=["']og:type["'][^>]*>/i, `<meta property="og:type" content="${ogType}" />`);
  html = html.replace(/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
  html = html.replace(
    /<meta\s+property=["']og:locale["'][^>]*>/i,
    `<meta property="og:locale" content="${lang === "ar" ? "ar_AR" : "en_US"}" />`
  );
  html = html.replace(/<meta\s+property=["']og:image["'][^>]*>/i, `<meta property="og:image" content="${image}" />`);
  html = html.replace(
    /<meta\s+property=["']og:image:alt["'][^>]*>/i,
    `<meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />`
  );
  if (imageWidth) {
    html = html.replace(/<meta\s+property=["']og:image:width["'][^>]*>/i, `<meta property="og:image:width" content="${imageWidth}" />`);
  }
  if (imageHeight) {
    html = html.replace(/<meta\s+property=["']og:image:height["'][^>]*>/i, `<meta property="og:image:height" content="${imageHeight}" />`);
  }
  html = html.replace(/<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
  html = html.replace(
    /<meta\s+name=["']twitter:description["'][^>]*>/i,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`
  );
  html = html.replace(/<meta\s+name=["']twitter:image["'][^>]*>/i, `<meta name="twitter:image" content="${image}" />`);
  html = html.replace(
    /<meta\s+name=["']twitter:image:alt["'][^>]*>/i,
    `<meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}" />`
  );

  const extra = [
    ...hreflang.map((h) => `<link rel="alternate" hreflang="${h.hreflang}" href="${h.href}" />`),
    publishedTime ? `<meta property="article:published_time" content="${publishedTime}" />` : "",
    modifiedTime ? `<meta property="article:modified_time" content="${modifiedTime}" />` : "",
    jsonLd ? `<script type="application/ld+json">${jsonLd}</script>` : "",
  ]
    .filter(Boolean)
    .join("\n    ");
  html = html.replace("</head>", `    ${extra}\n  </head>`);

  return html;
}

function hreflangFor(barePath) {
  return [
    { hreflang: "ar", href: absoluteUrl(barePath) },
    { hreflang: "en", href: absoluteUrl(withLanguagePrefix(barePath, "en")) },
    { hreflang: "x-default", href: absoluteUrl(barePath) },
  ];
}

function writeRoute(barePath, lang, html) {
  const langPath = withLanguagePrefix(barePath, lang);
  const outDir = langPath === "/" ? DIST_DIR : join(DIST_DIR, langPath);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html, "utf-8");
}

let written = 0;

function renderAndWrite(barePath, lang, opts) {
  const langPath = withLanguagePrefix(barePath, lang);
  const canonicalUrl = absoluteUrl(langPath);
  const html = renderHead({
    lang,
    dir: lang === "ar" ? "rtl" : "ltr",
    canonicalUrl,
    ogType: "website",
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    imageWidth: DEFAULT_OG_IMAGE_WIDTH,
    imageHeight: DEFAULT_OG_IMAGE_HEIGHT,
    robots: "index,follow",
    hreflang: hreflangFor(barePath),
    ...opts,
  });
  writeRoute(barePath, lang, html);
  written += 1;
}

const socialImage = INITIAL_SETTINGS.seo.socialImage ?? DEFAULT_OG_IMAGE;
const brandLogo = INITIAL_SETTINGS.brand.logo ?? "/Raqim-logo.webp";

const { books, authors, articles, blogIndexLastmod } = getIndexableRoutes();

for (const lang of /** @type {const} */ (["ar", "en"])) {
  // Home
  {
    const orgAndSite = [
      organizationSchema({ logo: brandLogo, image: socialImage, language: lang }),
      websiteSchema(lang),
    ];
    renderAndWrite("/", lang, {
      title: resolveText(INITIAL_SETTINGS.seo.title, lang),
      description: resolveText(INITIAL_SETTINGS.seo.description, lang),
      imageAlt: resolveText(INITIAL_SETTINGS.seo.title, lang),
      jsonLd: buildGraph(orgAndSite),
    });
  }

  // Books index
  renderAndWrite("/books", lang, {
    title: `${t(lang, "books.seo.title")}`,
    description: t(lang, "books.seo.description"),
    imageAlt: t(lang, "books.seo.title"),
    jsonLd: buildGraph([
      webPageSchema({ name: t(lang, "books.seo.title"), description: t(lang, "books.seo.description"), path: "/books", language: lang }),
      breadcrumbSchema([homeCrumb(lang), { name: t(lang, "books.breadcrumb.title"), path: "/books" }], lang),
    ]),
  });

  // Book detail pages
  for (const raw of books) {
    const book = resolveBookForLang(raw, lang);
    const title = resolveBookSeoTitle(book, t(lang, "home.hero.titleFallback"));
    const description = resolveBookSeoDescription(book);
    renderAndWrite(`/books/${book.id}`, lang, {
      title,
      description,
      ogType: "book",
      image: absoluteUrl(book.cover ?? DEFAULT_OG_IMAGE),
      imageAlt: title,
      jsonLd: buildGraph([
        bookSchema(book, lang),
        breadcrumbSchema(
          [homeCrumb(lang), { name: t(lang, "books.breadcrumb.title"), path: "/books" }, { name: book.title, path: `/books/${book.id}` }],
          lang
        ),
      ]),
    });
  }

  // Future releases
  renderAndWrite("/future-releases", lang, {
    title: t(lang, "futureReleases.seo.title"),
    description: t(lang, "futureReleases.seo.description"),
    imageAlt: t(lang, "futureReleases.seo.title"),
    jsonLd: buildGraph([
      webPageSchema({ name: t(lang, "futureReleases.seo.title"), path: "/future-releases", language: lang }),
    ]),
  });

  // About
  renderAndWrite("/about", lang, {
    title: t(lang, "about.seo.title"),
    description: t(lang, "about.seo.description"),
    imageAlt: t(lang, "about.seo.title"),
    jsonLd: buildGraph([webPageSchema({ name: t(lang, "about.seo.title"), path: "/about", language: lang })]),
  });

  // Authors
  for (const { slug, primaryBook: rawPrimaryBook } of authors) {
    const book = resolveBookForLang(rawPrimaryBook, lang);
    const displayName = localizeProperName(rawPrimaryBook.author, lang);
    const title = resolveAuthorSeoTitle(displayName, t(lang, "author.seoTitleSuffix"));
    const bio = resolveText(rawPrimaryBook.authorBio, lang);
    renderAndWrite(`/authors/${slug}`, lang, {
      title,
      description: bio,
      imageAlt: displayName,
      jsonLd: buildGraph([
        personSchema({ name: rawPrimaryBook.author, slug, description: bio, language: lang }),
        breadcrumbSchema([homeCrumb(lang), { name: displayName, path: `/authors/${slug}` }], lang),
      ]),
    });
  }

  // Blog index
  renderAndWrite("/blog", lang, {
    title: t(lang, "blog.seo.title"),
    description: t(lang, "blog.seo.description"),
    imageAlt: t(lang, "blog.seo.title"),
    jsonLd: buildGraph([
      webPageSchema({ name: t(lang, "blog.seo.title"), description: t(lang, "blog.seo.description"), path: "/blog", language: lang }),
      breadcrumbSchema([homeCrumb(lang), { name: t(lang, "blog.breadcrumb.title"), path: "/blog" }], lang),
    ]),
  });

  // Blog articles
  for (const raw of articles) {
    const article = resolveArticleForLang(raw, lang);
    const title = resolveArticleSeoTitle(article, t(lang, "blog.post.seoTitleSuffix"));
    const description = resolveArticleSeoDescription(article);
    const authorSlug = raw.author === "مها نصر" ? "maha-nasr" : undefined;
    renderAndWrite(`/blog/${article.slug}`, lang, {
      title,
      description,
      ogType: "article",
      image: absoluteUrl(article.coverImage ?? DEFAULT_OG_IMAGE),
      imageAlt: title,
      publishedTime: article.publishedAt ?? undefined,
      modifiedTime: article.updatedAt,
      jsonLd: buildGraph([
        articleSchema(article, lang, authorSlug),
        organizationSchema({ logo: brandLogo, image: socialImage, language: lang }),
        breadcrumbSchema(
          [homeCrumb(lang), { name: t(lang, "blog.breadcrumb.title"), path: "/blog" }, { name: article.title, path: `/blog/${article.slug}` }],
          lang
        ),
      ]),
    });
  }

  // Contact / FAQ
  renderAndWrite("/contact", lang, {
    title: t(lang, "contact.seo.title"),
    description: t(lang, "contact.seo.description"),
    imageAlt: t(lang, "contact.seo.title"),
    jsonLd: buildGraph([webPageSchema({ name: t(lang, "contact.seo.title"), path: "/contact", language: lang })]),
  });

  {
    const faqs = INITIAL_GLOBAL_FAQS.map((f) => ({
      question: resolveText(f.question, lang),
      answer: resolveText(f.answer, lang),
    }));
    renderAndWrite("/faq", lang, {
      title: t(lang, "faq.seo.title"),
      description: t(lang, "faq.seo.description"),
      imageAlt: t(lang, "faq.seo.title"),
      jsonLd: buildGraph([
        webPageSchema({ name: t(lang, "faq.seo.title"), path: "/faq", language: lang }),
        ...(faqs.length > 0 ? [faqPageSchema(faqs)] : []),
      ]),
    });
  }

  // Privacy / Terms — same sitemap-listed static legal pages
  // scripts/generate-sitemap.mjs has always included (trailingStaticEntries);
  // missed on the prerender script's first pass, added here to match.
  renderAndWrite("/privacy", lang, {
    title: t(lang, "privacy.seo.title"),
    description: t(lang, "privacy.seo.description"),
    imageAlt: t(lang, "privacy.seo.title"),
    jsonLd: buildGraph([webPageSchema({ name: t(lang, "privacy.seo.title"), path: "/privacy", language: lang })]),
  });

  renderAndWrite("/terms", lang, {
    title: t(lang, "terms.seo.title"),
    description: t(lang, "terms.seo.description"),
    imageAlt: t(lang, "terms.seo.title"),
    jsonLd: buildGraph([webPageSchema({ name: t(lang, "terms.seo.title"), path: "/terms", language: lang })]),
  });
}

console.log(`Prerendered SEO HTML written for ${written} route/language files under ${DIST_DIR}.`);
