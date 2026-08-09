import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClickOutside } from "@/admin/lib/useClickOutside";
import { useAuth } from "@/admin/context/AuthContext";
import { CustomerAvatar } from "@/admin/components/ui/CustomerAvatar";
import { Button } from "@/admin/components/ui/Button";
import { SearchInput } from "@/admin/components/ui/SearchInput";
import { IconBell, IconChevronDown, IconMenu, IconPlus } from "@/admin/icons";

// Starts empty — there is no backend event source to populate this from
// yet. Wire this up to real order/message/stock events once one exists.
const NOTIFICATIONS: { id: string; title: string; time: string; unread: boolean }[] = [];

const QUICK_ACTIONS = [
  { to: "/admin/books/new", label: "كتاب جديد" },
  { to: "/admin/articles/new", label: "مقالة جديدة" },
  { to: "/admin/coupons", label: "كود خصم جديد" },
];

interface AdminTopbarProps {
  onOpenMobileMenu: () => void;
}

export function AdminTopbar({ onOpenMobileMenu }: AdminTopbarProps) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<"notifications" | "quick" | "profile" | null>(
    null
  );
  // Decorative only, same as before this migration — no search backend
  // exists yet. Held in state purely so this can use the shared
  // SearchInput component instead of duplicating its markup.
  const [searchQuery, setSearchQuery] = useState("");

  const notificationsRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useClickOutside(notificationsRef, openMenu === "notifications", () => setOpenMenu(null));
  useClickOutside(quickRef, openMenu === "quick", () => setOpenMenu(null));
  useClickOutside(profileRef, openMenu === "profile", () => setOpenMenu(null));

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center gap-4 border-b border-beige bg-ivory/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onOpenMobileMenu}
        aria-label="فتح القائمة"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-ink transition-colors hover:bg-cream lg:hidden"
      >
        <IconMenu className="h-5 w-5" />
      </button>

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="ابحثي عن كتاب، طلب، عميل..."
        className="hidden max-w-sm flex-1 sm:block"
      />

      <div className="ms-auto flex items-center gap-2">
        <div className="relative" ref={quickRef}>
          <Button icon={IconPlus} onClick={() => setOpenMenu((v) => (v === "quick" ? null : "quick"))}>
            <span className="hidden sm:inline">جديد</span>
          </Button>
          {openMenu === "quick" && (
            <div className="absolute end-0 z-40 mt-2 w-52 overflow-hidden rounded-2xl border border-beige bg-ivory shadow-(--shadow-md)">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  onClick={() => setOpenMenu(null)}
                  className="block px-4 py-3 text-sm text-ink transition-colors hover:bg-cream"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() =>
              setOpenMenu((v) => (v === "notifications" ? null : "notifications"))
            }
            aria-label="الإشعارات"
            className="relative grid h-10 w-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-cream hover:text-ink"
          >
            <IconBell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
            )}
          </button>
          {openMenu === "notifications" && (
            <div className="absolute end-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-beige bg-ivory shadow-(--shadow-md)">
              <p className="border-b border-beige px-4 py-3 text-sm font-medium text-ink">
                الإشعارات
              </p>
              {NOTIFICATIONS.length === 0 && (
                <p className="px-4 py-6 text-center text-xs text-ink-faint">لا توجد إشعارات جديدة</p>
              )}
              <ul>
                {NOTIFICATIONS.map((n) => (
                  <li
                    key={n.id}
                    className="flex items-start gap-3 border-b border-beige/60 px-4 py-3 last:border-0 hover:bg-cream/60"
                  >
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        n.unread ? "bg-gold" : "bg-transparent"
                      }`}
                    />
                    <span>
                      <span className="block text-sm text-ink">{n.title}</span>
                      <span className="mt-0.5 block text-xs text-ink-faint">{n.time}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setOpenMenu((v) => (v === "profile" ? null : "profile"))}
            className="flex items-center gap-2 rounded-full py-1 pe-1 ps-2 transition-colors hover:bg-cream"
          >
            <span className="hidden text-start sm:block">
              <span className="block text-sm text-ink">{currentUser?.name ?? "المسؤول"}</span>
              <span className="block text-xs text-ink-faint" dir="ltr">
                {currentUser?.email ?? ""}
              </span>
            </span>
            <CustomerAvatar name={currentUser?.name ?? "المسؤول"} size="sm" />
            <IconChevronDown className="hidden h-3.5 w-3.5 text-ink-faint sm:block" />
          </button>
          {openMenu === "profile" && (
            <div className="absolute end-0 z-40 mt-2 w-52 overflow-hidden rounded-2xl border border-beige bg-ivory shadow-(--shadow-md)">
              <Link
                to="/admin/profile"
                onClick={() => setOpenMenu(null)}
                className="block px-4 py-3 text-sm text-ink transition-colors hover:bg-cream"
              >
                الملف الشخصي
              </Link>
              <Link
                to="/admin/settings"
                onClick={() => setOpenMenu(null)}
                className="block px-4 py-3 text-sm text-ink transition-colors hover:bg-cream"
              >
                الإعدادات
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpenMenu(null);
                  logout();
                  navigate("/admin/login", { replace: true });
                }}
                className="block w-full px-4 py-3 text-start text-sm text-danger transition-colors hover:bg-danger/10"
              >
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
