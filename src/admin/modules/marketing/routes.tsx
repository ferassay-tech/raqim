import { Route } from "react-router-dom";
import CouponsPage from "./pages/CouponsPage";
import { RequirePermission } from "@/admin/components/ui/RequirePermission";

// Route path stays "coupons" — only the internal module name changed (to
// "marketing", the long-term product surface). URL is unchanged.
export const marketingRoutes = (
  <Route
    path="coupons"
    element={
      <RequirePermission permission="coupons.manage">
        <CouponsPage />
      </RequirePermission>
    }
  />
);
