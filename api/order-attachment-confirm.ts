/**
 * Vercel serverless function — step 2 of 2 for the checkout receipt
 * upload (see order-attachment-init.ts for step 1 and the full rationale).
 * Called after the browser has already uploaded the file bytes directly to
 * Supabase Storage via the signed URL from step 1. This endpoint only ever
 * handles small JSON metadata — never file bytes — and records the
 * order_attachments row using the service role (order_attachments has no
 * anon INSERT... via this path; the anon-facing table/storage policies
 * from migration 20260818330001/20260819100001 remain in place and
 * correct, just no longer exercised by checkout, which now goes through
 * this service-role path instead).
 *
 * SUPABASE_SERVICE_ROLE_KEY is used ONLY here, server-side.
 *
 * Deliberately self-contained (no imports from src/) — same reason as
 * every other file in this directory (see send-download-email.ts).
 */
import { createClient } from "@supabase/supabase-js";

const BUCKET = "order-attachments";
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { orderId, storagePath, originalFilename, mimeType, sizeBytes } = (req.body ?? {}) as {
    orderId?: string;
    storagePath?: string;
    originalFilename?: string;
    mimeType?: string;
    sizeBytes?: number;
  };

  if (!orderId || !storagePath || !originalFilename || !mimeType || typeof sizeBytes !== "number") {
    res.status(400).json({ error: "Missing required fields." });
    return;
  }
  if (!ALLOWED_MIME_TYPES.includes(mimeType) || sizeBytes > MAX_SIZE_BYTES) {
    res.status(400).json({ error: "Invalid attachment metadata." });
    return;
  }
  // A client-supplied storagePath is never trusted on its own — it must
  // actually be scoped under the order it claims to belong to.
  if (!storagePath.startsWith(`${orderId}/`) || storagePath.includes("..")) {
    res.status(400).json({ error: "Invalid storage path for this order." });
    return;
  }

  const url = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    res.status(500).json({ error: "Attachment storage is not configured on the server." });
    return;
  }

  const supabase = createClient(url, serviceRoleKey);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .maybeSingle();
  if (orderError || !order) {
    res.status(400).json({ error: "Order not found." });
    return;
  }

  // Confirm the object genuinely exists at this exact path before
  // recording metadata for it — never trust the client's claim that the
  // signed-URL upload actually succeeded.
  const folder = orderId;
  const leaf = storagePath.slice(folder.length + 1);
  const { data: listing, error: listError } = await supabase.storage.from(BUCKET).list(folder, { search: leaf });
  if (listError || !listing?.some((entry) => entry.name === leaf)) {
    res.status(400).json({ error: "Uploaded object not found." });
    return;
  }

  const { error: insertError } = await supabase.from("order_attachments").insert({
    order_id: orderId,
    storage_path: storagePath,
    original_filename: originalFilename,
    mime_type: mimeType,
    size_bytes: sizeBytes,
  });

  if (insertError) {
    console.error("Failed to record order attachment metadata:", insertError);
    // Best-effort rollback of the just-uploaded object — a stray,
    // unreferenced file is a smaller problem than an inconsistent state.
    const { error: removeError } = await supabase.storage.from(BUCKET).remove([storagePath]);
    if (removeError) {
      console.error("Failed to roll back orphaned order attachment object:", removeError);
    }
    res.status(500).json({ error: "Could not save the attachment record." });
    return;
  }

  res.status(200).json({ ok: true });
}
