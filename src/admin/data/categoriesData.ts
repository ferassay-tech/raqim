import type { AdminCategoryRaw } from "../types/category";

// Real taxonomy, not demo content — these are the actual category names
// used across the live book catalog (src/admin/types/book.ts / the public
// site's content), kept as plain names here since AdminBook.category is a
// string, not a category id (see CategoriesContext for why renames
// intentionally don't cascade). Genuine starter configuration, analogous
// to Settings' real defaults, so it's intentionally not emptied like the
// business-data seed files (books/orders/coupons/articles/media/messages).
// English is a natural, marketing-quality translation, not literal.
export const INITIAL_CATEGORIES: AdminCategoryRaw[] = [
  {
    id: "cat-motherhood",
    name: { ar: "الأمومة والإلهام الإسلامي", en: "Motherhood & Islamic Inspiration" },
    description: {
      ar: "كتب تجمع بين رحلة الأمومة والقيم الإيمانية.",
      en: "Books that bring together the journey of motherhood and faith-rooted values.",
    },
  },
  {
    id: "cat-self-development",
    name: { ar: "التطوير الذاتي", en: "Self-Development" },
    description: {
      ar: "أدوات وتأملات عملية لبناء نسخة أكثر ثباتًا من الذات.",
      en: "Practical tools and reflections for building a more grounded version of yourself.",
    },
  },
  {
    id: "cat-spirituality",
    name: { ar: "الروحانيات", en: "Spirituality" },
    description: {
      ar: "كتب تعيد الاتصال بالسكينة الداخلية والمعنى الإيماني.",
      en: "Books that reconnect you with inner tranquility and spiritual meaning.",
    },
  },
  {
    id: "cat-literature",
    name: { ar: "الأدب والسيرة", en: "Literature & Biography" },
    description: {
      ar: "سرد أدبي وسير ملهمة بلمسة معاصرة.",
      en: "Literary narrative and inspiring biographies with a contemporary touch.",
    },
  },
  {
    id: "cat-parenting",
    name: { ar: "تربية الأبناء", en: "Parenting" },
    description: {
      ar: "محتوى يرافق الأمهات في رحلة تربية أبنائهن.",
      en: "Content that accompanies mothers on their journey of raising their children.",
    },
  },
];
