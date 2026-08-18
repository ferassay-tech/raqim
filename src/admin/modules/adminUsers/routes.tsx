import { Route } from "react-router-dom";
import AdminUsersPage from "./pages/AdminUsersPage";
import { RequireRole } from "@/admin/components/ui/RequireRole";

/** Phase 2B — Admin Users & Permissions. One route; the page itself splits
 * Users / Invitations / Permissions into tabs rather than separate routes,
 * matching how Communications' sub-areas (templates/components/variables/
 * theme) are tabs within one editor rather than a deep route tree.
 * Phase 2C — gated to owner/super_admin only, matching list_admin_profiles'
 * own backend authorization scope exactly, so the page never renders an
 * empty/error state for a role that was never allowed to see it. */
export const adminUsersRoutes = (
  <>
    <Route
      path="users"
      element={
        <RequireRole allow={["owner", "super_admin"]}>
          <AdminUsersPage />
        </RequireRole>
      }
    />
  </>
);
