import { Link } from "react-router-dom";
import { PageShell, PageHeader } from "../components/page-shell";
import { blogPosts } from "../lib/content";
import { Reveal } from "../components/motion-primitives";
import { Helmet } from "../components/Helmet";

export default function BlogIndexPage() {
  return (
    <PageShell>
      <Helmet
        title="المدونة — مرافئ"
        description="مقالات وأفكار من مرافئ حول الكتب، والثقافة، والكتابة، والإلهام."
      />
      <PageHeader
        eyebrow="المدونة"
        title="كلمات تستحق وقتك"
        description="مقالات وأفكار نكتبها بعناية حول الكتب، والثقافة، والتطوير الذاتي، والإلهام، وكل ما يثري رحلة القارئ."
      />

      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
          {blogPosts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.08} className={i === 0 ? "lg:col-span-2" : ""}>
              <Link
                to={`/blog/${post.slug}`}
                className="group block rounded-[10px] border border-beige bg-cream/40 p-8 transition-shadow duration-300 hover:shadow-[0_20px_45px_-20px_rgba(44,36,32,0.25)]"
              >
                <div className="flex items-center gap-3 text-xs text-ink-soft">
                  <span className="text-gold">{post.category}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                  <span>·</span>
                  <span>{post.date}</span>
                </div>
                <h2 className="mt-4 font-display text-2xl leading-snug text-ink">{post.title}</h2>
                <p className="mt-3 text-balance leading-relaxed text-ink-soft">{post.excerpt}</p>
                <span className="mt-5 inline-block text-sm text-gold opacity-0 transition-opacity group-hover:opacity-100">
                  متابعة القراءة ←
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

