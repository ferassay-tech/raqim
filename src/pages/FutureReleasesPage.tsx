import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PageShell, PageHeader } from "../components/page-shell";
import { Reveal } from "../components/motion-primitives";
import { GoldDivider } from "../components/ornaments";
import { Helmet } from "../components/Helmet";
import { useBooks } from "../admin/context/BooksContext";
import { useAssetDimensions } from "../lib/mediaDimensions";

export default function FutureReleasesPage() {
  const { books } = useBooks();
  const getDimensions = useAssetDimensions();
  const upcoming = useMemo(
    () =>
      books
        .filter((b) => b.deletedAt === null && b.placement === "comingSoon")
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [books]
  );

  return (
    <PageShell>
      <Helmet
        title="إصدارات قادمة — رقيم"
        description="تعرّفي على الكتب القادمة من رقيم قبل صدورها."
        path="/future-releases"
      />
      <PageHeader
        eyebrow="قريبًا"
        title="إصدارات قادمة"
        description="نعمل على إعداد إصدارات جديدة بعناية. تعرّفي على الكتب القادمة من رقيم قبل صدورها."
      />

      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-4xl space-y-8">
          {upcoming.map((book, i) => (
            <Reveal key={book.id} delay={i * 0.08}>
              <div className="flex flex-col items-center gap-8 rounded-[10px] border border-beige bg-cream/40 p-8 sm:flex-row-reverse sm:text-right">
                <div className="w-40 shrink-0 rounded-[10px] bg-gradient-to-br from-cream to-beige p-4">
                  {book.cover && (
                    <img
                      src={book.cover}
                      alt={book.title}
                      width={getDimensions(book.cover)?.width}
                      height={getDimensions(book.cover)?.height}
                      className="w-full object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-gold">{book.category}</p>
                  <h2 className="mt-2 font-display text-2xl text-ink">{book.title}</h2>
                  <p className="mt-1 text-sm text-ink-soft">{book.author}</p>
                  <p className="mt-3 text-balance leading-relaxed text-ink-soft">{book.description}</p>
                  <span className="mt-4 inline-block rounded-full bg-lavender/50 px-4 py-1.5 text-xs text-ink">
                    قريبًا
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3} className="mx-auto mt-16 max-w-2xl text-center">
          <GoldDivider className="mx-auto h-4 w-44 text-gold" />
          <p className="mt-6 text-balance leading-loose text-ink-soft">
            كوني أول من يعلم بموعد صدور كل كتاب جديد عبر نشرتنا البريدية.
          </p>
          <Link to="/" className="mt-4 inline-block text-sm text-gold hover:underline">
            العودة إلى الرئيسية
          </Link>
        </Reveal>
      </section>
    </PageShell>
  );
}
