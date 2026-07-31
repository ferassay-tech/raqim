import { Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";

export const dashboardRoutes = (
  <>
    <Route index element={<DashboardPage />} />
    <Route path="dashboard" element={<DashboardPage />} />
  </>
);
