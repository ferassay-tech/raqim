import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSiteContent } from "../admin/context/SiteContentContext";
import { useBooks } from "../admin/context/BooksContext";
import { isInLibraryGrid } from "../admin/lib/bookPlacement";
import { useSettings } from "../admin/context/SettingsContext";

function IconMenu({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClose({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { getValue } = useSiteContent();
  const { books } = useBooks();

  const navLinks = [
    { to: "/", label: getValue("nav.home") },
    { to: "/books", label: getValue("nav.books") },
    { to: "/about", label: getValue("nav.about") },
    { to: "/future-releases", label: getValue("nav.futureReleases") },
    { to: "/blog", label: getValue("nav.blog") },
    { to: "/contact", label: getValue("nav.contact") },
  ];

  const ctaBook = useMemo(
    () =>
      [...books]
        .filter((b) => b.deletedAt === null && isInLibraryGrid(b.placement) && b.prices.USD)
        .sort((a, b) => a.displayOrder - b.displayOrder)[0] ?? null,
    [books]
  );

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
          <LogoMark className="h-16 w-16 object-contain transition-transform duration-300 hover:scale-105" />
          <span className="font-logotype text-2xl tracking-wide text-ink">
            رقيم
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} label={link.label} active={pathname === link.to} />
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            to="/search"
            aria-label={getValue("nav.search")}
            className="text-sm text-ink-soft transition-colors hover:text-gold"
          >
            {getValue("nav.search")}
          </Link>
          {ctaBook && (
            <Link
              to={`/books/${ctaBook.id}`}
              className="rounded-full bg-ink px-5 py-2.5 text-sm text-ivory transition-transform duration-300 hover:-translate-y-0.5 hover:bg-gold-deep"
            >
              {ctaBook.title}
            </Link>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center text-ink lg:hidden"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
        >
          {open ? <IconClose size={22} /> : <IconMenu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-beige bg-ivory px-6 pb-8 pt-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-lg px-3 py-3 text-base text-ink transition-colors hover:bg-cream"
              >
                {link.label}
              </Link>
            ))}
            <Link to="/search" className="rounded-lg px-3 py-3 text-base text-ink hover:bg-cream">
              {getValue("nav.search")}
            </Link>
            {ctaBook && (
              <Link
                to={`/books/${ctaBook.id}`}
                className="mt-3 rounded-full bg-ink px-5 py-3 text-center text-sm text-ivory"
              >
                اطلبي {ctaBook.title}
              </Link>
            )}
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
  const { settings } = useSettings();
  return <img src={settings.brand.logo ?? undefined} alt="رقيم" className={className} />;
}