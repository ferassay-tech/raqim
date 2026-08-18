import { Route, Routes } from "react-router-dom";
import { AdminLayout } from "./components/layout/AdminLayout";
import { ProtectedRoute } from "./components/ui/ProtectedRoute";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminAcceptInvitationPage from "./pages/AdminAcceptInvitationPage";
import AdminNotFoundPage from "./pages/AdminNotFoundPage";

import { dashboardRoutes } from "./modules/dashboard/routes";
import { analyticsRoutes } from "./modules/analytics/routes";
import { booksRoutes } from "./modules/books/routes";
import { categoriesRoutes } from "./modules/categories/routes";
import { ordersRoutes } from "./modules/orders/routes";
import { customersRoutes } from "./modules/customers/routes";
import { marketingRoutes } from "./modules/marketing/routes";
import { articlesRoutes } from "./modules/articles/routes";
import { mediaRoutes } from "./modules/media/routes";
import { downloadsRoutes } from "./modules/downloads/routes";
import { communicationsRoutes } from "./modules/communications/routes";
import { settingsRoutes } from "./modules/settings/routes";
import { adminUsersRoutes } from "./modules/adminUsers/routes";

/**
 * Fully isolated from the public site's <Routes> in App.tsx — its own
 * layout (AdminLayout), its own nav, its own 404. Matched against "/admin/*"
 * from the root router, so every path below is relative (no "/admin" prefix).
 *
 * Each module owns its own routes.tsx — a Fragment of <Route> elements.
 * React Router resolves <Route>/<Fragment> children structurally (not by
 * rendering arbitrary components), so composing pre-built Fragments here
 * works exactly like one flat list did before. Adding a future module means
 * adding one import + one line below, not editing any route bodies. No path
 * string changed in this split — every URL below is byte-identical to what
 * it replaced.
 */
export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<AdminLoginPage />} />
      <Route path="accept-invitation" element={<AdminAcceptInvitationPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {dashboardRoutes}
        {analyticsRoutes}
        {booksRoutes}
        {categoriesRoutes}
        {ordersRoutes}
        {customersRoutes}
        {marketingRoutes}
        {articlesRoutes}
        {mediaRoutes}
        {downloadsRoutes}
        {communicationsRoutes}
        {settingsRoutes}
        {adminUsersRoutes}

        <Route path="*" element={<AdminNotFoundPage />} />
      </Route>
    </Routes>
  );
}
