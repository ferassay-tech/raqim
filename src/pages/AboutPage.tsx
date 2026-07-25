import { PageShell } from "../components/page-shell";
import { GoldDivider, IconBook, IconHeart, IconCrescent, IconJournal } from "../components/ornaments";
import { Reveal } from "../components/motion-primitives";
import { UnderlineLink } from "../components/cta";
import { Helmet } from "../components/Helmet";

export default function AboutPage() {
  return (
    <PageShell>
      <Helmet
        title="عن رقيم"
        description="تعرّفي على رقيم، دار النشر الرقمية الفاخرة للمرأة العربية."
      />
      <section className="relative overflow-hidden px-6 pb-20 pt-16 lg:px-10 lg:pt-24">
        <div className="pointer-events-none absolute inset-0">
          <img src="/assets/philosophy.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.1]" />
          <div className="absolute inset-0 bg-gradient-to-b from-ivory via-ivory/95 to-ivory" />
        </div>
        <div className="relative mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.25em] text-gold">عن الدار</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 font-display text-4xl leading-tight text-ink md:text-5xl">
              رقيم: حيث تتحول المعرفة إلى أثر خالد
            </h1>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="mt-6 flex justify-center">
              <GoldDivider className="h-5 w-52 text-gold" />
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 text-balance text-lg leading-loose text-ink-soft">
              رقيم دار نشر رقمية عربية فاخرة، متخصصة في الكتب والمنتجات الرقمية الراقية. نؤمن أن
              كل فكرة تستحق أن تُوثَّق، وأن كل كتاب يترك أثرًا، وأن المعرفة الخالدة تتحول إلى رقيم.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-cream px-6 py-24 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.25em] text-gold">قصتنا</p>
            <h2 className="mt-4 text-balance font-display text-3xl leading-tight text-ink md:text-4xl">
              لماذا رقيم؟
            </h2>
            <p className="mt-6 max-w-lg text-balance leading-loose text-ink-soft">
              اسم رقيم مستوحى من الرقيم، الأثر المكتوب الذي يحفظ المعرفة ويصونها عبر الزمن. أطلقنا
              الدار لتكون مساحة تتحول فيها الأفكار إلى أثر يبقى، وتتحول فيها المعرفة الخالدة إلى
              رقيم، عبر كتب رقمية فاخرة تُصمَّم بعناية فائقة، من اختيار الكلمة إلى تفاصيل التصميم.
            </p>
           <p className="mt-4 max-w-lg text-balance leading-loose text-ink-soft">
  رسالتنا هي صناعة تجربة معرفية تجمع بين الجمال والعمق والهوية العربية، لنقدم أعمالًا تترك أثرًا وترافق القارئ في مختلف مراحل رحلته.
</p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="overflow-hidden rounded-[10px]">
              <img
  src="/assets/lumora-about.webp"
  alt="رقيم للنشر والإصدارات الرقمية"
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
            <p className="text-sm uppercase tracking-[0.25em] text-gold">قيمنا</p>
            <h2 className="mt-4 font-display text-3xl text-ink md:text-4xl">ما الذي يوجّهنا</h2>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <IconBook className="h-8 w-8" />, title: "جودة لا تُساوَم", body: "كل كتاب يمر بمراحل تحرير وتصميم دقيقة قبل أن يصل إليك." },
              { icon: <IconHeart className="h-8 w-8" />, title: "صدق في الطرح", body: "نبتعد عن المبالغة، ونكتب بلغة صادقة تلامس واقعك." },
              { icon: <IconCrescent className="h-8 w-8" />, title: "جذور أصيلة", body: "نستلهم من تراثنا الإسلامي والعربي بروح معاصرة." },
              { icon: <IconJournal className="h-8 w-8" />, title: "أثر يدوم", body: "نصمم كل إصدار ليكون رفيقًا تعودين إليه مرارًا." },
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
          <h2 className="font-display text-3xl text-ink md:text-4xl">اكتشفي إصدارنا الأول</h2>
          <div className="mt-6 flex justify-center">
            <UnderlineLink to="/books/kuni-hajar">
  اكتشفي كتاب «كوني هاجر»
</UnderlineLink>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}

