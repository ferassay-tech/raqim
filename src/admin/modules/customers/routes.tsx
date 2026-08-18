import { Route } from "react-router-dom";
import CustomersListPage from "./pages/CustomersListPage";
import CustomerProfilePage from "./pages/CustomerProfilePage";
import { RequirePermission } from "@/admin/components/ui/RequirePermission";

export const customersRoutes = (
  <>
    <Route
      path="customers"
      element={
        <RequirePermission permission="customers.view">
          <CustomersListPage />
        </RequirePermission>
      }
    />
    <Route
      path="customers/:id"
      element={
        <RequirePermission permission="customers.view">
          <CustomerProfilePage />
        </RequirePermission>
      }
    />
  </>
);
