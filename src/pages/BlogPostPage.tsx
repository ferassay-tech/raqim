import { Link, useParams, Navigate } from "react-router-dom";
import { PageShell } from "../components/page-shell";
import { blogPosts } from "../lib/content";
import { Reveal } from "../components/motion-primitives";
import { GoldDivider } from "../components/ornaments";
import { Helmet } from "../components/Helmet";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <PageShell>
      <Helmet title={`${post.title} — مدونة مرافئ`} description={post.excerpt} />
      <article className="px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <div className="flex items-center justify-center gap-3 text-xs text-ink-soft">
              <span className="text-gold">{post.category}</span>
              <span>·</span>
              <span>{post.readTime}</span>
              <span>·</span>
              <span>{post.date}</span>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="mt-5 text-balance text-center font-display text-4xl leading-tight text-ink md:text-5xl">
              {post.title}
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="mt-6 flex justify-center">
              <GoldDivider className="h-4 w-44 text-gold" />
            </div>
          </Reveal>

          <div className="mt-12 space-y-6">
            {post.body.map((para, i) => (
              <Reveal key={i} delay={0.05 * i}>
                <p className="text-balance text-lg leading-loose text-ink-soft">{para}</p>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 border-t border-beige pt-8 text-center space-y-4">
  <Link to="/blog" className="block text-sm text-gold hover:underline">
    العودة إلى المدونة
  </Link>

  <Link to="/books" className="block text-sm text-ink hover:text-gold transition-colors">
    تصفح كتب مرافئ
  </Link>
</div>
        </div>
      </article>
    </PageShell>
  );
}

