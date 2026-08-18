import { useEffect, useMemo, useState } from "react";
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
import { IconUsers, IconPlus, IconCheck, IconClose, IconAlertTriangle } from "@/admin/icons";
import { useAdminUsers } from "@/admin/context/AdminUsersContext";
import { InviteAdminModal } from "../components/InviteAdminModal";
import { ChangeRoleModal } from "../components/ChangeRoleModal";
import type {
  AdminInvitation,
  AdminInvitationStatus,
  AdminProfileWithEmail,
  UserPermissionOverrideRow,
} from "@/admin/types/adminUser";

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
    suspendAdmin,
    reactivateAdmin,
    changeAdminRole,
    getUserPermissionOverrides,
  } = useAdminUsers();

  const [tab, setTab] = useState<string>("users");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ email: string; rawToken: string; expiresAt: string } | null>(null);
  const [roleChangeTarget, setRoleChangeTarget] = useState<AdminProfileWithEmail | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<AdminProfileWithEmail | null>(null);
  const [reactivateTarget, setReactivateTarget] = useState<AdminProfileWithEmail | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminInvitation | null>(null);
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
      setToast({ variant: "error", message: err instanceof Error ? err.message : "حدث خطأ غير متوقع." });
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
      key: "actions",
      header: "",
      align: "end",
      render: (p) => {
        if (p.role === "owner" || !isOwner) return null;
        return (
          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
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
        if (!isOwner || i.status !== "accepted") return null;
        const busy = pendingActionId === i.id;
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
          {invitations.length === 0 ? (
            <EmptyState
              icon={IconUsers}
              title="لا توجد دعوات بعد"
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
            <DataTable columns={invitationColumns} rows={invitations} rowKey={(i) => i.id} />
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
              تُحسب من دور المستخدم مضافًا إليها أي استثناءات خاصة به. إدارة الاستثناءات (إضافة/إزالة) تتطلب دالة
              قاعدة بيانات إضافية لم تُبنَ بعد — هذا العرض للقراءة فقط حاليًا.
            </p>
            {profiles.length === 0 ? (
              <p className="mt-4 text-sm text-ink-faint">لا يوجد مستخدمون لعرض صلاحياتهم.</p>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                <div className="max-w-xs">
                  <Select
                    label="المستخدم"
                    value={selectedUserId}
                    onChange={setSelectedUserId}
                    options={profiles.map((p) => ({ value: p.id, label: `${p.name} (${ROLE_LABELS[p.role] ?? p.role})` }))}
                  />
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
                          <li className="text-xs text-ink-faint">لا توجد استثناءات لهذا المستخدم.</li>
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
          setInviteResult({ email, rawToken: result.rawToken, expiresAt: result.expiresAt });
          setToast({ variant: "success", message: `تم إنشاء الدعوة لـ${email}.` });
        }}
      />

      <Modal
        open={Boolean(inviteResult)}
        onClose={() => setInviteResult(null)}
        title="تم إنشاء الدعوة"
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
          <p className="text-sm text-ink-soft">
            لم يُفعَّل الإرسال التلقائي للبريد الإلكتروني بعد لهذه الخطوة — انسخي رمز الدعوة وشاركيه يدويًا مع
            <span dir="ltr"> {inviteResult?.email}</span> مؤقتًا.
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

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
