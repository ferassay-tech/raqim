import { Route } from "react-router-dom";
import BooksListPage from "./pages/BooksListPage";
import BookNewPage from "./pages/BookNewPage";
import BookEditPage from "./pages/BookEditPage";

export const booksRoutes = (
  <>
    <Route path="books" element={<BooksListPage />} />
    <Route path="books/new" element={<BookNewPage />} />
    <Route path="books/edit/:id" element={<BookEditPage />} />
  </>
);
