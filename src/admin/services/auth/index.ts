// CMS Foundation Phase 1 — real-auth infrastructure, not yet in use.
// AuthContext.tsx is still the live, active implementation; nothing in the
// running app imports from this folder today. Phase 2 decides whether/how
// AuthContext delegates to one of these adapters.
export type { AuthAdapter, AuthBackend, AuthSession } from "./types";
export { createLocalAuthAdapter } from "./localAuthAdapter";
export { supabaseAuthAdapter } from "./supabaseAuthAdapter";
