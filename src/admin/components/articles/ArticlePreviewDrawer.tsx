import type { AdminArticle } from "../../types/article";
import { ARTICLE_STATUS_META, estimateReadingMinutes } from "../../lib/articleStatus";
import { Drawer } from "../Drawer";
import { StatusBadge } from "../StatusBadge";

type PreviewArticle = Pick<
  AdminArticle,
  "title" | "excerpt" | "content" | "coverImage" | "author" | "status"
>;

interface ArticlePreviewDrawerProps {
  article: PreviewArticle | null;
  onClose: () => void;
}

/** Reflects whatever is currently in the editor's form state — including
 * unsaved changes — not just the last-saved article, so "preview" means
 * what a reader would actually see if this were live right now. */
export function ArticlePreviewDrawer({ article, onClose }: ArticlePreviewDrawerProps) {
  return (
    <Drawer open={Boolean(article)} onClose={onClose} title="معاينة المقالة">
      {article && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <StatusBadge variant={ARTICLE_STATUS_META[article.status].variant}>
              {ARTICLE_STATUS_META[article.status].label}
            </StatusBadge>
            <span className="text-xs text-ink-faint">
              {estimateReadingMinutes(article.content)} دقائق قراءة
            </span>
          </div>

          {article.coverImage && (
            <div className="overflow-hidden rounded-[10px]">
              <img src={article.coverImage} alt={article.title} className="h-40 w-full object-cover" />
            </div>
          )}

          <div>
            <h1 className="font-display text-2xl leading-snug text-ink">
              {article.title || "بلا عنوان"}
            </h1>
            <p className="mt-1.5 text-sm text-ink-faint">بقلم {article.author || "—"}</p>
          </div>

          {article.excerpt && (
            <p className="border-r-2 border-gold/40 pr-3 text-sm leading-relaxed text-ink-soft">
              {article.excerpt}
            </p>
          )}

          <div className="flex flex-col gap-3 text-sm leading-loose text-ink-soft">
            {article.content
              .split("\n")
              .filter((p) => p.trim())
              .map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
          </div>
        </div>
      )}
    </Drawer>
  );
}
