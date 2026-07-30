import type { AdminSettings } from "../types/settings";
import { CONTACT_EMAILS } from "../../config/contactEmails";
import { BRAND_ASSETS } from "../../config/brandAssets";

// Seeded from the real, live values already hardcoded across index.html,
// src/index.css's @theme, and the (previously non-persisted) Settings
// section components — so turning Settings into a real, persisted store
// changes nothing visually until an admin actually edits a field.
export const INITIAL_SETTINGS: AdminSettings = {
  general: {
    siteName: "رقيم",
    description:
      "رقيم دار نشر رقمية عربية فاخرة، تُحوّل المعرفة إلى أثر خالد عبر كتب أنيقة للمرأة والأم في التطوير الذاتي والروحانية والإلهام الإسلامي.",
    language: "ar",
    timezone: "cairo",
  },
  brand: {
    logo: BRAND_ASSETS.logo,
    logoSizing: {
      width: null,
      height: null,
      maxWidth: null,
      maxHeight: null,
      // Matches today's real rendered size exactly (h-16 w-16 in site-nav.tsx)
      // so switching to configured sizing changes nothing until edited.
      desktopSize: 64,
      mobileSize: 64,
      objectFit: "contain",
      padding: 0,
    },
    heroImage: BRAND_ASSETS.heroImage,
    wordmark: {
      arabicFontFamily: "Cormorant Garamond",
      englishFontFamily: "Cormorant Garamond",
      fontWeight: 400,
      letterSpacing: 0.025,
      // Matches today's real rendered size exactly (text-2xl = 24px) at
      // every breakpoint, since the header never varied it responsively.
      fontSizeDesktop: 24,
      fontSizeMobile: 24,
    },
    favicon: "/favicon.ico",
    colors: {
      ivory: "#fbf6ed",
      cream: "#f6efe2",
      beige: "#f1e9da",
      gold: "#b99451",
      goldDeep: "#9c7a3c",
      lavender: "#c3b4d6",
      mauve: "#c9a9ac",
      ink: "#2c2420",
      inkSoft: "#5c5147",
      inkFaint: "#8a7d70",
    },
    fonts: {
      display: "Amiri",
      body: "IBM Plex Sans Arabic",
      logotype: "Cormorant Garamond",
    },
    radius: { base: 0.625, sm: 0.5, md: 0.625, lg: 0.75 },
    spacing: 0.25,
    shadowSoft: "0 10px 30px -18px rgba(44,36,32,0.2)",
    shadowMd: "0 20px 45px -20px rgba(44,36,32,0.25)",
  },
  seo: {
    title: "رقيم — دار نشر رقمية فاخرة للمرأة",
    description:
      "رقيم دار نشر رقمية عربية فاخرة، تُحوّل المعرفة إلى أثر خالد عبر كتب أنيقة للمرأة والأم. اكتشفي كوني هاجر، إصدارنا الأول.",
    socialImage: BRAND_ASSETS.ogImage,
  },
  // Unset by default so the homepage keeps rendering the featured book's own
  // gallery image exactly as before — only once an admin picks a dedicated
  // image here does the homepage switch to it.
  homepage: {
    heroImage: null,
    heroImageMobile: null,
  },
  contact: {
    email: CONTACT_EMAILS.contact,
    phone: "",
    address: "",
    hours: "من الأحد إلى الخميس، ٩ص - ٥م",
    instagram: "",
    pinterest: "",
    tiktok: "",
  },
  store: {
    supportedCurrencies: ["USD", "EGP", "ILS"],
    defaultCurrency: "USD",
    tax: 0,
    orderPrefix: "A-",
  },
  storage: {
    activeProvider: "local",
    // Sensible secure-by-default policy for a real digital-goods store — a
    // customer who paid gets a full week and several attempts to download
    // (accounting for a failed attempt, a second device, etc.), while the
    // link doesn't stay valid forever. Both are admin-editable.
    downloadLinkExpiryDays: 7,
    downloadLinkMaxDownloads: 5,
  },
};
