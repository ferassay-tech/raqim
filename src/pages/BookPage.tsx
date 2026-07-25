import { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Helmet } from "../components/Helmet";
import { PageShell } from "../components/page-shell";
import { getBookBySlug, faqs as globalFaqs } from "../lib/content";
import { GoldDivider, CornerFlourish, QuoteMark, IconHeart } from "../components/ornaments";
import { StampCTA, UnderlineLink, NumeralCTA } from "../components/cta";
import { Reveal } from "../components/motion-primitives";
import { StructuredData } from "../components/StructuredData";
import PremiumBook3D from "../components/PremiumBook3D";

export default function BookPage() {
  const { slug } = useParams<{ slug: string }>();
  const book = getBookBySlug(slug ?? "");

  if (!book) return <Navigate to="/books" replace />;

  const isFlagship = book.slug === "kuni-hajar";

  const BOOK_JSON_LD = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    description: book.excerpt,
    author: { "@type": "Person", name: book.author },
    inLanguage: "ar",
    bookFormat: "https://schema.org/EBook",
    offers: {
      "@type": "Offer",
      price: book.price.replace(/[^\d]/g, ""),
      priceCurrency: "SAR",
      availability: "https://schema.org/InStock",
    },
  });

  if (!isFlagship) {
    return (
      <PageShell>
        <Helmet
        title={`${book.title} — رقيم`}
        description={book.excerpt}
        image={`https://lumora-house-seven.vercel.app${book.cover}`}
        url={`https://lumora-house-seven.vercel.app/books/${book.slug}`}
/>
        <StructuredData json={BOOK_JSON_LD} />
        <SimpleBookPage book={book} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Helmet
  title={`${book.title} — رقيم`}
  description={book.excerpt}
  image={`https://lumora-house-seven.vercel.app${book.cover}`}
  url={`https://lumora-house-seven.vercel.app/books/${book.slug}`}
/>
      <StructuredData json={BOOK_JSON_LD} />
      <BookHero book={book} />
      <WhoForSection book={book} />
      <StorySection />
      <ChaptersSection book={book} />
      <BenefitsSection book={book} />
      <TestimonialsSection book={book} />
      <AuthorSection book={book} />
      <PurchaseSection book={book} />
      <GuaranteeSection />
      <FaqSection />
      <FinalCTASection book={book} />
    </PageShell>
  );
}

type BookT = NonNullable<ReturnType<typeof getBookBySlug>>;

function BookHero({ book }: { book: BookT }) {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-14 lg:px-10 lg:pb-28 lg:pt-20">
      <div className="pointer-events-none absolute inset-0">
        <img src="/assets/hero.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.12]" />
        <div className="absolute inset-0 bg-gradient-to-b from-ivory via-ivory/95 to-ivory" />
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal className="order-2 flex justify-center lg:order-1 lg:justify-start">
          <div className="relative">
            <div className="absolute -inset-10 -z-10 rounded-full bg-gold/10 blur-3xl" />
            <PremiumBook3D
              cover={book.cover}
              alt={book.title}
              previewPages={book.previewPages}
              backCover={book.backCoverImage}
            />
          </div>
        </Reveal>

        <div className="order-1 text-center lg:order-2 lg:text-right">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.25em] text-gold">إصدار رقيم الأول</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 font-display text-5xl leading-[1.15] text-ink md:text-7xl">{book.title}</h1>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="mt-6 flex justify-center lg:justify-end">
              <GoldDivider className="h-5 w-52 text-gold" />
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-xl text-balance text-lg leading-loose text-ink-soft lg:mx-0">
              {book.subtitle}
            </p>
          </Reveal>
          <Reveal delay={0.26}>
            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-end">
              <StampCTA href="#purchase">اطلبي نسختك الآن</StampCTA>
              <UnderlineLink to={`/authors/${book.authorSlug}`}>عن المؤلفة</UnderlineLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function WhoForSection({ book }: { book: BookT }) {
  return (
    <section className="bg-cream px-6 py-24 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal className="text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-gold">لمن هذا الكتاب</p>
          <h2 className="mt-4 font-display text-4xl text-ink md:text-5xl">هل هذا الكتاب لكِ؟</h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {book.whoFor?.map((line: string, i: number) => (
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

function StorySection() {
  return (
    <section className="relative overflow-hidden px-6 py-24 lg:px-10 lg:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <Reveal>
          <p className="text-sm uppercase tracking-[0.25em] text-gold">رحلة التحول</p>
          <h2 className="mt-4 text-balance font-display text-4xl leading-tight text-ink md:text-5xl">
            من الإرهاق إلى السكينة، خطوة بخطوة
          </h2>
          <p className="mt-6 max-w-lg text-balance leading-loose text-ink-soft">
            كل أم تمر بلحظات تشعر فيها أن العطاء بلا حدود يستنزفها. في هذا الكتاب، نأخذك في رحلة
            مع سيرة هاجر عليها السلام، لتكتشفي أن الصبر ليس استسلامًا، بل قوة هادئة تصنع الأثر.
            ستنتقلين من الشعور بالوحدة في التعب، إلى اليقين بأن كل خطوة تخطينها لها معنى يتجاوز
            اللحظة.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="relative">
          <div className="relative overflow-hidden rounded-[10px]">
            <img
  src="/assets/kuni-hajar-collection.webp"
  alt="مجموعة كتاب كوني هاجر وإصدارات رقيم"
  className="h-full w-full object-cover"
  loading="lazy"
/>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ChaptersSection({ book }: { book: BookT }) {
  return (
    <section className="bg-cream px-6 py-24 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-gold">لمحة من الداخل</p>
          <h2 className="mt-4 font-display text-4xl text-ink md:text-5xl">ماذا ستجدين بين الصفحات</h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {book.chapters?.map((ch: { number: string; title: string }, i: number) => (
            <Reveal
              key={ch.number}
              delay={i * 0.08}
              className={i % 2 === 1 ? "sm:translate-y-6" : ""}
            >
              <div className="group relative overflow-hidden rounded-[10px] border border-gold/30 bg-ivory p-7 shadow-[0_10px_30px_-18px_rgba(44,36,32,0.2)] transition-transform duration-300 hover:-translate-y-1.5">
                <CornerFlourish className="absolute -left-2 -top-2 h-10 w-10 text-gold/30" />
                <span className="font-logotype text-4xl text-gold">{ch.number}</span>
                <h3 className="mt-4 font-display text-lg leading-snug text-ink">{ch.title}</h3>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitsSection({ book }: { book: BookT }) {
  return (
    <section className="px-6 py-24 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-gold">لماذا هذا الكتاب</p>
          <h2 className="mt-4 font-display text-4xl text-ink md:text-5xl">كيف سيغيّر هذا الكتاب رحلتك</h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {book.benefits?.map((b: { title: string; body: string }, i: number) => (
            <Reveal
              key={b.title}
              delay={i * 0.06}
              className={i === 0 ? "sm:col-span-2 lg:col-span-1" : ""}
            >
              <div
                className={`h-full rounded-[10px] p-7 ${
                  i % 3 === 1 ? "bg-lavender/25" : i % 3 === 2 ? "bg-mauve/20" : "bg-cream"
                }`}
              >
                <h3 className="font-display text-xl text-ink">{b.title}</h3>
                <p className="mt-3 text-balance leading-loose text-ink-soft">{b.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection({ book }: { book: BookT }) {
  return (
    <section className="bg-mauve/20 px-6 py-24 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-gold">قالت قارئاتنا</p>
          <h2 className="mt-4 font-display text-4xl text-ink md:text-5xl">تجارب حقيقية</h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {book.testimonials?.map((t: { quote: string; name: string; role: string }, i: number) => (
            <Reveal key={t.name} delay={i * 0.1} className={i === 1 ? "lg:-translate-y-6" : ""}>
              <div className="h-full rounded-[10px] border border-gold/25 bg-ivory p-7">
                <QuoteMark className="h-6 w-9 text-gold/70" />
                <p className="mt-4 text-balance leading-loose text-ink">{t.quote}</p>
                <p className="mt-5 text-sm text-gold">{t.name}</p>
                <p className="text-xs text-ink-soft">{t.role}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function AuthorSection({ book }: { book: BookT }) {
  return (
    <section className="px-6 py-24 lg:px-10 lg:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-[0.7fr_1.3fr]">
        <Reveal className="flex justify-center">
          <div className="flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-cream to-lavender/40 text-6xl text-gold">
            م
          </div>
        </Reveal>
        <Reveal delay={0.1} className="text-center lg:text-right">
          <p className="text-sm uppercase tracking-[0.25em] text-gold">عن المؤلفة</p>
          <h2 className="mt-4 font-display text-3xl text-ink md:text-4xl">{book.author}</h2>
          <p className="mt-5 max-w-2xl text-balance leading-loose text-ink-soft">
  مها نصر كاتبة فلسطينية من غزة، ومدربة في تنمية المرأة والأسرة. تهتم ببناء الوعي التربوي والنفسي، وتستلهم في كتاباتها القيم الإيمانية والتجارب الإنسانية الواقعية، لتقدم محتوى يجمع بين الدفء والعمق. ويأتي كتابها الأول «كوني هاجر» ليكون بداية رحلة أدبية تهدف إلى إلهام المرأة وبناء أثر يبقى.
</p>
          <div className="mt-6 flex justify-center lg:justify-end">
            <UnderlineLink to={`/authors/${book.authorSlug}`}>اقرئي المزيد عن مها</UnderlineLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PurchaseSection({ book }: { book: BookT }) {
  return (
    <section id="purchase" className="bg-cream px-6 py-24 lg:px-10 lg:py-28">
      <Reveal className="mx-auto max-w-3xl rounded-[10px] border border-gold/30 bg-ivory p-10 text-center lg:p-14">
        <p className="text-sm uppercase tracking-[0.25em] text-gold">اقتني نسختك</p>
        <h2 className="mt-4 font-display text-3xl text-ink md:text-4xl">{book.title}</h2>
        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="font-logotype text-4xl text-ink">{book.price}</span>
          {book.originalPrice && (
            <span className="text-lg text-ink-soft line-through">{book.originalPrice}</span>
          )}
        </div>
        <p className="mt-2 text-sm text-ink-soft">
          {book.format} · {book.pages} · {book.language}
        </p>
        <div className="mt-8 flex justify-center">
          <StampCTA to="/checkout">اطلبي نسختك الآن</StampCTA>
        </div>
        <p className="mt-4 text-xs text-ink-soft">تحميل فوري بعد إتمام الشراء · دعم فني على مدار الساعة</p>
      </Reveal>
    </section>
  );
}

function GuaranteeSection() {
  return (
    <section className="px-6 py-24 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-5xl grid grid-cols-1 gap-10 lg:grid-cols-2 items-center">
        <Reveal className="flex justify-center lg:justify-start">
          <NumeralCTA
            numeral="✓"
            label="تحميل فوري بعد الشراء"
            to="/faq"
          />
        </Reveal>

        <Reveal delay={0.1} className="text-center lg:text-right">
          <h2 className="font-display text-3xl leading-tight text-ink md:text-4xl">
            تجربة شراء رقمية بسيطة وآمنة
          </h2>

          <p className="mt-4 max-w-md text-balance leading-loose text-ink-soft lg:mr-0 lg:ml-auto">
            ستحصلين على نسخة رقمية عالية الجودة فور إتمام عملية الشراء،
            مع إمكانية التواصل معنا عبر البريد الإلكتروني لأي استفسار أو
            مساعدة، كما سنرسل لك أي تحديثات مستقبلية مجانية لهذا الإصدار
            عند توفرها.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-cream px-6 py-24 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-gold">الأسئلة الشائعة</p>
          <h2 className="mt-4 font-display text-4xl text-ink md:text-5xl">لديك سؤال؟</h2>
        </Reveal>

        <div className="mt-12 divide-y divide-beige border-y border-beige">
          {globalFaqs.map((faq, i) => (
            <div key={faq.question} className="py-5">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 text-right"
              >
                <span className="font-display text-lg text-ink">{faq.question}</span>
                <span className={`shrink-0 text-gold transition-transform duration-300 ${open === i ? "rotate-45" : ""}`}>
                  +
                </span>
              </button>
              <div
                className="grid overflow-hidden transition-all duration-300"
                style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <p className="pt-4 text-balance leading-loose text-ink-soft">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTASection({ book }: { book: BookT }) {
  return (
    <section className="relative overflow-hidden px-6 py-28 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <img src="/assets/arabesque-pattern.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.08]" />
      </div>
      <Reveal className="relative mx-auto max-w-2xl text-center">
        <h2 className="text-balance font-display text-3xl leading-tight text-ink md:text-4xl">
          كوني البداية التي تُلهم أجيالًا بعدك
        </h2>
        <p className="mt-4 text-balance leading-loose text-ink-soft">
          احصلي على نسختك من {book.title} اليوم، وابدئي رحلة الثبات والسكينة.
        </p>
        <div className="mt-8 flex justify-center">
          <StampCTA href="#purchase">اطلبي نسختك الآن</StampCTA>
        </div>
      </Reveal>
    </section>
  );
}

function SimpleBookPage({ book }: { book: BookT }) {
  return (
    <>
      <section className="px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <Reveal className="flex justify-center">
            <div className="rounded-[10px] bg-gradient-to-br from-cream to-beige p-10">
              <img src={book.cover} alt={book.title} className="w-full max-w-sm object-contain drop-shadow-xl" />
            </div>
          </Reveal>
          <Reveal delay={0.1} className="text-center lg:text-right">
            <p className="text-sm uppercase tracking-[0.25em] text-gold">{book.category}</p>
            <h1 className="mt-4 font-display text-4xl text-ink md:text-5xl">{book.title}</h1>
            <p className="mt-4 text-balance leading-loose text-ink-soft">{book.subtitle}</p>
            <p className="mt-6 max-w-lg text-balance leading-loose text-ink-soft">{book.excerpt}</p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-end">
              {book.comingSoon ? (
                <div className="rounded-[10px] border border-gold/30 bg-cream px-8 py-4 text-center">
  <p className="font-display text-lg text-gold">
    هذا الإصدار قيد الإعداد
  </p>

  <p className="mt-2 text-sm text-ink-soft">
    نعمل عليه بعناية، وسيكون متاحًا قريبًا بإذن الله.
  </p>
</div>
              ) : (
                <StampCTA to="/checkout">اطلبي نسختك الآن</StampCTA>
              )}
              <UnderlineLink to={`/authors/${book.authorSlug}`}>عن {book.author}</UnderlineLink>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="bg-cream px-6 py-16 text-center lg:px-10">
        <Link to="/books" className="text-sm text-gold hover:underline">
          العودة إلى جميع الكتب
        </Link>
      </section>
    </>
  );
}

