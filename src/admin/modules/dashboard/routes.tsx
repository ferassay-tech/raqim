import { Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import { RequirePermission } from "@/admin/components/ui/RequirePermission";

export const dashboardRoutes = (
  <>
    <Route
      index
      element={
        <RequirePermission permission="dashboard.view">
          <DashboardPage />
        </RequirePermission>
      }
    />
    <Route
      path="dashboard"
      element={
        <RequirePermission permission="dashboard.view">
          <DashboardPage />
        </RequirePermission>
      }
    />
  </>
);
