import type { CommunicationChannelId } from "./channel";
import type { TemplateSection, TemplateSectionRaw } from "./section";

export type CommunicationTemplateStatus = "draft" | "published" | "archived";

/**
 * Visual/system chrome controls for the download-link email — deliberately
 * separate from `draft` (the 4 admin-editable content Sections). Content
 * Sections control message copy; this controls the surrounding premium
 * structure (brand bars, book card, order info, security notice) and the
 * 3 identity colors used throughout both the chrome and the content rows.
 * `null` for any template that has no such chrome to configure (every
 * template type other than the download-link one, for now).
 */
export interface DownloadEmailDesignSettings {
  showBrandHeader: boolean;
  showBookCard: boolean;
  showOrderInfo: boolean;
  showSecurityNotice: boolean;
  /** The dark chrome footer bar (support email/copyright) — distinct from
   * the admin's own editable "footer" content Section (the small note
   * above it, e.g. "رقيم — دار نشر رقمية"). */
  showBrandFooterBar: boolean;
  /** Page/card background — currently #fbf6ed. */
  backgroundColor: string;
  /** Drives the CTA button and every gold accent (chrome + content) — the
   * current design already uses one consistent gold everywhere, so one
   * knob, not separate "button color"/"brand color" settings. */
  accentColor: string;
  /** Primary text color and the dark chrome bars' background — currently
   * #2c2420, already used both ways in the existing design. */
  inkColor: string;
}

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
  designSettings: DownloadEmailDesignSettings | null;
  publishedVersionId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Raw, bilingual storage shape — the Template Editor reads/writes this
 * directly. Public/send-time consumers use the resolved CommunicationTemplate
 * shape above, never this type. `name`/`description` stay plain strings even
 * here — they're Admin-only organizational labels (identify a template in
 * the list), never seen by an email recipient, so there's nothing to
 * localize about them. */
export interface CommunicationTemplateRaw {
  id: string;
  channelId: CommunicationChannelId;
  categoryId: string | null;
  type: string;
  name: string;
  description: string;
  status: CommunicationTemplateStatus;
  draft: TemplateSectionRaw[];
  designSettings: DownloadEmailDesignSettings | null;
  publishedVersionId: string | null;
  createdAt: string;
  updatedAt: string;
}
