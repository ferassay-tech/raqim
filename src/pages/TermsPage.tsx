import { PageShell, PageHeader } from "../components/page-shell";
import { Reveal } from "../components/motion-primitives";
import { Helmet } from "../components/Helmet";
import { StructuredData } from "../components/StructuredData";
import { useLanguage } from "../context/LanguageContext";
import { formatNumeral } from "../lib/numerals";
import { buildGraph, breadcrumbSchema, webPageSchema } from "../lib/structuredData";

const sections = [
  {
    title: { ar: "قبول الشروط", en: "Acceptance of Terms" },
    body: {
      ar: "باستخدامك موقع رقيم وشرائك أيًا من منتجاتنا الرقمية، فإنك توافقين على الالتزام بهذه الشروط والأحكام.",
      en: "By using the Raqim website and purchasing any of our digital products, you agree to be bound by these terms and conditions.",
    },
  },
  {
    title: { ar: "المنتجات الرقمية", en: "Digital Products" },
    body: {
      ar: "جميع المنتجات المعروضة على الموقع هي منتجات رقمية، وقد تُقدَّم بصيغ مختلفة حسب نوع المنتج. تُسلَّم للمشتري بالطريقة الموضحة أثناء عملية الشراء، وهي مخصصة للاستخدام الشخصي فقط ولا يجوز إعادة بيعها أو توزيعها.",
      en: "All products offered on the site are digital, and may be delivered in different formats depending on the product type. They are delivered to the buyer in the manner described during checkout, and are intended for personal use only — they may not be resold or redistributed.",
    },
  },
  {
    title: { ar: "حقوق الملكية الفكرية", en: "Intellectual Property Rights" },
    body: {
      ar: "جميع المحتويات المنشورة على هذا الموقع، بما في ذلك النصوص والتصاميم والصور، محمية بحقوق الملكية الفكرية لصالح رقيم ومؤلفيها، ويُمنع إعادة نشرها أو توزيعها دون إذن كتابي.",
      en: "All content published on this site, including text, designs, and images, is protected by intellectual property rights belonging to Raqim and its authors. Republishing or distributing it without written permission is prohibited.",
    },
  },
  {
    title: { ar: "سياسة الاسترجاع", en: "Refund Policy" },
    body: {
      ar: "نظرًا لطبيعة المنتجات الرقمية، تُراجع طلبات الاسترجاع أو الاستبدال كل حالة على حدة وفقًا للسياسة المعتمدة لدى رقيم.",
      en: "Given the nature of digital products, refund or exchange requests are reviewed on a case-by-case basis according to Raqim's approved policy.",
    },
  },
  {
    title: { ar: "تعديل الشروط", en: "Changes to These Terms" },
    body: {
      ar: "تحتفظ رقيم بحق تعديل هذه الشروط في أي وقت، وسيُعلن عن أي تغيير جوهري عبر الموقع أو البريد الإلكتروني.",
      en: "Raqim reserves the right to amend these terms at any time. Any material change will be announced via the website or by email.",
    },
  },
  {
    title: { ar: "القانون الحاكم", en: "Governing Law" },
    body: {
      ar: "تخضع هذه الشروط وتُفسَّر وفقًا للأنظمة المعمول بها، وأي نزاع يُحال إلى الجهات المختصة.",
      en: "These terms are governed by and construed in accordance with applicable regulations, and any dispute is referred to the competent authorities.",
    },
  },
];

export default function TermsPage() {
  const { t, language } = useLanguage();

  const termsJsonLd = buildGraph([
    webPageSchema({
      name: t("terms.seo.title"),
      description: t("terms.seo.description"),
      path: "/terms",
      language,
    }),
    breadcrumbSchema([
      { name: t("about.breadcrumb.home"), path: "/" },
      { name: t("terms.title"), path: "/terms" },
    ]),
  ]);

  return (
    <PageShell>
      <Helmet title={t("terms.seo.title")} description={t("terms.seo.description")} path="/terms" />
      <StructuredData json={termsJsonLd} />
      <PageHeader
        eyebrow={t("legal.eyebrow")}
        title={t("terms.title")}
        description={`${t("legal.lastUpdatedPrefix")}${formatNumeral(2026, language)}`}
      />
      <section className="px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-3xl space-y-10">
          {sections.map((s, i) => (
            <Reveal key={s.title.ar} delay={i * 0.04}>
              <h2 className="font-display text-xl text-ink">
                {formatNumeral(i + 1, language)}. {s.title[language]}
              </h2>
              <p className="mt-3 text-balance leading-loose text-ink-soft">{s.body[language]}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
