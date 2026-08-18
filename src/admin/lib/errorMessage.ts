/**
 * Supabase/PostgREST errors arrive as plain `{message, details, hint, code}`
 * objects, not `Error` instances (confirmed by reading
 * @supabase/postgrest-js's PostgrestBuilder source: `error = JSON.parse(body)`
 * in the non-`throwOnError()` path every RPC call in this codebase uses) —
 * a bare `err instanceof Error` check silently discards the real reason
 * (e.g. "Only a pending invitation can be resent.") and falls back to a
 * generic message. This extracts a human-readable message from either
 * shape without ever exposing a raw stack trace or internal object dump to
 * the user.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

/** Same as getErrorMessage, but also logs the full raw error first — per
 * PostgrestError's own documented advice: "Always log the full object...
 * logging only error.message hides the hint." Use at every catch site that
 * both shows the user a message and wants the real hint/code/details
 * available in devtools for debugging. */
export function logAndGetErrorMessage(context: string, err: unknown, fallback: string): string {
  console.error(context, err);
  return getErrorMessage(err, fallback);
}
