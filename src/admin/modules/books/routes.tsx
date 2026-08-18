import { Route } from "react-router-dom";
import BooksListPage from "./pages/BooksListPage";
import BookNewPage from "./pages/BookNewPage";
import BookEditPage from "./pages/BookEditPage";
import { RequirePermission } from "@/admin/components/ui/RequirePermission";

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
          <BookNewPage />
        </RequirePermission>
      }
    />
    <Route
      path="books/edit/:id"
      element={
        <RequirePermission permission="books.edit">
          <BookEditPage />
        </RequirePermission>
      }
    />
  </>
);
