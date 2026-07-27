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

import CheckoutPage from "./pages/CheckoutPage";
import PaymentMethodPage from "./pages/PaymentMethodPage";
import OrderReceivedPage from "./pages/OrderReceivedPage";
import DownloadPage from "./pages/DownloadPage";
import AdminApp from "./admin/AdminApp";
import { AdminProviders } from "./admin/context/AdminProviders";

export default function App() {
  return (
    <BrowserRouter>
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
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="*" element={<NotFoundPage />} />
     </Routes>
  </CheckoutProvider>
  </AdminProviders>
</BrowserRouter>
  );
}

