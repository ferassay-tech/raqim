import { Route } from "react-router-dom";
import CustomersListPage from "./pages/CustomersListPage";
import CustomerProfilePage from "./pages/CustomerProfilePage";

export const customersRoutes = (
  <>
    <Route path="customers" element={<CustomersListPage />} />
    <Route path="customers/:id" element={<CustomerProfilePage />} />
  </>
);
