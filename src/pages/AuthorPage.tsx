import { Link, useParams, Navigate } from "react-router-dom";
import { PageShell } from "../components/page-shell";
import { getAuthorBySlug, getBookBySlug } from "../lib/content";
import { GoldDivider } from "../components/ornaments";
import { UnderlineLink } from "../components/cta";
import { Reveal } from "../components/motion-primitives";
import { Helmet } from "../components/Helmet";

export default function AuthorPage() {
  const { slug } = useParams<{ slug: string }>();
  const author = getAuthorBySlug(slug ?? "");

  if (!author) return <Navigate to="/books" replace />;

  return (
    <PageShell>
      <Helmet title={`${author.name} — رقيم`} url={`https://r-aqim.com/authors/${author.slug}`} />
      <section className="px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-[0.6fr_1.4fr]">
          <Reveal className="flex justify-center">
            <div className="flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-cream to-lavender/40 font-logotype text-7xl text-gold">
              {author.name.charAt(0)}
            </div>
          </Reveal>
          <Reveal delay={0.1} className="text-center lg:text-right">
            <p className="text-sm uppercase tracking-[0.25em] text-gold">{author.title}</p>
            <h1 className="mt-4 font-display text-4xl text-ink md:text-5xl">{author.name}</h1>
            <div className="mt-5 flex justify-center lg:justify-end">
              <GoldDivider className="h-4 w-44 text-gold" />
            </div>
            <p className="mx-auto mt-6 max-w-2xl text-balance leading-loose text-ink-soft lg:mx-0">
              {author.bio}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-cream px-6 py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <p className="text-sm uppercase tracking-[0.25em] text-gold">الإصدارات</p>
            <h2 className="mt-4 font-display text-3xl text-ink md:text-4xl">أعمال {author.name}</h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {author.books.map((bookSlug, i) => {
              const book = getBookBySlug(bookSlug);
              if (!book) return null;
              return (
                <Reveal key={bookSlug} delay={i * 0.08}>
                  <Link
                    to={`/books/${book.slug}`}
                    className="group block overflow-hidden rounded-[10px] border border-beige bg-ivory"
                  >
                    <div className="aspect-[3/4] bg-gradient-to-br from-cream to-beige p-8">
                      <img src={book.cover} alt={book.title} className="mx-auto h-full w-auto object-contain" loading="lazy" />
                    </div>
                    <div className="p-5 text-right">
                      <h3 className="font-display text-lg text-ink">{book.title}</h3>
                      <div className="mt-3">
                        <UnderlineLink to={`/books/${book.slug}`}>
  {book.comingSoon ? "ترقبوا قريبًا" : "عرض الكتاب"}
</UnderlineLink>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

