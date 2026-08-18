import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/admin/context/AuthContext";
import type { AdminRole } from "@/admin/types/auth";
import { IconGrid } from "@/admin/icons";

// Page-level role gate — deliberately separate from ProtectedRoute (which
// only checks authentication and wraps the whole admin layout). Kept small
// and route-scoped so it can gate a single sensitive page (e.g. /admin/users)
// without touching ProtectedRoute or any other route's behavior.
export function RequireRole({ allow, children }: { allow: AdminRole[]; children: ReactNode }) {
  const { currentUser, isReady } = useAuth();

  // Same "wait one tick" guarantee ProtectedRoute already relies on — avoids
  // a flash of the forbidden state while the real admin_profiles role is
  // still being resolved.
  if (!isReady) return null;

  if (!currentUser || !allow.includes(currentUser.role)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
        <span className="font-logotype text-6xl text-gold">٤٠٣</span>
        <div>
          <h1 className="font-display text-2xl text-ink">لا تملكين صلاحية الوصول</h1>
          <p className="mt-2 text-ink-soft">هذه الصفحة مخصّصة لأدوار إدارية محددة فقط.</p>
        </div>
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-ivory transition-colors hover:bg-gold-deep"
        >
          <IconGrid className="h-4 w-4" />
          العودة للوحة التحكم
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
