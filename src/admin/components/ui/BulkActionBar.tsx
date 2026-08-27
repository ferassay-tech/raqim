import type { FC } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconClose } from "@/admin/icons";
import { EASE_ARRIVAL } from "@/lib/motionEasing";

export interface BulkAction {
  key: string;
  label: string;
  icon?: FC<{ className?: string }>;
  onClick: () => void;
  tone?: "default" | "danger";
}

interface BulkActionBarProps {
  count: number;
  onClear: () => void;
  actions: BulkAction[];
}

export function BulkActionBar({ count, onClear, actions }: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2, ease: EASE_ARRIVAL }}
          className="flex flex-wrap items-center gap-3 rounded-md border border-beige bg-ink px-5 py-3.5 text-ivory"
        >
          <button
            type="button"
            onClick={onClear}
            aria-label="إلغاء التحديد"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
          >
            <IconClose className="h-3.5 w-3.5" />
          </button>
          <span className="text-sm">{count.toLocaleString("en-US")} عنصر محدد</span>
          <div className="ms-auto flex flex-wrap items-center gap-2">
            {actions.map((action) => (
              <button
                key={action.key}
                type="button"
                onClick={action.onClick}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                  action.tone === "danger"
                    ? "bg-danger/20 text-ivory hover:bg-danger/30"
                    : "bg-white/10 text-ivory hover:bg-white/20"
                }`}
              >
                {action.icon && <action.icon className="h-3.5 w-3.5" />}
                {action.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
