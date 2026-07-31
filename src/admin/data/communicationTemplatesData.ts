import type { CommunicationTemplate } from "../modules/communications/types/template";

/** The one template the real Download Email flow sends — no picker, no
 * resolver, just this one known id (see OrderDownloadsCard.tsx). */
export const DOWNLOAD_EMAIL_TEMPLATE_ID = "tpl-download-link";

export const INITIAL_COMMUNICATION_TEMPLATES: CommunicationTemplate[] = [
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
        fields: { title: "رابط تحميل كتابك جاهز!", subtitle: "شكرًا لثقتك بنا" },
      },
      {
        id: "sec-body",
        type: "body",
        order: 1,
        fields: { richText: "يمكنك الآن تحميل نسخة الكتاب الرقمي عبر الزر أدناه." },
      },
      {
        id: "sec-button",
        type: "button",
        order: 2,
        fields: { label: "تحميل الكتاب", url: "https://r-aqim.com/download" },
      },
      {
        id: "sec-footer",
        type: "footer",
        order: 3,
        fields: { text: "رقيم — دار نشر رقمية" },
      },
    ],
    publishedVersionId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];
