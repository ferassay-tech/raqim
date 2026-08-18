import { Route } from "react-router-dom";
import MediaLibraryPage from "./pages/MediaLibraryPage";
import { RequirePermission } from "@/admin/components/ui/RequirePermission";

export const mediaRoutes = (
  <Route
    path="media"
    element={
      <RequirePermission permission="media.manage">
        <MediaLibraryPage />
      </RequirePermission>
    }
  />
);
