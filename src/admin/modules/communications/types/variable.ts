import type { CommunicationChannelId } from "./channel";

/** A merge-field an editor can insert into content and the (future) renderer
 * substitutes against real send-time data. Definitions only — no values, no
 * rendering — live in services/variableRegistry.ts. */
export interface CommunicationVariable {
  key: string;
  label: string;
  category: string;
  /** "global" applies to every channel/template; a channel list scopes it
   * (e.g. a WhatsApp-only variable). */
  appliesTo: "global" | CommunicationChannelId[];
  exampleValue: string;
}
