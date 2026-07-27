import { useId } from "react";
import { motion } from "motion/react";

export interface TabItem {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  const layoutId = useId();

  return (
    <div className="overflow-x-auto">
      <div role="tablist" className="flex items-center gap-1 border-b border-beige">
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.key)}
              className={`relative shrink-0 whitespace-nowrap px-4 py-3 text-sm transition-colors ${
                isActive ? "text-ink" : "text-ink-soft hover:text-ink"
              }`}
            >
              {tab.label}
              {isActive && (
                <motion.span
                  layoutId={`admin-tabs-indicator-${layoutId}`}
                  className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gold"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
