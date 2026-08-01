import type { GlobalFaqItem, SiteContentField } from "../types/siteContent";

// One entry per string that was previously hardcoded directly in a public
// page/component — value.ar = today's real, live copy, value.en is a
// natural, marketing-quality English translation (not literal) so turning
// this into an Admin-managed registry changes nothing visually until an
// admin edits it further.
export const INITIAL_SITE_CONTENT: SiteContentField[] = [
  { id: "nav.home", section: "التنقّل", label: "الرئيسية", type: "text", value: { ar: "الرئيسية", en: "Home" } },
  { id: "nav.books", section: "التنقّل", label: "الكتب", type: "text", value: { ar: "الكتب", en: "Books" } },
  { id: "nav.about", section: "التنقّل", label: "عن الدار", type: "text", value: { ar: "عن الدار", en: "About" } },
  {
    id: "nav.futureReleases",
    section: "التنقّل",
    label: "إصدارات قادمة",
    type: "text",
    value: { ar: "إصدارات قادمة", en: "Upcoming Releases" },
  },
  { id: "nav.blog", section: "التنقّل", label: "المدونة", type: "text", value: { ar: "المدونة", en: "Blog" } },
  { id: "nav.contact", section: "التنقّل", label: "تواصل معنا", type: "text", value: { ar: "تواصل معنا", en: "Contact" } },
  { id: "nav.search", section: "التنقّل", label: "بحث", type: "text", value: { ar: "بحث", en: "Search" } },

  {
    id: "contact.methodNote",
    section: "صفحة التواصل",
    label: "طريقة التواصل",
    type: "text",
    value: { ar: "يرجى استخدام نموذج التواصل أو البريد الإلكتروني.", en: "Please use the contact form or email." },
  },

  {
    id: "bookpage.guarantee.title",
    section: "صفحة الكتاب",
    label: "قسم الضمان — العنوان",
    type: "textarea",
    value: { ar: "تجربة شراء رقمية بسيطة وآمنة", en: "A simple, secure digital purchase experience" },
  },
  {
    id: "bookpage.guarantee.body",
    section: "صفحة الكتاب",
    label: "قسم الضمان — النص",
    type: "textarea",
    value: {
      ar: "ستحصلين على نسخة رقمية عالية الجودة فور إتمام عملية الشراء، مع إمكانية التواصل معنا عبر البريد الإلكتروني لأي استفسار أو مساعدة، كما سنرسل لك أي تحديثات مستقبلية مجانية لهذا الإصدار عند توفرها.",
      en: "You'll receive a high-quality digital copy immediately after your purchase, with the option to reach us by email for any question or help — and we'll send you any future updates to this edition free of charge, whenever they become available.",
    },
  },
  {
    id: "bookpage.finalCta.title",
    section: "صفحة الكتاب",
    label: "دعوة الختام — العنوان",
    type: "textarea",
    value: { ar: "كوني البداية التي تُلهم أجيالًا بعدك", en: "Be the beginning that inspires generations after you" },
  },
];

// The site-wide FAQ list (FaqPage + BookPage's general FAQ fallback) — the
// same 5 real questions originally hardcoded in the project's early static
// content file, now migrated here as the live source, with natural English
// translations.
export const INITIAL_GLOBAL_FAQS: GlobalFaqItem[] = [
  {
    question: { ar: "كيف أستلم الكتاب بعد الشراء؟", en: "How do I receive the book after purchase?" },
    answer: {
      ar: "فور إتمام عملية الشراء، تصلك رسالة على بريدك الإلكتروني تحتوي على رابط تحميل نسختك الرقمية الفاخرة بصيغة PDF، متاح للتحميل في أي وقت.",
      en: "As soon as your purchase is complete, you'll receive an email with a download link to your luxury digital copy in PDF format, available to download anytime.",
    },
  },
  {
    question: {
      ar: "هل يمكنني قراءة الكتاب على الهاتف والآيباد والكمبيوتر؟",
      en: "Can I read the book on my phone, iPad, and computer?",
    },
    answer: {
      ar: "نعم، الكتاب مصمم ليُقرأ بجودة عالية على جميع الأجهزة: الهاتف، الآيباد، وشاشة الكمبيوتر، مع الحفاظ على جمال التصميم وسهولة القراءة.",
      en: "Yes, the book is designed to be read in high quality on every device — phone, iPad, and computer screen — while preserving its beautiful design and easy readability.",
    },
  },
  {
    question: { ar: "هل يمكن استرجاع المنتج بعد الشراء؟", en: "Can the product be refunded after purchase?" },
    answer: {
      ar: "نظرًا لأن منتجات رقيم رقمية ويتم تحميلها مباشرة بعد إتمام الشراء، فلا يمكن استرجاعها أو استبدالها بعد إتمام عملية الدفع، إلا في حال وجود مشكلة تقنية تمنع الوصول إلى المنتج. إذا واجهتِ أي مشكلة، يسعدنا مساعدتك عبر البريد الإلكتروني.",
      en: "Since Raqim's products are digital and downloaded immediately after purchase, they cannot be refunded or exchanged once payment is complete, except in the case of a technical issue preventing access to the product. If you run into any problem, we're happy to help by email.",
    },
  },
  {
    question: { ar: "هل الكتاب مناسب لجميع الأعمار؟", en: "Is the book suitable for all ages?" },
    answer: {
      ar: "كُتب هذا الكتاب خصيصًا للمرأة البالغة، الأم أو التي تستعد لتكون أمًا، والباحثة عن إلهام روحي وعملي في آنٍ واحد.",
      en: "This book was written specifically for the adult woman — a mother, or one preparing to become a mother — who is seeking both spiritual and practical inspiration.",
    },
  },
  {
    question: { ar: "هل ستصدر رقيم كتبًا جديدة؟", en: "Will Raqim release new books?" },
    answer: {
      ar: "نعم، رقيم دار نشر مستمرة، وتصدر كتبًا ودفاتر ومنتجات تعليمية جديدة بانتظام. يمكنك الانضمام إلى نشرتنا البريدية لتصلك أول إشعار بكل إصدار جديد.",
      en: "Yes, Raqim is an ongoing publishing house, regularly releasing new books, journals, and educational products. You can join our newsletter to be the first notified of every new release.",
    },
  },
];
