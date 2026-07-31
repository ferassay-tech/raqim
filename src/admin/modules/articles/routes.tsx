import { Route } from "react-router-dom";
import ArticlesListPage from "./pages/ArticlesListPage";
import ArticleNewPage from "./pages/ArticleNewPage";
import ArticleEditPage from "./pages/ArticleEditPage";

export const articlesRoutes = (
  <>
    <Route path="articles" element={<ArticlesListPage />} />
    <Route path="articles/new" element={<ArticleNewPage />} />
    <Route path="articles/edit/:id" element={<ArticleEditPage />} />
  </>
);
