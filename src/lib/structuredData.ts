import type { AdminBook } from "../admin/types/book";
import type { AdminArticle } from "../admin/types/article";
import type { Language } from "../context/LanguageContext";
import { absoluteUrl, SITE_NAME, SITE_URL, withLanguagePrefix } from "./seo.ts";
import { CONTACT_EMAILS } from "../config/contactEmails.ts";
import { localizeProperName } from "./properNames.ts";

/** Combines any number of schema.org node objects into one JSON-LD script's
 * worth of content via `@graph` — one `<script>` tag per page instead of
 * one per schema, which is the form Google's own docs recommend for pages
 * that legitimately carry more than one schema type.
 *
 * The result is injected directly into a `<script>` tag via
 * dangerouslySetInnerHTML (see StructuredData.tsx) — JSON.stringify alone
 * does not escape "<", so a field containing a literal "</script>" (e.g. an
 * admin-authored book title or review quote) would otherwise close the tag
 * early at the HTML-parser level. Escaping "<" as its unicode form here,
 * once, centrally, makes every schema this function ever returns safe to
 * embed — the JSON meaning is unchanged (< decodes back to "<" for any
 * real JSON-LD consumer), no schema field or SEO behavior is affected. */
export function buildGraph(nodes: object[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": nodes,
  }).replace(/</g, "\\u003c");
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
export function breadcrumbSchema(items: BreadcrumbItem[], language: Language) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(withLanguagePrefix(item.path, language)),
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
  const localizedAuthorUrl = slug ? absoluteUrl(withLanguagePrefix(`/authors/${slug}`, language)) : undefined;
  return {
    "@type": "Person",
    ...(slug && {
      "@id": `${localizedAuthorUrl}#person`,
      url: localizedAuthorUrl,
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
  const localizedUrl = absoluteUrl(withLanguagePrefix(path, language));
  return {
    "@type": "WebPage",
    "@id": `${localizedUrl}#webpage`,
    url: localizedUrl,
    name,
    ...(description && { description }),
    inLanguage: language,
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

export function bookSchema(book: AdminBook, language: Language) {
  const usdPrice = book.prices.USD;
  const localizedBookUrl = absoluteUrl(withLanguagePrefix(`/books/${book.id}`, language));
  return {
    "@type": "Book",
    name: book.title,
    description: book.description,
    url: localizedBookUrl,
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
        url: localizedBookUrl,
        ...(book.sku && { sku: book.sku }),
      },
    }),
    // Real, on-page testimonials, each with its own real reviewRating
    // (AdminBook.reviews[].rating — an actual stored value, never guessed),
    // plus an AggregateRating computed live from those same stored ratings.
    // Nothing here is hardcoded: add, remove, or re-rate a review in the
    // Dashboard and reviewCount/ratingValue recompute from that same data
    // the next time this schema is built.
    ...(book.reviews.length > 0 && {
      review: book.reviews.map((review) => ({
        "@type": "Review",
        reviewBody: review.quote,
        author: { "@type": "Person", name: review.name },
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1,
        },
      })),
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue:
          Math.round(
            (book.reviews.reduce((sum, review) => sum + review.rating, 0) / book.reviews.length) * 10
          ) / 10,
        reviewCount: book.reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };
}

export function articleSchema(article: AdminArticle, language: Language, authorSlug?: string) {
  const localizedArticleUrl = absoluteUrl(withLanguagePrefix(`/blog/${article.slug}`, language));
  return {
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    url: localizedArticleUrl,
    inLanguage: language,
    author: personSchema({ name: article.author, slug: authorSlug, language }),
    publisher: { "@id": `${SITE_URL}/#organization` },
    datePublished: article.publishedAt ?? article.updatedAt,
    dateModified: article.updatedAt,
    ...(article.coverImage && { image: absoluteUrl(article.coverImage) }),
    mainEntityOfPage: localizedArticleUrl,
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
