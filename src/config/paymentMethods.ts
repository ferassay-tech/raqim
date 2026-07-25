export type PaymentMethodId =
  | "payoneer"
  | "etsy"
  | "vodafone"
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
  iconKey: "payoneer" | "etsy" | "vodafone" | "bank";
  instructions: string[];
  fields: PaymentField[];
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
      { label: "اسم الحساب", value: "YOUR_ACCOUNT_NAME", copyable: true },
      {
        label: "البريد الإلكتروني على Payoneer",
        value: "YOUR_PAYONEER_EMAIL",
        copyable: true,
      },
    ],
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
      { label: "اسم المستلم", value: "Feras Sayma", copyable: true },
    ],
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
      { label: "اسم صاحب الحساب", value: "Feras Sayma", copyable: true },
      { label: "رقم الحساب", value: "1327800", copyable: true },
    ],
  },
};

export const getPaymentMethod = (
  id: string | undefined
): PaymentMethodConfig | undefined =>
  id ? paymentMethods[id as PaymentMethodId] : undefined;

export const paymentMethodList: PaymentMethodConfig[] =
  Object.values(paymentMethods);