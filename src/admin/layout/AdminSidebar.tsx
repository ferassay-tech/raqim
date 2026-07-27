import { Link, useLocation } from "react-router-dom";
import { ADMIN_NAV } from "../nav";
import { IconPanelCollapse } from "../icons";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /** True when rendered inside the mobile drawer — skips the collapse affordance. */
  variant?: "desktop" | "drawer";
}

export function AdminSidebar({
  collapsed,
  onToggleCollapsed,
  variant = "desktop",
}: AdminSidebarProps) {
  const { pathname } = useLocation();
  const isDrawer = variant === "drawer";
  const showLabels = isDrawer || !collapsed;

  return (
    <aside
      className={`flex h-full flex-col bg-ink text-cream transition-[width] duration-300 ease-out ${
        isDrawer ? "w-full" : collapsed ? "w-20" : "w-64"
      }`}
    >
      <div
        className={`flex h-20 shrink-0 items-center border-b border-white/10 ${
          showLabels ? "justify-start gap-2.5 px-6" : "justify-center px-2"
        }`}
      >
        <Link to="/admin/dashboard" className="flex items-center gap-2.5">
          <span className="font-logotype text-2xl text-gold">ر</span>
          {showLabels && (
            <span className="flex flex-col leading-none">
              <span className="font-logotype text-lg tracking-wide text-ivory">رقيم</span>
              <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-cream/50">
                Admin
              </span>
            </span>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6">
        {ADMIN_NAV.map((group) => (
          <div key={group.label} className="mb-6 last:mb-0">
            {showLabels && (
              <p className="mb-2 px-3 text-[11px] uppercase tracking-[0.2em] text-cream/40">
                {group.label}
              </p>
            )}
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => {
                const active =
                  pathname === item.to || pathname.startsWith(`${item.to}/`);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      title={showLabels ? undefined : item.label}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200 ${
                        showLabels ? "" : "justify-center"
                      } ${
                        active
                          ? "bg-white/10 text-ivory"
                          : "text-cream/70 hover:bg-white/5 hover:text-ivory"
                      }`}
                    >
                      <item.icon
                        className={`h-5 w-5 shrink-0 ${
                          active ? "text-gold" : "text-cream/50 group-hover:text-gold"
                        }`}
                      />
                      {showLabels && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!isDrawer && (
        <div className="shrink-0 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "توسيع القائمة الجانبية" : "طي القائمة الجانبية"}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream/70 transition-colors duration-200 hover:bg-white/5 hover:text-ivory ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <IconPanelCollapse
              className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                collapsed ? "rotate-180" : ""
              }`}
            />
            {!collapsed && <span>طي القائمة</span>}
          </button>
        </div>
      )}
    </aside>
  );
}
