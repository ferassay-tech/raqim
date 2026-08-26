import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminMobileDrawer } from "./AdminMobileDrawer";
import { AdminTopbar } from "./AdminTopbar";
import { AdminBreadcrumbs } from "./AdminBreadcrumbs";

const COLLAPSE_STORAGE_KEY = "admin:sidebarCollapsed";

function readStoredCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(readStoredCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // Route actually changed (e.g. tapped a different destination in the
  // mobile drawer) — close it. Mirrors the public site's mobile-menu
  // auto-close pattern (site-nav.tsx). The same-route case (pathname
  // unchanged) is handled separately below via onSameRouteSelect, since
  // this effect never fires for it.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore storage access errors */
      }
      return next;
    });
  };

  return (
    <div dir="rtl" className="flex h-dvh overflow-hidden bg-canvas text-ink">
      <div className="hidden shrink-0 lg:block">
        <AdminSidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
      </div>

      <AdminMobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onSameRouteSelect={() => {
          setMobileOpen(false);
          mainRef.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminTopbar onOpenMobileMenu={() => setMobileOpen(true)} />
        <AdminBreadcrumbs />
        <main ref={mainRef} className="flex-1 overflow-y-auto px-4 pb-10 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
