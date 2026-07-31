import { Route } from "react-router-dom";
import SettingsPage from "./pages/SettingsPage";
import SiteContentPage from "./pages/SiteContentPage";
import ProfilePage from "./pages/ProfilePage";

export const settingsRoutes = (
  <>
    <Route path="settings" element={<SettingsPage />} />
    <Route path="settings/:section" element={<SettingsPage />} />
    <Route path="content" element={<SiteContentPage />} />
    <Route path="profile" element={<ProfilePage />} />
  </>
);
