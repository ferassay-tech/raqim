// Widened from the original "owner" | "editor" to match what the database
// (admin_profiles.role check constraint, migration 20260818120001,
// verified live in production) has actually supported since Phase 1 of the
// admin security hardening — the frontend type had fallen behind the real
// schema. Existing code that only ever produced/consumed "owner"/"editor"
// is unaffected; this only adds values, it doesn't remove any.
export type AdminRole = "owner" | "super_admin" | "admin" | "editor" | "analyst";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}
