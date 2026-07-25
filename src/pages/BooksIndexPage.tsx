import { Link } from "react-router-dom";
import { PageShell, PageHeader } from "../components/page-shell";
import { books } from "../lib/content";
import { Reveal } from "../components/motion-primitives";
import { Helmet } from "../components/Helmet";

export default function BooksIndexPage() {
  return (
    <PageShell>
      <Helmet title="الكتب — رقيم" description="استكشفي مكتبة رقيم الكاملة من الكتب الفاخرة." />
      <PageHeader
        eyebrow="المكتبة"
        title="كل كتب رقيم"
        description="مجموعة مختارة بعناية من الكتب الفاخرة للمرأة والأم، تجمع بين الجمال والعمق."
      />

      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book, i) => (
            <Reveal key={book.slug} delay={i * 0.05}>
              <Link
                to={`/books/${book.slug}`}
                className="group block h-full overflow-hidden rounded-[10px] border border-beige bg-cream/40 transition-shadow duration-300 hover:shadow-[0_20px_45px_-20px_rgba(44,36,32,0.25)]"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-cream to-beige p-8">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="mx-auto h-full w-auto object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  {book.comingSoon && (
                    <span className="absolute left-4 top-4 rounded-full bg-lavender/80 px-3 py-1 text-xs text-ink">
                      قريبًا
                    </span>
                  )}
                </div>
                <div className="p-6 text-right">
                  <p className="text-xs text-gold">{book.category}</p>
                  <h2 className="mt-2 font-display text-xl text-ink">{book.title}</h2>
                  <p className="mt-1.5 text-sm text-ink-soft">{book.author}</p>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-soft">{book.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-beige pt-4">
  <span className="text-sm text-ink">
    {book.comingSoon ? "قريبًا" : book.price}
  </span>

  <span className="text-xs text-gold opacity-0 transition-opacity group-hover:opacity-100">
    {book.comingSoon ? "اعرف المزيد ←" : "عرض التفاصيل ←"}
  </span>
</div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

