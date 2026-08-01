import type { AdminBook } from "../admin/types/book";
import type { AdminArticle } from "../admin/types/article";
import type { Language } from "../context/LanguageContext";
import { absoluteUrl, SITE_NAME, SITE_URL } from "./seo";
import { CONTACT_EMAILS } from "../config/contactEmails";
import { localizeProperName } from "./properNames";

/** Combines any number of schema.org node objects into one JSON-LD script's
 * worth of content via `@graph` — one `<script>` tag per page instead of
 * one per schema, which is the form Google's own docs recommend for pages
 * that legitimately carry more than one schema type. */
export function buildGraph(nodes: object[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": nodes,
  });
}

/** Sitewide Organization schema — real data only. `sameAs` is intentionally
 * omitted: every entry in src/config/socialLinks.ts is still `null` today,
 * so there are no real social profile URLs to list yet. Add them here (and
 * only here) once real ones exist.
 *
 * `logo` and `image` are passed in by the caller (read live from
 * `settings.brand.logo` / the resolved OG image) rather than read from a
 * hardcoded config here — so this schema always reflects whatever the
 * Dashboard currently has selected, the moment it changes, instead of
 * freezing on whatever the seed values were when the site was built. */
export function organizationSchema({ logo, image, language }: { logo: string; image: string; language: Language }) {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: localizeProperName(SITE_NAME, language),
    url: SITE_URL,
    logo: absoluteUrl(logo),
    image: absoluteUrl(image),
    email: CONTACT_EMAILS.contact,
  };
}

/** Sitewide WebSite schema with a real SearchAction — /search is a real,
 * working query page, not a placeholder. */
export function websiteSchema(language: Language) {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: localizeProperName(SITE_NAME, language),
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

/** Generic breadcrumb trail — no visible breadcrumb UI exists on the public
 * site yet, so this is pure structured data describing the real route
 * hierarchy, not a mismatch against something shown on screen. */
export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function bookSchema(book: AdminBook, language: Language) {
  const usdPrice = book.prices.USD;
  return {
    "@type": "Book",
    name: book.title,
    description: book.description,
    url: absoluteUrl(`/books/${book.id}`),
    author: { "@type": "Person", name: localizeProperName(book.author, language) },
    inLanguage: language,
    bookFormat: "https://schema.org/EBook",
    ...(usdPrice && {
      offers: {
        "@type": "Offer",
        price: usdPrice.price,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: absoluteUrl(`/books/${book.id}`),
      },
    }),
  };
}

export function articleSchema(article: AdminArticle, language: Language) {
  return {
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    url: absoluteUrl(`/blog/${article.slug}`),
    inLanguage: language,
    author: { "@type": "Person", name: localizeProperName(article.author, language) },
    publisher: { "@id": `${SITE_URL}/#organization` },
    datePublished: article.publishedAt ?? article.updatedAt,
    dateModified: article.updatedAt,
    ...(article.coverImage && { image: absoluteUrl(article.coverImage) }),
    mainEntityOfPage: absoluteUrl(`/blog/${article.slug}`),
  };
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export function faqPageSchema(faqs: FaqEntry[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
