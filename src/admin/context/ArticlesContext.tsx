import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { AdminArticle, ArticleStatus } from "../types/article";
import { INITIAL_ARTICLES } from "../data/articlesData";
import { usePersistedState } from "../lib/usePersistedState";

interface ArticlesContextValue {
  articles: AdminArticle[];
  getArticle: (id: string) => AdminArticle | undefined;
  createArticle: (values: Omit<AdminArticle, "id" | "updatedAt">) => AdminArticle;
  updateArticle: (id: string, values: Omit<AdminArticle, "id" | "updatedAt">) => void;
  deleteArticle: (id: string) => void;
  deleteArticles: (ids: string[]) => void;
  duplicateArticle: (id: string) => void;
  setArticlesStatus: (ids: string[], status: ArticleStatus) => void;
}

const ArticlesContext = createContext<ArticlesContextValue | null>(null);

const today = () => new Date().toISOString().slice(0, 10);

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
  const [articles, setArticles] = usePersistedState<AdminArticle[]>("articles", INITIAL_ARTICLES);

  const getArticle = useCallback((id: string) => articles.find((a) => a.id === id), [articles]);

  const createArticle = useCallback((values: Omit<AdminArticle, "id" | "updatedAt">) => {
    let id = slugify(values.title);
    setArticles((prev) => {
      let candidate = id;
      let n = 2;
      while (prev.some((a) => a.id === candidate)) {
        candidate = `${id}-${n}`;
        n += 1;
      }
      id = candidate;
      return [{ ...values, id, updatedAt: today() }, ...prev];
    });
    return { ...values, id, updatedAt: today() };
  }, [setArticles]);

  const updateArticle = useCallback((id: string, values: Omit<AdminArticle, "id" | "updatedAt">) => {
    setArticles((prev) => prev.map((a) => (a.id === id ? { ...values, id, updatedAt: today() } : a)));
  }, [setArticles]);

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
      const duplicate: AdminArticle = {
        ...source,
        id: dupId,
        title: `${source.title} (نسخة)`,
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
      createArticle,
      updateArticle,
      deleteArticle,
      deleteArticles,
      duplicateArticle,
      setArticlesStatus,
    }),
    [articles, getArticle, createArticle, updateArticle, deleteArticle, deleteArticles, duplicateArticle, setArticlesStatus]
  );

  return <ArticlesContext.Provider value={value}>{children}</ArticlesContext.Provider>;
}

export function useArticles() {
  const ctx = useContext(ArticlesContext);
  if (!ctx) throw new Error("useArticles must be used within ArticlesProvider");
  return ctx;
}
