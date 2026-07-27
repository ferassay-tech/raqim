export type AdminRole = "owner" | "editor";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}
