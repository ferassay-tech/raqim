import type { CommunicationTemplateRaw } from "../modules/communications/types/template";

/** The one template the real Download Email flow sends — no picker, no
 * resolver, just this one known id (see OrderDownloadsCard.tsx). */
export const DOWNLOAD_EMAIL_TEMPLATE_ID = "tpl-download-link";

// Section copy fields are bilingual ({ar, en}) — en starts empty (admin
// fills it in later), same convention as the SiteContent/Books/Categories/
// Articles migration. name/description stay plain (Admin-only labels).
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
          title: { ar: "رابط تحميل كتابك جاهز!", en: "" },
          subtitle: { ar: "شكرًا لثقتك بنا", en: "" },
        },
      },
      {
        id: "sec-body",
        type: "body",
        order: 1,
        fields: { richText: { ar: "يمكنك الآن تحميل نسخة الكتاب الرقمي عبر الزر أدناه.", en: "" } },
      },
      {
        id: "sec-button",
        type: "button",
        order: 2,
        fields: { label: { ar: "تحميل الكتاب", en: "" }, url: "https://r-aqim.com/download" },
      },
      {
        id: "sec-footer",
        type: "footer",
        order: 3,
        fields: { text: { ar: "رقيم — دار نشر رقمية", en: "" } },
      },
    ],
    publishedVersionId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];
