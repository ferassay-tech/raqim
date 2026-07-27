import type { AdminSettings } from "../types/settings";

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
    logo: "/logos/lumora-logo-signature.png",
    favicon: "/favicon.webp",
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
    socialImage: "/og-image.webp",
  },
  contact: {
    email: "lumora.m.house@gmail.com",
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
};
