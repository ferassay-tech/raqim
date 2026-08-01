import { useState } from "react";
import { Link } from "react-router-dom";
import { LogoMark } from "./site-nav";
import { GoldDivider } from "./ornaments";
import { SOCIAL_LINKS } from "../config/socialLinks";
import { useAssetDimensions } from "../lib/mediaDimensions";
import { useLanguage } from "../context/LanguageContext";

export function SiteFooter() {
  const getDimensions = useAssetDimensions();
  const patternDims = getDimensions("/assets/arabesque-pattern.webp");
  const { t } = useLanguage();

  const EXPLORE_LINKS = [
    { to: "/books", label: t("books.breadcrumb.title") },
    { to: "/about", label: t("footer.exploreLinks.aboutRaqim") },
    { to: "/authors/maha-nasr", label: t("footer.exploreLinks.authors") },
    { to: "/future-releases", label: t("footer.exploreLinks.upcomingReleases") },
  ];

  const SUPPORT_LINKS = [
    { to: "/faq", label: t("book.faq.eyebrow") },
    { to: "/contact", label: t("footer.supportLinks.contactUs") },
    { to: "/privacy", label: t("footer.supportLinks.privacyPolicy") },
    { to: "/terms", label: t("footer.supportLinks.termsAndConditions") },
  ];

  return (
    <footer className="relative overflow-hidden bg-ink text-cream">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <img
          src="/assets/arabesque-pattern.webp"
          alt=""
          width={patternDims?.width}
          height={patternDims?.height}
          className="absolute -left-24 -top-24 h-[560px] w-[560px] object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-20 lg:px-10">
        <NewsletterBand />

        <div className="mt-16 grid grid-cols-1 gap-12 border-t border-white/10 pt-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <LogoMark className="h-8 w-8 text-gold" />
              <span className="font-logotype text-xl tracking-wide text-ivory">{t("home.hero.titleFallback")}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-loose text-cream/70">
              {t("footer.tagline")}
            </p>
          </div>

          <FooterColumn title={t("footer.exploreTitle")} links={EXPLORE_LINKS} />
          <FooterColumn title={t("footer.supportTitle")} links={SUPPORT_LINKS} />

          <div>
            <h3 className="text-sm text-gold">{t("footer.followTitle")}</h3>
            <div className="mt-4 flex gap-3">
              {Object.entries(SOCIAL_LINKS).map(([platform, { label, url }]) =>
                url ? (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/15 px-4 py-2 text-xs text-cream/80 transition-colors hover:border-gold hover:text-gold"
                  >
                    {t(label)}
                  </a>
                ) : (
                  <span
                    key={platform}
                    aria-disabled="true"
                    title={t("footer.social.comingSoonTooltip")}
                    className="cursor-not-allowed rounded-full border border-white/15 px-4 py-2 text-xs text-cream/40"
                  >
                    {t(label)}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        <div className="mt-14 text-gold/60">
          <GoldDivider className="h-4 w-full" />
        </div>

        <div className="mt-6 flex flex-col-reverse items-center justify-between gap-4 text-xs text-cream/50 sm:flex-row">
          <p>{t("footer.copyrightText")}</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-gold">
              {t("footer.legal.privacyShort")}
            </Link>
            <Link to="/terms" className="hover:text-gold">
              {t("footer.legal.termsShort")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-sm text-gold">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-sm text-cream/70 transition-colors hover:text-cream">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NewsletterBand() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 items-center gap-8 rounded-3xl border border-white/10 bg-white/[0.03] p-8 lg:grid-cols-2 lg:p-12">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-gold">{t("footer.newsletterEyebrow")}</p>
        <h3 className="mt-3 font-display text-3xl leading-tight text-ivory">
          {t("footer.newsletterTitle")}
        </h3>
        <p className="mt-3 max-w-sm text-sm leading-loose text-cream/70">
          {t("footer.newsletterDescription")}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <label htmlFor="newsletter-email" className="sr-only">
          {t("footer.newsletter.emailLabel")}
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("footer.newsletter.emailLabel")}
          className="w-full rounded-full border border-white/15 bg-transparent px-5 py-3.5 text-sm text-ivory placeholder:text-cream/40 focus:border-gold focus:outline-none"
        />
        <TicketSubmitButton submitted={submitted} />
      </form>
    </div>
  );
}

/** Newsletter submit CTA — ticket-perforation edge that "tears" on hover to reveal a checkmark. */
function TicketSubmitButton({ submitted }: { submitted: boolean }) {
  const { t } = useLanguage();
  return (
    <button
      type="submit"
      className="group relative shrink-0 overflow-hidden rounded-full bg-gold px-7 py-3.5 text-sm font-medium text-ink transition-colors duration-300 hover:bg-gold-deep"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 right-0 w-px bg-[repeating-linear-gradient(to_bottom,transparent,transparent_3px,rgba(44,36,32,0.35)_3px,rgba(44,36,32,0.35)_5px)]"
      />
      <span className="relative inline-flex items-center gap-2">
        <span className="transition-transform duration-300 group-hover:-translate-y-6 group-hover:opacity-0">
          {submitted ? t("footer.newsletter.subscribed") : t("footer.newsletter.subscribeButton")}
        </span>
        <span className="absolute inset-0 flex translate-y-6 items-center justify-center opacity-0 transition-transform duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          ✓
        </span>
      </span>
    </button>
  );
}

