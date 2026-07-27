import type { AdminCategory } from "../types/category";

// Real taxonomy, not demo content — these are the actual category names
// used across the live book catalog (src/admin/types/book.ts / the public
// site's content), kept as plain names here since AdminBook.category is a
// string, not a category id (see CategoriesContext for why renames
// intentionally don't cascade). Genuine starter configuration, analogous
// to Settings' real defaults, so it's intentionally not emptied like the
// business-data seed files (books/orders/coupons/articles/media/messages).
export const INITIAL_CATEGORIES: AdminCategory[] = [
  {
    id: "cat-motherhood",
    name: "الأمومة والإلهام الإسلامي",
    description: "كتب تجمع بين رحلة الأمومة والقيم الإيمانية.",
  },
  {
    id: "cat-self-development",
    name: "التطوير الذاتي",
    description: "أدوات وتأملات عملية لبناء نسخة أكثر ثباتًا من الذات.",
  },
  {
    id: "cat-spirituality",
    name: "الروحانيات",
    description: "كتب تعيد الاتصال بالسكينة الداخلية والمعنى الإيماني.",
  },
  {
    id: "cat-literature",
    name: "الأدب والسيرة",
    description: "سرد أدبي وسير ملهمة بلمسة معاصرة.",
  },
  {
    id: "cat-parenting",
    name: "تربية الأبناء",
    description: "محتوى يرافق الأمهات في رحلة تربية أبنائهن.",
  },
];
