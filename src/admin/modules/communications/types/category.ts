import type { CommunicationChannelId } from "./channel";

/** Organizes Templates for the Templates/History list views — distinct from
 * (and unrelated to) the catalog `AdminCategory` used by Books. */
export interface CommunicationCategory {
  id: string;
  label: string;
  description: string;
  channelIds: CommunicationChannelId[];
}
