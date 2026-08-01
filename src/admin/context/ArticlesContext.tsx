import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { AdminArticle, AdminArticleRaw, ArticleStatus } from "../types/article";
import type { LocalizedText } from "../types/siteContent";
import { INITIAL_ARTICLES } from "../data/articlesData";
import { usePersistedState } from "../lib/usePersistedState";
import { useLanguage } from "../../context/LanguageContext";
import type { Language } from "../../context/LanguageContext";

interface ArticlesContextValue {
  /** Resolved for the active site language — public pages (BlogIndexPage,
   * BlogPostPage, SearchPage) and structuredData's articleSchema consume
   * this, unchanged shape. */
  articles: AdminArticle[];
  getArticle: (id: string) => AdminArticle | undefined;
  /** Raw, bilingual — Article Editor only. */
  getRawArticle: (id: string) => AdminArticleRaw | undefined;
  createArticle: (values: Omit<AdminArticleRaw, "id" | "updatedAt">) => AdminArticleRaw;
  updateArticle: (id: string, values: Omit<AdminArticleRaw, "id" | "updatedAt">) => void;
  deleteArticle: (id: string) => void;
  deleteArticles: (ids: string[]) => void;
  duplicateArticle: (id: string) => void;
  setArticlesStatus: (ids: string[], status: ArticleStatus) => void;
}

const ArticlesContext = createContext<ArticlesContextValue | null>(null);

const today = () => new Date().toISOString().slice(0, 10);

const FALLBACK_LANGUAGE: Language = "ar";

function resolveText(value: LocalizedText, language: Language): string {
  return value[language] || value[FALLBACK_LANGUAGE] || "";
}

// Older localStorage records (and the original seed data) stored these
// copy fields as plain strings. Wrapping any plain string into
// { ar: value, en: "" } on read means existing article data is never
// lost — this is a pure, idempotent transform, so already-migrated data
// just passes through unchanged. Mirrors the SiteContent/Books/Categories
// migration.
//
// `seedValue`, when given, self-heals a browser that already persisted this
// exact field from before an English translation was written for it — see
// BooksContext.tsx's migrateLocalizedText for the full rationale.
function migrateLocalizedText(value: unknown, seedValue?: LocalizedText): LocalizedText {
  const migrated: LocalizedText =
    typeof value === "string"
      ? { ar: value, en: "" }
      : value && typeof value === "object"
        ? { ar: (value as Partial<LocalizedText>).ar ?? "", en: (value as Partial<LocalizedText>).en ?? "" }
        : { ar: "", en: "" };
  if (!migrated.en && seedValue?.en) {
    return { ...migrated, en: seedValue.en };
  }
  return migrated;
}

function migrateArticle(raw: AdminArticleRaw): AdminArticleRaw {
  const seed = INITIAL_ARTICLES.find((a) => a.id === raw.id);
  return {
    ...raw,
    title: migrateLocalizedText(raw.title, seed?.title),
    excerpt: migrateLocalizedText(raw.excerpt, seed?.excerpt),
    content: migrateLocalizedText(raw.content, seed?.content),
    category: migrateLocalizedText(raw.category, seed?.category),
    seoTitle: migrateLocalizedText(raw.seoTitle, seed?.seoTitle),
    seoDescription: migrateLocalizedText(raw.seoDescription, seed?.seoDescription),
  };
}

function resolveArticle(raw: AdminArticleRaw, language: Language): AdminArticle {
  return {
    ...raw,
    title: resolveText(raw.title, language),
    excerpt: resolveText(raw.excerpt, language),
    content: resolveText(raw.content, language),
    category: resolveText(raw.category, language),
    seoTitle: resolveText(raw.seoTitle, language),
    seoDescription: resolveText(raw.seoDescription, language),
  };
}

function slugify(title: string) {
  return (
    title
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/(^-|-$)/g, "") || "article"
  );
}

export function ArticlesProvider({ children }: { children: ReactNode }) {
  const [storedArticles, setArticles] = usePersistedState<AdminArticleRaw[]>("articles", INITIAL_ARTICLES);
  const { language } = useLanguage();

  const rawArticles = useMemo(() => storedArticles.map(migrateArticle), [storedArticles]);
  const articles = useMemo(() => rawArticles.map((a) => resolveArticle(a, language)), [rawArticles, language]);

  const getArticle = useCallback((id: string) => articles.find((a) => a.id === id), [articles]);
  const getRawArticle = useCallback((id: string) => rawArticles.find((a) => a.id === id), [rawArticles]);

  const createArticle = useCallback(
    (values: Omit<AdminArticleRaw, "id" | "updatedAt">) => {
      let id = slugify(values.title.ar);
      let created!: AdminArticleRaw;
      setArticles((prev) => {
        let candidate = id;
        let n = 2;
        while (prev.some((a) => a.id === candidate)) {
          candidate = `${id}-${n}`;
          n += 1;
        }
        id = candidate;
        created = { ...values, id, updatedAt: today() };
        return [created, ...prev];
      });
      return created;
    },
    [setArticles]
  );

  const updateArticle = useCallback(
    (id: string, values: Omit<AdminArticleRaw, "id" | "updatedAt">) => {
      setArticles((prev) => prev.map((a) => (a.id === id ? { ...values, id, updatedAt: today() } : a)));
    },
    [setArticles]
  );

  const deleteArticle = useCallback((id: string) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  }, [setArticles]);

  const deleteArticles = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setArticles((prev) => prev.filter((a) => !idSet.has(a.id)));
  }, [setArticles]);

  const duplicateArticle = useCallback((id: string) => {
    setArticles((prev) => {
      const source = prev.find((a) => a.id === id);
      if (!source) return prev;
      let dupId = `${source.id}-copy`;
      let n = 2;
      while (prev.some((a) => a.id === dupId)) {
        dupId = `${source.id}-copy-${n}`;
        n += 1;
      }
      const sourceTitle = migrateLocalizedText(source.title);
      const duplicate: AdminArticleRaw = {
        ...source,
        id: dupId,
        title: {
          ar: `${sourceTitle.ar} (نسخة)`,
          en: sourceTitle.en ? `${sourceTitle.en} (copy)` : "",
        },
        slug: `${source.slug}-copy`,
        status: "draft",
        publishedAt: null,
        scheduledFor: null,
        updatedAt: today(),
      };
      const index = prev.findIndex((a) => a.id === id);
      return [...prev.slice(0, index + 1), duplicate, ...prev.slice(index + 1)];
    });
  }, [setArticles]);

  const setArticlesStatus = useCallback((ids: string[], status: ArticleStatus) => {
    const idSet = new Set(ids);
    setArticles((prev) =>
      prev.map((a) =>
        idSet.has(a.id)
          ? {
              ...a,
              status,
              publishedAt: status === "published" ? a.publishedAt ?? today() : a.publishedAt,
              updatedAt: today(),
            }
          : a
      )
    );
  }, [setArticles]);

  const value = useMemo(
    () => ({
      articles,
      getArticle,
      getRawArticle,
      createArticle,
      updateArticle,
      deleteArticle,
      deleteArticles,
      duplicateArticle,
      setArticlesStatus,
    }),
    [
      articles,
      getArticle,
      getRawArticle,
      createArticle,
      updateArticle,
      deleteArticle,
      deleteArticles,
      duplicateArticle,
      setArticlesStatus,
    ]
  );

  return <ArticlesContext.Provider value={value}>{children}</ArticlesContext.Provider>;
}

export function useArticles() {
  const ctx = useContext(ArticlesContext);
  if (!ctx) throw new Error("useArticles must be used within ArticlesProvider");
  return ctx;
}
