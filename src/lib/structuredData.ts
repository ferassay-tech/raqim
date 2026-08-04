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

/** Shared Person builder — used for both a book/article's author sub-node
 * and the Author page's own top-level entity, so the same real person is
 * described identically (and, when `slug` is given, identifiably via the
 * same `@id`/`url`) everywhere they appear, instead of each caller
 * hand-rolling its own inline Person object. `slug` is only ever available
 * for book authors (`AdminBook.authorSlug`, always resolvable to a real
 * `/authors/:slug` page) — articles have no dedicated author page today, so
 * their Person node is name-only, exactly as before. */
export function personSchema({
  name,
  slug,
  description,
  language,
}: {
  name: string;
  slug?: string;
  description?: string;
  language: Language;
}) {
  return {
    "@type": "Person",
    ...(slug && {
      "@id": `${SITE_URL}/authors/${slug}#person`,
      url: absoluteUrl(`/authors/${slug}`),
    }),
    name: localizeProperName(name, language),
    ...(description && { description }),
  };
}

/** Generic page-level entity for routes that have no more specific schema
 * type of their own (About, Books/Blog index, Contact, Future Releases,
 * Privacy, Terms) — ties the page back to the sitewide WebSite node via
 * `isPartOf`, the same way every other page's more specific type (Book,
 * Article, Person, FAQPage) already stands on its own. */
export function webPageSchema({
  name,
  description,
  path,
  language,
}: {
  name: string;
  description?: string;
  path: string;
  language: Language;
}) {
  return {
    "@type": "WebPage",
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name,
    ...(description && { description }),
    inLanguage: language,
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

export function bookSchema(book: AdminBook, language: Language) {
  const usdPrice = book.prices.USD;
  return {
    "@type": "Book",
    name: book.title,
    description: book.description,
    url: absoluteUrl(`/books/${book.id}`),
    author: personSchema({ name: book.author, slug: book.authorSlug, language }),
    inLanguage: language,
    bookFormat: "https://schema.org/EBook",
    dateModified: book.updatedAt,
    ...(book.cover && { image: absoluteUrl(book.cover) }),
    ...(book.pages > 0 && { numberOfPages: book.pages }),
    ...(usdPrice && {
      offers: {
        "@type": "Offer",
        price: usdPrice.price,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: absoluteUrl(`/books/${book.id}`),
        ...(book.sku && { sku: book.sku }),
      },
    }),
    // Real, on-page testimonials only — no fabricated rating value, since
    // none is ever collected for a book (AdminBook has no numeric rating
    // field), so an AggregateRating is deliberately never added here.
    ...(book.reviews.length > 0 && {
      review: book.reviews.map((review) => ({
        "@type": "Review",
        reviewBody: review.quote,
        author: { "@type": "Person", name: review.name },
      })),
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
    author: personSchema({ name: article.author, language }),
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
