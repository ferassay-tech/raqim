import type { RolePermissionRow, UserPermissionOverrideRow } from "@/admin/types/adminUser";

export type PermissionSource = "inherited" | "granted" | "revoked" | "unset";

/**
 * Permissions that must always be available to every approved admin,
 * regardless of role, and are never affected by a stored
 * user_permission_overrides row — dashboard.view specifically, because the
 * dashboard is the post-login landing page: a revoked-but-not-yet-noticed
 * override here would otherwise strand a real admin on a 403 the moment
 * they log in. Deliberately a tiny, explicit allow-list, not a new
 * permission system — role_permissions/user_permission_overrides are still
 * the only source of truth for every other permission.
 */
export const CORE_PERMISSIONS: readonly string[] = ["dashboard.view"];

export function isCorePermission(permission: string): boolean {
  return CORE_PERMISSIONS.includes(permission);
}

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
 *
 * CORE_PERMISSIONS is the one deliberate exception: always true for any
 * role once past the owner check, ignoring any stored override entirely
 * (a stored revoke row is never read for it, and is never deleted either —
 * see ManageUserPermissionsModal, which hides the controls for it instead).
 */
export function hasEffectivePermission(
  role: string | undefined,
  permission: string,
  rolePermissions: RolePermissionRow[],
  overrides: UserPermissionOverrideRow[]
): boolean {
  if (role === "owner") return true;
  if (isCorePermission(permission)) return true;
  const source = permissionSourceFor(role, permission, rolePermissions, overrides);
  return source === "inherited" || source === "granted";
}
