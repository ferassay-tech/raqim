/**
 * The set of delivery surfaces the Communication System is designed to
 * support. Only "email" is operational; the rest are real, first-class
 * members of the type from day one so adding one later is a registry entry
 * (see services/channelRegistry.ts), not a redesign of Template/Category/
 * Variable, all of which are already keyed/typed against this union.
 */
export type CommunicationChannelId = "email" | "whatsapp" | "sms" | "push" | "in_app";

export type CommunicationChannelStatus = "active" | "planned";

export interface CommunicationChannel {
  id: CommunicationChannelId;
  label: string;
  description: string;
  status: CommunicationChannelStatus;
}
