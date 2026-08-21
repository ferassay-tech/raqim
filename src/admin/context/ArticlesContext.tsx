import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AdminArticle, AdminArticleRaw, ArticleStatus } from "../types/article";
import type { LocalizedText } from "../types/siteContent";
import { INITIAL_ARTICLES } from "../data/articlesData";
import { articleFromSupabaseRow, articleToSupabaseRow, articlesRepository } from "./articlesRepository.ts";
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
  createArticle: (values: Omit<AdminArticleRaw, "id" | "updatedAt">) => Promise<void>;
  updateArticle: (id: string, values: Omit<AdminArticleRaw, "id" | "updatedAt">) => void;
  deleteArticle: (id: string) => void;
  deleteArticles: (ids: string[]) => void;
  duplicateArticle: (id: string) => void;
  setArticlesStatus: (ids: string[], status: ArticleStatus) => void;
  loadError: string | null;
  reload: () => void;
}

const ArticlesContext = createContext<ArticlesContextValue | null>(null);

const today = () => new Date().toISOString().slice(0, 10);

const FALLBACK_LANGUAGE: Language = "ar";

function resolveText(value: LocalizedText, language: Language): string {
  return value[language] || value[FALLBACK_LANGUAGE] || "";
}

// Older records (and the original seed data) stored these copy fields as
// plain strings. Wrapping any plain string into { ar: value, en: "" } on
// read means existing article data is never lost — this is a pure,
// idempotent transform, so already-migrated data just passes through
// unchanged. Mirrors the SiteContent/Books/Categories migration.
//
// `seedValue`, when given, self-heals a record that already persisted this
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

/**
 * Articles, backed by the Supabase `articles` table since Phase 6F. No
 * auth-gating on the mount-fetch — the public blog genuinely needs to
 * read this. migrateArticle/resolveArticle/slugify are unchanged from
 * before this migration; they operate on whatever the repository
 * returns instead of whatever usePersistedState returned.
 */
export function ArticlesProvider({ children }: { children: ReactNode }) {
  const [storedArticles, setStoredArticles] = useState<AdminArticleRaw[]>(INITIAL_ARTICLES);
  const { language } = useLanguage();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    articlesRepository
      .list()
      .then((rows) => {
        if (cancelled) return;
        setStoredArticles(rows.map(articleFromSupabaseRow));
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load articles from Supabase:", error);
        setLoadError("تعذر تحميل المقالات من الخادم.");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const rawArticles = useMemo(() => storedArticles.map(migrateArticle), [storedArticles]);
  const articles = useMemo(() => rawArticles.map((a) => resolveArticle(a, language)), [rawArticles, language]);

  const getArticle = useCallback((id: string) => articles.find((a) => a.id === id), [articles]);
  const getRawArticle = useCallback((id: string) => rawArticles.find((a) => a.id === id), [rawArticles]);

  // Id computed from the storedArticles closure, not inside a setState
  // updater — React 18 StrictMode double-invokes updater functions in
  // dev to catch impure code like a repository write triggered from one.
  const createArticle = useCallback(
    async (values: Omit<AdminArticleRaw, "id" | "updatedAt">) => {
      const base = slugify(values.title.ar);
      let id = base;
      let n = 2;
      while (storedArticles.some((a) => a.id === id)) {
        id = `${base}-${n}`;
        n += 1;
      }
      const created: AdminArticleRaw = { ...values, id, updatedAt: today() };
      await articlesRepository.create(articleToSupabaseRow(created));
      setStoredArticles((prev) => [created, ...prev]);
    },
    [storedArticles]
  );

  const updateArticle = useCallback((id: string, values: Omit<AdminArticleRaw, "id" | "updatedAt">) => {
    const updated: AdminArticleRaw = { ...values, id, updatedAt: today() };
    void articlesRepository
      .update(id, articleToSupabaseRow(updated))
      .then(() => {
        setStoredArticles((prev) => prev.map((a) => (a.id === id ? updated : a)));
      })
      .catch((error) => {
        console.error("Failed to update article:", error);
      });
  }, []);

  const deleteArticle = useCallback((id: string) => {
    void articlesRepository
      .remove(id)
      .then(() => {
        setStoredArticles((prev) => prev.filter((a) => a.id !== id));
      })
      .catch((error) => {
        console.error("Failed to delete article:", error);
      });
  }, []);

  const deleteArticles = useCallback(
    (ids: string[]) => {
      ids.forEach((id) => deleteArticle(id));
    },
    [deleteArticle]
  );

  const duplicateArticle = useCallback(
    (id: string) => {
      const source = storedArticles.find((a) => a.id === id);
      if (!source) return;
      // Suffix both id and slug together — slug now has a unique
      // constraint (Phase 6F migration), so duplicating an already-
      // duplicated article must avoid colliding on either field, not
      // just id as before.
      let n = 2;
      let dupId = `${source.id}-copy`;
      let dupSlug = `${source.slug}-copy`;
      while (storedArticles.some((a) => a.id === dupId || a.slug === dupSlug)) {
        dupId = `${source.id}-copy-${n}`;
        dupSlug = `${source.slug}-copy-${n}`;
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
        slug: dupSlug,
        status: "draft",
        publishedAt: null,
        scheduledFor: null,
        updatedAt: today(),
      };
      void articlesRepository
        .create(articleToSupabaseRow(duplicate))
        .then(() => {
          setStoredArticles((prev) => {
            const index = prev.findIndex((a) => a.id === id);
            return [...prev.slice(0, index + 1), duplicate, ...prev.slice(index + 1)];
          });
        })
        .catch((error) => {
          console.error("Failed to duplicate article:", error);
        });
    },
    [storedArticles]
  );

  const setArticlesStatus = useCallback(
    (ids: string[], status: ArticleStatus) => {
      const idSet = new Set(ids);
      const targets = storedArticles.filter((a) => idSet.has(a.id));
      for (const target of targets) {
        const updated: AdminArticleRaw = {
          ...target,
          status,
          publishedAt: status === "published" ? (target.publishedAt ?? today()) : target.publishedAt,
          updatedAt: today(),
        };
        void articlesRepository
          .update(target.id, articleToSupabaseRow(updated))
          .then(() => {
            setStoredArticles((prev) => prev.map((a) => (a.id === target.id ? updated : a)));
          })
          .catch((error) => {
            console.error("Failed to update article status:", error);
          });
      }
    },
    [storedArticles]
  );

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
      loadError,
      reload,
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
      loadError,
      reload,
    ]
  );

  return <ArticlesContext.Provider value={value}>{children}</ArticlesContext.Provider>;
}

export function useArticles() {
  const ctx = useContext(ArticlesContext);
  if (!ctx) throw new Error("useArticles must be used within ArticlesProvider");
  return ctx;
}
