import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/admin/context/AuthContext";
import { useAdminUsers } from "@/admin/context/AdminUsersContext";
import { hasEffectivePermission } from "@/admin/lib/effectivePermissions";
import { IconGrid } from "@/admin/icons";

/**
 * Route-level permission guard — the missing enforcement layer for
 * role_permissions/user_permission_overrides (previously data + an editing
 * UI only, never actually consulted by any route). Deliberately separate
 * from RequireRole (role allow-lists, e.g. /admin/users) — this checks the
 * full effective-permission computation instead.
 */
export function RequirePermission({ permission, children }: { permission: string; children: ReactNode }) {
  const { currentUser, isReady } = useAuth();
  const { rolePermissions, myOverrides, isLoading } = useAdminUsers();

  // Wait for auth AND permission data to resolve before deciding anything —
  // rendering a denial (or the page) against a still-loading, possibly
  // empty rolePermissions/myOverrides snapshot would be indistinguishable
  // from a real "no access" and could flash a wrong result on a hard
  // refresh / direct URL navigation.
  if (!isReady || isLoading) return null;

  if (!currentUser || !hasEffectivePermission(currentUser.role, permission, rolePermissions, myOverrides)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
        <span className="font-logotype text-6xl text-gold">٤٠٣</span>
        <div>
          <h1 className="font-display text-2xl text-ink">لا تملك صلاحية الوصول إلى هذه الصفحة</h1>
          <p className="mt-2 text-ink-soft">تواصلي مع مالك المنصة إن كنتِ تعتقدين أن هذا خطأ.</p>
        </div>
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-ivory transition-colors hover:bg-gold-deep"
        >
          <IconGrid className="h-4 w-4" />
          العودة إلى لوحة التحكم
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
