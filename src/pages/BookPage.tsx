import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";
import { Helmet } from "../components/Helmet";
import { PageShell } from "../components/page-shell";
import { GoldDivider, CornerFlourish, QuoteMark, IconHeart } from "../components/ornaments";
import { StampCTA, UnderlineLink, NumeralCTA } from "../components/cta";
import { Reveal } from "../components/motion-primitives";
import { StructuredData } from "../components/StructuredData";
import PremiumBook3D from "../components/PremiumBook3D";
import { useBooks } from "../admin/context/BooksContext";
import { useSiteContent } from "../admin/context/SiteContentContext";
import { useSettings } from "../admin/context/SettingsContext";
import { useCategories } from "../admin/context/CategoriesContext";
import type { AdminBook } from "../admin/types/book";
import { buildGraph, bookSchema, breadcrumbSchema, faqPageSchema } from "../lib/structuredData";
import { useAssetDimensions } from "../lib/mediaDimensions";
import { useLanguage } from "../context/LanguageContext";
import { localizeProperName } from "../lib/properNames";
import { formatNumeral } from "../lib/numerals";

function formatUsdPrice(n: number): string {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

export default function BookPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getBook } = useBooks();
  const { faqs: globalFaqs } = useSiteContent();
  const { t, language } = useLanguage();
  const book = slug ? getBook(slug) : undefined;

  if (!book || book.deletedAt !== null) return <NotFoundPage />;

  const hasFullContent = book.placement !== "comingSoon";
  const faqItems = book.faq.length > 0 ? book.faq : globalFaqs;
  const getDimensions = useAssetDimensions();
  const coverDims = getDimensions(book.cover);

  const bookJsonLd = buildGraph([
    bookSchema(book, language),
    breadcrumbSchema([
      { name: t("about.breadcrumb.home"), path: "/" },
      { name: t("books.breadcrumb.title"), path: "/books" },
      { name: book.title, path: `/books/${book.id}` },
    ]),
    ...(hasFullContent && faqItems.length > 0 ? [faqPageSchema(faqItems)] : []),
  ]);

  if (!hasFullContent) {
    return (
      <PageShell>
        <Helmet
          title={`${book.title} — ${t("home.hero.titleFallback")}`}
          description={book.description}
          image={book.cover ?? undefined}
          imageWidth={coverDims?.width}
          imageHeight={coverDims?.height}
          path={`/books/${book.id}`}
          type="book"
        />
        <StructuredData json={bookJsonLd} />
        <SimpleBookPage book={book} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Helmet
        title={`${book.title} — ${t("home.hero.titleFallback")}`}
        description={book.description}
        image={book.cover ?? undefined}
        imageWidth={coverDims?.width}
        imageHeight={coverDims?.height}
        path={`/books/${book.id}`}
        type="book"
      />
      <StructuredData json={bookJsonLd} />
      <BookHero book={book} />
      {book.whoFor.length > 0 && <WhoForSection book={book} />}
      {book.longDescription && <StorySection book={book} />}
      {book.chapters.length > 0 && <ChaptersSection book={book} />}
      {book.features.length > 0 && <BenefitsSection book={book} />}
      {book.reviews.length > 0 && <TestimonialsSection book={book} />}
      <AuthorSection book={book} />
      <PurchaseSection book={book} />
      <GuaranteeSection />
      <FaqSection book={book} />
      <FinalCTASection book={book} />
    </PageShell>
  );
}

function BookHero({ book }: { book: AdminBook }) {
  const { settings } = useSettings();
  const getDimensions = useAssetDimensions();
  const heroDims = getDimensions(settings.brand.heroImage);
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-14 lg:px-10 lg:pb-28 lg:pt-20">
      <div className="pointer-events-none absolute inset-0">
        {settings.brand.heroImage && (
          <img
            src={settings.brand.heroImage}
            alt=""
            width={heroDims?.width}
            height={heroDims?.height}
            className="absolute inset-0 h-full w-full object-cover opacity-[0.12]"
            decoding="async"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-ivory via-ivory/95 to-ivory" />
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal className="order-2 flex justify-center lg:order-1 lg:justify-start">
          <div className="relative">
            <div className="absolute -inset-10 -z-10 rounded-full bg-gold/10 blur-3xl" />
            <PremiumBook3D
              cover={book.cover ?? ""}
              alt={book.title}
              previewPages={book.previewPages}
              backCover={book.backCoverImage ?? undefined}
            />
          </div>
        </Reveal>

        <div className="order-1 text-center lg:order-2 lg:text-start">
          {book.badges.length > 0 && (
            <Reveal>
              <p className="text-sm uppercase tracking-[0.25em] text-gold">{book.badges.join(" · ")}</p>
            </Reveal>
          )}
          <Reveal delay={0.08}>
            <h1 className="mt-5 font-display text-5xl leading-[1.15] text-ink md:text-7xl">{book.title}</h1>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="mt-6 flex max-lg:justify-center lg:justify-start">
              <GoldDivider className="h-5 w-52 text-gold" />
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-xl text-balance text-lg leading-loose text-ink-soft lg:mx-0">
              {book.subtitle}
            </p>
          </Reveal>
          <Reveal delay={0.26}>
            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:max-lg:justify-center lg:rtl:justify-end lg:ltr:justify-start">
              <StampCTA href="#purchase">{book.ctaLabel || t("home.cta.orderNow")}</StampCTA>
              <UnderlineLink to={`/authors/${book.authorSlug}`}>{t("book.author.aboutLabel")}</UnderlineLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function WhoForSection({ book }: { book: AdminBook }) {
  const { t } = useLanguage();
  return (
    <section className="bg-cream px-6 py-24 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal className="text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-gold">{t("book.whoFor.eyebrow")}</p>
          <h2 className="mt-4 font-display text-4xl text-ink md:text-5xl">{t("book.whoFor.title")}</h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {book.whoFor.map((line, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="flex items-start gap-4 rounded-[10px] border border-beige bg-ivory p-6">
                <span className="mt-1 shrink-0 text-gold">
                  <IconHeart className="h-6 w-6" />
                </span>
                <p className="text-balance leading-loose text-ink-soft">{line}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function StorySection({ book }: { book: AdminBook }) {
  const getDimensions = useAssetDimensions();
  const galleryDims = getDimensions(book.gallery[0]);
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden px-6 py-24 lg:px-10 lg:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <Reveal>
          <p className="text-sm uppercase tracking-[0.25em] text-gold">{t("book.story.eyebrow")}</p>
          <h2 className="mt-4 text-balance font-display text-4xl leading-tight text-ink md:text-5xl">
            {t("book.story.title")}
          </h2>
          <p className="mt-6 max-w-lg text-balance leading-loose text-ink-soft">{book.longDescription}</p>
        </Reveal>

        {book.gallery[0] && (
          <Reveal delay={0.15} className="relative">
            <div className="relative overflow-hidden rounded-[10px]">
              <img
                src={book.gallery[0]}
                alt={`${t("book.story.imageAltPrefix")}${book.title}`}
                width={galleryDims?.width}
                height={galleryDims?.height}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function ChaptersSection({ book }: { book: AdminBook }) {
  const { t, language } = useLanguage();
  return (
    <section className="bg-cream px-6 py-24 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-gold">{t("book.chapters.eyebrow")}</p>
          <h2 className="mt-4 font-display text-4xl text-ink md:text-5xl">{t("book.chapters.title")}</h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {book.chapters.map((ch, i) => (
            <Reveal key={ch.number} delay={i * 0.08} className={i % 2 === 1 ? "sm:translate-y-6" : ""}>
              <div className="group relative overflow-hidden rounded-[10px] border border-gold/30 bg-ivory p-7 shadow-[0_10px_30px_-18px_rgba(44,36,32,0.2)] transition-transform duration-300 hover:-translate-y-1.5">
                <CornerFlourish className="absolute -left-2 -top-2 h-10 w-10 text-gold/30" />
                <span className="font-logotype text-4xl text-gold">{formatNumeral(ch.number, language)}</span>
                <h3 className="mt-4 font-display text-lg leading-snug text-ink">{ch.title}</h3>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitsSection({ book }: { book: AdminBook }) {
  const { t } = useLanguage();
  return (
    <section className="px-6 py-24 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-gold">{t("book.benefits.eyebrow")}</p>
          <h2 className="mt-4 font-display text-4xl text-ink md:text-5xl">{t("book.benefits.title")}</h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {book.features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06} className={i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}>
              <div
                className={`h-full rounded-[10px] p-7 ${
                  i % 3 === 1 ? "bg-lavender/25" : i % 3 === 2 ? "bg-mauve/20" : "bg-cream"
                }`}
              >
                <h3 className="font-display text-xl text-ink">{f.title}</h3>
                <p className="mt-3 text-balance leading-loose text-ink-soft">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ book }: { book: AdminBook }) {
  const { t } = useLanguage();
  return (
    <section className="bg-mauve/20 px-6 py-24 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-gold">{t("book.testimonials.eyebrow")}</p>
          <h2 className="mt-4 font-display text-4xl text-ink md:text-5xl">{t("book.testimonials.title")}</h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {book.reviews.map((review, i) => (
            <Reveal key={review.name} delay={i * 0.1} className={i === 1 ? "lg:-translate-y-6" : ""}>
              <div className="h-full rounded-[10px] border border-gold/25 bg-ivory p-7">
                <QuoteMark className="h-6 w-9 text-gold/70" />
                <p className="mt-4 text-balance leading-loose text-ink">{review.quote}</p>
                <p className="mt-5 text-sm text-gold">{review.name}</p>
                <p className="text-xs text-ink-soft">{review.role}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function AuthorSection({ book }: { book: AdminBook }) {
  const { t, language } = useLanguage();
  const displayName = localizeProperName(book.author, language);
  return (
    <section className="px-6 py-24 lg:px-10 lg:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-[0.7fr_1.3fr]">
        <Reveal className="flex justify-center">
          <div className="flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-cream to-lavender/40 text-6xl text-gold">
            {displayName.trim().charAt(0) || t("book.author.fallbackInitial")}
          </div>
        </Reveal>
        <Reveal delay={0.1} className="text-center lg:text-start">
          <p className="text-sm uppercase tracking-[0.25em] text-gold">{t("book.author.aboutLabel")}</p>
          <h2 className="mt-4 font-display text-3xl text-ink md:text-4xl">{displayName}</h2>
          {book.authorBio && (
            <p className="mt-5 max-w-2xl text-balance leading-loose text-ink-soft">{book.authorBio}</p>
          )}
          <div className="mt-6 flex max-lg:justify-center lg:rtl:justify-end lg:ltr:justify-start">
            <UnderlineLink to={`/authors/${book.authorSlug}`}>{t("book.author.readMorePrefix")}{displayName.split(" ")[0]}</UnderlineLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PurchaseSection({ book }: { book: AdminBook }) {
  const price = book.prices.USD;
  const { t, language } = useLanguage();
  return (
    <section id="purchase" className="bg-cream px-6 py-24 lg:px-10 lg:py-28">
      <Reveal className="mx-auto max-w-3xl rounded-[10px] border border-gold/30 bg-ivory p-10 text-center lg:p-14">
        <p className="text-sm uppercase tracking-[0.25em] text-gold">{t("book.purchase.eyebrow")}</p>
        <h2 className="mt-4 font-display text-3xl text-ink md:text-4xl">{book.title}</h2>
        {price && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="font-logotype text-4xl text-ink">{formatUsdPrice(price.price)}</span>
            {price.compareAtPrice && (
              <span className="text-lg text-ink-soft line-through">{formatUsdPrice(price.compareAtPrice)}</span>
            )}
          </div>
        )}
        <p className="mt-2 text-sm text-ink-soft">
          {book.format} · {formatNumeral(book.pages, language)} {t("book.purchase.pages")} · {book.language}
        </p>
        <div className="mt-8 flex justify-center">
          <StampCTA to="/checkout">{book.ctaLabel || t("home.cta.orderNow")}</StampCTA>
        </div>
        <p className="mt-4 text-xs text-ink-soft">{t("book.purchase.helperText")}</p>
      </Reveal>
    </section>
  );
}

function GuaranteeSection() {
  const { getValue } = useSiteContent();
  const { t } = useLanguage();
  return (
    <section className="px-6 py-24 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-5xl grid grid-cols-1 gap-10 lg:grid-cols-2 items-center">
        <Reveal className="flex justify-center lg:justify-start">
          <NumeralCTA
            numeral="✓"
            label={t("book.guarantee.instantDownloadLabel")}
            to="/faq"
          />
        </Reveal>

        <Reveal delay={0.1} className="text-center lg:text-start">
          <h2 className="font-display text-3xl leading-tight text-ink md:text-4xl">
            {getValue("bookpage.guarantee.title")}
          </h2>

          <p className="mt-4 max-w-md text-balance leading-loose text-ink-soft lg:ms-0 lg:me-auto">
            {getValue("bookpage.guarantee.body")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function FaqSection({ book }: { book: AdminBook }) {
  const [open, setOpen] = useState<number | null>(0);
  const { faqs: globalFaqs } = useSiteContent();
  const { t } = useLanguage();
  const faqItems = book.faq.length > 0 ? book.faq : globalFaqs;

  if (faqItems.length === 0) return null;

  return (
    <section className="bg-cream px-6 py-24 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-gold">{t("book.faq.eyebrow")}</p>
          <h2 className="mt-4 font-display text-4xl text-ink md:text-5xl">{t("book.faq.title")}</h2>
        </Reveal>

        <div className="mt-12 divide-y divide-beige border-y border-beige">
          {faqItems.map((faq, i) => {
            const panelId = `book-faq-panel-${i}`;
            const buttonId = `book-faq-button-${i}`;
            const isOpen = open === i;
            return (
              <div key={faq.question} className="py-5">
                <button
                  id={buttonId}
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex w-full items-center justify-between gap-4 text-start"
                >
                  <span className="font-display text-lg text-ink">{faq.question}</span>
                  <span className={`shrink-0 text-gold transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>
                    +
                  </span>
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="grid overflow-hidden transition-all duration-300"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="pt-4 text-balance leading-loose text-ink-soft">{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCTASection({ book }: { book: AdminBook }) {
  const { getValue } = useSiteContent();
  const getDimensions = useAssetDimensions();
  const patternDims = getDimensions("/assets/arabesque-pattern.webp");
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden px-6 py-28 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <img
          src="/assets/arabesque-pattern.webp"
          alt=""
          width={patternDims?.width}
          height={patternDims?.height}
          className="absolute inset-0 h-full w-full object-cover opacity-[0.08]"
          decoding="async"
        />
      </div>
      <Reveal className="relative mx-auto max-w-2xl text-center">
        <h2 className="text-balance font-display text-3xl leading-tight text-ink md:text-4xl">
          {getValue("bookpage.finalCta.title")}
        </h2>
        <p className="mt-4 text-balance leading-loose text-ink-soft">
          {t("book.finalCta.bodyPrefix")}{book.title}{t("book.finalCta.bodySuffix")}
        </p>
        <div className="mt-8 flex justify-center">
          <StampCTA href="#purchase">{book.ctaLabel || t("home.cta.orderNow")}</StampCTA>
        </div>
      </Reveal>
    </section>
  );
}

function SimpleBookPage({ book }: { book: AdminBook }) {
  const getDimensions = useAssetDimensions();
  const coverDims = getDimensions(book.cover);
  const { t, language } = useLanguage();
  const { getCategoryLabel } = useCategories();
  return (
    <>
      <section className="px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <Reveal className="flex justify-center">
            <div className="rounded-[10px] bg-gradient-to-br from-cream to-beige p-10">
              {book.cover && (
                <img
                  src={book.cover}
                  alt={book.title}
                  width={coverDims?.width}
                  height={coverDims?.height}
                  className="w-full max-w-sm object-contain drop-shadow-xl"
                  decoding="async"
                />
              )}
            </div>
          </Reveal>
          <Reveal delay={0.1} className="text-center lg:text-start">
            <p className="text-sm uppercase tracking-[0.25em] text-gold">{getCategoryLabel(book.category)}</p>
            <h1 className="mt-4 font-display text-4xl text-ink md:text-5xl">{book.title}</h1>
            <p className="mt-4 text-balance leading-loose text-ink-soft">{book.subtitle}</p>
            <p className="mt-6 max-w-lg text-balance leading-loose text-ink-soft">{book.description}</p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:max-lg:justify-center lg:rtl:justify-end lg:ltr:justify-start">
              <div className="rounded-[10px] border border-gold/30 bg-cream px-8 py-4 text-center">
                <p className="font-display text-lg text-gold">{t("book.comingSoon.badge")}</p>
                <p className="mt-2 text-sm text-ink-soft">{t("book.comingSoon.helperText")}</p>
              </div>
              <UnderlineLink to={`/authors/${book.authorSlug}`}>{t("book.comingSoon.aboutAuthorPrefix")}{localizeProperName(book.author, language)}</UnderlineLink>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="bg-cream px-6 py-16 text-center lg:px-10">
        <Link to="/books" className="text-sm text-gold hover:underline">
          {t("book.comingSoon.backToBooks")}
        </Link>
      </section>
    </>
  );
}
