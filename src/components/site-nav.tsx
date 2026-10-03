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
import { scrollToTop } from "../lib/scrollToTop";

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

export type NavTone = "light" | "dark";

// Glass pill: one shape and blur on every page, in two tones — ivory glass
// with ink text on the light pages, dark-brown glass with cream text while
// the nav sits over the homepage journey's dark scenes.
const TONE = {
  light: {
    pill: "border-gold/30 bg-ivory/70 text-ink shadow-[0_10px_30px_-20px_rgba(44,36,32,0.4)]",
    link: "text-ink-soft hover:text-ink",
    linkActive: "text-ink",
    quiet: "text-ink-soft hover:text-gold",
    cta: "bg-ink text-ivory hover:bg-gold-deep",
    panel: "border-gold/30 bg-ivory/95 text-ink",
    panelLink: "hover:bg-cream",
  },
  dark: {
    pill: "border-gold/30 bg-ink/45 text-ivory",
    link: "text-ivory/80 hover:text-ivory",
    linkActive: "text-ivory",
    quiet: "text-ivory/80 hover:text-gold",
    cta: "bg-gold text-ink shadow-[0_8px_30px_rgba(212,175,95,0.35)] hover:bg-[#d9bd84]",
    panel: "border-gold/30 bg-ink/90 text-ivory",
    panelLink: "hover:bg-ivory/10",
  },
} as const;

const GLASS = "backdrop-blur-[14px] backdrop-saturate-[1.2]";

export function SiteNav({
  overlay = false,
  tone = "light",
}: {
  /** Fixed over the page (no row of its own) instead of sticky in flow. */
  overlay?: boolean;
  tone?: NavTone;
}) {
  const [open, setOpen] = useState(false);
  const c = TONE[tone];
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
    setOpen(false);
  }, [pathname]);

  return (
    <header className={`${overlay ? "fixed inset-x-0" : "sticky"} top-0 z-40 w-full px-3 pb-0.5 pt-2.5 lg:px-8`}>
      {/* 10px + 68px pill + 2px = the same 80px row the previous header took, so no page shifts */}
      <div
        className={`mx-auto flex min-h-[68px] max-w-[1240px] items-center justify-between gap-4 rounded-[22px] border px-4 transition-colors duration-300 lg:px-5 ${GLASS} ${c.pill}`}
      >
        <Link
          to={localizePath("/")}
          className="flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
        >
          <LogoMark useConfiguredSize className="transition-transform duration-300 hover:scale-105" />
          <span
            style={wordmarkStyle}
            className="text-[length:var(--wordmark-size-mobile)] lg:text-[length:var(--wordmark-size-desktop)]"
          >
            {t("home.hero.titleFallback")}
          </span>
        </Link>

        <nav aria-label={t("nav.mainLabel")} className="hidden items-center gap-6 lg:flex xl:gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={localizePath(link.to)}
              label={link.label}
              active={pathname === localizePath(link.to)}
              tone={tone}
            />
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <LanguageSwitcher tone={tone} />
          <Link
            to={localizePath("/search")}
            aria-label={getValue("nav.search")}
            className={`text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${c.quiet}`}
          >
            {getValue("nav.search")}
          </Link>
          {ctaBook && (
            <Link
              to={localizePath(`/books/${ctaBook.id}`)}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm transition-[transform,background-color] duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${c.cta}`}
            >
              {ctaBook.title}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher tone={tone} />
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center"
            aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <IconClose size={22} /> : <IconMenu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className={`mx-auto mt-2 max-w-[1240px] rounded-[22px] border px-4 pb-5 pt-3 lg:hidden ${GLASS} ${c.panel}`}
        >
          <nav aria-label={t("nav.mobileMenuLabel")} className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const to = localizePath(link.to);
              const isCurrent = pathname === to;
              return (
                <Link
                  key={link.to}
                  to={to}
                  onClick={(e) => {
                    // Same route: react-router's Link would otherwise no-op —
                    // close the menu and reset scroll ourselves, since a
                    // pathname change (which ScrollToTop/the effect above key
                    // off) never happens in this case.
                    if (isCurrent) {
                      e.preventDefault();
                      scrollToTop();
                      setOpen(false);
                    }
                  }}
                  className={`rounded-lg px-3 py-3 text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${c.panelLink}`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              to={localizePath("/search")}
              className={`rounded-lg px-3 py-3 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${c.panelLink}`}
            >
              {getValue("nav.search")}
            </Link>
            {ctaBook && (
              <Link
                to={localizePath(`/books/${ctaBook.id}`)}
                className={`mt-3 rounded-full px-5 py-3 text-center text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${c.cta}`}
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

function NavLink({ to, label, active, tone }: { to: string; label: string; active: boolean; tone: NavTone }) {
  return (
    <Link
      to={to}
      onClick={(e) => {
        // Same route: react-router's Link would otherwise no-op — reset
        // scroll ourselves, since no pathname change occurs for
        // ScrollToTop's own effect to react to.
        if (active) {
          e.preventDefault();
          scrollToTop();
        }
      }}
      className={`group relative whitespace-nowrap py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${TONE[tone].link}`}
    >
      <span className={active ? TONE[tone].linkActive : ""}>{label}</span>
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