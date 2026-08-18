import { useEffect, useState } from "react";
import { Modal } from "@/admin/components/ui/Modal";
import { Select } from "@/admin/components/forms/Select";
import { ASSIGNABLE_ADMIN_ROLES } from "@/admin/types/adminUser";
import type { AdminInvitation, AssignableAdminRole } from "@/admin/types/adminUser";
import { getErrorMessage } from "@/admin/lib/errorMessage";

const ROLE_LABELS: Record<AssignableAdminRole, string> = {
  super_admin: "مدير عام (Super Admin)",
  admin: "مدير",
  editor: "محرر",
  analyst: "محلل (قراءة فقط)",
};

interface EditInvitationModalProps {
  invitation: AdminInvitation | null;
  onClose: () => void;
  onSubmit: (invitationId: string, email: string, newRole: AssignableAdminRole) => Promise<void>;
}

/** Edits ONLY the role of a pending invitation — email is shown but never
 * editable (admin_invitations has no way to change it that preserves the
 * token's identity anyway), and the token/expiry are never exposed as
 * editable fields here at all: they're regenerated server-side as a
 * necessary side effect of the role change (see editInvitationRole in
 * AdminUsersContext), never something this form lets anyone type into. */
export function EditInvitationModal({ invitation, onClose, onSubmit }: EditInvitationModalProps) {
  const [role, setRole] = useState<AssignableAdminRole>("editor");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invitation) setRole(invitation.role);
    setError(null);
  }, [invitation]);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!invitation) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(invitation.id, invitation.email, role);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "تعذّر تحديث صلاحية الدعوة."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={Boolean(invitation)}
      onClose={handleClose}
      title="تعديل صلاحية الدعوة"
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
            disabled={isSubmitting || role === invitation?.role}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "جارٍ الحفظ..." : "حفظ التغيير"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <span className="mb-2 block text-sm text-ink">البريد الإلكتروني</span>
          <p dir="ltr" className="rounded-md border border-beige bg-cream/50 px-4 py-3 text-sm text-ink-soft">
            {invitation?.email}
          </p>
        </div>
        <Select
          label="الصلاحية"
          value={role}
          onChange={(v) => setRole(v as AssignableAdminRole)}
          options={ASSIGNABLE_ADMIN_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
          required
        />
        <p className="text-xs text-ink-faint">
          سيتم إنشاء دعوة جديدة بالصلاحية الجديدة ورمز جديد؛ ستُلغى الدعوة الحالية تلقائيًا.
        </p>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </Modal>
  );
}
