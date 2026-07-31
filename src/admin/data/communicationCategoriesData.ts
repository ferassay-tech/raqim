import type { CommunicationCategory } from "../modules/communications/types/category";

export const INITIAL_COMMUNICATION_CATEGORIES: CommunicationCategory[] = [
  {
    id: "transactional",
    label: "معاملات",
    description: "رسائل مرتبطة مباشرة بطلب أو حساب العميلة — تأكيدات، روابط تحميل.",
    channelIds: ["email"],
  },
  {
    id: "marketing",
    label: "تسويقية",
    description: "عروض وحملات ترويجية.",
    channelIds: ["email", "whatsapp", "sms", "push"],
  },
];
