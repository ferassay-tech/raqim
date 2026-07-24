import type { Product } from "../types/product";

// Matches the real "كوني هاجر" book defined in src/lib/content.ts — kept in
// sync manually since Product and Book are different shapes (numeric vs.
// localized-string price/pages). Update both files together if the price
// or page count changes.
export const products: Record<string, Product> = {
  "kuni-hajar": {
    id: "kuni-hajar",
    slug: "kuni-hajar",
    title: "كوني هاجر",
    subtitle: "دروس من سيرة هاجر لأمٍ تصنع الأجيال وتواجه التحديات بقلب مطمئن",
    coverImage: "/books/kuni-hajar/cover.webp",
    oldPrice: 15.99,
    newPrice: 10,
    currency: "$",
    language: "العربية",
    pages: 186,
    format: "كتاب رقمي PDF فاخر",
    deliveryNotice: "يصلك رابط التحميل عبر البريد الإلكتروني فور تأكيد الدفع",
  },
};

export const getProductBySlug = (slug: string): Product | undefined =>
  products[slug];

export const defaultProduct: Product = products["kuni-hajar"];