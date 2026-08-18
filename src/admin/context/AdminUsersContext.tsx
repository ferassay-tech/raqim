import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { getSupabaseClient } from "../../lib/supabaseClient";
import type {
  AdminInvitation,
  AdminProfileWithEmail,
  AssignableAdminRole,
  RolePermissionRow,
  UserPermissionOverrideRow,
} from "../types/adminUser";

/**
 * Read/write layer for Phase 2A's admin security foundation — every
 * mutation here calls one of the 7 SECURITY DEFINER functions from
 * migration 20260818130001 via supabase.rpc(), the exact same calling
 * convention downloadTokensRepository.ts already established
 * (resolveDownloadToken/recordDownloadTokenUse). Never a direct client
 * INSERT/UPDATE/DELETE against admin_profiles/admin_invitations — the
 * database functions are the only path, by design.
 *
 * Reads are a mix: admin_invitations and role_permissions are read
 * directly (RLS already allows it — admin_invitations_select_owner,
 * role_permissions_select_active_admin, both from the applied
 * migrations), but the full admin roster with email needs
 * list_admin_profiles() — a genuinely new function proposed alongside this
 * phase's report, NOT yet applied. Calling it defensively (catching the
 * "function does not exist" error into `profilesError`) means this whole
 * page still renders — invitations, permissions, ownership — even before
 * that migration is reviewed and applied; only the Users roster itself
 * shows a clear "not available yet" state until then.
 */

interface AdminInvitationRow {
  id: string;
  email: string;
  role: string;
  status: string;
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  accepted_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

interface RolePermissionDbRow {
  role: string;
  permission: string;
}

interface UserPermissionOverrideDbRow {
  user_id: string;
  permission: string;
  granted: boolean;
}

interface AdminProfileRpcRow {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  created_at: string;
  invited_by: string | null;
}

function invitationFromRow(row: AdminInvitationRow): AdminInvitation {
  return {
    id: row.id,
    email: row.email,
    role: row.role as AssignableAdminRole,
    status: row.status as AdminInvitation["status"],
    invitedBy: row.invited_by,
    expiresAt: row.expires_at,
    acceptedAt: row.accepted_at,
    acceptedBy: row.accepted_by,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
  };
}

function profileFromRpcRow(row: AdminProfileRpcRow): AdminProfileWithEmail {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as AdminProfileWithEmail["role"],
    status: row.status as AdminProfileWithEmail["status"],
    createdAt: row.created_at,
    invitedBy: row.invited_by,
  };
}

interface AdminUsersContextValue {
  profiles: AdminProfileWithEmail[];
  /** Non-null only when list_admin_profiles() itself failed (most likely:
   * not applied to the database yet) — distinct from a genuinely empty
   * roster, which is `profiles: []` with this null. */
  profilesError: string | null;
  invitations: AdminInvitation[];
  rolePermissions: RolePermissionRow[];
  /** Derived from platform_ownership.owner_profile_id compared against the
   * current session's real auth id — deliberately NOT read from
   * AuthContext's currentUser.role, which still synthesizes "owner" for
   * any authenticated user with no local fallback match (a known,
   * pre-existing gap outside this phase's scope — see the Phase 2B
   * report). This check is independently correct regardless of that gap. */
  isOwner: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  inviteAdmin: (email: string, role: AssignableAdminRole) => Promise<{ rawToken: string; expiresAt: string }>;
  approveInvitation: (invitationId: string) => Promise<void>;
  rejectInvitation: (invitationId: string, reason?: string) => Promise<void>;
  suspendAdmin: (userId: string) => Promise<void>;
  reactivateAdmin: (userId: string) => Promise<void>;
  changeAdminRole: (userId: string, newRole: AssignableAdminRole) => Promise<void>;
  getUserPermissionOverrides: (userId: string) => Promise<UserPermissionOverrideRow[]>;
}

const AdminUsersContext = createContext<AdminUsersContextValue | null>(null);

export function AdminUsersProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, currentUser } = useAuth();
  const [profiles, setProfiles] = useState<AdminProfileWithEmail[]>([]);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<AdminInvitation[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermissionRow[]>([]);
  const [ownerProfileId, setOwnerProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    const supabase = getSupabaseClient();
    setIsLoading(true);
    try {
      const [ownershipRes, invitationsRes, permissionsRes] = await Promise.all([
        supabase.from("platform_ownership").select("owner_profile_id").maybeSingle(),
        supabase.from("admin_invitations").select("*").order("created_at", { ascending: false }),
        supabase.from("role_permissions").select("*"),
      ]);

      if (!ownershipRes.error) {
        setOwnerProfileId((ownershipRes.data as { owner_profile_id: string } | null)?.owner_profile_id ?? null);
      }
      if (!invitationsRes.error && invitationsRes.data) {
        setInvitations((invitationsRes.data as AdminInvitationRow[]).map(invitationFromRow));
      }
      if (!permissionsRes.error && permissionsRes.data) {
        setRolePermissions(
          (permissionsRes.data as RolePermissionDbRow[]).map((r) => ({ role: r.role, permission: r.permission }))
        );
      }

      const profilesRes = await supabase.rpc("list_admin_profiles");
      if (profilesRes.error) {
        setProfilesError(profilesRes.error.message);
        setProfiles([]);
      } else {
        setProfilesError(null);
        setProfiles(((profilesRes.data ?? []) as AdminProfileRpcRow[]).map(profileFromRpcRow));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    load();
  }, [isAuthenticated, load]);

  const isOwner = Boolean(currentUser?.id && ownerProfileId && currentUser.id === ownerProfileId);

  const inviteAdmin = useCallback(
    async (email: string, role: AssignableAdminRole) => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.rpc("create_admin_invitation", { p_email: email, p_role: role });
      if (error) throw error;
      const row = (data as { raw_token: string; expires_at: string }[] | null)?.[0];
      if (!row) throw new Error("Invitation was not created.");
      await load();
      return { rawToken: row.raw_token, expiresAt: row.expires_at };
    },
    [load]
  );

  const approveInvitation = useCallback(
    async (invitationId: string) => {
      const supabase = getSupabaseClient();
      const { error } = await supabase.rpc("approve_admin_invitation", { p_invitation_id: invitationId });
      if (error) throw error;
      await load();
    },
    [load]
  );

  const rejectInvitation = useCallback(
    async (invitationId: string, reason?: string) => {
      const supabase = getSupabaseClient();
      const { error } = await supabase.rpc("reject_admin_invitation", {
        p_invitation_id: invitationId,
        p_reason: reason ?? null,
      });
      if (error) throw error;
      await load();
    },
    [load]
  );

  const suspendAdmin = useCallback(
    async (userId: string) => {
      const supabase = getSupabaseClient();
      const { error } = await supabase.rpc("suspend_admin", { p_user_id: userId });
      if (error) throw error;
      await load();
    },
    [load]
  );

  const reactivateAdmin = useCallback(
    async (userId: string) => {
      const supabase = getSupabaseClient();
      const { error } = await supabase.rpc("reactivate_admin", { p_user_id: userId });
      if (error) throw error;
      await load();
    },
    [load]
  );

  const changeAdminRole = useCallback(
    async (userId: string, newRole: AssignableAdminRole) => {
      const supabase = getSupabaseClient();
      const { error } = await supabase.rpc("change_admin_role", { p_user_id: userId, p_new_role: newRole });
      if (error) throw error;
      await load();
    },
    [load]
  );

  const getUserPermissionOverrides = useCallback(async (userId: string): Promise<UserPermissionOverrideRow[]> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("user_permission_overrides").select("*").eq("user_id", userId);
    if (error) throw error;
    return ((data ?? []) as UserPermissionOverrideDbRow[]).map((r) => ({
      userId: r.user_id,
      permission: r.permission,
      granted: r.granted,
    }));
  }, []);

  const value = useMemo(
    () => ({
      profiles,
      profilesError,
      invitations,
      rolePermissions,
      isOwner,
      isLoading,
      refresh: load,
      inviteAdmin,
      approveInvitation,
      rejectInvitation,
      suspendAdmin,
      reactivateAdmin,
      changeAdminRole,
      getUserPermissionOverrides,
    }),
    [
      profiles,
      profilesError,
      invitations,
      rolePermissions,
      isOwner,
      isLoading,
      load,
      inviteAdmin,
      approveInvitation,
      rejectInvitation,
      suspendAdmin,
      reactivateAdmin,
      changeAdminRole,
      getUserPermissionOverrides,
    ]
  );

  return <AdminUsersContext.Provider value={value}>{children}</AdminUsersContext.Provider>;
}

export function useAdminUsers() {
  const ctx = useContext(AdminUsersContext);
  if (!ctx) throw new Error("useAdminUsers must be used within AdminUsersProvider");
  return ctx;
}
