import { useState } from "react";
import { PageShell, PageHeader } from "../components/page-shell";
import { Reveal } from "../components/motion-primitives";
import { Helmet } from "../components/Helmet";
import { StructuredData } from "../components/StructuredData";
import { useSiteContent } from "../admin/context/SiteContentContext";
import { buildGraph, breadcrumbSchema, faqPageSchema } from "../lib/structuredData";
import { useLanguage } from "../context/LanguageContext";

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  const { faqs } = useSiteContent();
  const { t, language } = useLanguage();

  const faqJsonLd = buildGraph([
    faqPageSchema(faqs),
    breadcrumbSchema([
      { name: t("about.breadcrumb.home"), path: "/" },
      { name: t("book.faq.eyebrow"), path: "/faq" },
    ], language),
  ]);

  return (
    <PageShell>
      <Helmet title={t("faq.seo.title")} description={t("faq.seo.description")} path="/faq" />
      <StructuredData json={faqJsonLd} />
      <PageHeader eyebrow={t("faq.eyebrow")} title={t("book.faq.eyebrow")} description={t("faq.description")} />

      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-3xl divide-y divide-beige border-y border-beige">
          {faqs.map((faq, i) => {
            const panelId = `faq-panel-${i}`;
            const buttonId = `faq-button-${i}`;
            const isOpen = open === i;
            return (
              <Reveal key={faq.question} delay={i * 0.05} className="py-5">
                <button
                  id={buttonId}
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex w-full items-center justify-between gap-4 text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                >
                  <span className="font-display text-h2 text-ink">{faq.question}</span>
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
              </Reveal>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
