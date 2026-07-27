import type { BookCurrency } from "../admin/types/book";

export type PaymentMethodId =
  | "etsy"
  | "vodafone"
  | "instapay"
  | "bank-palestine";

export interface PaymentField {
  label: string;
  value: string;
  copyable?: boolean;
}

export interface PaymentMethodConfig {
  id: PaymentMethodId;
  title: string;
  shortDescription: string;
  iconKey: "etsy" | "vodafone" | "bank" | "instapay";
  instructions: string[];
  fields: PaymentField[];
  /** Which of the book's manually-entered per-currency prices this method
   * charges in (e.g. Vodafone/InstaPay collect EGP, Bank of Palestine
   * collects ILS) — looked up against `AdminBook.prices` at render time
   * instead of a hardcoded amount string, so an Admin price edit is
   * reflected immediately. */
  currency: BookCurrency;
  externalLink?: {
    label: string;
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
    shortDescription: "أكمل الشراء عبر متجرنا الرسمي على Etsy",
    iconKey: "etsy",
    instructions: [
      "استعرض صفحة المنتج على Etsy.",
      "شاهد صور الكتاب والمحتوى المعروض.",
      "اقرأ تفاصيل المنتج وآراء المشترين.",
      "إذا أعجبك المنتج يمكنك إتمام عملية الشراء مباشرة من خلال Etsy.",
    ],
    fields: [
      {
        label: "رابط المنتج",
        value: "https://www.etsy.com/listing/4532463342/kuni-hajar-arabic-islamic-self",
        copyable: true,
      },
    ],
    externalLink: {
      label: "عرض المنتج على Etsy",
      url: "https://www.etsy.com/listing/4532463342/kuni-hajar-arabic-islamic-self",
    },
    requiresConfirmation: false,
    currency: "USD",
  },
  vodafone: {
    id: "vodafone",
    title: "Vodafone Cash",
    shortDescription: "حوّل المبلغ عبر محفظة فودافون كاش",
    iconKey: "vodafone",
    instructions: [
      "افتح تطبيق فودافون كاش.",
      "أرسل المبلغ الظاهر أدناه إلى الرقم المذكور.",
      "احتفظ برقم العملية لاستخدامه في نموذج التأكيد.",
    ],
    fields: [
      { label: "رقم الهاتف", value: "01033017659", copyable: true },
      { label: "اسم المستلم", value: "Feras S.M.S.", copyable: true },
    ],
    currency: "EGP",
  },
  instapay: {
    id: "instapay",
    title: "InstaPay",
    shortDescription: "حوّل المبلغ عبر تطبيق إنستاباي",
    iconKey: "instapay",
    instructions: [
      "افتح تطبيق إنستاباي.",
      "أرسل المبلغ الظاهر أدناه إلى الرقم المذكور.",
      "احتفظ برقم العملية لاستخدامه في نموذج التأكيد.",
    ],
    fields: [
      { label: "رقم الهاتف", value: "01033017659", copyable: true },
      { label: "اسم المستلم", value: "Feras S.M.S.", copyable: true },
    ],
    currency: "EGP",
  },
  "bank-palestine": {
    id: "bank-palestine",
    title: "Bank of Palestine",
    shortDescription: "حوّل المبلغ عبر تحويل بنكي مباشر",
    iconKey: "bank",
    instructions: [
      "استخدم بيانات الحساب البنكي أدناه لإجراء التحويل.",
      "أضف اسمك الكامل في خانة ملاحظات التحويل إن أمكن.",
      "احتفظ بإيصال التحويل لرفعه في نموذج التأكيد.",
    ],
    fields: [
      { label: "اسم صاحب الحساب", value: "Feras S.M.S.", copyable: true },
      { label: "رقم الحساب", value: "1327800", copyable: true },
    ],
    currency: "ILS",
  },
};

export const getPaymentMethod = (
  id: string | undefined
): PaymentMethodConfig | undefined =>
  id ? paymentMethods[id as PaymentMethodId] : undefined;

export const paymentMethodList: PaymentMethodConfig[] =
  Object.values(paymentMethods);