import { PageShell } from "../components/page-shell";
import { GoldDivider, IconBook, IconHeart, IconCrescent, IconJournal } from "../components/ornaments";
import { Reveal } from "../components/motion-primitives";
import { UnderlineLink } from "../components/cta";
import { Helmet } from "../components/Helmet";
import { StructuredData } from "../components/StructuredData";
import { buildGraph, breadcrumbSchema } from "../lib/structuredData";
import { useLanguage } from "../context/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();

  const aboutJsonLd = buildGraph([
    breadcrumbSchema([
      { name: t("about.breadcrumb.home"), path: "/" },
      { name: t("about.eyebrow"), path: "/about" },
    ]),
  ]);

  return (
    <PageShell>
      <Helmet
        title={t("about.seo.title")}
        description={t("about.seo.description")}
        path="/about"
      />
      <StructuredData json={aboutJsonLd} />
      <section className="relative overflow-hidden px-6 pb-20 pt-16 lg:px-10 lg:pt-24">
        <div className="pointer-events-none absolute inset-0">
          <img src="/assets/philosophy.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.1]" />
          <div className="absolute inset-0 bg-gradient-to-b from-ivory via-ivory/95 to-ivory" />
        </div>
        <div className="relative mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.25em] text-gold">{t("about.eyebrow")}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 font-display text-4xl leading-tight text-ink md:text-5xl">
              {t("about.hero.title")}
            </h1>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="mt-6 flex justify-center">
              <GoldDivider className="h-5 w-52 text-gold" />
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 text-balance text-lg leading-loose text-ink-soft">
              {t("about.hero.body")}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-cream px-6 py-24 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.25em] text-gold">{t("about.story.eyebrow")}</p>
            <h2 className="mt-4 text-balance font-display text-3xl leading-tight text-ink md:text-4xl">
              {t("about.story.title")}
            </h2>
            <p className="mt-6 max-w-lg text-balance leading-loose text-ink-soft">
              {t("about.story.bodyOne")}
            </p>
           <p className="mt-4 max-w-lg text-balance leading-loose text-ink-soft">
  {t("about.story.bodyTwo")}
</p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="overflow-hidden rounded-[10px]">
              <img
  src="/assets/lumora-about.webp"
  alt={t("about.story.imageAlt")}
  className="h-full w-full object-cover"
  loading="lazy"
/>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-24 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <p className="text-sm uppercase tracking-[0.25em] text-gold">{t("about.values.eyebrow")}</p>
            <h2 className="mt-4 font-display text-3xl text-ink md:text-4xl">{t("about.values.title")}</h2>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <IconBook className="h-8 w-8" />, title: t("about.values.quality.title"), body: t("about.values.quality.body") },
              { icon: <IconHeart className="h-8 w-8" />, title: t("about.values.honesty.title"), body: t("about.values.honesty.body") },
              { icon: <IconCrescent className="h-8 w-8" />, title: t("about.values.roots.title"), body: t("about.values.roots.body") },
              { icon: <IconJournal className="h-8 w-8" />, title: t("about.values.legacy.title"), body: t("about.values.legacy.body") },
            ].map((v, i) => (
              <Reveal key={v.title} delay={i * 0.06}>
                <div className="h-full rounded-[10px] border border-beige bg-cream/50 p-7 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold">
                    {v.icon}
                  </span>
                  <h3 className="mt-5 font-display text-lg text-ink">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream px-6 py-20 text-center lg:px-10">
        <Reveal>
          <h2 className="font-display text-3xl text-ink md:text-4xl">{t("about.finalCta.title")}</h2>
          <div className="mt-6 flex justify-center">
            <UnderlineLink to="/books/kuni-hajar">
  {t("about.finalCta.link")}
</UnderlineLink>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}

