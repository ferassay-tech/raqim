import type { CommunicationChannelId } from "./channel";
import type { TemplateSection } from "./section";

export type CommunicationTemplateStatus = "draft" | "published" | "archived";

/** A single message definition — e.g. one Template row per (channel, purpose)
 * pair, such as the existing download-link email, a future WhatsApp order
 * update, or a marketing newsletter. `draft` is the template's actual
 * content — a flat, ordered Section list (see section.ts) — managed by the
 * Template Editor's Content area; `publishedVersionId` is reserved for a
 * future publish/versioning workflow and isn't written by anything yet. */
export interface CommunicationTemplate {
  id: string;
  channelId: CommunicationChannelId;
  categoryId: string | null;
  /** Template-type registry key — e.g. "download_link" — free-form string
   * so a new type is a registry entry, not a union-type change. */
  type: string;
  name: string;
  description: string;
  status: CommunicationTemplateStatus;
  draft: TemplateSection[];
  publishedVersionId: string | null;
  createdAt: string;
  updatedAt: string;
}
