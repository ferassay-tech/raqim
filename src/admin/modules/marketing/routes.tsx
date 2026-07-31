import { Route } from "react-router-dom";
import CouponsPage from "./pages/CouponsPage";

// Route path stays "coupons" — only the internal module name changed (to
// "marketing", the long-term product surface). URL is unchanged.
export const marketingRoutes = <Route path="coupons" element={<CouponsPage />} />;
