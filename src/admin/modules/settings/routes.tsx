import { Route } from "react-router-dom";
import SettingsPage from "./pages/SettingsPage";
import SiteContentPage from "./pages/SiteContentPage";
import ProfilePage from "./pages/ProfilePage";
import BrandStudioPage from "./pages/BrandStudioPage";
import { RequirePermission } from "@/admin/components/ui/RequirePermission";

// profile is deliberately NOT wrapped in RequirePermission — it's the
// self-service "manage my own account" page every authenticated admin must
// always reach, regardless of role or permission state. No permission key
// for it exists in the vocabulary, and none should be invented for it.
export const settingsRoutes = (
  <>
    <Route
      path="settings"
      element={
        <RequirePermission permission="settings.manage">
          <SettingsPage />
        </RequirePermission>
      }
    />
    <Route
      path="settings/:section"
      element={
        <RequirePermission permission="settings.manage">
          <SettingsPage />
        </RequirePermission>
      }
    />
    <Route
      path="content"
      element={
        <RequirePermission permission="content.manage">
          <SiteContentPage />
        </RequirePermission>
      }
    />
    <Route path="profile" element={<ProfilePage />} />
    <Route
      path="brand-studio"
      element={
        <RequirePermission permission="settings.manage">
          <BrandStudioPage />
        </RequirePermission>
      }
    />
  </>
);
