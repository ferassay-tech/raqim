import { useCallback } from "react";
import { useAuth } from "@/admin/context/AuthContext";
import { useAdminUsers } from "@/admin/context/AdminUsersContext";
import { hasEffectivePermission } from "@/admin/lib/effectivePermissions";

/**
 * Convenience wrapper around the same role_permissions/user_permission_overrides
 * computation RequirePermission and AdminSidebar already use — avoids every
 * list page re-wiring useAuth + useAdminUsers + hasEffectivePermission by
 * hand. Not a new authorization system: still resolves through
 * hasEffectivePermission exclusively.
 */
export function useHasPermission() {
  const { currentUser } = useAuth();
  const { rolePermissions, myOverrides } = useAdminUsers();
  return useCallback(
    (permission: string) => hasEffectivePermission(currentUser?.role, permission, rolePermissions, myOverrides),
    [currentUser?.role, rolePermissions, myOverrides]
  );
}
