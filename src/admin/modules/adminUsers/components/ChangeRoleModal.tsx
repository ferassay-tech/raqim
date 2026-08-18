import { useEffect, useState } from "react";
import { Modal } from "@/admin/components/ui/Modal";
import { Select } from "@/admin/components/forms/Select";
import { ASSIGNABLE_ADMIN_ROLES } from "@/admin/types/adminUser";
import type { AdminProfileWithEmail, AssignableAdminRole } from "@/admin/types/adminUser";

const ROLE_LABELS: Record<AssignableAdminRole, string> = {
  super_admin: "مدير عام (Super Admin)",
  admin: "مدير",
  editor: "محرر",
  analyst: "محلل (قراءة فقط)",
};

interface ChangeRoleModalProps {
  target: AdminProfileWithEmail | null;
  onClose: () => void;
  onSubmit: (userId: string, role: AssignableAdminRole) => Promise<void>;
}

/** target is never the owner — AdminUsersPage never offers this action on
 * the owner's own row (change_admin_role() itself also refuses that
 * target server-side; this is a UX nicety on top of a real enforced rule,
 * not the actual boundary). */
export function ChangeRoleModal({ target, onClose, onSubmit }: ChangeRoleModalProps) {
  const [role, setRole] = useState<AssignableAdminRole>("editor");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (target && target.role !== "owner") setRole(target.role as AssignableAdminRole);
    setError(null);
  }, [target]);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!target) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(target.id, role);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر تغيير الصلاحية.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={Boolean(target)}
      onClose={handleClose}
      title={target ? `تغيير صلاحية ${target.name}` : "تغيير الصلاحية"}
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-full px-5 py-2.5 text-sm text-ink-soft transition-colors hover:bg-beige disabled:pointer-events-none disabled:opacity-60"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? "جارٍ الحفظ..." : "حفظ التغيير"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Select
          label="الصلاحية الجديدة"
          value={role}
          onChange={(v) => setRole(v as AssignableAdminRole)}
          options={ASSIGNABLE_ADMIN_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
          required
        />
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </Modal>
  );
}
