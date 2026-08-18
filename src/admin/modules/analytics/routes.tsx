import { Route } from "react-router-dom";
import AnalyticsPage from "./pages/AnalyticsPage";
import { RequirePermission } from "@/admin/components/ui/RequirePermission";

export const analyticsRoutes = (
  <Route
    path="analytics"
    element={
      <RequirePermission permission="analytics.view">
        <AnalyticsPage />
      </RequirePermission>
    }
  />
);
