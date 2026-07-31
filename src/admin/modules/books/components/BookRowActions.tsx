import { useRef, useState } from "react";
import type { FC, MouseEvent } from "react";
import { useClickOutside } from "@/admin/lib/useClickOutside";
import { IconArchive, IconCopy, IconDots, IconEye, IconPencil, IconTrash } from "@/admin/icons";

interface BookRowActionsProps {
  onPreview: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
  archived: boolean;
}

export function BookRowActions({
  onPreview,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  archived,
}: BookRowActionsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, open, () => setOpen(false));

  const run = (fn: () => void) => (e: MouseEvent) => {
    e.stopPropagation();
    fn();
    setOpen(false);
  };

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="إجراءات الكتاب"
        className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-cream hover:text-ink"
      >
        <IconDots className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute end-0 z-30 mt-1 w-44 overflow-hidden rounded-2xl border border-beige bg-ivory py-1 shadow-[0_20px_45px_-20px_rgba(44,36,32,0.4)]">
          <MenuItem icon={IconEye} label="معاينة" onClick={run(onPreview)} />
          <MenuItem icon={IconPencil} label="تعديل" onClick={run(onEdit)} />
          <MenuItem icon={IconCopy} label="نسخ" onClick={run(onDuplicate)} />
          <MenuItem
            icon={IconArchive}
            label={archived ? "إلغاء الأرشفة" : "أرشفة"}
            onClick={run(onArchive)}
          />
          <div className="my-1 border-t border-beige" />
          <MenuItem icon={IconTrash} label="حذف" tone="danger" onClick={run(onDelete)} />
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  tone = "default",
}: {
  icon: FC<{ className?: string }>;
  label: string;
  onClick: (e: MouseEvent) => void;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-start text-sm transition-colors ${
        tone === "danger" ? "text-danger hover:bg-danger/10" : "text-ink hover:bg-cream"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
