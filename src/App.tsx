import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import BooksIndexPage from "./pages/BooksIndexPage";
import BookPage from "./pages/BookPage";
import AboutPage from "./pages/AboutPage";
import AuthorPage from "./pages/AuthorPage";
import FutureReleasesPage from "./pages/FutureReleasesPage";
import BlogIndexPage from "./pages/BlogIndexPage";
import BlogPostPage from "./pages/BlogPostPage";
import FaqPage from "./pages/FaqPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import SearchPage from "./pages/SearchPage";
import NotFoundPage from "./pages/NotFoundPage";
import ScrollToTop from "./components/ScrollToTop";
import { CheckoutProvider } from "./context/CheckoutContext";
import { LanguageProvider } from "./context/LanguageContext";

import CheckoutPage from "./pages/CheckoutPage";
import PaymentMethodPage from "./pages/PaymentMethodPage";
import OrderReceivedPage from "./pages/OrderReceivedPage";
import DownloadPage from "./pages/DownloadPage";
import { AdminProviders } from "./admin/context/AdminProviders";

// Lazy-loaded: public visitors (the overwhelming majority of traffic) never
// need the admin dashboard's JS at all. AdminProviders (the CMS data-context
// layer public pages themselves read via useBooks()/useSettings()/etc.)
// stays eagerly imported above — only the admin UI component tree itself
// (pages, forms, tables) is split into its own chunk, fetched solely when a
// route under /admin/* is actually visited.
const AdminApp = lazy(() => import("./admin/AdminApp"));

export default function App() {
  return (
    <BrowserRouter>
    <LanguageProvider>
    <AdminProviders>
    <CheckoutProvider>
    <ScrollToTop />

    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/books" element={<BooksIndexPage />} />
        <Route path="/books/:slug" element={<BookPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/authors/:slug" element={<AuthorPage />} />
        <Route path="/future-releases" element={<FutureReleasesPage />} />
        <Route path="/blog" element={<BlogIndexPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment/:method" element={<PaymentMethodPage />} />
        <Route path="/order-received" element={<OrderReceivedPage />} />
        <Route path="/download/:token" element={<DownloadPage />} />

        {/* SEO Milestone 2 — English mirror. Same page components, /en
            prefix; slugs are never translated (see lib/seo.ts), so each
            route below is identical to its Arabic counterpart above except
            for this prefix. Any unmatched /en/... path correctly falls
            through to the catch-all NotFoundPage at the bottom — its
            language is still derived correctly from the URL. */}
        <Route path="/en" element={<HomePage />} />
        <Route path="/en/books" element={<BooksIndexPage />} />
        <Route path="/en/books/:slug" element={<BookPage />} />
        <Route path="/en/about" element={<AboutPage />} />
        <Route path="/en/authors/:slug" element={<AuthorPage />} />
        <Route path="/en/future-releases" element={<FutureReleasesPage />} />
        <Route path="/en/blog" element={<BlogIndexPage />} />
        <Route path="/en/blog/:slug" element={<BlogPostPage />} />
        <Route path="/en/faq" element={<FaqPage />} />
        <Route path="/en/contact" element={<ContactPage />} />
        <Route path="/en/privacy" element={<PrivacyPage />} />
        <Route path="/en/terms" element={<TermsPage />} />
        <Route path="/en/search" element={<SearchPage />} />
        <Route path="/en/checkout" element={<CheckoutPage />} />
        <Route path="/en/payment/:method" element={<PaymentMethodPage />} />
        <Route path="/en/order-received" element={<OrderReceivedPage />} />
        <Route path="/en/download/:token" element={<DownloadPage />} />

        <Route
          path="/admin/*"
          element={
            <Suspense fallback={null}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
     </Routes>
  </CheckoutProvider>
  </AdminProviders>
  </LanguageProvider>
</BrowserRouter>
  );
}

