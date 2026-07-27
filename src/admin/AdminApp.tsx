import { Route, Routes } from "react-router-dom";
import { AdminLayout } from "./layout/AdminLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AdminLoginPage from "./pages/AdminLoginPage";
import DashboardPage from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import BooksListPage from "./pages/BooksListPage";
import BookNewPage from "./pages/BookNewPage";
import BookEditPage from "./pages/BookEditPage";
import OrdersListPage from "./pages/OrdersListPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import CustomersListPage from "./pages/CustomersListPage";
import CustomerProfilePage from "./pages/CustomerProfilePage";
import CategoriesPage from "./pages/CategoriesPage";
import CouponsPage from "./pages/CouponsPage";
import ArticlesListPage from "./pages/ArticlesListPage";
import ArticleNewPage from "./pages/ArticleNewPage";
import ArticleEditPage from "./pages/ArticleEditPage";
import MediaLibraryPage from "./pages/MediaLibraryPage";
import MessagesPage from "./pages/MessagesPage";
import SettingsPage from "./pages/SettingsPage";
import SiteContentPage from "./pages/SiteContentPage";
import ProfilePage from "./pages/ProfilePage";
import AdminNotFoundPage from "./pages/AdminNotFoundPage";

/**
 * Fully isolated from the public site's <Routes> in App.tsx — its own
 * layout (AdminLayout), its own nav, its own 404. Matched against "/admin/*"
 * from the root router, so every path below is relative (no "/admin" prefix).
 */
export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<AdminLoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />

        <Route path="books" element={<BooksListPage />} />
        <Route path="books/new" element={<BookNewPage />} />
        <Route path="books/edit/:id" element={<BookEditPage />} />

        <Route path="orders" element={<OrdersListPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />

        <Route path="customers" element={<CustomersListPage />} />
        <Route path="customers/:id" element={<CustomerProfilePage />} />

        <Route path="categories" element={<CategoriesPage />} />
        <Route path="coupons" element={<CouponsPage />} />

        <Route path="articles" element={<ArticlesListPage />} />
        <Route path="articles/new" element={<ArticleNewPage />} />
        <Route path="articles/edit/:id" element={<ArticleEditPage />} />

        <Route path="media" element={<MediaLibraryPage />} />

        <Route path="messages" element={<MessagesPage />} />
        <Route path="messages/:id" element={<MessagesPage />} />

        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/:section" element={<SettingsPage />} />

        <Route path="content" element={<SiteContentPage />} />

        <Route path="profile" element={<ProfilePage />} />

        <Route path="*" element={<AdminNotFoundPage />} />
      </Route>
    </Routes>
  );
}
