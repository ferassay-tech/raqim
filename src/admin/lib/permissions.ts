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

const ROLE_CAPABILITIES: Record<AdminRole, Capability[]> = {
  owner: ["manageDownloads", "deleteLibraryFile", "changeOrderStatus", "manageUsers"],
  editor: ["manageDownloads", "changeOrderStatus"],
};

export function can(role: AdminRole | undefined, capability: Capability): boolean {
  if (!role) return false;
  return ROLE_CAPABILITIES[role].includes(capability);
}
