export type PaymentMethodId =
  | "payoneer"
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
  iconKey: "payoneer" | "etsy" | "vodafone" | "bank" | "instapay";
  instructions: string[];
  fields: PaymentField[];
  /** Overrides the default product-price display when this method's
   * required amount differs from the checkout total (e.g. a fixed local-
   * currency amount instead of the product's own price). */
  amount?: string;
  externalLink?: {
    label: string;
    url: string;
  };
}

/**
 * ⚠️ PLACEHOLDER VALUES ONLY.
 * Replace the strings below with your real payment details.
 * No other file in the project needs to change.
 */
export const paymentMethods: Record<PaymentMethodId, PaymentMethodConfig> = {
  payoneer: {
    id: "payoneer",
    title: "Payoneer",
    shortDescription: "حوّل المبلغ مباشرة عبر حساب Payoneer",
    iconKey: "payoneer",
    instructions: [
      "افتح تطبيق أو موقع Payoneer الخاص بك.",
      "أرسل المبلغ الظاهر أدناه إلى البريد الإلكتروني المذكور.",
      "احتفظ برقم العملية (Transaction ID) لاستخدامه في نموذج التأكيد.",
    ],
    fields: [
      {
        label: "البريد الإلكتروني على Payoneer",
        value: "ferassaymah@gmail.com",
        copyable: true,
      },
      {
        label: "رابط الدفع",
        value: "https://link.payoneer.com/Token?t=56BF05C5ACB64112B26B28BE1D7A7C03&src=pl",
        copyable: true,
      },
    ],
    externalLink: {
      label: "فتح رابط الدفع على Payoneer",
      url: "https://link.payoneer.com/Token?t=56BF05C5ACB64112B26B28BE1D7A7C03&src=pl",
    },
  },
  etsy: {
    id: "etsy",
    title: "Etsy",
    shortDescription: "أكمل الشراء عبر متجرنا الرسمي على Etsy",
    iconKey: "etsy",
    instructions: [
      "اضغط على زر \"فتح المتجر\" أدناه.",
      "أكمل عملية الشراء داخل منصة Etsy.",
      "بعد الدفع، عد إلى هذه الصفحة واضغط \"لقد أتممت الدفع\".",
    ],
    fields: [
      {
        label: "رابط المتجر",
        value: "https://www.etsy.com/listing/4532463342/kuni-hajar-arabic-islamic-self",
        copyable: true,
      },
    ],
    externalLink: {
      label: "فتح المتجر على Etsy",
      url: "https://www.etsy.com/listing/4532463342/kuni-hajar-arabic-islamic-self",
    },
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
    amount: "500 جنيه مصري",
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
    amount: "500 جنيه مصري",
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
    amount: "30 شيكل",
  },
};

export const getPaymentMethod = (
  id: string | undefined
): PaymentMethodConfig | undefined =>
  id ? paymentMethods[id as PaymentMethodId] : undefined;

export const paymentMethodList: PaymentMethodConfig[] =
  Object.values(paymentMethods);