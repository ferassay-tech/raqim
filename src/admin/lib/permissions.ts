import type { AdminRole } from "../types/auth";

/**
 * Every gated action in the Admin, named by what it does rather than who
 * can do it — roles are looked up against this list, not the other way
 * around. Adding a new role later (e.g. "author") is one new entry in
 * ROLE_CAPABILITIES; adding a new gated action is one new value here plus
 * one `can(role, "...")` call at the point of use. No route-level or
 * component-level refactor either way.
 */
export type Capability =
  | "manageDownloads"
  | "deleteLibraryFile"
  | "changeOrderStatus"
  | "manageUsers";

// super_admin/admin/analyst added when AdminRole widened to match the real
// 5-role database model (see auth.ts) — this older, narrower capability
// list (4 fixed actions) is a separate, smaller concept than the new
// role_permissions/user_permission_overrides tables (many named
// permissions, DB-enforced via RLS). Defaults here are conservative:
// super_admin mirrors owner (broad operational access, everything except
// what's explicitly owner-only elsewhere), admin mirrors editor, analyst
// gets nothing (read-only role, no mutating capability).
const ROLE_CAPABILITIES: Record<AdminRole, Capability[]> = {
  owner: ["manageDownloads", "deleteLibraryFile", "changeOrderStatus", "manageUsers"],
  super_admin: ["manageDownloads", "deleteLibraryFile", "changeOrderStatus", "manageUsers"],
  admin: ["manageDownloads", "changeOrderStatus"],
  editor: ["manageDownloads", "changeOrderStatus"],
  analyst: [],
};

export function can(role: AdminRole | undefined, capability: Capability): boolean {
  if (!role) return false;
  return ROLE_CAPABILITIES[role].includes(capability);
}
