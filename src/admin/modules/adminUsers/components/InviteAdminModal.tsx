import { useState } from "react";
import { Modal } from "@/admin/components/ui/Modal";
import { TextField } from "@/admin/components/forms/TextField";
import { Select } from "@/admin/components/forms/Select";
import { ASSIGNABLE_ADMIN_ROLES } from "@/admin/types/adminUser";
import type { AssignableAdminRole } from "@/admin/types/adminUser";

const ROLE_LABELS: Record<AssignableAdminRole, string> = {
  super_admin: "مدير عام (Super Admin)",
  admin: "مدير",
  editor: "محرر",
  analyst: "محلل (قراءة فقط)",
};

interface InviteAdminModalProps {
  open: boolean;
  onClose: () => void;
  onInvite: (email: string, role: AssignableAdminRole) => Promise<void>;
}

/** Owner-only (enforced server-side by create_admin_invitation() — this
 * modal simply isn't rendered for a non-owner viewer, see AdminUsersPage).
 * No display-name field: neither admin_invitations nor
 * create_admin_invitation() has one — schema/API don't support it, so it's
 * correctly omitted rather than invented. */
export function InviteAdminModal({ open, onClose, onInvite }: InviteAdminModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AssignableAdminRole>("editor");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setEmail("");
    setRole("editor");
    setError(null);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("البريد الإلكتروني مطلوب.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onInvite(email.trim(), role);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر إرسال الدعوة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="دعوة مستخدم إداري جديد"
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
            {isSubmitting ? "جارٍ الإرسال..." : "إرسال الدعوة"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <TextField
          label="البريد الإلكتروني"
          value={email}
          onChange={setEmail}
          type="email"
          dir="ltr"
          placeholder="name@example.com"
          required
        />
        <Select
          label="الصلاحية"
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
