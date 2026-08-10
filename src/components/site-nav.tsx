import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSiteContent } from "../admin/context/SiteContentContext";
import { useBooks } from "../admin/context/BooksContext";
import { isInLibraryGrid } from "../admin/lib/bookPlacement";
import { useSettings } from "../admin/context/SettingsContext";
import { FONT_STACKS } from "../admin/context/ThemeContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";

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
  const { settings } = useSettings();
  const { wordmark, fonts } = settings.brand;
  const { t, localizePath } = useLanguage();

  const wordmarkStyle = {
    // Font family is driven by the Logotype role (settings.brand.fonts.logotype
    // → ThemeSync/FONT_STACKS), the same source every other Logotype consumer
    // uses — wordmark.arabicFontFamily/englishFontFamily remain the source for
    // weight/letter-spacing/size below, unchanged.
    fontFamily: FONT_STACKS[fonts.logotype],
    fontWeight: wordmark.fontWeight,
    letterSpacing: `${wordmark.letterSpacing}em`,
    "--wordmark-size-mobile": `${wordmark.fontSizeMobile}px`,
    "--wordmark-size-desktop": `${wordmark.fontSizeDesktop}px`,
  } as CSSProperties;

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
        <Link to={localizePath("/")} className="flex items-center gap-1">
          <LogoMark useConfiguredSize className="transition-transform duration-300 hover:scale-105" />
          <span
            style={wordmarkStyle}
            className="text-[length:var(--wordmark-size-mobile)] text-ink lg:text-[length:var(--wordmark-size-desktop)]"
          >
            {t("home.hero.titleFallback")}
          </span>
        </Link>

        <nav aria-label={t("nav.mainLabel")} className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={localizePath(link.to)}
              label={link.label}
              active={pathname === localizePath(link.to)}
            />
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <LanguageSwitcher />
          <Link
            to={localizePath("/search")}
            aria-label={getValue("nav.search")}
            className="text-sm text-ink-soft transition-colors hover:text-gold"
          >
            {getValue("nav.search")}
          </Link>
          {ctaBook && (
            <Link
              to={localizePath(`/books/${ctaBook.id}`)}
              className="rounded-full bg-ink px-5 py-2.5 text-sm text-ivory transition-transform duration-300 hover:-translate-y-0.5 hover:bg-gold-deep"
            >
              {ctaBook.title}
            </Link>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center text-ink lg:hidden"
          aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <IconClose size={22} /> : <IconMenu size={22} />}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-beige bg-ivory px-6 pb-8 pt-4 lg:hidden">
          <nav aria-label={t("nav.mobileMenuLabel")} className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={localizePath(link.to)}
                className="rounded-lg px-3 py-3 text-base text-ink transition-colors hover:bg-cream"
              >
                {link.label}
              </Link>
            ))}
            <Link to={localizePath("/search")} className="rounded-lg px-3 py-3 text-base text-ink hover:bg-cream">
              {getValue("nav.search")}
            </Link>
            <LanguageSwitcher className="px-3 py-3" />
            {ctaBook && (
              <Link
                to={localizePath(`/books/${ctaBook.id}`)}
                className="mt-3 rounded-full bg-ink px-5 py-3 text-center text-sm text-ivory"
              >
                {t("nav.orderPrefix")}{ctaBook.title}
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
  useConfiguredSize = false,
}: {
  className?: string;
  /** Applies the Dashboard's Logo Sizing controls (width/height/max/object
   * fit/padding/responsive size) via inline style. Off by default so
   * existing call sites (e.g. the footer's small fixed-size mark) keep
   * their own Tailwind size classes untouched. */
  useConfiguredSize?: boolean;
}) {
  const { settings } = useSettings();
  const { logo, logoSizing } = settings.brand;
  const { t } = useLanguage();

  if (!useConfiguredSize) {
    return <img src={logo ?? undefined} alt={t("home.hero.titleFallback")} decoding="async" className={className} />;
  }

  const hasExplicitWidth = Boolean(logoSizing.width);
  const hasExplicitHeight = Boolean(logoSizing.height);

  // A floor keeps a momentarily-empty or zeroed number field (e.g. while the
  // admin retypes it) from collapsing the responsive height to 0 and making
  // the logo vanish — these fixed sizes only ever act as a fallback when
  // neither explicit width nor height is set below.
  const safeDesktopSize = logoSizing.desktopSize > 0 ? logoSizing.desktopSize : 64;
  const safeMobileSize = logoSizing.mobileSize > 0 ? logoSizing.mobileSize : 64;

  const style = {
    objectFit: logoSizing.objectFit,
    padding: logoSizing.padding ? `${logoSizing.padding}px` : undefined,
    maxWidth: logoSizing.maxWidth ? `${logoSizing.maxWidth}px` : undefined,
    maxHeight: logoSizing.maxHeight ? `${logoSizing.maxHeight}px` : undefined,
    // Either explicit dimension takes over completely. Width's "auto"
    // fallback is a real inline value (nothing else ever sizes width, so
    // nothing conflicts) — but height must stay `undefined` (omitted
    // entirely) rather than an explicit "auto", because a real inline
    // height would silently override the responsiveHeight Tailwind class
    // below, which is what actually renders the Desktop/Mobile Size.
    width: hasExplicitWidth ? `${logoSizing.width}px` : "auto",
    height: hasExplicitHeight ? `${logoSizing.height}px` : undefined,
    "--logo-size-mobile": `${safeMobileSize}px`,
    "--logo-size-desktop": `${safeDesktopSize}px`,
  } as CSSProperties;

  // The responsive mobile/desktop size only drives the rendered height when
  // the admin hasn't pinned an explicit width or height of their own.
  const useResponsiveHeight = !hasExplicitWidth && !hasExplicitHeight;
  const responsiveHeight = useResponsiveHeight
    ? "h-[length:var(--logo-size-mobile)] lg:h-[length:var(--logo-size-desktop)]"
    : "";

  return (
    <img
      src={logo ?? undefined}
      alt={t("home.hero.titleFallback")}
      decoding="async"
      style={style}
      className={`${responsiveHeight} ${className}`}
    />
  );
}