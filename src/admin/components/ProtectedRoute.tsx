import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isReady } = useAuth();
  const location = useLocation();

  // Wait one tick for AuthProvider to read the persisted session before
  // deciding — otherwise a real, remembered session would flash a redirect
  // to /admin/login on every hard refresh.
  if (!isReady) return null;

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
