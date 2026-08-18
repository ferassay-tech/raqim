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

function extensionFor(filename: string): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(filename);
  return match ? match[1].toLowerCase() : "";
}

export function isAllowedAttachmentFile(file: File): boolean {
  return (ALLOWED_ATTACHMENT_MIME_TYPES as readonly string[]).includes(file.type) && file.size <= MAX_ATTACHMENT_SIZE_BYTES;
}

/**
 * Checkout's one-shot upload — called only after createOrder() has already
 * resolved, so orderId is always a real, existing order. Uploads under
 * {orderId}/{uuid}.{ext}, never the customer-supplied filename as the
 * storage path (order_attachments_bucket_insert_anon's path-prefix check
 * requires the first segment to equal a real order id; a uuid-based leaf
 * name also avoids any collision/overwrite risk). Deliberately no
 * `.select()` on the table insert — order_attachments has no anon SELECT
 * policy, so a read-back would fail RLS even though the row was written
 * successfully (the exact trap ordersRepository.insertOrder() already
 * documents and avoids the same way).
 */
export async function uploadOrderAttachment(orderId: string, file: File): Promise<void> {
  const supabase = getSupabaseClient();
  const ext = extensionFor(file.name);
  const key = `${orderId}/${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(key, file, {
    upsert: false,
    contentType: file.type,
  });
  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.from("order_attachments").insert({
    order_id: orderId,
    storage_path: key,
    original_filename: file.name,
    mime_type: file.type,
    size_bytes: file.size,
  });
  if (insertError) throw insertError;
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
