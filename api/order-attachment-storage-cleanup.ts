/**
 * Vercel serverless function — the ONLY path that permanently deletes an
 * order and its Storage attachment files. Redesigned after a security
 * review found the previous version accepted a client-supplied
 * `storagePaths` array with no authentication at all — an unauthenticated
 * arbitrary-file-delete primitive against the order-attachments bucket.
 * This version accepts only `{ orderId }`; every storage path and every
 * authorization decision is derived server-side.
 *
 * Request shape: POST { orderId: string }, header
 * "Authorization: Bearer <the caller's own Supabase access token>". The
 * server never trusts a client-supplied user id, role, or isOwner flag —
 * every one of those is independently re-derived here.
 *
 * Flow (each step's exact failure behavior is deliberate, not incidental):
 *   1. Authenticate — supabase.auth.getUser(token) verifies the JWT itself
 *      (signature + expiry) against Supabase Auth. Missing/invalid/expired
 *      token -> 401, nothing deleted.
 *   2. Authorize — resolve platform_ownership.owner_profile_id (the same
 *      authoritative source AdminUsersContext.isOwner already uses
 *      client-side) via the service-role client and compare it to the
 *      verified caller id from step 1. Authenticated but not the owner
 *      -> 403, nothing deleted.
 *   3. Validate orderId — orders.id is a client-generated TEXT id (e.g.
 *      "ORD-MT1IVIRO", confirmed against the live schema — NOT a uuid),
 *      so this checks shape/safety (bounded length, no path-traversal or
 *      injection-shaped characters), not a uuid format. Invalid -> 400,
 *      nothing deleted. A `storagePaths`/`storagePath` field anywhere in
 *      the body is rejected outright — this endpoint no longer accepts
 *      that input under any circumstance, even to ignore it silently.
 *   4. Look up this order's attachment storage_path values server-side
 *      (service-role read of order_attachments) — the client supplies
 *      none. If this read fails, the order is NOT deleted — better to
 *      abort a permanent delete than to knowingly create one with unknown
 *      cleanup paths.
 *   5. Delete the order through a client SCOPED TO THE CALLER'S OWN
 *      SESSION (anon key + their bearer token) — never the service-role
 *      client. This is what makes the existing orders_delete_owner RLS
 *      policy (current_admin_role() = 'owner') the actual, live
 *      enforcement boundary: even if steps 1-2 somehow passed
 *      incorrectly, the database itself independently rejects the delete
 *      for a non-owner. If this fails or affects zero rows, nothing is
 *      considered deleted and Storage is never touched.
 *   6. Only after step 5 has genuinely succeeded, best-effort delete the
 *      paths captured in step 4 via the service-role client — the one and
 *      only place that key is used, and only for this. A failure here
 *      never un-deletes the order and is never retried as a delete
 *      failure; it's reported back as storageCleanupFailed: true for the
 *      existing frontend warning banner to surface.
 *
 * Deliberately self-contained (no imports from src/): cross-directory
 * imports out of api/ previously broke a deployed function at runtime
 * (FUNCTION_INVOCATION_FAILED) — see send-download-email.ts's own comment.
 * SUPABASE_SERVICE_ROLE_KEY is used only here, server-side, never sent to
 * the browser, no VITE_ prefix — and even here, only for the ownership
 * lookup, the attachment-path lookup, and the final Storage delete, never
 * for the order DELETE itself (see step 5).
 */
import { createClient } from "@supabase/supabase-js";

const BUCKET = "order-attachments";
// Shape/safety validation for orders.id (text, e.g. "ORD-MT1IVIRO") — not
// a uuid check, see file header.
const ORDER_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const authHeader = (req.headers?.authorization ?? req.headers?.Authorization) as string | undefined;
  const token = typeof authHeader === "string" && authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!token) {
    res.status(401).json({ error: "Missing or invalid Authorization header." });
    return;
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  // Explicitly rejected, never merely ignored — see file header.
  if ("storagePaths" in body || "storagePath" in body) {
    res
      .status(400)
      .json({ error: "This endpoint no longer accepts storage paths from the client; it derives them from orderId." });
    return;
  }
  const orderId = body.orderId;
  if (typeof orderId !== "string" || !ORDER_ID_RE.test(orderId)) {
    res.status(400).json({ error: "Missing or invalid orderId." });
    return;
  }

  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceRoleKey) {
    res.status(500).json({ error: "Server is not configured." });
    return;
  }

  const serviceClient = createClient(url, serviceRoleKey);

  // Step 1 — authenticate. Never trust a client-supplied user id.
  const { data: userData, error: userError } = await serviceClient.auth.getUser(token);
  if (userError || !userData?.user) {
    res.status(401).json({ error: "Invalid or expired session." });
    return;
  }
  const callerId = userData.user.id;

  // Step 2 — authorize. Never trust a client-supplied role/isOwner flag.
  const { data: ownership, error: ownershipError } = await serviceClient
    .from("platform_ownership")
    .select("owner_profile_id")
    .maybeSingle();
  if (ownershipError) {
    console.error("Failed to resolve platform ownership:", ownershipError);
    res.status(500).json({ error: "Could not verify ownership." });
    return;
  }
  if (!ownership || ownership.owner_profile_id !== callerId) {
    res.status(403).json({ error: "Only the platform owner may permanently delete an order." });
    return;
  }

  // Step 4 — server-derived attachment paths, before anything is deleted.
  const { data: attachments, error: attachmentsError } = await serviceClient
    .from("order_attachments")
    .select("storage_path")
    .eq("order_id", orderId);
  if (attachmentsError) {
    console.error("Failed to read order attachments before permanent delete:", attachmentsError);
    res.status(500).json({ error: "Could not verify attachments for this order — permanent delete aborted." });
    return;
  }
  const storagePaths = (attachments ?? []).map((a: { storage_path: string }) => a.storage_path);

  // Step 5 — delete through the CALLER'S OWN session, not service-role, so
  // orders_delete_owner RLS is the real, live enforcement boundary.
  const userScopedClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { error: deleteError, count } = await userScopedClient
    .from("orders")
    .delete({ count: "exact" })
    .eq("id", orderId);
  if (deleteError) {
    console.error("Failed to delete order (RLS-protected):", deleteError);
    res.status(403).json({ error: "Could not delete this order." });
    return;
  }
  if (!count) {
    // RLS blocks a delete by matching zero rows, not by raising an error
    // — treat that identically to a rejection.
    res.status(403).json({ error: "Order not found or not permitted." });
    return;
  }

  // Step 6 — order is genuinely gone; best-effort Storage cleanup only now.
  if (storagePaths.length === 0) {
    res.status(200).json({ ok: true, storageCleanupFailed: false });
    return;
  }

  const { error: storageError } = await serviceClient.storage.from(BUCKET).remove(storagePaths);
  if (storageError) {
    console.error("Failed to delete order attachment files from storage:", storageError);
    res.status(200).json({ ok: true, storageCleanupFailed: true });
    return;
  }

  res.status(200).json({ ok: true, storageCleanupFailed: false });
}
