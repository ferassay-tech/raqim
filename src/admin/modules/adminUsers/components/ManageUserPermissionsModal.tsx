import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/admin/components/ui/Modal";
import { getErrorMessage } from "@/admin/lib/errorMessage";
import { isCorePermission, permissionSourceFor } from "@/admin/lib/effectivePermissions";
import type { PermissionSource } from "@/admin/lib/effectivePermissions";
import { IconCheck, IconClose, IconRefresh } from "@/admin/icons";
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

const STATUS_META: Record<PermissionSource, { label: string; className: string }> = {
  inherited: { label: "موروثة من الدور", className: "bg-cream text-ink-soft" },
  granted: { label: "ممنوحة لهذا المستخدم", className: "bg-success/15 text-success" },
  revoked: { label: "ملغاة لهذا المستخدم", className: "bg-danger/15 text-danger" },
  unset: { label: "غير مفعّلة", className: "bg-cream text-ink-faint" },
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
  /** Called after a successful save so a caller showing its own separate
   * read-only summary of this user's overrides (the Permissions tab) can
   * refresh — this modal's own internal list already refreshes itself. */
  onSaved?: () => void;
}

/** Owner-only per-user permission management: role permissions + explicit
 * grants − explicit revokes, exactly the model already established by
 * user_permission_overrides. Never a second permission vocabulary — every
 * permission shown here comes directly from role_permissions, the same
 * table the read-only Permissions tab already renders, and status is
 * computed via the same permissionSourceFor() helper RequirePermission
 * (route guard) uses for real access decisions. This modal only ever
 * writes user_permission_overrides — role_permissions is never touched. */
export function ManageUserPermissionsModal({
  target,
  rolePermissions,
  onClose,
  getOverrides,
  setOverride,
  onSaved,
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

  // overrides + any staged (not-yet-saved) changes, merged into one list —
  // reused via the same permissionSourceFor() helper the route guard uses,
  // so the status shown here is always "what access will actually be"
  // once saved, not a separately-invented display rule.
  const draftOverrides = useMemo<UserPermissionOverrideRow[]>(() => {
    if (!target) return [];
    const map = new Map<string, boolean>();
    for (const o of overrides) map.set(o.permission, o.granted);
    for (const [perm, val] of pending.entries()) {
      if (val === null) map.delete(perm);
      else map.set(perm, val);
    }
    return Array.from(map.entries()).map(([permission, granted]) => ({ userId: target.id, permission, granted }));
  }, [target, overrides, pending]);

  const setDraft = (permission: string, value: boolean | null) => {
    // Core permissions (dashboard.view) have no controls in this UI, but
    // guard the setter too — belt and suspenders against any future path
    // that might call it directly.
    if (isCorePermission(permission)) return;
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

  const setDraftForGroup = (perms: string[], value: boolean | null) => {
    const actionable = perms.filter((p) => !isCorePermission(p));
    if (actionable.length === 0) return;
    setSavedJustNow(false);
    setPending((prev) => {
      const next = new Map(prev);
      for (const permission of actionable) {
        const saved = savedOverrideFor(permission);
        if (value === saved) next.delete(permission);
        else next.set(permission, value);
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
      onSaved?.();
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
      title="إدارة صلاحيات المستخدم"
      size="xl"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <div className="text-xs">
            {saving && <span className="text-ink-faint">جارٍ الحفظ...</span>}
            {!saving && savedJustNow && pending.size === 0 && !error && (
              <span className="flex items-center gap-1.5 text-success">
                <IconCheck className="h-3.5 w-3.5" />
                تم حفظ التغييرات بنجاح.
              </span>
            )}
            {!saving && error && <span className="text-danger">{error}</span>}
            {!saving && !savedJustNow && !error && pending.size > 0 && (
              <span className="text-gold-deep">{pending.size} تغيير غير محفوظ</span>
            )}
          </div>
          <div className="flex items-center gap-3">
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
              className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {target && (
          <div className="rounded-md border border-beige bg-cream/50 px-5 py-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-ink-faint">المستخدم:</span>
                <span dir="ltr" className="font-medium text-ink">
                  {target.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ink-faint">الدور:</span>
                <span className="font-medium text-ink">{ROLE_LABELS[target.role] ?? target.role}</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-ink-faint">
              تعديل هذه الصلاحيات يؤثر على هذا المستخدم فقط ولا يغيّر صلاحيات الدور.
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          {(["inherited", "granted", "revoked", "unset"] as PermissionSource[]).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  s === "granted" ? "bg-success" : s === "revoked" ? "bg-danger" : "bg-ink-faint/50"
                }`}
              />
              <span className="text-ink-soft">{STATUS_META[s].label}</span>
            </span>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-ink-faint">جارٍ التحميل...</p>
        ) : (
          <div className="flex max-h-[55vh] flex-col gap-6 overflow-y-auto pe-1">
            {grouped.map(([group, perms]) => {
              const hasActionable = perms.some((p) => !isCorePermission(p));
              return (
                <div key={group} className="rounded-md border border-beige bg-white/70">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-beige px-4 py-3">
                    <p className="text-sm font-medium text-ink">{GROUP_LABELS[group] ?? group}</p>
                    {hasActionable && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDraftForGroup(perms, true)}
                          className="rounded-full border border-success/40 px-2.5 py-1 text-[11px] text-success transition-colors hover:bg-success/10"
                        >
                          تفعيل الكل
                        </button>
                        <button
                          type="button"
                          onClick={() => setDraftForGroup(perms, false)}
                          className="rounded-full border border-danger/40 px-2.5 py-1 text-[11px] text-danger transition-colors hover:bg-danger/10"
                        >
                          تعطيل الكل
                        </button>
                        <button
                          type="button"
                          onClick={() => setDraftForGroup(perms, null)}
                          title="إعادة كل صلاحيات هذه المجموعة إلى افتراضي الدور"
                          className="inline-flex items-center gap-1 rounded-full border border-beige px-2.5 py-1 text-[11px] text-ink-soft transition-colors hover:border-gold hover:text-ink"
                        >
                          <IconRefresh className="h-3 w-3" />
                          إعادة للوضع الافتراضي
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col divide-y divide-beige/70">
                    {perms.map((perm) => {
                      if (isCorePermission(perm)) {
                        return (
                          <div key={perm} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                            <div className="flex min-w-[160px] flex-col">
                              <span className="text-sm text-ink">{permissionActionLabel(perm)}</span>
                              <span dir="ltr" className="text-[11px] text-ink-faint">
                                {perm}
                              </span>
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-medium text-gold-deep">
                              <IconCheck className="h-3 w-3" />
                              صلاحية أساسية — متاحة دائمًا لكل مستخدم إداري
                            </span>
                          </div>
                        );
                      }

                      const source = permissionSourceFor(target?.role, perm, rolePermissions, draftOverrides);
                      const value = draftValueFor(perm);
                      const isDirty = pending.has(perm);
                      const meta = STATUS_META[source];
                      return (
                        <div
                          key={perm}
                          className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${
                            isDirty ? "bg-gold/5" : ""
                          }`}
                        >
                          <div className="flex min-w-[160px] flex-col">
                            <span className="text-sm text-ink">{permissionActionLabel(perm)}</span>
                            <span dir="ltr" className="text-[11px] text-ink-faint">
                              {perm}
                            </span>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium ${meta.className}`}
                          >
                            {source === "granted" && <IconCheck className="h-3 w-3" />}
                            {source === "revoked" && <IconClose className="h-3 w-3" />}
                            {meta.label}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDraft(perm, true)}
                              disabled={value === true}
                              title="منح لهذا المستخدم"
                              className="rounded-full border border-success/40 px-3 py-1.5 text-[11px] text-success transition-colors hover:bg-success/10 disabled:pointer-events-none disabled:opacity-40"
                            >
                              منح
                            </button>
                            <button
                              type="button"
                              onClick={() => setDraft(perm, false)}
                              disabled={value === false}
                              title="إلغاء لهذا المستخدم"
                              className="rounded-full border border-danger/40 px-3 py-1.5 text-[11px] text-danger transition-colors hover:bg-danger/10 disabled:pointer-events-none disabled:opacity-40"
                            >
                              إلغاء
                            </button>
                            <button
                              type="button"
                              onClick={() => setDraft(perm, null)}
                              disabled={value === null}
                              title="إعادة إلى افتراضي الدور"
                              className="rounded-full border border-beige px-3 py-1.5 text-[11px] text-ink-soft transition-colors hover:border-gold hover:text-ink disabled:pointer-events-none disabled:opacity-40"
                            >
                              افتراضي
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
