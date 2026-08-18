import type { AdminRole } from "./auth";

export type AdminProfileStatus = "active" | "suspended";

/** Assignable roles for an invitation/role-change — every real role except
 * "owner" itself, matching admin_invitations_role_check and
 * change_admin_role()'s own validation exactly (both verified live). */
export type AssignableAdminRole = Exclude<AdminRole, "owner">;

export const ASSIGNABLE_ADMIN_ROLES: AssignableAdminRole[] = ["super_admin", "admin", "editor", "analyst"];

/** One admin_profiles row, with email resolved server-side (admin_profiles
 * itself has no email column — see list_admin_profiles(), the one
 * genuinely-new function this phase proposes; not yet applied). */
export interface AdminProfileWithEmail {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  status: AdminProfileStatus;
  createdAt: string;
  invitedBy: string | null;
}

export type AdminInvitationStatus = "pending" | "accepted" | "approved" | "rejected" | "revoked" | "expired";

export interface AdminInvitation {
  id: string;
  email: string;
  role: AssignableAdminRole;
  status: AdminInvitationStatus;
  invitedBy: string;
  expiresAt: string;
  acceptedAt: string | null;
  acceptedBy: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface RolePermissionRow {
  role: string;
  permission: string;
}

export interface UserPermissionOverrideRow {
  userId: string;
  permission: string;
  granted: boolean;
}
