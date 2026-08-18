import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/admin/components/ui/Modal";
import { getErrorMessage } from "@/admin/lib/errorMessage";
import type { AdminProfileWithEmail, RolePermissionRow, UserPermissionOverrideRow } from "@/admin/types/adminUser";

const ROLE_LABELS: Record<string, string> = {
  owner: "المالك",
  super_admin: "مدير عام",
  admin: "مدير",
  editor: "محرر",
  analyst: "محلل",
};

const GROUP_LABELS: Record<string, string> = {
  dashboard: "لوحة التحكم",
  analytics: "التحليلات",
  books: "الكتب",
  categories: "التصنيفات",
  orders: "الطلبات",
  customers: "العملاء",
  coupons: "أكواد الخصم",
  articles: "المقالات",
  media: "الوسائط",
  library: "المكتبة الرقمية",
  messages: "الرسائل",
  communications: "نظام التواصل",
  content: "المحتوى",
  settings: "الإعدادات",
  users: "المستخدمون الإداريون",
  audit_log: "سجل التدقيق",
};

const ACTION_LABELS: Record<string, string> = {
  view: "عرض",
  create: "إنشاء",
  edit: "تعديل",
  delete: "حذف",
  manage: "إدارة",
  reply: "الرد",
  invite: "دعوة",
  approve: "موافقة",
  suspend: "تعليق",
  change_role: "تغيير الصلاحية",
  change_permissions: "تغيير الصلاحيات الفردية",
};

function permissionGroup(permission: string): string {
  return permission.split(".")[0] ?? permission;
}

function permissionActionLabel(permission: string): string {
  const action = permission.split(".")[1];
  if (!action) return permission;
  return ACTION_LABELS[action] ?? action;
}

interface ManageUserPermissionsModalProps {
  target: AdminProfileWithEmail | null;
  rolePermissions: RolePermissionRow[];
  onClose: () => void;
  getOverrides: (userId: string) => Promise<UserPermissionOverrideRow[]>;
  setOverride: (userId: string, permission: string, granted: boolean | null) => Promise<void>;
}

/** Owner-only per-user permission management: role permissions + explicit
 * grants − explicit revokes, exactly the model already established by
 * user_permission_overrides (Phase 1) and now actually writable via
 * set_user_permission_override() (migration 20260818180001). Never a
 * second permission vocabulary — every permission shown here comes
 * directly from role_permissions, the same table the read-only Permissions
 * tab already renders. */
export function ManageUserPermissionsModal({
  target,
  rolePermissions,
  onClose,
  getOverrides,
  setOverride,
}: ManageUserPermissionsModalProps) {
  const [overrides, setOverrides] = useState<UserPermissionOverrideRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<Map<string, boolean | null>>(new Map());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedJustNow, setSavedJustNow] = useState(false);

  useEffect(() => {
    if (!target) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPending(new Map());
    setSavedJustNow(false);
    getOverrides(target.id)
      .then((rows) => {
        if (!cancelled) setOverrides(rows);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "تعذّر تحميل استثناءات هذا المستخدم."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [target, getOverrides]);

  const allPermissions = useMemo(
    () => Array.from(new Set(rolePermissions.map((r) => r.permission))).sort(),
    [rolePermissions]
  );

  const roleBasePermissions = useMemo(() => {
    if (!target) return new Set<string>();
    return new Set(rolePermissions.filter((r) => r.role === target.role).map((r) => r.permission));
  }, [rolePermissions, target]);

  const grouped = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const perm of allPermissions) {
      const group = permissionGroup(perm);
      const list = map.get(group) ?? [];
      list.push(perm);
      map.set(group, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [allPermissions]);

  const savedOverrideFor = (permission: string): boolean | null =>
    overrides.find((o) => o.permission === permission)?.granted ?? null;

  const draftValueFor = (permission: string): boolean | null =>
    pending.has(permission) ? (pending.get(permission) ?? null) : savedOverrideFor(permission);

  const setDraft = (permission: string, value: boolean | null) => {
    setSavedJustNow(false);
    setPending((prev) => {
      const next = new Map(prev);
      const saved = savedOverrideFor(permission);
      if (value === saved) {
        next.delete(permission);
      } else {
        next.set(permission, value);
      }
      return next;
    });
  };

  const handleClose = () => {
    if (saving) return;
    if (pending.size > 0 && !window.confirm("لديك تغييرات غير محفوظة. هل تريدين تجاهلها؟")) return;
    onClose();
  };

  const handleSave = async () => {
    if (!target || pending.size === 0) return;
    setSaving(true);
    setError(null);
    try {
      for (const [permission, value] of pending.entries()) {
        await setOverride(target.id, permission, value);
      }
      const fresh = await getOverrides(target.id);
      setOverrides(fresh);
      setPending(new Map());
      setSavedJustNow(true);
    } catch (err) {
      setError(getErrorMessage(err, "تعذّر حفظ التغييرات."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={Boolean(target)}
      onClose={handleClose}
      title={target ? `إدارة صلاحيات ${target.name}` : "إدارة الصلاحيات"}
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="rounded-full px-5 py-2.5 text-sm text-ink-soft transition-colors hover:bg-beige disabled:pointer-events-none disabled:opacity-60"
          >
            إغلاق
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || pending.size === 0}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "جارٍ الحفظ..." : pending.size > 0 ? `حفظ التغييرات (${pending.size})` : "حفظ التغييرات"}
          </button>
        </>
      }
    >
      <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto">
        {target && (
          <div className="flex flex-wrap items-center gap-3 rounded-[10px] border border-beige bg-cream/50 px-4 py-3 text-sm">
            <span className="text-ink-soft">البريد الإلكتروني:</span>
            <span dir="ltr" className="text-ink">
              {target.email}
            </span>
            <span className="text-ink-faint">·</span>
            <span className="text-ink-soft">الدور الحالي:</span>
            <span className="font-medium text-ink">{ROLE_LABELS[target.role] ?? target.role}</span>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-ink-faint">جارٍ التحميل...</p>
        ) : (
          <div className="flex flex-col gap-5">
            {grouped.map(([group, perms]) => (
              <div key={group}>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">
                  {GROUP_LABELS[group] ?? group}
                </p>
                <div className="flex flex-col gap-1.5">
                  {perms.map((perm) => {
                    const inRole = roleBasePermissions.has(perm);
                    const value = draftValueFor(perm);
                    const isDirty = pending.has(perm);
                    let statusLabel: string;
                    let statusClass: string;
                    if (value === true) {
                      statusLabel = "منح إضافي";
                      statusClass = "text-success";
                    } else if (value === false) {
                      statusLabel = "ملغى للمستخدم";
                      statusClass = "text-danger";
                    } else if (inRole) {
                      statusLabel = "موروث من الدور";
                      statusClass = "text-ink-faint";
                    } else {
                      statusLabel = "غير مشمول";
                      statusClass = "text-ink-faint";
                    }
                    return (
                      <div
                        key={perm}
                        className={`flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 ${
                          isDirty ? "border-gold/60 bg-gold/5" : "border-beige"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm text-ink">{permissionActionLabel(perm)}</span>
                          <span dir="ltr" className="text-[11px] text-ink-faint">
                            {perm}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${statusClass}`}>{statusLabel}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setDraft(perm, true)}
                              disabled={value === true}
                              title="منح"
                              className="rounded-full border border-success/40 px-2.5 py-1 text-[11px] text-success transition-colors hover:bg-success/10 disabled:pointer-events-none disabled:opacity-40"
                            >
                              منح
                            </button>
                            <button
                              type="button"
                              onClick={() => setDraft(perm, false)}
                              disabled={value === false}
                              title="إلغاء"
                              className="rounded-full border border-danger/40 px-2.5 py-1 text-[11px] text-danger transition-colors hover:bg-danger/10 disabled:pointer-events-none disabled:opacity-40"
                            >
                              إلغاء
                            </button>
                            <button
                              type="button"
                              onClick={() => setDraft(perm, null)}
                              disabled={value === null}
                              title="إعادة إلى افتراضي الدور"
                              className="rounded-full border border-beige px-2.5 py-1 text-[11px] text-ink-soft transition-colors hover:border-gold hover:text-ink disabled:pointer-events-none disabled:opacity-40"
                            >
                              افتراضي
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {savedJustNow && pending.size === 0 && !error && (
          <p className="text-sm text-success">تم حفظ التغييرات بنجاح.</p>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </Modal>
  );
}
