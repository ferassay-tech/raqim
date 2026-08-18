import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import BooksListPage from "./pages/BooksListPage";
import { RequirePermission } from "@/admin/components/ui/RequirePermission";

// BookForm (the heavy shared editor both of these render) is only ever
// needed once someone opens the create/edit screen — the list page (the
// common landing view for this module) stays eagerly imported.
const BookNewPage = lazy(() => import("./pages/BookNewPage"));
const BookEditPage = lazy(() => import("./pages/BookEditPage"));

export const booksRoutes = (
  <>
    <Route
      path="books"
      element={
        <RequirePermission permission="books.view">
          <BooksListPage />
        </RequirePermission>
      }
    />
    <Route
      path="books/new"
      element={
        <RequirePermission permission="books.create">
          <Suspense fallback={null}>
            <BookNewPage />
          </Suspense>
        </RequirePermission>
      }
    />
    <Route
      path="books/edit/:id"
      element={
        <RequirePermission permission="books.edit">
          <Suspense fallback={null}>
            <BookEditPage />
          </Suspense>
        </RequirePermission>
      }
    />
  </>
);
