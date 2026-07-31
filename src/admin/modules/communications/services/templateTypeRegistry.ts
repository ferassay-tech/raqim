import type { CommunicationChannelId } from "../types/channel";

/** Metadata describing a creatable kind of template — not an instance.
 * Backs "new template" flows: pick a type, get its label/allowed
 * channels/default layout. Registering a new type here is how a future
 * template kind (e.g. an SMS shipping update) is added — no change to the
 * `CommunicationTemplate.type` field itself, which stays a free string. */
export interface TemplateTypeDefinition {
  id: string;
  label: string;
  description: string;
  channelIds: CommunicationChannelId[];
  defaultLayoutId: string;
}

const SEED_TEMPLATE_TYPES: TemplateTypeDefinition[] = [
  {
    id: "download_link",
    label: "رابط تحميل الملف",
    description: "تُرسل بعد اعتماد الدفع — تحتوي رابط التحميل الآمن للكتاب.",
    channelIds: ["email"],
    defaultLayoutId: "standardTransactional",
  },
  {
    id: "purchase_confirmation",
    label: "تأكيد الشراء",
    description: "تأكيد استلام الطلب قبل اعتماد الدفع.",
    channelIds: ["email", "whatsapp"],
    defaultLayoutId: "standardTransactional",
  },
  {
    id: "welcome",
    label: "ترحيب بعميلة جديدة",
    description: "يتطلب نظام تسجيل حسابات لم يُبنَ بعد.",
    channelIds: ["email"],
    defaultLayoutId: "minimal",
  },
  {
    id: "password_reset",
    label: "إعادة تعيين كلمة المرور",
    description: "يتطلب نظام حسابات/دخول لم يُبنَ بعد.",
    channelIds: ["email"],
    defaultLayoutId: "minimal",
  },
  {
    id: "marketing",
    label: "رسالة تسويقية",
    description: "عروض وحملات ترويجية.",
    channelIds: ["email", "whatsapp", "sms", "push"],
    defaultLayoutId: "standardTransactional",
  },
  {
    id: "newsletter",
    label: "نشرة إخبارية",
    description: "تحديثات دورية — إصدارات جديدة، مقالات المدونة.",
    channelIds: ["email"],
    defaultLayoutId: "standardTransactional",
  },
];

const TEMPLATE_TYPE_REGISTRY = new Map<string, TemplateTypeDefinition>(
  SEED_TEMPLATE_TYPES.map((t) => [t.id, t])
);

export function listTemplateTypes(): TemplateTypeDefinition[] {
  return Array.from(TEMPLATE_TYPE_REGISTRY.values());
}

export function getTemplateType(id: string): TemplateTypeDefinition | undefined {
  return TEMPLATE_TYPE_REGISTRY.get(id);
}

export function registerTemplateType(type: TemplateTypeDefinition): void {
  TEMPLATE_TYPE_REGISTRY.set(type.id, type);
}
