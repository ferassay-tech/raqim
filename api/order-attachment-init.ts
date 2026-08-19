/**
 * Vercel serverless function — step 1 of 2 for the checkout receipt
 * upload. Validates the order and the declared file metadata, then mints
 * a short-lived, single-use Supabase Storage *signed upload URL* scoped to
 * one exact object path.
 *
 * Why this shape instead of the browser posting the file bytes to a server
 * endpoint that forwards them to Storage: Vercel Serverless Functions cap
 * the incoming request body (~4.5 MB by default), well under this
 * feature's required 10 MB attachment limit — proxying raw bytes through
 * this function would fail for any file anywhere near that limit. A signed
 * upload URL lets the browser upload directly to Supabase Storage instead
 * (this endpoint never sees the file bytes at all), while still requiring
 * zero anon RLS grant on storage.objects — the token itself is the
 * authorization, independent of the uploading client's own role. That's
 * also what sidesteps the exact bug this endpoint exists to fix: Storage's
 * normal anon-role INSERT path implicitly reads the row back
 * (RETURNING-shaped), which requires a SELECT policy anon deliberately
 * does not have; a signed-upload-URL PUT does not go through that same
 * check.
 *
 * SUPABASE_SERVICE_ROLE_KEY is used ONLY here, server-side — it is never
 * sent to the browser and has no VITE_ prefix, so Vite never bundles it.
 *
 * Deliberately self-contained (no imports from src/): cross-directory
 * imports out of api/ previously broke the deployed function at runtime
 * (FUNCTION_INVOCATION_FAILED) — see send-download-email.ts's own comment.
 */
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const BUCKET = "order-attachments";
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

function extensionFor(filename: string): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(filename);
  return match ? match[1].toLowerCase() : "";
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { orderId, filename, mimeType, sizeBytes } = (req.body ?? {}) as {
    orderId?: string;
    filename?: string;
    mimeType?: string;
    sizeBytes?: number;
  };

  if (!orderId || !filename || !mimeType || typeof sizeBytes !== "number") {
    res.status(400).json({ error: "Missing required fields: orderId, filename, mimeType, sizeBytes" });
    return;
  }
  // Client-declared values — never trusted alone. The bucket's own
  // allowed_mime_types/file_size_limit (already configured, unchanged by
  // this endpoint) is what actually enforces both at the Storage layer
  // regardless of what's claimed here; this is just an early, friendly
  // rejection before minting a URL for an obviously invalid upload.
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    res.status(400).json({ error: "Unsupported file type." });
    return;
  }
  if (sizeBytes > MAX_SIZE_BYTES) {
    res.status(400).json({ error: "File is too large." });
    return;
  }

  const url = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    res.status(500).json({ error: "Attachment storage is not configured on the server." });
    return;
  }

  const supabase = createClient(url, serviceRoleKey);

  // Service-role bypasses RLS entirely, so — unlike the anon-facing table/
  // storage policies — this check is the actual enforcement that the order
  // is real, not decoration on top of it.
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .maybeSingle();
  if (orderError) {
    console.error("Failed to verify order for attachment upload:", orderError);
    res.status(500).json({ error: "Could not verify the order." });
    return;
  }
  if (!order) {
    res.status(400).json({ error: "Order not found." });
    return;
  }

  // Never the customer-supplied filename as the storage path — a fresh
  // uuid leaf avoids both collisions and any path-traversal risk from an
  // attacker-chosen filename.
  const ext = extensionFor(filename);
  const storagePath = `${orderId}/${randomUUID()}${ext ? `.${ext}` : ""}`;

  const { data: signed, error: signError } = await supabase.storage.from(BUCKET).createSignedUploadUrl(storagePath);
  if (signError || !signed) {
    console.error("Failed to create signed upload URL for order attachment:", signError);
    res.status(500).json({ error: "Could not prepare the upload." });
    return;
  }

  // token is single-use and scoped to exactly this one path — not a
  // general storage credential, cannot list/read/delete anything, and
  // cannot be replayed for a different object.
  res.status(200).json({ storagePath, token: signed.token });
}
