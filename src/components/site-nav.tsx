import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { to: "/", label: "الرئيسية" },
  { to: "/books", label: "الكتب" },
  { to: "/about", label: "عن الدار" },
  { to: "/future-releases", label: "إصدارات قادمة" },
  { to: "/blog", label: "المدونة" },
  { to: "/contact", label: "تواصل معنا" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-colors duration-300 ${
        scrolled ? "bg-ivory/90 shadow-[0_1px_0_0_rgba(185,148,81,0.25)] backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link to="/" className="flex items-center gap-1">
          <img
            src="/logos/lumora-logo-signature.png"
           alt="رقيم"
           className="h-16 w-16 object-contain transition-transform duration-300 hover:scale-105"
           />
          <span className="font-logotype text-2xl tracking-wide text-ink">
            رقيم
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} label={link.label} active={pathname === link.to} />
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            to="/search"
            aria-label="بحث"
            className="text-sm text-ink-soft transition-colors hover:text-gold"
          >
            بحث
          </Link>
          <Link
            to="/books/kuni-hajar"
            className="rounded-full bg-ink px-5 py-2.5 text-sm text-ivory transition-transform duration-300 hover:-translate-y-0.5 hover:bg-gold-deep"
          >
            كوني هاجر
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center text-ink lg:hidden"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-beige bg-ivory px-6 pb-8 pt-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-lg px-3 py-3 text-base text-ink transition-colors hover:bg-cream"
              >
                {link.label}
              </Link>
            ))}
            <Link to="/search" className="rounded-lg px-3 py-3 text-base text-ink hover:bg-cream">
              بحث
            </Link>
            <Link
              to="/books/kuni-hajar"
              className="mt-3 rounded-full bg-ink px-5 py-3 text-center text-sm text-ivory"
            >
              اطلبي كوني هاجر
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className="group relative py-2 text-sm text-ink-soft transition-colors hover:text-ink"
    >
      <span className={active ? "text-ink" : ""}>{label}</span>
      <span
        className={`absolute inset-x-0 -bottom-0.5 h-px origin-center bg-gold transition-transform duration-300 ${
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
    </Link>
  );
}
export function LogoMark({
  className = "",
}: {
  className?: string;
}) {
  return (
    <img
      src="/logos/lumora-logo-signature.png"
      alt="رقيم"
      className={className}
    />
  );
}