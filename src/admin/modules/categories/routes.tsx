import { Route } from "react-router-dom";
import CategoriesPage from "./pages/CategoriesPage";
import { RequirePermission } from "@/admin/components/ui/RequirePermission";

export const categoriesRoutes = (
  <Route
    path="categories"
    element={
      <RequirePermission permission="categories.manage">
        <CategoriesPage />
      </RequirePermission>
    }
  />
);
