import { useMemo, useState } from "react";
import { useCoupons } from "@/admin/context/CouponsContext";
import type { AdminCoupon } from "@/admin/types/coupon";
import { COUPON_STATUS_META, getCouponStatus } from "@/admin/lib/couponStatus";
import { PageHeader } from "@/admin/components/ui/PageHeader";
import { FilterBar, FilterSelect } from "@/admin/components/ui/FilterBar";
import { DataTable } from "@/admin/components/ui/DataTable";
import type { DataTableColumn } from "@/admin/components/ui/DataTable";
import { EmptyState } from "@/admin/components/ui/EmptyState";
import { StatusBadge } from "@/admin/components/ui/StatusBadge";
import { ConfirmDialog } from "@/admin/components/ui/ConfirmDialog";
import { CopyIconButton } from "@/admin/components/ui/CopyIconButton";
import { CouponFormModal } from "../components/CouponFormModal";
import { IconPencil, IconPlus, IconTicket, IconTrash } from "@/admin/icons";
import { LoadErrorBanner } from "@/admin/components/ui/LoadErrorBanner";

export default function CouponsPage() {
  const { coupons, createCoupon, updateCoupon, deleteCoupon, loadError, reload } = useCoupons();

  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCoupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCoupon | null>(null);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return coupons;
    return coupons.filter((c) => getCouponStatus(c) === statusFilter);
  }, [coupons, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (coupon: AdminCoupon) => {
    setEditing(coupon);
    setFormOpen(true);
  };

  const columns: DataTableColumn<AdminCoupon>[] = [
    {
      key: "code",
      header: "الكود",
      className: "min-w-[160px]",
      render: (c) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <span className="font-logotype text-base tracking-wide text-ink" dir="ltr">
            {c.code}
          </span>
          <CopyIconButton value={c.code} label="نسخ الكود" className="h-6 w-6" />
        </div>
      ),
    },
    {
      key: "value",
      header: "الخصم",
      render: (c) => (
        <span className="text-ink-soft">{c.type === "percentage" ? `${c.value}%` : `$${c.value.toFixed(2)}`}</span>
      ),
    },
    {
      key: "usage",
      header: "الاستخدام",
      render: (c) => (
        <span className="text-ink-soft">
          {c.usageCount.toLocaleString("en-US")} / {c.usageLimit === null ? "بلا حد" : c.usageLimit.toLocaleString("en-US")}
        </span>
      ),
    },
    {
      key: "validity",
      header: "الصلاحية",
      render: (c) => (
        <span className="text-ink-soft">
          {c.startsAt || c.expiresAt ? `${c.startsAt ?? "—"} → ${c.expiresAt ?? "—"}` : "بلا تاريخ انتهاء"}
        </span>
      ),
    },
    {
      key: "status",
      header: "الحالة",
      render: (c) => {
        const meta = COUPON_STATUS_META[getCouponStatus(c)];
        return <StatusBadge variant={meta.variant}>{meta.label}</StatusBadge>;
      },
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (c) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => openEdit(c)}
            aria-label="تعديل الكود"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-cream hover:text-ink"
          >
            <IconPencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(c)}
            aria-label="حذف الكود"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <IconTrash className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 py-2">
      <PageHeader
        title="أكواد الخصم"
        description={`${coupons.length.toLocaleString("en-US")} كودًا`}
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-ivory transition-colors hover:bg-gold-deep"
          >
            <IconPlus className="h-4 w-4" />
            كود جديد
          </button>
        }
      />

      {loadError && <LoadErrorBanner message={loadError} onRetry={reload} />}

      {coupons.length > 0 && (
        <FilterBar>
          <FilterSelect
            ariaLabel="الحالة"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "كل الحالات" },
              ...Object.entries(COUPON_STATUS_META).map(([value, meta]) => ({ value, label: meta.label })),
            ]}
          />
        </FilterBar>
      )}

      {coupons.length === 0 ? (
        <EmptyState
          icon={IconTicket}
          title="لا توجد أكواد خصم بعد"
          description="أنشئي أول كود خصم لتحفيز عميلاتك على الشراء."
          action={
            <button
              type="button"
              onClick={openCreate}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-ivory transition-colors hover:bg-gold-deep"
            >
              <IconPlus className="h-4 w-4" />
              كود جديد
            </button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(c) => c.id}
          emptyState={
            <EmptyState icon={IconTicket} title="لا توجد نتائج" description="جربي تغيير فلتر الحالة المستخدم." />
          }
        />
      )}

      <CouponFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initialCoupon={editing}
        existingCodes={coupons.map((c) => c.code)}
        onSave={(values) => {
          if (editing) updateCoupon(editing.id, values);
          else createCoupon(values);
          setFormOpen(false);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="حذف كود الخصم"
        description={`هل تريدين حذف الكود «${deleteTarget?.code ?? ""}»؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف نهائي"
        onConfirm={() => {
          if (deleteTarget) deleteCoupon(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
