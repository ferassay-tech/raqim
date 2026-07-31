import { Route } from "react-router-dom";
import LibraryListPage from "./pages/LibraryListPage";

// Route path stays "library" — only the internal module name changed (to
// "downloads", the long-term product surface). URL is unchanged.
export const downloadsRoutes = <Route path="library" element={<LibraryListPage />} />;
