import type { BookCurrency } from "../admin/types/book";
import type { LocalizedText } from "../admin/types/siteContent";

export type PaymentMethodId =
  | "etsy"
  | "vodafone"
  | "instapay"
  | "bank-palestine";

export interface PaymentField {
  label: LocalizedText;
  value: string;
  copyable?: boolean;
}

export interface PaymentMethodConfig {
  id: PaymentMethodId;
  title: string;
  shortDescription: LocalizedText;
  iconKey: "etsy" | "vodafone" | "bank" | "instapay";
  instructions: LocalizedText[];
  fields: PaymentField[];
  /** Which of the book's manually-entered per-currency prices this method
   * charges in (e.g. Vodafone/InstaPay collect EGP, Bank of Palestine
   * collects ILS) — looked up against `AdminBook.prices` at render time
   * instead of a hardcoded amount string, so an Admin price edit is
   * reflected immediately. */
  currency: BookCurrency;
  externalLink?: {
    label: LocalizedText;
    url: string;
  };
  /** False for methods that only redirect to an external product/purchase
   * page rather than collecting payment on this site directly (e.g. Etsy) —
   * suppresses the required-amount display, the "I've completed payment"
   * button, and the confirmation form, none of which apply once the actual
   * purchase happens on the external platform. Defaults to true. */
  requiresConfirmation?: boolean;
}

/**
 * ⚠️ PLACEHOLDER VALUES ONLY.
 * Replace the strings below with your real payment details.
 * No other file in the project needs to change.
 */
export const paymentMethods: Record<PaymentMethodId, PaymentMethodConfig> = {
  etsy: {
    id: "etsy",
    title: "Etsy",
    shortDescription: {
      ar: "أكمل الشراء عبر متجرنا الرسمي على Etsy",
      en: "Complete your purchase through our official Etsy shop",
    },
    iconKey: "etsy",
    instructions: [
      { ar: "استعرض صفحة المنتج على Etsy.", en: "Browse the product page on Etsy." },
      { ar: "شاهد صور الكتاب والمحتوى المعروض.", en: "View the book's photos and the listed content." },
      { ar: "اقرأ تفاصيل المنتج وآراء المشترين.", en: "Read the product details and buyer reviews." },
      {
        ar: "إذا أعجبك المنتج يمكنك إتمام عملية الشراء مباشرة من خلال Etsy.",
        en: "If you like what you see, complete your purchase directly through Etsy.",
      },
    ],
    fields: [
      {
        label: { ar: "رابط المنتج", en: "Product Link" },
        value: "https://www.etsy.com/listing/4532463342/kuni-hajar-arabic-islamic-self",
        copyable: true,
      },
    ],
    externalLink: {
      label: { ar: "عرض المنتج على Etsy", en: "View Product on Etsy" },
      url: "https://www.etsy.com/listing/4532463342/kuni-hajar-arabic-islamic-self",
    },
    requiresConfirmation: false,
    currency: "USD",
  },
  vodafone: {
    id: "vodafone",
    title: "Vodafone Cash",
    shortDescription: { ar: "حوّل المبلغ عبر محفظة فودافون كاش", en: "Transfer the amount via Vodafone Cash" },
    iconKey: "vodafone",
    instructions: [
      { ar: "افتح تطبيق فودافون كاش.", en: "Open the Vodafone Cash app." },
      { ar: "أرسل المبلغ الظاهر أدناه إلى الرقم المذكور.", en: "Send the amount shown below to the number listed." },
      { ar: "احتفظ برقم العملية لاستخدامه في نموذج التأكيد.", en: "Keep the transaction number to use in the confirmation form." },
    ],
    fields: [
      { label: { ar: "رقم الهاتف", en: "Phone Number" }, value: "01033017659", copyable: true },
      { label: { ar: "اسم المستلم", en: "Recipient Name" }, value: "Feras S.M.S.", copyable: true },
    ],
    currency: "EGP",
  },
  instapay: {
    id: "instapay",
    title: "InstaPay",
    shortDescription: { ar: "حوّل المبلغ عبر تطبيق إنستاباي", en: "Transfer the amount via the InstaPay app" },
    iconKey: "instapay",
    instructions: [
      { ar: "افتح تطبيق إنستاباي.", en: "Open the InstaPay app." },
      { ar: "أرسل المبلغ الظاهر أدناه إلى الرقم المذكور.", en: "Send the amount shown below to the number listed." },
      { ar: "احتفظ برقم العملية لاستخدامه في نموذج التأكيد.", en: "Keep the transaction number to use in the confirmation form." },
    ],
    fields: [
      { label: { ar: "رقم الهاتف", en: "Phone Number" }, value: "01033017659", copyable: true },
      { label: { ar: "اسم المستلم", en: "Recipient Name" }, value: "Feras S.M.S.", copyable: true },
    ],
    currency: "EGP",
  },
  "bank-palestine": {
    id: "bank-palestine",
    title: "Bank of Palestine",
    shortDescription: { ar: "حوّل المبلغ عبر تحويل بنكي مباشر", en: "Transfer the amount via direct bank transfer" },
    iconKey: "bank",
    instructions: [
      { ar: "استخدم بيانات الحساب البنكي أدناه لإجراء التحويل.", en: "Use the bank account details below to make the transfer." },
      { ar: "أضف اسمك الكامل في خانة ملاحظات التحويل إن أمكن.", en: "Add your full name in the transfer notes if possible." },
      { ar: "احتفظ بإيصال التحويل لرفعه في نموذج التأكيد.", en: "Keep the transfer receipt to upload it in the confirmation form." },
    ],
    fields: [
      { label: { ar: "اسم صاحب الحساب", en: "Account Holder Name" }, value: "Feras S.M.S.", copyable: true },
      { label: { ar: "رقم الحساب", en: "Account Number" }, value: "1327800", copyable: true },
    ],
    currency: "ILS",
  },
};

export const getPaymentMethod = (
  id: string | undefined
): PaymentMethodConfig | undefined =>
  id ? paymentMethods[id as PaymentMethodId] : undefined;

/**
 * Not yet called anywhere — orders currently always render their own
 * `paymentMethod` snapshot string directly, which stays correct for every
 * order regardless of this field's presence. This exists so that whatever
 * later reads `payment_method_id` (e.g. a method icon/badge) has a single,
 * correct fallback path from day one: prefer the stable id's live config
 * title when present, otherwise fall back to the order's own stored
 * snapshot string — never assume every order has an id.
 */
export function resolveOrderPaymentMethodLabel(order: {
  paymentMethodId: PaymentMethodId | null;
  paymentMethod: string;
}): string {
  if (order.paymentMethodId) {
    const config = paymentMethods[order.paymentMethodId];
    if (config) return config.title;
  }
  return order.paymentMethod;
}

export const paymentMethodList: PaymentMethodConfig[] =
  Object.values(paymentMethods);
