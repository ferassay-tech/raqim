import { lazy, Suspense, useMemo } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../components/page-shell";
import { GoldDivider, CornerFlourish, ArchFrame, QuoteMark, IconBook, IconHeart, IconOpenHands } from "../components/ornaments";
import { StampCTA, UnderlineLink } from "../components/cta";
import {Reveal,ParallaxLayer,CursorDrift,Floating,MouseTilt,} from "../components/motion-primitives";
import { StructuredData } from "../components/StructuredData";
import { Helmet } from "../components/Helmet";
import { useBooks } from "../admin/context/BooksContext";
import type { AdminBook } from "../admin/types/book";
import { isInLibraryGrid } from "../admin/lib/bookPlacement";
import { useSettings } from "../admin/context/SettingsContext";
import { useCategories } from "../admin/context/CategoriesContext";
import { useLanguage } from "../context/LanguageContext";
import { buildGraph, bookSchema, organizationSchema, websiteSchema } from "../lib/structuredData";
import { useAssetDimensions } from "../lib/mediaDimensions";
import { DEFAULT_OG_IMAGE } from "../lib/seo";
import { localizeProperName } from "../lib/properNames";
import { BRAND_ASSETS } from "../config/brandAssets";

// Lazy-loaded: pulls in react-pageflip + motion, kept out of the main
// public bundle every visitor downloads (HomePage is the highest-traffic
// route) — only fetched when this component actually renders.
const PremiumBook3D = lazy(() => import("../components/PremiumBook3D"));

// Every Hero* atmosphere component (HeroLight, HeroClouds, HeroParticles,
// HeroBirds, HeroForeground) and the shared ambient mask are temporarily
// not rendered anywhere on the homepage — components and assets are kept
// in place on disk, untouched, pending a from-first-principles atmosphere
// redesign. This is a deliberate, temporary reset, not a permanent removal.

const byOrder = (a: AdminBook, b: AdminBook) => a.displayOrder - b.displayOrder;

export default function HomePage() {
  const { books } = useBooks();
  const { settings } = useSettings();
  const { language } = useLanguage();

  const activeBooks = useMemo(() => books.filter((b) => b.deletedAt === null), [books]);
  const heroBook = useMemo(
    () => [...activeBooks].filter((b) => b.placement === "hero").sort(byOrder)[0] ?? null,
    [activeBooks]
  );
  const featuredBook = useMemo(() => {
    const dedicated = [...activeBooks].filter((b) => b.placement === "featured").sort(byOrder)[0];
    return dedicated ?? heroBook;
  }, [activeBooks, heroBook]);
  const libraryBooks = useMemo(
    () => [...activeBooks].filter((b) => isInLibraryGrid(b.placement)).sort(byOrder),
    [activeBooks]
  );

  const homeJsonLd = buildGraph([
    organizationSchema({
      logo: settings.brand.logo ?? BRAND_ASSETS.logo,
      image: settings.seo.socialImage ?? DEFAULT_OG_IMAGE,
      language,
    }),
    websiteSchema(language),
    ...(heroBook ? [bookSchema(heroBook, language)] : []),
  ]);

  return (
    <PageShell>
      <Helmet title={settings.seo.title} description={settings.seo.description} path="/" />
      <StructuredData json={homeJsonLd} />
      <HeroSection book={heroBook} />
      <PhilosophySection />
      {featuredBook && <FeaturedBookSection book={featuredBook} />}
      <BooksGridSection books={libraryBooks} />
      <QuoteSection />
      <FinalCTASection book={heroBook} />
    </PageShell>
  );
}

function HeroSection({ book }: { book: AdminBook | null }) {
  const { t } = useLanguage();
  return (
    <section className="isolate relative overflow-hidden px-6 pb-14 pt-14 lg:px-10 lg:pb-20 lg:pt-20">
      {/* background watercolor plate, muted — fades into Philosophy's cream by the bottom edge so the two sections read as one continuous scene */}
<div className="pointer-events-none absolute inset-0">
  <div className="absolute inset-0 bg-gradient-to-b from-ivory via-ivory to-cream" />
</div>

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        {/* book cutout — bottom-left per brief's editorial-offset architecture */}
        {book && (
        <div className="relative order-2 flex justify-center lg:order-1 lg:justify-start">
          <ParallaxLayer speed={0.08} className="relative">
           <Floating amplitude={8} duration={6}>
            <MouseTilt>
            <CursorDrift strength={8}>
             <div className="relative">
                <div className="absolute -inset-10 -z-10 rounded-full bg-gold/10 blur-3xl" />
                <div className="relative">
  {/* Luxury cinematic glow */}
  <div
    className="
      pointer-events-none
      absolute
      left-1/2
      top-1/2
      -z-10
      h-[520px]
      w-[520px]
      -translate-x-1/2
      -translate-y-1/2
      rounded-full
      bg-[#D4AF37]/10
      blur-[120px]
    "
  />

  {/* Shadow under the book */}
  <div className="absolute inset-x-10 -bottom-8 h-10 rounded-full bg-black/20 blur-2xl" />

  {/* Subtle rim light */}
  <div className="pointer-events-none absolute inset-0 -z-10 rounded-[16px] bg-gold/15 blur-2xl" />

  <Suspense fallback={null}>
    <PremiumBook3D
      cover={book.cover ?? ""}
      alt={book.title}
    />
  </Suspense>

  {/* Soft luxury highlight */}
  <div
    className="
      pointer-events-none
      absolute
      inset-0
      rounded-[10px]
      bg-gradient-to-br
      from-white/20
      via-transparent
      to-transparent
    "
  />
  <div
    className="
      pointer-events-none
      absolute
      inset-0
      rounded-[10px]
      bg-gradient-to-br
      from-white/30
      via-transparent
      to-transparent
    "
  />
</div>
                     </div>
                   </CursorDrift>
                 </MouseTilt>
               </Floating>
            </ParallaxLayer>
        </div>
        )}

        {/* headline block — top-right, RTL primary reading direction */}
        <div className="order-1 text-center lg:order-2 lg:text-start">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.25em] text-gold">{t("home.hero.eyebrow")}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 text-balance font-display text-5xl leading-[1.15] text-ink md:text-7xl">
              {book?.title ?? t("home.hero.titleFallback")}
            </h1>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="mt-6 flex max-lg:justify-center lg:justify-start">
              <GoldDivider className="h-5 w-52 text-gold" />
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-xl text-balance text-lg leading-loose text-ink-soft lg:mx-0">
              {t("home.hero.subtitle")}
            </p>
          </Reveal>
          <Reveal delay={0.26}>
            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:max-lg:justify-center lg:rtl:justify-end lg:ltr:justify-start">
              {book && <StampCTA to={`/books/${book.id}`}>{book.ctaLabel || t("home.cta.orderNow")}</StampCTA>}
              <UnderlineLink to="/about">{t("home.hero.aboutLink")}</UnderlineLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function PhilosophySection() {
  const { t } = useLanguage();
  const getDimensions = useAssetDimensions();
  const patternDims = getDimensions("/assets/arabesque-pattern.webp");
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream via-cream to-ivory px-6 py-14 lg:px-10 lg:py-20">
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <Reveal className="relative z-10">
          <div className="flex items-center gap-3">
            <CornerFlourish className="h-8 w-8 text-gold/60" />
            <p className="text-sm uppercase tracking-[0.25em] text-gold">{t("home.philosophy.eyebrow")}</p>
          </div>
          <h2 className="mt-5 text-balance font-display text-4xl leading-tight text-ink md:text-6xl">
            {t("home.philosophy.title")}
          </h2>
          <p className="mt-6 max-w-lg text-balance leading-loose text-ink-soft">
            {t("home.philosophy.body")}
          </p>
        </Reveal>

        {/* the gold pattern is the section's real visual anchor — bleeding to the edge, entering once and staying settled within this section */}
        <Reveal delay={0.15} className="relative">
          <div className="relative -mx-6 aspect-[4/5] overflow-hidden rounded-[10px] lg:mx-0 lg:-ms-16 lg:aspect-auto lg:h-[36rem]">
            <img
              src="/assets/arabesque-pattern.webp"
              alt=""
              width={patternDims?.width}
              height={patternDims?.height}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cream/40 via-transparent to-transparent" />
            <ArchFrame className="pointer-events-none absolute -bottom-8 left-1/2 h-64 w-48 -translate-x-1/2 text-ivory/70" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FeaturedBookSection({ book }: { book: AdminBook }) {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const getDimensions = useAssetDimensions();
  // Dashboard-controlled override (Settings → Home Page) takes priority;
  // falls back to the featured book's own gallery image exactly as before
  // this setting existed, so nothing visually changes until an admin sets it.
  const fallbackSrc = book.gallery[0] ?? "/assets/kuni-hajar-collection.webp";
  const desktopSrc = settings.homepage.heroImage ?? fallbackSrc;
  const mobileSrc = settings.homepage.heroImageMobile ?? desktopSrc;
  const desktopDims = getDimensions(desktopSrc);
  const coverDims = getDimensions(book.cover);
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-ivory via-ivory to-cream px-6 py-16 lg:px-10 lg:py-24">
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <Reveal className="relative order-2 lg:order-1">
          <div className="relative overflow-hidden rounded-[10px] shadow-[0_30px_60px_-25px_rgba(44,36,32,0.35)]">
            <picture>
              {mobileSrc !== desktopSrc && <source media="(max-width: 1023px)" srcSet={mobileSrc} />}
              <img
                src={desktopSrc}
                alt=""
                width={desktopDims?.width}
                height={desktopDims?.height}
                className="h-[28rem] w-full object-cover lg:h-[34rem]"
                style={{ objectPosition: "30% 35%" }}
                loading="lazy"
                decoding="async"
              />
            </picture>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
          </div>
          <CornerFlourish className="pointer-events-none absolute start-4 top-4 h-14 w-14 text-ivory/80" />
          {/* the real product, kept accurate — floated as a framed detail over the lifestyle backdrop */}
          {book.cover && (
            <div className="absolute -bottom-6 end-6 w-28 overflow-hidden rounded-[6px] border-2 border-ivory shadow-[0_15px_30px_-10px_rgba(44,36,32,0.45)] sm:w-32">
              <img
                src={book.cover}
                alt={book.title}
                width={coverDims?.width}
                height={coverDims?.height}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
        </Reveal>

        <div className="order-1 text-center lg:order-2 lg:text-start">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.25em] text-gold">{t("home.featuredBook.eyebrow")}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl">
              {book.title}
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="mt-5 flex max-lg:justify-center lg:justify-start">
              <GoldDivider className="h-4 w-44 text-gold" />
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-lg text-balance leading-loose text-ink-soft lg:mx-0">
              {book.description}
            </p>
          </Reveal>
          <Reveal delay={0.26}>
            <div className="mt-8 flex max-lg:justify-center lg:rtl:justify-end lg:ltr:justify-start">
              <UnderlineLink to={`/books/${book.id}`}>{t("home.featuredBook.readMore")}</UnderlineLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function BooksGridSection({ books }: { books: AdminBook[] }) {
  const getDimensions = useAssetDimensions();
  const { t, language } = useLanguage();
  const { getCategoryLabel } = useCategories();
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream via-cream to-mauve/25 px-6 py-16 lg:px-10 lg:py-24">
      <div className="relative mx-auto max-w-7xl">
        <Reveal className="text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-gold">{t("home.booksGrid.eyebrow")}</p>
          <h2 className="mt-4 font-display text-4xl text-ink md:text-5xl">{t("home.booksGrid.title")}</h2>
          <div className="mt-5 flex justify-center">
            <GoldDivider className="h-4 w-44 text-gold" />
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {books.map((book, i) => (
            <Reveal key={book.id} delay={i * 0.06}>
              <Link
                to={`/books/${book.id}`}
                className="group block overflow-hidden rounded-[10px] border border-beige bg-ivory transition-shadow duration-300 hover:shadow-[0_20px_45px_-20px_rgba(44,36,32,0.25)]"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-cream to-beige p-6">
                  {book.cover && (
                    <img
                      src={book.cover}
                      alt={book.title}
                      width={getDimensions(book.cover)?.width}
                      height={getDimensions(book.cover)?.height}
                      className="mx-auto h-full w-auto object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <span className="absolute start-4 top-4 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-ink/90 text-sm text-ivory opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {book.placement === "comingSoon" && (
                    <span className="absolute end-4 top-4 rounded-full bg-lavender/80 px-3 py-1 text-xs text-ink">
                      {t("home.booksGrid.comingSoon")}
                    </span>
                  )}
                </div>
                <div className="border-t border-beige p-5 text-start">
                  <p className="text-xs text-gold">{getCategoryLabel(book.category)}</p>
                  <h3 className="mt-1.5 font-display text-lg text-ink">{book.title}</h3>
                  <p className="mt-1 text-xs text-ink-soft">{localizeProperName(book.author, language)}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3} className="mt-12 text-center">
          <UnderlineLink to="/books">{t("home.booksGrid.viewAll")}</UnderlineLink>
        </Reveal>
      </div>
    </section>
  );
}

function QuoteSection() {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-mauve/25 via-mauve/25 to-ivory px-6 py-20 lg:px-10 lg:py-24">
      <div className="relative mx-auto max-w-3xl rounded-[10px] border border-mauve/40 bg-ivory/50 px-6 py-14 text-center shadow-[0_20px_50px_-30px_rgba(44,36,32,0.35)] backdrop-blur-sm lg:px-14 lg:py-16">
        <Reveal>
          <QuoteMark className="mx-auto h-14 w-20 text-gold" />
        </Reveal>
        <Reveal delay={0.1}>
          <blockquote className="mt-8 text-balance font-display text-4xl leading-relaxed text-ink md:text-5xl">
            {t("home.quote.text")}
          </blockquote>
        </Reveal>
        <Reveal delay={0.18}>
          <cite className="mt-6 block text-sm not-italic text-ink-soft">{t("home.quote.citation")}</cite>
        </Reveal>
      </div>
    </section>
  );
}

function FinalCTASection({ book }: { book: AdminBook | null }) {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden px-6 py-16 lg:px-10 lg:py-20">
      <div className="relative mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 rounded-[10px] border border-beige bg-cream/60 p-10 text-center sm:grid-cols-3 lg:p-14">
        <CornerFlourish className="pointer-events-none absolute start-4 top-4 h-12 w-12 text-gold/50" />
        <CornerFlourish className="pointer-events-none absolute bottom-4 end-4 h-12 w-12 rotate-180 text-gold/50" />
        <FeatureIcon icon={<IconBook className="h-8 w-8" />} label={t("home.finalCta.featureLuxuryBook")} />
        <FeatureIcon icon={<IconHeart className="h-8 w-8" />} label={t("home.finalCta.featureHonestContent")} />
        <FeatureIcon icon={<IconOpenHands className="h-8 w-8" />} label={t("home.finalCta.featureLastingImpact")} />
      </div>

      <Reveal className="mx-auto mt-16 max-w-2xl text-center">
        <h2 className="text-balance font-display text-3xl leading-tight text-ink md:text-4xl">
          {book ? t("home.finalCta.titleWithBook").replace("{{book}}", book.title) : t("home.finalCta.titleDefault")}
        </h2>
        <p className="mt-4 text-balance leading-loose text-ink-soft">
          {t("home.finalCta.body")}
        </p>
        {book && (
          <div className="mt-8 flex justify-center">
            <StampCTA to={`/books/${book.id}`}>{book.ctaLabel || t("home.cta.orderNow")}</StampCTA>
          </div>
        )}
      </Reveal>
    </section>
  );
}

function FeatureIcon({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-gold">{icon}</span>
      <span className="text-sm text-ink-soft">{label}</span>
    </div>
  );
}
