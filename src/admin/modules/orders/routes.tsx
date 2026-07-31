import { Route } from "react-router-dom";
import OrdersListPage from "./pages/OrdersListPage";
import OrderDetailPage from "./pages/OrderDetailPage";

export const ordersRoutes = (
  <>
    <Route path="orders" element={<OrdersListPage />} />
    <Route path="orders/:id" element={<OrderDetailPage />} />
  </>
);
