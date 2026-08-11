import type { CommunicationTemplateRaw, DownloadEmailDesignSettings } from "../modules/communications/types/template";

/** The one template the real Download Email flow sends — no picker, no
 * resolver, just this one known id (see OrderDownloadsCard.tsx). */
export const DOWNLOAD_EMAIL_TEMPLATE_ID = "tpl-download-link";

/** Matches the current hardcoded premium email exactly — every chrome
 * element shown, current hex values — so a template that has never had its
 * design settings touched (a fresh seed, or an older persisted record
 * migrated in) renders identically to before design settings existed. Also
 * the fallback used by CommunicationTemplatesContext's migration for any
 * already-persisted tpl-download-link record that predates this field. */
export const DEFAULT_DOWNLOAD_EMAIL_DESIGN_SETTINGS: DownloadEmailDesignSettings = {
  showBrandHeader: true,
  showBookCard: true,
  showOrderInfo: true,
  showSecurityNotice: true,
  showBrandFooterBar: true,
  backgroundColor: "#fbf6ed",
  accentColor: "#b99451",
  inkColor: "#2c2420",
};

/** Known section-id → field → English default, used both by the seed below
 * and by CommunicationTemplatesContext's migration to backfill English text
 * onto an already-persisted tpl-download-link record that predates it
 * (same self-healing pattern as migrateDesignSettings) — only fills a
 * currently-empty `.en`, never overwrites real admin-entered English, and
 * only matches these exact, original section ids (a section added later,
 * or one of these deleted and re-added with a fresh id, is untouched). */
export const DOWNLOAD_EMAIL_ENGLISH_DEFAULTS: Record<string, Record<string, string>> = {
  "sec-header": { title: "Your book download link is ready!" },
  "sec-body": { richText: "You can now download your digital book using the button below." },
  "sec-button": { label: "Download the Book" },
  "sec-footer": { text: "Raqim — Digital Publishing House" },
};

// Section copy fields are bilingual ({ar, en}) — same convention as the
// SiteContent/Books/Categories/Articles migration. name/description stay
// plain (Admin-only labels). English defaults above (header title, body,
// button label, footer text) are seeded in directly; the header's
// subtitle has no specified English default and starts empty like before.
export const INITIAL_COMMUNICATION_TEMPLATES: CommunicationTemplateRaw[] = [
  {
    id: DOWNLOAD_EMAIL_TEMPLATE_ID,
    channelId: "email",
    categoryId: "transactional",
    type: "download_link",
    name: "رابط تحميل الملف",
    description: "تُرسل بعد اعتماد الدفع — تحتوي رابط التحميل الآمن للكتاب.",
    status: "published",
    draft: [
      {
        id: "sec-header",
        type: "header",
        order: 0,
        fields: {
          title: { ar: "رابط تحميل كتابك جاهز!", en: DOWNLOAD_EMAIL_ENGLISH_DEFAULTS["sec-header"].title },
          subtitle: { ar: "شكرًا لثقتك بنا", en: "" },
        },
      },
      {
        id: "sec-body",
        type: "body",
        order: 1,
        fields: {
          richText: {
            ar: "يمكنك الآن تحميل نسخة الكتاب الرقمي عبر الزر أدناه.",
            en: DOWNLOAD_EMAIL_ENGLISH_DEFAULTS["sec-body"].richText,
          },
        },
      },
      {
        id: "sec-button",
        type: "button",
        order: 2,
        fields: {
          label: { ar: "تحميل الكتاب", en: DOWNLOAD_EMAIL_ENGLISH_DEFAULTS["sec-button"].label },
          url: "https://r-aqim.com/download",
        },
      },
      {
        id: "sec-footer",
        type: "footer",
        order: 3,
        fields: { text: { ar: "رقيم — دار نشر رقمية", en: DOWNLOAD_EMAIL_ENGLISH_DEFAULTS["sec-footer"].text } },
      },
    ],
    designSettings: DEFAULT_DOWNLOAD_EMAIL_DESIGN_SETTINGS,
    publishedVersionId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];
