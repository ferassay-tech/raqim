import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import ArticlesListPage from "./pages/ArticlesListPage";
import { RequirePermission } from "@/admin/components/ui/RequirePermission";

// ArticleEditor (the heavy shared rich-text editor both of these render) is
// only needed once someone opens the create/edit screen.
const ArticleNewPage = lazy(() => import("./pages/ArticleNewPage"));
const ArticleEditPage = lazy(() => import("./pages/ArticleEditPage"));

export const articlesRoutes = (
  <>
    <Route
      path="articles"
      element={
        <RequirePermission permission="articles.view">
          <ArticlesListPage />
        </RequirePermission>
      }
    />
    <Route
      path="articles/new"
      element={
        <RequirePermission permission="articles.create">
          <Suspense fallback={null}>
            <ArticleNewPage />
          </Suspense>
        </RequirePermission>
      }
    />
    <Route
      path="articles/edit/:id"
      element={
        <RequirePermission permission="articles.edit">
          <Suspense fallback={null}>
            <ArticleEditPage />
          </Suspense>
        </RequirePermission>
      }
    />
  </>
);
