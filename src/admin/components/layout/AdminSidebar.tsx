import { Link, useLocation } from "react-router-dom";
import { ADMIN_NAV } from "@/admin/nav";
import { IconPanelCollapse } from "@/admin/icons";
import { useAuth } from "@/admin/context/AuthContext";
import { useAdminUsers } from "@/admin/context/AdminUsersContext";
import { hasEffectivePermission } from "@/admin/lib/effectivePermissions";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /** True when rendered inside the mobile drawer — skips the collapse affordance. */
  variant?: "desktop" | "drawer";
  /** Called when the user clicks the nav item for the route they're already
   * exactly on — react-router's Link would otherwise no-op (no pathname
   * change, so nothing closes the mobile drawer or resets scroll on its
   * own). Only passed by AdminMobileDrawer; desktop usage is unaffected. */
  onSameRouteSelect?: () => void;
}

export function AdminSidebar({
  collapsed,
  onToggleCollapsed,
  variant = "desktop",
  onSameRouteSelect,
}: AdminSidebarProps) {
  const { pathname } = useLocation();
  const { currentUser } = useAuth();
  const { rolePermissions, myOverrides } = useAdminUsers();
  const isDrawer = variant === "drawer";
  const showLabels = isDrawer || !collapsed;

  // Supplemental visibility only — the real gate is each route's own
  // RequirePermission/RequireRole wrapper. Items with allowedRoles are
  // hidden from anyone whose role isn't listed; items with
  // requiredPermission are hidden unless the effective permission
  // computation (role_permissions + user_permission_overrides, same
  // helper the route guard uses) allows it. Both undefined = always
  // visible, unchanged for every item that has neither.
  const visibleNav = ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (item.allowedRoles && (!currentUser || !item.allowedRoles.includes(currentUser.role))) {
        return false;
      }
      if (
        item.requiredPermission &&
        !hasEffectivePermission(currentUser?.role, item.requiredPermission, rolePermissions, myOverrides)
      ) {
        return false;
      }
      return true;
    }),
  })).filter((group) => group.items.length > 0);

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
        {visibleNav.map((group) => (
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
                // Deliberately stricter than `active`: a detail route like
                // /admin/orders/123 is "active" for the /admin/orders item
                // (so it stays highlighted) but clicking it must still
                // navigate to the list — only an exact match is a true
                // same-route no-op.
                const isExactCurrent = pathname === item.to;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={(e) => {
                        if (isExactCurrent && onSameRouteSelect) {
                          e.preventDefault();
                          onSameRouteSelect();
                        }
                      }}
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
