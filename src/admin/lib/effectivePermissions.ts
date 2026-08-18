import type { RolePermissionRow, UserPermissionOverrideRow } from "@/admin/types/adminUser";

export type PermissionSource = "inherited" | "granted" | "revoked" | "unset";

/**
 * Single source of truth for "why does this user have (or not have) this
 * permission" — role_permissions + user_permission_overrides, exactly the
 * model already established by ManageUserPermissionsModal, now shared by
 * it and by RequirePermission (route guard) instead of each computing it
 * separately.
 */
export function permissionSourceFor(
  role: string | undefined,
  permission: string,
  rolePermissions: RolePermissionRow[],
  overrides: UserPermissionOverrideRow[]
): PermissionSource {
  const override = overrides.find((o) => o.permission === permission);
  if (override) return override.granted ? "granted" : "revoked";
  const inRole = rolePermissions.some((r) => r.role === role && r.permission === permission);
  return inRole ? "inherited" : "unset";
}

/**
 * Effective access decision: role permissions + explicit grants − explicit
 * revokes. `owner` is the one hardcoded bypass (matches every existing
 * owner-only RPC's own special-casing — owner has no role_permissions rows
 * at all by design). `super_admin` is NOT special-cased here: the seed
 * grants them every permission, so normal computation already yields full
 * access — and set_user_permission_override() has no protection against an
 * owner overriding a super_admin's permission, so pretending otherwise on
 * the frontend would be a security illusion that disagrees with real data.
 */
export function hasEffectivePermission(
  role: string | undefined,
  permission: string,
  rolePermissions: RolePermissionRow[],
  overrides: UserPermissionOverrideRow[]
): boolean {
  if (role === "owner") return true;
  const source = permissionSourceFor(role, permission, rolePermissions, overrides);
  return source === "inherited" || source === "granted";
}
