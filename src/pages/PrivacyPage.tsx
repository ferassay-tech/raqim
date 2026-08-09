import { PageShell, PageHeader } from "../components/page-shell";
import { Reveal } from "../components/motion-primitives";
import { Helmet } from "../components/Helmet";
import { StructuredData } from "../components/StructuredData";
import { CONTACT_EMAILS } from "../config/contactEmails";
import { useLanguage } from "../context/LanguageContext";
import { formatNumeral } from "../lib/numerals";
import { buildGraph, breadcrumbSchema, webPageSchema } from "../lib/structuredData";

const sections = [
  {
    title: { ar: "المعلومات التي نجمعها", en: "Information We Collect" },
    body: {
      ar: "نجمع المعلومات التي تقدمينها مباشرة عند الشراء أو الاشتراك في نشرتنا البريدية، مثل الاسم والبريد الإلكتروني، بالإضافة إلى بيانات الاستخدام الأساسية لتحسين تجربتك على الموقع.",
      en: "We collect the information you provide directly when purchasing or subscribing to our newsletter, such as your name and email address, along with basic usage data to improve your experience on the site.",
    },
  },
  {
    title: { ar: "كيف نستخدم معلوماتك", en: "How We Use Your Information" },
    body: {
      ar: "نستخدم بياناتك لإتمام عمليات الشراء، وإرسال نسخ الكتب الرقمية، والتواصل معك بشأن إصدارات جديدة إن اخترتِ الاشتراك، ولا نشارك بياناتك مع أي جهة خارجية لأغراض تسويقية.",
      en: "We use your data to complete purchases, deliver digital book copies, and contact you about new releases if you've chosen to subscribe. We never share your data with any third party for marketing purposes.",
    },
  },
  {
    title: { ar: "حماية البيانات", en: "Data Protection" },
    body: {
      ar: "نتخذ إجراءات تقنية وتنظيمية معقولة لحماية معلوماتك من الوصول غير المصرح به أو الفقدان أو سوء الاستخدام، مع العلم أنه لا توجد وسيلة نقل أو تخزين إلكترونية تضمن أمانًا مطلقًا.",
      en: "We take reasonable technical and organizational measures to protect your information from unauthorized access, loss, or misuse — while acknowledging that no electronic transmission or storage method can guarantee absolute security.",
    },
  },
  {
    title: { ar: "حقوقك", en: "Your Rights" },
    body: {
      ar: "يحق لك في أي وقت طلب الاطلاع على بياناتك أو تعديلها أو حذفها، وذلك بالتواصل معنا عبر صفحة التواصل.",
      en: "You have the right, at any time, to request access to, correction of, or deletion of your data by contacting us through our Contact page.",
    },
  },
  {
    title: { ar: "ملفات تعريف الارتباط", en: "Cookies" },
    body: {
      ar: "نستخدم ملفات تعريف ارتباط أساسية لضمان عمل الموقع بشكل سليم، ولا نستخدمها لأغراض إعلانية تتبعية.",
      en: "We use essential cookies to ensure the site functions properly, and never for tracking-based advertising purposes.",
    },
  },
  {
    title: { ar: "التواصل معنا", en: "Contact Us" },
    body: {
      ar: `لأي استفسار حول سياسة الخصوصية هذه، يمكنك التواصل معنا عبر البريد الإلكتروني ${CONTACT_EMAILS.general}.`,
      en: `For any question about this privacy policy, you can reach us by email at ${CONTACT_EMAILS.general}.`,
    },
  },
];

export default function PrivacyPage() {
  const { t, language } = useLanguage();

  const privacyJsonLd = buildGraph([
    webPageSchema({
      name: t("privacy.seo.title"),
      description: t("privacy.seo.description"),
      path: "/privacy",
      language,
    }),
    breadcrumbSchema([
      { name: t("about.breadcrumb.home"), path: "/" },
      { name: t("privacy.title"), path: "/privacy" },
    ], language),
  ]);

  return (
    <PageShell>
      <Helmet title={t("privacy.seo.title")} description={t("privacy.seo.description")} path="/privacy" />
      <StructuredData json={privacyJsonLd} />
      <PageHeader
        eyebrow={t("legal.eyebrow")}
        title={t("privacy.title")}
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
