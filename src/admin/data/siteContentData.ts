import type { GlobalFaqItem, SiteContentField } from "../types/siteContent";

// One entry per string that was previously hardcoded directly in a public
// page/component — value = today's real, live copy, so turning this into an
// Admin-managed registry changes nothing visually until an admin edits it.
export const INITIAL_SITE_CONTENT: SiteContentField[] = [
  { id: "nav.home", section: "التنقّل", label: "الرئيسية", type: "text", value: "الرئيسية" },
  { id: "nav.books", section: "التنقّل", label: "الكتب", type: "text", value: "الكتب" },
  { id: "nav.about", section: "التنقّل", label: "عن الدار", type: "text", value: "عن الدار" },
  { id: "nav.futureReleases", section: "التنقّل", label: "إصدارات قادمة", type: "text", value: "إصدارات قادمة" },
  { id: "nav.blog", section: "التنقّل", label: "المدونة", type: "text", value: "المدونة" },
  { id: "nav.contact", section: "التنقّل", label: "تواصل معنا", type: "text", value: "تواصل معنا" },
  { id: "nav.search", section: "التنقّل", label: "بحث", type: "text", value: "بحث" },

  {
    id: "footer.tagline",
    section: "التذييل",
    label: "الوصف المختصر تحت الشعار",
    type: "textarea",
    value: "دار نشر رقمية فاخرة، تصدر كتبًا للمرأة تجمع بين الجمال والعمق والإلهام.",
  },
  { id: "footer.exploreTitle", section: "التذييل", label: "عنوان عمود «استكشفي»", type: "text", value: "استكشفي" },
  { id: "footer.supportTitle", section: "التذييل", label: "عنوان عمود «الدعم»", type: "text", value: "الدعم" },
  { id: "footer.followTitle", section: "التذييل", label: "عنوان عمود «تابعينا»", type: "text", value: "تابعينا" },
  { id: "footer.newsletterEyebrow", section: "التذييل", label: "عنوان النشرة الفرعي", type: "text", value: "النشرة البريدية" },
  { id: "footer.newsletterTitle", section: "التذييل", label: "عنوان النشرة", type: "text", value: "انضمي إلى رقيم" },
  {
    id: "footer.newsletterDescription",
    section: "التذييل",
    label: "وصف النشرة",
    type: "textarea",
    value: "كوني أول من يعلم بكل إصدار جديد، ومقالات ملهمة تصل بريدك بلا إزعاج.",
  },
  { id: "footer.copyright", section: "التذييل", label: "نص حقوق النشر", type: "text", value: "© ٢٠٢٦ رقيم. جميع الحقوق محفوظة." },

  { id: "homepage.philosophy.eyebrow", section: "الصفحة الرئيسية", label: "فلسفتنا — عنوان فرعي", type: "text", value: "فلسفتنا" },
  {
    id: "homepage.philosophy.title",
    section: "الصفحة الرئيسية",
    label: "فلسفتنا — العنوان",
    type: "textarea",
    value: "نؤمن بأن الكلمة الراقية تستحق أن تصاغ في أبهى صورة",
  },
  {
    id: "homepage.philosophy.body",
    section: "الصفحة الرئيسية",
    label: "فلسفتنا — النص",
    type: "textarea",
    value:
      "من هذا الإيمان، نختار بعناية ما ننشر وما نصمم وما نُبدع، لنمنح قارئاتنا تجارب فكرية وجمالية تلهم وتدوم. نحن أكثر من دار نشر، نحن حارسات للمعنى، وجسر بين الجمال والعمق.",
  },
  {
    id: "homepage.quote.text",
    section: "الصفحة الرئيسية",
    label: "الاقتباس",
    type: "textarea",
    value: "الكتاب الذي يصل إلى قلبك، يبقى فيه أطول من أي كلمة تُقال.",
  },
  { id: "homepage.quote.citation", section: "الصفحة الرئيسية", label: "توقيع الاقتباس", type: "text", value: "مها نصر، مؤلفة كوني هاجر" },
  {
    id: "homepage.finalCta.body",
    section: "الصفحة الرئيسية",
    label: "دعوة الختام — النص",
    type: "textarea",
    value: "نسخة رقمية فاخرة، تصلك خلال دقائق، لتبدئي القراءة على الفور.",
  },

  {
    id: "contact.methodNote",
    section: "صفحة التواصل",
    label: "طريقة التواصل",
    type: "text",
    value: "يرجى استخدام نموذج التواصل أو البريد الإلكتروني.",
  },

  {
    id: "bookpage.guarantee.title",
    section: "صفحة الكتاب",
    label: "قسم الضمان — العنوان",
    type: "textarea",
    value: "تجربة شراء رقمية بسيطة وآمنة",
  },
  {
    id: "bookpage.guarantee.body",
    section: "صفحة الكتاب",
    label: "قسم الضمان — النص",
    type: "textarea",
    value:
      "ستحصلين على نسخة رقمية عالية الجودة فور إتمام عملية الشراء، مع إمكانية التواصل معنا عبر البريد الإلكتروني لأي استفسار أو مساعدة، كما سنرسل لك أي تحديثات مستقبلية مجانية لهذا الإصدار عند توفرها.",
  },
  {
    id: "bookpage.finalCta.title",
    section: "صفحة الكتاب",
    label: "دعوة الختام — العنوان",
    type: "textarea",
    value: "كوني البداية التي تُلهم أجيالًا بعدك",
  },
];

// The site-wide FAQ list (FaqPage + BookPage's general FAQ fallback) — the
// same 5 real questions previously hardcoded in src/lib/content.ts's `faqs`.
export const INITIAL_GLOBAL_FAQS: GlobalFaqItem[] = [
  {
    question: "كيف أستلم الكتاب بعد الشراء؟",
    answer:
      "فور إتمام عملية الشراء، تصلك رسالة على بريدك الإلكتروني تحتوي على رابط تحميل نسختك الرقمية الفاخرة بصيغة PDF، متاح للتحميل في أي وقت.",
  },
  {
    question: "هل يمكنني قراءة الكتاب على الهاتف والآيباد والكمبيوتر؟",
    answer:
      "نعم، الكتاب مصمم ليُقرأ بجودة عالية على جميع الأجهزة: الهاتف، الآيباد، وشاشة الكمبيوتر، مع الحفاظ على جمال التصميم وسهولة القراءة.",
  },
  {
    question: "هل يمكن استرجاع المنتج بعد الشراء؟",
    answer:
      "نظرًا لأن منتجات رقيم رقمية ويتم تحميلها مباشرة بعد إتمام الشراء، فلا يمكن استرجاعها أو استبدالها بعد إتمام عملية الدفع، إلا في حال وجود مشكلة تقنية تمنع الوصول إلى المنتج. إذا واجهتِ أي مشكلة، يسعدنا مساعدتك عبر البريد الإلكتروني.",
  },
  {
    question: "هل الكتاب مناسب لجميع الأعمار؟",
    answer: "كُتب هذا الكتاب خصيصًا للمرأة البالغة، الأم أو التي تستعد لتكون أمًا، والباحثة عن إلهام روحي وعملي في آنٍ واحد.",
  },
  {
    question: "هل ستصدر رقيم كتبًا جديدة؟",
    answer:
      "نعم، رقيم دار نشر مستمرة، وتصدر كتبًا ودفاتر ومنتجات تعليمية جديدة بانتظام. يمكنك الانضمام إلى نشرتنا البريدية لتصلك أول إشعار بكل إصدار جديد.",
  },
];
