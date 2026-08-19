import { getSupabaseClient } from "../../lib/supabaseClient";

const BUCKET = "order-attachments";

/** Matches the bucket's own allowed_mime_types (migration 20260818330001) —
 * single source of truth for both the checkout-side validation and the
 * bucket config, so the two can never drift apart. */
export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export type AllowedAttachmentMimeType = (typeof ALLOWED_ATTACHMENT_MIME_TYPES)[number];

/** Matches the bucket's own file_size_limit (10485760 bytes). */
export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;

/** Applied only when the caller doesn't pass one — long enough for an
 * admin to view/download once, short enough to keep the link narrow.
 * Matches supabaseAdapter.ts's existing DEFAULT_SIGNED_URL_TTL_SECONDS. */
const DEFAULT_SIGNED_URL_TTL_SECONDS = 120;

export interface OrderAttachment {
  id: string;
  orderId: string;
  storagePath: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

interface OrderAttachmentRow {
  id: string;
  order_id: string;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  uploaded_at: string;
}

function fromRow(row: OrderAttachmentRow): OrderAttachment {
  return {
    id: row.id,
    orderId: row.order_id,
    storagePath: row.storage_path,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    uploadedAt: row.uploaded_at,
  };
}

export function isAllowedAttachmentFile(file: File): boolean {
  return (ALLOWED_ATTACHMENT_MIME_TYPES as readonly string[]).includes(file.type) && file.size <= MAX_ATTACHMENT_SIZE_BYTES;
}

async function readJsonError(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => null);
  return (body && typeof body.error === "string" && body.error) || fallback;
}

/**
 * Checkout's one-shot upload — called only after createOrder() has already
 * resolved, so orderId is always a real, existing order.
 *
 * Goes through two small server endpoints (api/order-attachment-init.ts,
 * api/order-attachment-confirm.ts) instead of calling
 * supabase.storage.from(BUCKET).upload() directly, as a plain anon upload
 * did before. Root cause (confirmed live, not assumed): Supabase Storage's
 * normal anon-role INSERT path implicitly reads the new row back
 * (RETURNING-shaped) to build its response, which requires a SELECT policy
 * anon deliberately does not have — "new row violates row-level security
 * policy" even though the INSERT's own WITH CHECK passed. A server-minted,
 * single-use signed upload URL sidesteps that entirely (the token itself
 * is the authorization, independent of the anon role's own RLS) while
 * still needing zero anon SELECT grant anywhere. The public contract here
 * (signature, throw-on-any-failure) is unchanged, so no caller
 * (PaymentMethodPage.tsx) needed to change.
 */
export async function uploadOrderAttachment(orderId: string, file: File): Promise<void> {
  const initResponse = await fetch("/api/order-attachment-init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, filename: file.name, mimeType: file.type, sizeBytes: file.size }),
  });
  if (!initResponse.ok) {
    throw new Error(await readJsonError(initResponse, "Failed to prepare attachment upload."));
  }
  const { storagePath, token } = (await initResponse.json()) as { storagePath: string; token: string };

  const supabase = getSupabaseClient();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .uploadToSignedUrl(storagePath, token, file, { contentType: file.type });
  if (uploadError) throw uploadError;

  const confirmResponse = await fetch("/api/order-attachment-confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId,
      storagePath,
      originalFilename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    }),
  });
  if (!confirmResponse.ok) {
    throw new Error(await readJsonError(confirmResponse, "Failed to save attachment record."));
  }
}

/** Admin-only read — order_attachments_select_admin requires orders.view. */
export async function getOrderAttachments(orderId: string): Promise<OrderAttachment[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("order_attachments")
    .select("*")
    .eq("order_id", orderId)
    .order("uploaded_at", { ascending: true });
  if (error) throw error;
  return (data as OrderAttachmentRow[]).map(fromRow);
}

/** Short-lived signed URL — never a public/permanent link. */
export async function getOrderAttachmentSignedUrl(storagePath: string, expiresInSeconds?: number): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds ?? DEFAULT_SIGNED_URL_TTL_SECONDS);
  if (error) throw error;
  return data.signedUrl;
}
