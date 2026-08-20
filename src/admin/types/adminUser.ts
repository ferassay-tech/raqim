import type { AdminRole } from "./auth";

export type AdminProfileStatus = "active" | "suspended";

/** Assignable roles for an invitation/role-change — every real role except
 * "owner" itself, matching admin_invitations_role_check and
 * change_admin_role()'s own validation exactly (both verified live). */
export type AssignableAdminRole = Exclude<AdminRole, "owner">;

export const ASSIGNABLE_ADMIN_ROLES: AssignableAdminRole[] = ["super_admin", "admin", "editor", "analyst"];

/** Extensible by design — a new notification type is a new key here, never
 * a new column/migration. Absent key means "off"; nobody is opted in just
 * because a new key starts being read. Keys are deliberately snake_case,
 * matching the raw admin_profiles.notification_preferences JSONB exactly
 * (round-trips as-is, no translation layer for what's an intentionally
 * flexible flag bag) — a local exception to this project's usual camelCase
 * convention, not an oversight. */
export interface AdminNotificationPreferences {
  payment_confirmed?: boolean;
  [key: string]: boolean | undefined;
}

/** The one notification key currently implemented — controls whether an
 * admin receives the "purchase submitted" email (api/send-admin-payment-
 * notification.ts), fired when a customer's order is first created, not
 * when payment is later confirmed. The literal string value is
 * deliberately kept as "payment_confirmed" (not renamed to match the
 * corrected meaning) so an administrator who already opted in keeps
 * working immediately, with no need to re-toggle anything — this constant
 * is shared so the write call (setNotificationPreference) and every read
 * never risk typo drift against each other. */
export const PAYMENT_CONFIRMED_NOTIFICATION_KEY = "payment_confirmed";

/** One admin_profiles row, with email resolved server-side (admin_profiles
 * itself has no email column — see list_admin_profiles()). */
export interface AdminProfileWithEmail {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  status: AdminProfileStatus;
  createdAt: string;
  invitedBy: string | null;
  notificationPreferences: AdminNotificationPreferences;
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
