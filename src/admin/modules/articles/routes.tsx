import { Route } from "react-router-dom";
import ArticlesListPage from "./pages/ArticlesListPage";
import ArticleNewPage from "./pages/ArticleNewPage";
import ArticleEditPage from "./pages/ArticleEditPage";
import { RequirePermission } from "@/admin/components/ui/RequirePermission";

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
          <ArticleNewPage />
        </RequirePermission>
      }
    />
    <Route
      path="articles/edit/:id"
      element={
        <RequirePermission permission="articles.edit">
          <ArticleEditPage />
        </RequirePermission>
      }
    />
  </>
);
