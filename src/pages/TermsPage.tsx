import { PageShell, PageHeader } from "../components/page-shell";
import { Reveal } from "../components/motion-primitives";
import { Helmet } from "../components/Helmet";

const sections = [
  {
    title: "١. قبول الشروط",
    body: "باستخدامك موقع مرافئ وشرائك أيًا من منتجاتنا الرقمية، فإنك توافقين على الالتزام بهذه الشروط والأحكام.",
  },
  {
    title: "٢. المنتجات الرقمية",
    body: "جميع المنتجات المعروضة على الموقع هي منتجات رقمية، وقد تُقدَّم بصيغ مختلفة حسب نوع المنتج. تُسلَّم للمشتري بالطريقة الموضحة أثناء عملية الشراء، وهي مخصصة للاستخدام الشخصي فقط ولا يجوز إعادة بيعها أو توزيعها.",
  },
  {
    title: "٣. حقوق الملكية الفكرية",
    body: "جميع المحتويات المنشورة على هذا الموقع، بما في ذلك النصوص والتصاميم والصور، محمية بحقوق الملكية الفكرية لصالح مرافئ ومؤلفيها، ويُمنع إعادة نشرها أو توزيعها دون إذن كتابي.",
  },
  {
    title: "٤. سياسة الاسترجاع",
    body: "نظرًا لطبيعة المنتجات الرقمية، تُراجع طلبات الاسترجاع أو الاستبدال كل حالة على حدة وفقًا للسياسة المعتمدة لدى مرافئ.",
  },
  {
    title: "٥. تعديل الشروط",
    body: "تحتفظ مرافئ بحق تعديل هذه الشروط في أي وقت، وسيُعلن عن أي تغيير جوهري عبر الموقع أو البريد الإلكتروني.",
  },
  {
    title: "٦. القانون الحاكم",
    body: "تخضع هذه الشروط وتُفسَّر وفقًا للأنظمة المعمول بها، وأي نزاع يُحال إلى الجهات المختصة.",
  },
];

export default function TermsPage() {
  return (
    <PageShell>
      <Helmet title="الشروط والأحكام — مرافئ" />
      <PageHeader eyebrow="قانوني" title="الشروط والأحكام" description="آخر تحديث: يونيو ٢٠٢٦" />
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

