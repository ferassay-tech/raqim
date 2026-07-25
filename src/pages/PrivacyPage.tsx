import { PageShell, PageHeader } from "../components/page-shell";
import { Reveal } from "../components/motion-primitives";
import { Helmet } from "../components/Helmet";

const sections = [
  {
    title: "١. المعلومات التي نجمعها",
    body: "نجمع المعلومات التي تقدمينها مباشرة عند الشراء أو الاشتراك في نشرتنا البريدية، مثل الاسم والبريد الإلكتروني، بالإضافة إلى بيانات الاستخدام الأساسية لتحسين تجربتك على الموقع.",
  },
  {
    title: "٢. كيف نستخدم معلوماتك",
    body: "نستخدم بياناتك لإتمام عمليات الشراء، وإرسال نسخ الكتب الرقمية، والتواصل معك بشأن إصدارات جديدة إن اخترتِ الاشتراك، ولا نشارك بياناتك مع أي جهة خارجية لأغراض تسويقية.",
  },
  {
    title: "٣. حماية البيانات",
    body: "نتخذ إجراءات تقنية وتنظيمية معقولة لحماية معلوماتك من الوصول غير المصرح به أو الفقدان أو سوء الاستخدام، مع العلم أنه لا توجد وسيلة نقل أو تخزين إلكترونية تضمن أمانًا مطلقًا.",
  },
  {
    title: "٤. حقوقك",
    body: "يحق لك في أي وقت طلب الاطلاع على بياناتك أو تعديلها أو حذفها، وذلك بالتواصل معنا عبر صفحة التواصل.",
  },
  {
    title: "٥. ملفات تعريف الارتباط",
    body: "نستخدم ملفات تعريف ارتباط أساسية لضمان عمل الموقع بشكل سليم، ولا نستخدمها لأغراض إعلانية تتبعية.",
  },
  {
    title: "٦. التواصل معنا",
    body: "لأي استفسار حول سياسة الخصوصية هذه، يمكنك التواصل معنا عبر البريد الإلكتروني lumora.m.house@gmail.com.",
  },
];

export default function PrivacyPage() {
  return (
    <PageShell>
      <Helmet title="سياسة الخصوصية — مرافئ" />
      <PageHeader eyebrow="قانوني" title="سياسة الخصوصية" description="آخر تحديث: يونيو ٢٠٢٦" />
      <section className="px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-3xl space-y-10">
          {sections.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.04}>
              <h2 className="font-display text-xl text-ink">{s.title}</h2>
              <p className="mt-3 text-balance leading-loose text-ink-soft">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

