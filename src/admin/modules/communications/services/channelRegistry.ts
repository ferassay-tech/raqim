import type { CommunicationChannel, CommunicationChannelId } from "../types/channel";

/**
 * Every delivery surface the Communication System is designed for. Adding
 * WhatsApp/SMS/Push/In-App support later means flipping its `status` to
 * "active" once a real send integration exists for it — nothing in
 * Template/Category/Variable/the editor needs to change, since they already
 * key against `CommunicationChannelId`, not against this list's contents.
 */
export const CHANNEL_REGISTRY: Record<CommunicationChannelId, CommunicationChannel> = {
  email: {
    id: "email",
    label: "البريد الإلكتروني",
    description: "القناة الوحيدة الفعّالة حاليًا — تُرسل عبر Resend.",
    status: "active",
  },
  whatsapp: {
    id: "whatsapp",
    label: "واتساب",
    description: "قادم — سيتطلب تكاملاً مع واجهة WhatsApp Business API.",
    status: "planned",
  },
  sms: {
    id: "sms",
    label: "الرسائل النصية (SMS)",
    description: "قادم — سيتطلب تكاملاً مع مزوّد SMS.",
    status: "planned",
  },
  push: {
    id: "push",
    label: "الإشعارات الفورية (Push)",
    description: "قادم — سيتطلب تسجيل الأجهزة وتكاملاً مع مزوّد Push.",
    status: "planned",
  },
  in_app: {
    id: "in_app",
    label: "إشعارات داخل التطبيق",
    description: "قادم — إشعارات تظهر للعميلة داخل حسابها مباشرة.",
    status: "planned",
  },
};

export function listChannels(): CommunicationChannel[] {
  return Object.values(CHANNEL_REGISTRY);
}

export function getChannel(id: CommunicationChannelId): CommunicationChannel {
  return CHANNEL_REGISTRY[id];
}
