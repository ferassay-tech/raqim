import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/admin/components/ui/PageHeader";
import { DataTable } from "@/admin/components/ui/DataTable";
import type { DataTableColumn } from "@/admin/components/ui/DataTable";
import { EmptyState } from "@/admin/components/ui/EmptyState";
import { StatusBadge } from "@/admin/components/ui/StatusBadge";
import type { StatusBadgeVariant } from "@/admin/components/ui/StatusBadge";
import { ConfirmDialog } from "@/admin/components/ui/ConfirmDialog";
import { Tabs } from "@/admin/components/ui/Tabs";
import type { TabItem } from "@/admin/components/ui/Tabs";
import { Toast } from "@/admin/components/ui/Toast";
import type { ToastState } from "@/admin/components/ui/Toast";
import { Modal } from "@/admin/components/ui/Modal";
import { Select } from "@/admin/components/forms/Select";
import { CopyIconButton } from "@/admin/components/ui/CopyIconButton";
import {
  IconUsers,
  IconPlus,
  IconCheck,
  IconClose,
  IconAlertTriangle,
  IconRefresh,
  IconPencil,
  IconTrash,
  IconGear,
} from "@/admin/icons";
import { useAdminUsers } from "@/admin/context/AdminUsersContext";
import { InviteAdminModal } from "../components/InviteAdminModal";
import { ChangeRoleModal } from "../components/ChangeRoleModal";
import { EditInvitationModal } from "../components/EditInvitationModal";
import { ManageUserPermissionsModal } from "../components/ManageUserPermissionsModal";
import { logAndGetErrorMessage } from "@/admin/lib/errorMessage";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type {
  AdminInvitation,
  AdminInvitationStatus,
  AdminProfileWithEmail,
  AssignableAdminRole,
  UserPermissionOverrideRow,
} from "@/admin/types/adminUser";
import { PAYMENT_CONFIRMED_NOTIFICATION_KEY } from "@/admin/types/adminUser";

const ROLE_LABELS: Record<string, string> = {
  owner: "المالك",
  super_admin: "مدير عام",
  admin: "مدير",
  editor: "محرر",
  analyst: "محلل",
};

const INVITATION_STATUS_META: Record<AdminInvitationStatus, { label: string; variant: StatusBadgeVariant }> = {
  pending: { label: "بانتظار قبول المدعو", variant: "neutral" },
  accepted: { label: "بانتظار مراجعتك", variant: "warning" },
  approved: { label: "تمت الموافقة", variant: "success" },
  rejected: { label: "مرفوضة", variant: "danger" },
  revoked: { label: "ملغاة", variant: "neutral" },
  expired: { label: "منتهية الصلاحية", variant: "neutral" },
};

const TABS: TabItem[] = [
  { key: "users", label: "المستخدمون" },
  { key: "invitations", label: "الدعوات" },
  { key: "permissions", label: "الصلاحيات" },
];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso;
  }
}

export default function AdminUsersPage() {
  const {
    profiles,
    profilesError,
    invitations,
    rolePermissions,
    isOwner,
    isLoading,
    inviteAdmin,
    approveInvitation,
    rejectInvitation,
    revokeInvitation,
    resendInvitation,
    editInvitationRole,
    restoreInvitation,
    deleteInvitationPermanently,
    suspendAdmin,
    reactivateAdmin,
    changeAdminRole,
    getUserPermissionOverrides,
    setUserPermissionOverride,
    setNotificationPreference,
  } = useAdminUsers();

  const [tab, setTab] = useState<string>("users");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteResult, setInviteResult] = useState<{
    kind: "create" | "resend" | "edit";
    email: string;
    role: AssignableAdminRole;
    rawToken: string;
    expiresAt: string;
    /** "idle" is edit-only: a new invitation exists but no email has been
     * sent for it yet — the owner must explicitly choose to send it, since
     * the previously-sent email (if any) may still reference the old role. */
    emailStatus: "idle" | "sending" | "sent" | "failed";
  } | null>(null);
  const [roleChangeTarget, setRoleChangeTarget] = useState<AdminProfileWithEmail | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<AdminProfileWithEmail | null>(null);
  const [reactivateTarget, setReactivateTarget] = useState<AdminProfileWithEmail | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminInvitation | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<AdminInvitation | null>(null);
  const [editTarget, setEditTarget] = useState<AdminInvitation | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<AdminInvitation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminInvitation | null>(null);
  const [permissionsTarget, setPermissionsTarget] = useState<AdminProfileWithEmail | null>(null);
  const [invitationView, setInvitationView] = useState<"active" | "trash">("active");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [overrides, setOverrides] = useState<UserPermissionOverrideRow[]>([]);
  const [overridesLoading, setOverridesLoading] = useState(false);

  useEffect(() => {
    if (profiles.length > 0 && !selectedUserId) setSelectedUserId(profiles[0].id);
  }, [profiles, selectedUserId]);

  useEffect(() => {
    if (!selectedUserId) {
      setOverrides([]);
      return;
    }
    let cancelled = false;
    setOverridesLoading(true);
    getUserPermissionOverrides(selectedUserId)
      .then((rows) => {
        if (!cancelled) setOverrides(rows);
      })
      .catch(() => {
        if (!cancelled) setOverrides([]);
      })
      .finally(() => {
        if (!cancelled) setOverridesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedUserId, getUserPermissionOverrides]);

  // ManageUserPermissionsModal already refreshes its own internal list after
  // a successful save — this just keeps the Permissions tab's separate
  // read-only "استثناءات خاصة" summary (for whichever user is selected
  // there) in sync too, since it's driven by its own independent fetch.
  const reloadSelectedOverrides = useCallback(() => {
    if (!selectedUserId) return;
    getUserPermissionOverrides(selectedUserId)
      .then(setOverrides)
      .catch(() => {});
  }, [selectedUserId, getUserPermissionOverrides]);

  // Fires the invitation email independently of the invite-creation call
  // above so InviteAdminModal can close immediately once the invitation
  // itself exists — the invitation is already valid in the database at
  // that point, and email delivery is a best-effort follow-up, never a
  // reason to roll it back. Guards every state update against a newer
  // invite having since been created (rawToken match) so a slow response
  // can't clobber a fresher result the owner is now looking at.
  const sendInvitationEmail = useCallback(
    async (email: string, role: AssignableAdminRole, token: string, expiresAt: string) => {
      try {
        const supabase = getSupabaseClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        if (!accessToken) {
          throw new Error("لا توجد جلسة نشطة.");
        }
        const response = await fetch("/api/send-admin-invitation", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ email, role, token, expiresAt }),
        });
        const body = await response.json().catch(() => ({}) as { error?: string });
        if (!response.ok) {
          throw new Error(body?.error || "تعذر إرسال البريد الإلكتروني.");
        }
        setInviteResult((prev) => (prev && prev.rawToken === token ? { ...prev, emailStatus: "sent" } : prev));
      } catch (err) {
        console.error("Failed to send admin invitation email:", err);
        setInviteResult((prev) => (prev && prev.rawToken === token ? { ...prev, emailStatus: "failed" } : prev));
      }
    },
    []
  );

  // Revokes the existing pending invitation and creates a fresh one (new
  // token, new expiry) in one atomic RPC call, then reuses the exact same
  // "creating" result modal/email flow inviteAdmin's onInvite already
  // drives — resending is create_admin_invitation's happy path again, just
  // for a row that already existed.
  const handleResendInvitation = useCallback(
    async (invitation: AdminInvitation) => {
      setPendingActionId(invitation.id);
      try {
        const result = await resendInvitation(invitation.id);
        setInviteResult({
          kind: "resend",
          email: result.email,
          role: result.role,
          rawToken: result.rawToken,
          expiresAt: result.expiresAt,
          emailStatus: "sending",
        });
        void sendInvitationEmail(result.email, result.role, result.rawToken, result.expiresAt);
      } catch (err) {
        setToast({
          variant: "error",
          message: logAndGetErrorMessage("resend_admin_invitation RPC error:", err, "تعذر إعادة إرسال الدعوة."),
        });
      } finally {
        setPendingActionId(null);
      }
    },
    [resendInvitation, sendInvitationEmail]
  );

  // "Trash" is a view split, not a new status — revoked (and expired, if
  // that status is ever actually produced; nothing in the current system
  // sets it today) invitations move out of the active list here, never
  // deleted from the database. pending/accepted/approved/rejected are
  // unaffected and stay in the active view exactly as before.
  const activeInvitations = useMemo(
    () => invitations.filter((i) => i.status !== "revoked" && i.status !== "expired"),
    [invitations]
  );
  const trashedInvitations = useMemo(
    () => invitations.filter((i) => i.status === "revoked" || i.status === "expired"),
    [invitations]
  );

  const permissionsByRole = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const row of rolePermissions) {
      const list = map.get(row.role) ?? [];
      list.push(row.permission);
      map.set(row.role, list);
    }
    return map;
  }, [rolePermissions]);

  const selectedProfile = profiles.find((p) => p.id === selectedUserId) ?? null;
  const selectedRolePermissions = selectedProfile ? (permissionsByRole.get(selectedProfile.role) ?? []) : [];

  const runAction = async (id: string, action: () => Promise<void>, successMessage: string) => {
    setPendingActionId(id);
    try {
      await action();
      setToast({ variant: "success", message: successMessage });
    } catch (err) {
      setToast({ variant: "error", message: logAndGetErrorMessage("Admin action failed:", err, "حدث خطأ غير متوقع.") });
    } finally {
      setPendingActionId(null);
    }
  };

  const userColumns: DataTableColumn<AdminProfileWithEmail>[] = [
    {
      key: "name",
      header: "الاسم",
      className: "min-w-[160px]",
      render: (p) => (
        <div className="flex items-center gap-2">
          <span className="text-ink">{p.name}</span>
          {p.role === "owner" && (
            <StatusBadge variant="info" icon={null}>
              المالك
            </StatusBadge>
          )}
        </div>
      ),
    },
    {
      key: "email",
      header: "البريد الإلكتروني",
      className: "min-w-[220px]",
      render: (p) => (
        <span dir="ltr" className="text-ink-soft">
          {p.email}
        </span>
      ),
    },
    {
      key: "role",
      header: "الصلاحية",
      render: (p) => <span className="text-ink-soft">{ROLE_LABELS[p.role] ?? p.role}</span>,
    },
    {
      key: "status",
      header: "الحالة",
      render: (p) => (
        <StatusBadge variant={p.status === "active" ? "success" : "danger"}>
          {p.status === "active" ? "نشط" : "معلّق"}
        </StatusBadge>
      ),
    },
    {
      key: "createdAt",
      header: "تاريخ الإنضمام",
      render: (p) => <span dir="ltr" className="text-ink-faint">{formatDate(p.createdAt)}</span>,
    },
    {
      key: "notifications",
      header: "إشعارات عمليات الشراء",
      render: (p) => {
        // Extensible by design (AdminNotificationPreferences) — this is the
        // one notification type currently implemented; a future type is a
        // new key + a new column/toggle here, not a schema change. The
        // owner is deliberately NOT hidden from this column — the RPC
        // itself never excluded the owner as a target, only this
        // component's earlier rendering did; the owner must be selectable
        // like any other administrator.
        const enabled = p.notificationPreferences[PAYMENT_CONFIRMED_NOTIFICATION_KEY] === true;
        if (!isOwner) {
          return (
            <StatusBadge variant={enabled ? "success" : "neutral"} icon={null}>
              {enabled ? "مفعّل" : "متوقف"}
            </StatusBadge>
          );
        }
        return (
          <label
            className="flex items-center gap-1.5 text-xs text-ink-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) =>
                runAction(
                  p.id,
                  () => setNotificationPreference(p.id, PAYMENT_CONFIRMED_NOTIFICATION_KEY, e.target.checked),
                  e.target.checked
                    ? `تم تفعيل إشعارات عمليات الشراء لـ${p.name}.`
                    : `تم إيقاف إشعارات عمليات الشراء لـ${p.name}.`
                )
              }
              className="h-4 w-4 rounded border-beige accent-gold-deep"
            />
            تلقي إشعارات عمليات الشراء
          </label>
        );
      },
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (p) => {
        if (p.role === "owner" || !isOwner) return null;
        return (
          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPermissionsTarget(p)}
              title="إدارة الصلاحيات"
              aria-label="إدارة الصلاحيات"
              className="grid h-8 w-8 place-items-center rounded-full text-ink-faint transition-colors hover:bg-cream hover:text-ink"
            >
              <IconGear className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setRoleChangeTarget(p)}
              className="rounded-full border border-beige px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-gold hover:text-ink"
            >
              تغيير الصلاحية
            </button>
            {p.status === "active" ? (
              <button
                type="button"
                onClick={() => setSuspendTarget(p)}
                className="rounded-full px-3 py-1.5 text-xs text-danger transition-colors hover:bg-danger/10"
              >
                تعليق
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setReactivateTarget(p)}
                className="rounded-full px-3 py-1.5 text-xs text-ink-soft transition-colors hover:bg-cream"
              >
                إعادة تفعيل
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const invitationColumns: DataTableColumn<AdminInvitation>[] = [
    {
      key: "email",
      header: "البريد الإلكتروني",
      className: "min-w-[220px]",
      render: (i) => (
        <span dir="ltr" className="text-ink">
          {i.email}
        </span>
      ),
    },
    {
      key: "role",
      header: "الصلاحية المطلوبة",
      render: (i) => <span className="text-ink-soft">{ROLE_LABELS[i.role] ?? i.role}</span>,
    },
    {
      key: "status",
      header: "الحالة",
      render: (i) => {
        const meta = INVITATION_STATUS_META[i.status];
        return <StatusBadge variant={meta.variant}>{meta.label}</StatusBadge>;
      },
    },
    {
      key: "createdAt",
      header: "تاريخ الدعوة",
      render: (i) => <span dir="ltr" className="text-ink-faint">{formatDate(i.createdAt)}</span>,
    },
    {
      key: "expiresAt",
      header: "تنتهي في",
      render: (i) => <span dir="ltr" className="text-ink-faint">{formatDate(i.expiresAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (i) => {
        if (!isOwner) return null;
        const busy = pendingActionId === i.id;

        if (i.status === "pending") {
          return (
            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                disabled={busy}
                onClick={() => handleResendInvitation(i)}
                title="إعادة إرسال الدعوة"
                aria-label="إعادة إرسال الدعوة"
                className="grid h-8 w-8 place-items-center rounded-full text-ink-faint transition-colors hover:bg-cream hover:text-ink disabled:pointer-events-none disabled:opacity-50"
              >
                <IconRefresh className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setEditTarget(i)}
                title="تعديل الصلاحية"
                aria-label="تعديل الصلاحية"
                className="grid h-8 w-8 place-items-center rounded-full text-ink-faint transition-colors hover:bg-cream hover:text-ink disabled:pointer-events-none disabled:opacity-50"
              >
                <IconPencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setRevokeTarget(i)}
                title="إلغاء الدعوة"
                aria-label="إلغاء الدعوة"
                className="grid h-8 w-8 place-items-center rounded-full text-danger/80 transition-colors hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-50"
              >
                <IconTrash className="h-4 w-4" />
              </button>
            </div>
          );
        }

        if (i.status === "accepted") {
          return (
            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  runAction(i.id, () => approveInvitation(i.id), `تمت الموافقة على ${i.email} كـ${ROLE_LABELS[i.role] ?? i.role}.`)
                }
                className="inline-flex items-center gap-1 rounded-full border border-gold/50 px-3 py-1.5 text-xs text-gold-deep transition-colors hover:bg-gold/10 disabled:opacity-50"
              >
                <IconCheck className="h-3.5 w-3.5" />
                موافقة
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setRejectTarget(i)}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
              >
                <IconClose className="h-3.5 w-3.5" />
                رفض
              </button>
            </div>
          );
        }

        return null;
      },
    },
  ];

  const trashColumns: DataTableColumn<AdminInvitation>[] = [
    {
      key: "email",
      header: "البريد الإلكتروني",
      className: "min-w-[220px]",
      render: (i) => (
        <span dir="ltr" className="text-ink">
          {i.email}
        </span>
      ),
    },
    {
      key: "role",
      header: "الصلاحية المطلوبة",
      render: (i) => <span className="text-ink-soft">{ROLE_LABELS[i.role] ?? i.role}</span>,
    },
    {
      key: "status",
      header: "الحالة",
      render: (i) => {
        const meta = INVITATION_STATUS_META[i.status];
        return <StatusBadge variant={meta.variant}>{meta.label}</StatusBadge>;
      },
    },
    {
      key: "reviewedAt",
      header: "تاريخ الإلغاء",
      render: (i) => (
        <span dir="ltr" className="text-ink-faint">
          {i.reviewedAt ? formatDate(i.reviewedAt) : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (i) => {
        if (!isOwner) return null;
        const busy = pendingActionId === i.id;
        return (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              disabled={busy}
              onClick={() => setRestoreTarget(i)}
              title="استعادة الدعوة"
              aria-label="استعادة الدعوة"
              className="grid h-8 w-8 place-items-center rounded-full text-ink-faint transition-colors hover:bg-cream hover:text-ink disabled:pointer-events-none disabled:opacity-50"
            >
              <IconRefresh className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setDeleteTarget(i)}
              title="حذف نهائي"
              aria-label="حذف نهائي"
              className="grid h-8 w-8 place-items-center rounded-full text-danger/80 transition-colors hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-50"
            >
              <IconTrash className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="المستخدمون الإداريون"
        description={`${profiles.length.toLocaleString("en-US")} مستخدمًا · ${invitations.filter((i) => i.status === "pending" || i.status === "accepted").length.toLocaleString("en-US")} دعوة قائمة`}
        actions={
          isOwner ? (
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-ivory transition-colors hover:bg-gold-deep"
            >
              <IconPlus className="h-4 w-4" />
              دعوة مستخدم
            </button>
          ) : undefined
        }
      />

      {!isOwner && (
        <div className="flex items-start gap-3 rounded-[10px] border border-beige bg-cream/50 p-4 text-sm text-ink-soft">
          <IconAlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" />
          <p>إدارة المستخدمين والدعوات متاحة لمالك المنصة فقط. يمكنك استعراض القوائم أدناه دون تعديلها.</p>
        </div>
      )}

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "users" && (
        <div className="flex flex-col gap-4">
          {profilesError ? (
            <EmptyState
              icon={IconAlertTriangle}
              title="تعذّر تحميل قائمة المستخدمين"
              description={profilesError}
            />
          ) : isLoading && profiles.length === 0 ? (
            <div className="rounded-[10px] border border-beige bg-white/70 p-10 text-center text-sm text-ink-faint">
              جارٍ التحميل...
            </div>
          ) : profiles.length === 0 ? (
            <EmptyState icon={IconUsers} title="لا يوجد مستخدمون بعد" />
          ) : (
            <DataTable columns={userColumns} rows={profiles} rowKey={(p) => p.id} />
          )}
        </div>
      )}

      {tab === "invitations" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInvitationView("active")}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                invitationView === "active" ? "bg-ink text-ivory" : "text-ink-soft hover:bg-cream"
              }`}
            >
              الدعوات النشطة
            </button>
            <button
              type="button"
              onClick={() => setInvitationView("trash")}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                invitationView === "trash" ? "bg-ink text-ivory" : "text-ink-soft hover:bg-cream"
              }`}
            >
              سلة المحذوفات
              {trashedInvitations.length > 0 && ` (${trashedInvitations.length.toLocaleString("en-US")})`}
            </button>
          </div>

          {invitationView === "active" ? (
            activeInvitations.length === 0 ? (
              <EmptyState
                icon={IconUsers}
                title="لا توجد دعوات نشطة"
                description={isOwner ? "ابدئي بدعوة أول عضو في فريق الإدارة." : undefined}
                action={
                  isOwner ? (
                    <button
                      type="button"
                      onClick={() => setInviteOpen(true)}
                      className="mt-2 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-ivory transition-colors hover:bg-gold-deep"
                    >
                      <IconPlus className="h-4 w-4" />
                      دعوة مستخدم
                    </button>
                  ) : undefined
                }
              />
            ) : (
              <DataTable columns={invitationColumns} rows={activeInvitations} rowKey={(i) => i.id} />
            )
          ) : trashedInvitations.length === 0 ? (
            <EmptyState icon={IconTrash} title="سلة المحذوفات فارغة" />
          ) : (
            <DataTable columns={trashColumns} rows={trashedInvitations} rowKey={(i) => i.id} />
          )}
        </div>
      )}

      {tab === "permissions" && (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-display text-lg text-ink">صلاحيات كل دور</h2>
            <p className="mt-1 text-xs text-ink-faint">
              الصلاحيات موروثة من دور المستخدم — لا يمكن تعديلها هنا مباشرة.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from(permissionsByRole.entries()).map(([role, perms]) => (
                <div key={role} className="rounded-[10px] border border-beige bg-white/70 p-4">
                  <p className="font-medium text-ink">{ROLE_LABELS[role] ?? role}</p>
                  <ul className="mt-2 flex flex-col gap-1">
                    {perms.map((perm) => (
                      <li key={perm} dir="ltr" className="text-xs text-ink-faint">
                        {perm}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {permissionsByRole.size === 0 && (
                <p className="text-sm text-ink-faint">لا توجد بيانات صلاحيات متاحة.</p>
              )}
            </div>
          </div>

          <div className="border-t border-beige pt-6">
            <h2 className="font-display text-lg text-ink">الصلاحيات الفعلية لمستخدم</h2>
            <p className="mt-1 text-xs text-ink-faint">
              الصلاحية الفعلية = صلاحيات الدور، مضافًا إليها أي استثناءات خاصة بهذا المستخدم تحديدًا. "صلاحيات الدور"
              أدناه للقراءة فقط دائمًا؛ "استثناءات خاصة" هي ما يمكن تعديله لهذا المستخدم وحده دون التأثير على بقية من
              يحملون نفس الدور.
            </p>
            {profiles.length === 0 ? (
              <p className="mt-4 text-sm text-ink-faint">لا يوجد مستخدمون لعرض صلاحياتهم.</p>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="max-w-xs grow">
                    <Select
                      label="المستخدم"
                      value={selectedUserId}
                      onChange={setSelectedUserId}
                      options={profiles.map((p) => ({ value: p.id, label: `${p.name} (${ROLE_LABELS[p.role] ?? p.role})` }))}
                    />
                  </div>
                  {isOwner && selectedProfile && selectedProfile.role !== "owner" && (
                    <button
                      type="button"
                      onClick={() => setPermissionsTarget(selectedProfile)}
                      className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-medium text-ivory transition-colors hover:bg-gold-deep"
                    >
                      <IconGear className="h-3.5 w-3.5" />
                      إدارة الاستثناءات
                    </button>
                  )}
                </div>
                {overridesLoading ? (
                  <p className="text-sm text-ink-faint">جارٍ التحميل...</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-[10px] border border-beige bg-white/70 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">صلاحيات الدور</p>
                      <ul className="mt-2 flex flex-col gap-1">
                        {selectedRolePermissions.map((perm) => (
                          <li key={perm} dir="ltr" className="text-xs text-ink-soft">
                            {perm}
                          </li>
                        ))}
                        {selectedRolePermissions.length === 0 && (
                          <li className="text-xs text-ink-faint">لا توجد صلاحيات لهذا الدور.</li>
                        )}
                      </ul>
                    </div>
                    <div className="rounded-[10px] border border-beige bg-white/70 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">استثناءات خاصة</p>
                      <ul className="mt-2 flex flex-col gap-1">
                        {overrides.map((o) => (
                          <li key={o.permission} dir="ltr" className="flex items-center gap-2 text-xs">
                            <StatusBadge variant={o.granted ? "success" : "danger"} icon={null}>
                              {o.granted ? "+" : "-"}
                            </StatusBadge>
                            <span className="text-ink-soft">{o.permission}</span>
                          </li>
                        ))}
                        {overrides.length === 0 && (
                          <li className="text-xs text-ink-faint">
                            لا توجد استثناءات لهذا المستخدم — صلاحياته الفعلية مطابقة تمامًا لصلاحيات دوره.
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <InviteAdminModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={async (email, role) => {
          const result = await inviteAdmin(email, role);
          setInviteResult({
            kind: "create",
            email,
            role,
            rawToken: result.rawToken,
            expiresAt: result.expiresAt,
            emailStatus: "sending",
          });
          setToast({ variant: "success", message: `تم إنشاء الدعوة لـ${email}.` });
          void sendInvitationEmail(email, role, result.rawToken, result.expiresAt);
        }}
      />

      <EditInvitationModal
        invitation={editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={async (invitationId, email, newRole) => {
          const result = await editInvitationRole(invitationId, email, newRole);
          setInviteResult({
            kind: "edit",
            email: result.email,
            role: result.role,
            rawToken: result.rawToken,
            expiresAt: result.expiresAt,
            emailStatus: "idle",
          });
          setToast({ variant: "success", message: `تم تحديث صلاحية دعوة ${email}.` });
        }}
      />

      <Modal
        open={Boolean(inviteResult)}
        onClose={() => setInviteResult(null)}
        title={
          inviteResult?.kind === "resend"
            ? "تمت إعادة إرسال الدعوة"
            : inviteResult?.kind === "edit"
              ? "تم تحديث صلاحية الدعوة"
              : "تم إنشاء الدعوة"
        }
        footer={
          <button
            type="button"
            onClick={() => setInviteResult(null)}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
          >
            تم
          </button>
        }
      >
        <div className="flex flex-col gap-3">
          {inviteResult?.emailStatus === "idle" && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-ink-soft">
                تم حفظ الصلاحية الجديدة وإنشاء دعوة جديدة بها لـ<span dir="ltr">{inviteResult.email}</span>. إن كانت
                رسالة سابقة قد أُرسلت لهذا البريد، فقد تحتوي على الصلاحية القديمة.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (!inviteResult) return;
                  setInviteResult({ ...inviteResult, emailStatus: "sending" });
                  void sendInvitationEmail(
                    inviteResult.email,
                    inviteResult.role,
                    inviteResult.rawToken,
                    inviteResult.expiresAt
                  );
                }}
                className="self-start rounded-full bg-ink px-4 py-1.5 text-xs font-medium text-ivory transition-colors hover:bg-gold-deep"
              >
                إرسال الدعوة المحدّثة الآن
              </button>
            </div>
          )}
          {inviteResult?.emailStatus === "sending" && (
            <p className="text-sm text-ink-soft">
              جارٍ إرسال بريد الدعوة إلى <span dir="ltr">{inviteResult.email}</span>...
            </p>
          )}
          {inviteResult?.emailStatus === "sent" && (
            <p className="flex items-center gap-2 text-sm text-success">
              <IconCheck className="h-4 w-4 shrink-0" />
              تم إرسال الدعوة بنجاح إلى <span dir="ltr">{inviteResult.email}</span>
            </p>
          )}
          {inviteResult?.emailStatus === "failed" && (
            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-2 text-sm text-danger">
                <IconAlertTriangle className="h-4 w-4 shrink-0" />
                تم إنشاء الدعوة، لكن تعذر إرسال البريد الإلكتروني. يمكنك إعادة المحاولة.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (!inviteResult) return;
                  setInviteResult({ ...inviteResult, emailStatus: "sending" });
                  void sendInvitationEmail(
                    inviteResult.email,
                    inviteResult.role,
                    inviteResult.rawToken,
                    inviteResult.expiresAt
                  );
                }}
                className="self-start rounded-full border border-danger/40 px-4 py-1.5 text-xs text-danger transition-colors hover:bg-danger/10"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          <p className="text-xs text-ink-faint">
            يمكنك أيضًا مشاركة رابط الدعوة يدويًا كخيار احتياطي إذا لم تصل الرسالة:
          </p>
          {inviteResult && (
            <div className="flex items-center justify-between gap-2 rounded-[10px] bg-cream/60 px-4 py-3">
              <span dir="ltr" className="truncate text-xs text-ink">
                {inviteResult.rawToken}
              </span>
              <CopyIconButton value={inviteResult.rawToken} label="نسخ الرمز" className="h-6 w-6 shrink-0" />
            </div>
          )}
          <p className="text-xs text-ink-faint">
            تنتهي صلاحية الدعوة في {inviteResult ? formatDate(inviteResult.expiresAt) : ""}.
          </p>
        </div>
      </Modal>

      <ChangeRoleModal
        target={roleChangeTarget}
        onClose={() => setRoleChangeTarget(null)}
        onSubmit={async (userId, role) => {
          await changeAdminRole(userId, role);
          setToast({ variant: "success", message: "تم تحديث الصلاحية." });
        }}
      />

      <ManageUserPermissionsModal
        target={permissionsTarget}
        rolePermissions={rolePermissions}
        onClose={() => setPermissionsTarget(null)}
        getOverrides={getUserPermissionOverrides}
        setOverride={setUserPermissionOverride}
        onSaved={reloadSelectedOverrides}
      />

      <ConfirmDialog
        open={Boolean(suspendTarget)}
        title="تعليق الوصول"
        description={`هل تريدين تعليق وصول ${suspendTarget?.name ?? ""}؟ سيفقد صلاحياته الإدارية فورًا حتى تتم إعادة تفعيله.`}
        confirmLabel="تعليق"
        onConfirm={() => {
          if (suspendTarget) {
            runAction(suspendTarget.id, () => suspendAdmin(suspendTarget.id), `تم تعليق وصول ${suspendTarget.name}.`);
          }
          setSuspendTarget(null);
        }}
        onCancel={() => setSuspendTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(reactivateTarget)}
        title="إعادة تفعيل الوصول"
        description={`هل تريدين إعادة تفعيل وصول ${reactivateTarget?.name ?? ""}؟`}
        confirmLabel="إعادة تفعيل"
        tone="neutral"
        onConfirm={() => {
          if (reactivateTarget) {
            runAction(reactivateTarget.id, () => reactivateAdmin(reactivateTarget.id), `تمت إعادة تفعيل وصول ${reactivateTarget.name}.`);
          }
          setReactivateTarget(null);
        }}
        onCancel={() => setReactivateTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(rejectTarget)}
        title="رفض الدعوة"
        description={`هل تريدين رفض دعوة ${rejectTarget?.email ?? ""}؟ لن يحصل على أي صلاحيات إدارية.`}
        confirmLabel="رفض الدعوة"
        onConfirm={() => {
          if (rejectTarget) {
            runAction(rejectTarget.id, () => rejectInvitation(rejectTarget.id), `تم رفض دعوة ${rejectTarget.email}.`);
          }
          setRejectTarget(null);
        }}
        onCancel={() => setRejectTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(revokeTarget)}
        title="إلغاء الدعوة"
        description={`هل تريدين إلغاء دعوة ${revokeTarget?.email ?? ""}؟ سيتوقف رابط الدعوة الحالي عن العمل، ويمكنك دعوة هذا البريد مجددًا لاحقًا.`}
        confirmLabel="إلغاء الدعوة"
        onConfirm={() => {
          if (revokeTarget) {
            runAction(revokeTarget.id, () => revokeInvitation(revokeTarget.id), `تم إلغاء دعوة ${revokeTarget.email}.`);
          }
          setRevokeTarget(null);
        }}
        onCancel={() => setRevokeTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(restoreTarget)}
        title="استعادة الدعوة"
        description={`هل تريدين استعادة دعوة ${restoreTarget?.email ?? ""}؟ ستعود إلى قائمة الدعوات النشطة بحالة "بانتظار قبول المدعو" ورابط دعوة صالح لمدة ٧ أيام جديدة.`}
        confirmLabel="استعادة"
        tone="neutral"
        onConfirm={() => {
          if (restoreTarget) {
            runAction(restoreTarget.id, () => restoreInvitation(restoreTarget.id), `تمت استعادة دعوة ${restoreTarget.email}.`);
          }
          setRestoreTarget(null);
        }}
        onCancel={() => setRestoreTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف نهائي"
        description={`هل تريدين حذف دعوة ${deleteTarget?.email ?? ""} نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف نهائي"
        onConfirm={() => {
          if (deleteTarget) {
            runAction(deleteTarget.id, () => deleteInvitationPermanently(deleteTarget.id), `تم حذف دعوة ${deleteTarget.email} نهائيًا.`);
          }
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
