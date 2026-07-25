import { Link } from "react-router-dom";
import { PageShell } from "../components/page-shell";
import { GoldDivider, CornerFlourish, ArchFrame, QuoteMark, IconBook, IconHeart, IconOpenHands } from "../components/ornaments";
import { StampCTA, UnderlineLink } from "../components/cta";
import {Reveal,ParallaxLayer,CursorDrift,Floating,MouseTilt,} from "../components/motion-primitives";
import { books } from "../lib/content";
import { StructuredData } from "../components/StructuredData";
import PremiumBook3D from "../components/PremiumBook3D";
// Every Hero* atmosphere component (HeroLight, HeroClouds, HeroParticles,
// HeroBirds, HeroForeground) and the shared ambient mask are temporarily
// not rendered anywhere on the homepage — components and assets are kept
// in place on disk, untouched, pending a from-first-principles atmosphere
// redesign. This is a deliberate, temporary reset, not a permanent removal.

const featuredBook = books.find((b) => b.featured)!;

const BOOK_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Book",
  name: featuredBook.title,
  author: { "@type": "Person", name: featuredBook.author },
  inLanguage: "ar",
  bookFormat: "https://schema.org/EBook",
});

export default function HomePage() {
  return (
    <PageShell>
      <StructuredData json={BOOK_JSON_LD} />
      <HeroSection />
      <PhilosophySection />
      <FeaturedBookSection />
      <BooksGridSection />
      <QuoteSection />
      <FinalCTASection />
    </PageShell>
  );
}

function HeroSection() {
  return (
    <section className="isolate relative overflow-hidden px-6 pb-14 pt-14 lg:px-10 lg:pb-20 lg:pt-20">
      {/* background watercolor plate, muted — fades into Philosophy's cream by the bottom edge so the two sections read as one continuous scene */}
<div className="pointer-events-none absolute inset-0">
  <div className="absolute inset-0 bg-gradient-to-b from-ivory via-ivory to-cream" />
</div>

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        {/* book cutout — bottom-left per brief's editorial-offset architecture */}
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

  <PremiumBook3D
    cover={featuredBook.cover}
    alt={featuredBook.title}
  />

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

        {/* headline block — top-right, RTL primary reading direction */}
        <div className="order-1 text-center lg:order-2 lg:text-right">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.25em] text-gold">رقيم للنشر الرقمي</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 text-balance font-display text-5xl leading-[1.15] text-ink md:text-7xl">
              كوني هاجر
            </h1>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="mt-6 flex justify-center lg:justify-end">
              <GoldDivider className="h-5 w-52 text-gold" />
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-xl text-balance text-lg leading-loose text-ink-soft lg:mx-0">
              دليلك للثبات والوعي والأثر الذي لا يُنسى. للمرأة التي تختار أن تكون بدايةً لحكاية تُلهم.
            </p>
          </Reveal>
          <Reveal delay={0.26}>
            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-end">
              <StampCTA to="/books/kuni-hajar">اطلبي نسختك الآن</StampCTA>
              <UnderlineLink to="/about">تعرّفي على الدار</UnderlineLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function PhilosophySection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream via-cream to-ivory px-6 py-14 lg:px-10 lg:py-20">
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <Reveal className="relative z-10">
          <div className="flex items-center gap-3">
            <CornerFlourish className="h-8 w-8 text-gold/60" />
            <p className="text-sm uppercase tracking-[0.25em] text-gold">فلسفتنا</p>
          </div>
          <h2 className="mt-5 text-balance font-display text-4xl leading-tight text-ink md:text-6xl">
            نؤمن بأن الكلمة الراقية تستحق أن تصاغ في أبهى صورة
          </h2>
          <p className="mt-6 max-w-lg text-balance leading-loose text-ink-soft">
            من هذا الإيمان، نختار بعناية ما ننشر وما نصمم وما نُبدع، لنمنح قارئاتنا تجارب فكرية
            وجمالية تلهم وتدوم. نحن أكثر من دار نشر، نحن حارسات للمعنى، وجسر بين الجمال والعمق.
          </p>
        </Reveal>

        {/* the gold pattern is the section's real visual anchor — bleeding to the edge, entering once and staying settled within this section */}
        <Reveal delay={0.15} className="relative">
          <div className="relative -mx-6 aspect-[4/5] overflow-hidden rounded-[10px] lg:mx-0 lg:-mr-16 lg:aspect-auto lg:h-[36rem]">
            <img
              src="/assets/arabesque-pattern.webp"
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cream/40 via-transparent to-transparent" />
            <ArchFrame className="pointer-events-none absolute -bottom-8 left-1/2 h-64 w-48 -translate-x-1/2 text-ivory/70" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FeaturedBookSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-ivory via-ivory to-cream px-6 py-16 lg:px-10 lg:py-24">
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <Reveal className="relative order-2 lg:order-1">
          <div className="relative overflow-hidden rounded-[10px] shadow-[0_30px_60px_-25px_rgba(44,36,32,0.35)]">
            <img
              src="/assets/kuni-hajar-collection.webp"
              alt=""
              className="h-[28rem] w-full object-cover lg:h-[34rem]"
              style={{ objectPosition: "30% 35%" }}
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
          </div>
          <CornerFlourish className="pointer-events-none absolute right-4 top-4 h-14 w-14 text-ivory/80" />
          {/* the real product, kept accurate — floated as a framed detail over the lifestyle backdrop */}
          <div className="absolute -bottom-6 left-6 w-28 overflow-hidden rounded-[6px] border-2 border-ivory shadow-[0_15px_30px_-10px_rgba(44,36,32,0.45)] sm:w-32">
            <img
              src={featuredBook.cover}
              alt={featuredBook.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </Reveal>

        <div className="order-1 text-center lg:order-2 lg:text-right">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.25em] text-gold">الكتاب المميز</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl">
              {featuredBook.title}
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="mt-5 flex justify-center lg:justify-end">
              <GoldDivider className="h-4 w-44 text-gold" />
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-lg text-balance leading-loose text-ink-soft lg:mx-0">
              {featuredBook.excerpt}
            </p>
          </Reveal>
          <Reveal delay={0.26}>
            <div className="mt-8 flex justify-center lg:justify-end">
              <UnderlineLink to={`/books/${featuredBook.slug}`}>اقرئي المزيد</UnderlineLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function BooksGridSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream via-cream to-mauve/25 px-6 py-16 lg:px-10 lg:py-24">
      <div className="relative mx-auto max-w-7xl">
        <Reveal className="text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-gold">أحدث الإصدارات</p>
          <h2 className="mt-4 font-display text-4xl text-ink md:text-5xl">مكتبة رقيم</h2>
          <div className="mt-5 flex justify-center">
            <GoldDivider className="h-4 w-44 text-gold" />
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {books.map((book, i) => (
            <Reveal key={book.slug} delay={i * 0.06}>
              <Link
                to={`/books/${book.slug}`}
                className="group block overflow-hidden rounded-[10px] border border-beige bg-ivory transition-shadow duration-300 hover:shadow-[0_20px_45px_-20px_rgba(44,36,32,0.25)]"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-cream to-beige p-6">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="mx-auto h-full w-auto object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <span className="absolute right-4 top-4 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-ink/90 text-sm text-ivory opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {book.comingSoon && (
                    <span className="absolute left-4 top-4 rounded-full bg-lavender/80 px-3 py-1 text-xs text-ink">
                      قريبًا
                    </span>
                  )}
                </div>
                <div className="border-t border-beige p-5 text-right">
                  <p className="text-xs text-gold">{book.category}</p>
                  <h3 className="mt-1.5 font-display text-lg text-ink">{book.title}</h3>
                  <p className="mt-1 text-xs text-ink-soft">{book.author}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3} className="mt-12 text-center">
          <UnderlineLink to="/books">عرض جميع الكتب</UnderlineLink>
        </Reveal>
      </div>
    </section>
  );
}

function QuoteSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-mauve/25 via-mauve/25 to-ivory px-6 py-20 lg:px-10 lg:py-24">
      <div className="relative mx-auto max-w-3xl rounded-[10px] border border-mauve/40 bg-ivory/50 px-6 py-14 text-center shadow-[0_20px_50px_-30px_rgba(44,36,32,0.35)] backdrop-blur-sm lg:px-14 lg:py-16">
        <Reveal>
          <QuoteMark className="mx-auto h-14 w-20 text-gold" />
        </Reveal>
        <Reveal delay={0.1}>
          <blockquote className="mt-8 text-balance font-display text-4xl leading-relaxed text-ink md:text-5xl">
            الكتاب الذي يصل إلى قلبك، يبقى فيه أطول من أي كلمة تُقال.
          </blockquote>
        </Reveal>
        <Reveal delay={0.18}>
          <cite className="mt-6 block text-sm not-italic text-ink-soft">مها نصر، مؤلفة كوني هاجر</cite>
        </Reveal>
      </div>
    </section>
  );
}

function FinalCTASection() {
  return (
    <section className="relative overflow-hidden px-6 py-16 lg:px-10 lg:py-20">
      <div className="relative mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 rounded-[10px] border border-beige bg-cream/60 p-10 text-center sm:grid-cols-3 lg:p-14">
        <CornerFlourish className="pointer-events-none absolute right-4 top-4 h-12 w-12 text-gold/50" />
        <CornerFlourish className="pointer-events-none absolute bottom-4 left-4 h-12 w-12 rotate-180 text-gold/50" />
        <FeatureIcon icon={<IconBook className="h-8 w-8" />} label="كتاب فاخر يُقتنى" />
        <FeatureIcon icon={<IconHeart className="h-8 w-8" />} label="محتوى بقلب صادق" />
        <FeatureIcon icon={<IconOpenHands className="h-8 w-8" />} label="أثر يبقى بعدك" />
      </div>

      <Reveal className="mx-auto mt-16 max-w-2xl text-center">
        <h2 className="text-balance font-display text-3xl leading-tight text-ink md:text-4xl">
          ابدئي رحلتك مع كوني هاجر اليوم
        </h2>
        <p className="mt-4 text-balance leading-loose text-ink-soft">
          نسخة رقمية فاخرة، تصلك خلال دقائق، لتبدئي القراءة على الفور.
        </p>
        <div className="mt-8 flex justify-center">
          <StampCTA to="/books/kuni-hajar">اطلبي نسختك الآن</StampCTA>
        </div>
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

