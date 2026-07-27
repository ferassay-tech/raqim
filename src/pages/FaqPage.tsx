import { useState } from "react";
import { PageShell, PageHeader } from "../components/page-shell";
import { Reveal } from "../components/motion-primitives";
import { Helmet } from "../components/Helmet";
import { useSiteContent } from "../admin/context/SiteContentContext";

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  const { faqs } = useSiteContent();

  return (
    <PageShell>
      <Helmet
        title="الأسئلة الشائعة — رقيم"
        description="إجابات على أكثر الأسئلة شيوعًا حول كتب رقيم وطريقة الشراء."
        url="https://r-aqim.com/faq"
      />
      <PageHeader eyebrow="الدعم" title="الأسئلة الشائعة" description="كل ما تحتاجين معرفته قبل وبعد الشراء." />

      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-3xl divide-y divide-beige border-y border-beige">
          {faqs.map((faq, i) => (
            <Reveal key={faq.question} delay={i * 0.05} className="py-5">
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
            </Reveal>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

