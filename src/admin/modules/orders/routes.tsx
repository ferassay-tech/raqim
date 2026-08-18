import { Route } from "react-router-dom";
import OrdersListPage from "./pages/OrdersListPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import { RequirePermission } from "@/admin/components/ui/RequirePermission";

export const ordersRoutes = (
  <>
    <Route
      path="orders"
      element={
        <RequirePermission permission="orders.view">
          <OrdersListPage />
        </RequirePermission>
      }
    />
    <Route
      path="orders/:id"
      element={
        <RequirePermission permission="orders.view">
          <OrderDetailPage />
        </RequirePermission>
      }
    />
  </>
);
