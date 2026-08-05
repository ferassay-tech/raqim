import type { AdminUser } from "../../types/auth";
import type { AuthAdapter, AuthSession } from "./types";

// Matches usePersistedState.ts's PREFIX and AuthContext.tsx's own key names
// exactly (raqim_admin:auth_users / :auth_credentials / :session) — not a
// coincidence. Whenever a later phase points AuthContext at this adapter
// instead of its inline logic, today's stored admin accounts and active
// session carry over with zero migration step. Nothing calls this adapter
// yet; AuthContext.tsx remains the live implementation.
const PREFIX = "raqim_admin:";
const USERS_KEY = PREFIX + "auth_users";
const CREDENTIALS_KEY = PREFIX + "auth_credentials";
const SESSION_KEY = PREFIX + "session";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota/availability errors — same tolerance as usePersistedState */
  }
}

/**
 * The `local` AuthAdapter — functionally equivalent to AuthContext's own
 * sign-in check (case-insensitive email match, plaintext credential
 * comparison), reimplemented as a standalone, framework-agnostic adapter
 * so it satisfies AuthAdapter without importing from a React context.
 * Seed values are supplied by the caller rather than hardcoded here, so
 * this stays a generic engine rather than a second copy of AuthContext's
 * own seed constants.
 */
export function createLocalAuthAdapter(
  seedUsers: AdminUser[],
  seedCredentials: Record<string, string>
): AuthAdapter {
  return {
    id: "local",

    async signIn(email, password) {
      const users = readJson(USERS_KEY, seedUsers);
      const credentials = readJson(CREDENTIALS_KEY, seedCredentials);
      const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user || credentials[user.id] !== password) {
        throw new Error("Invalid email or password.");
      }
      const session: AuthSession = { userId: user.id, email: user.email };
      writeJson(SESSION_KEY, session);
      return session;
    },

    async signOut() {
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch {
        /* ignore availability errors */
      }
    },

    async getSession() {
      return readJson<AuthSession | null>(SESSION_KEY, null);
    },

    onSessionChange() {
      // localStorage has no same-tab push mechanism (the native `storage`
      // event only fires in *other* tabs) — a real consumer would need to
      // poll or re-check on its own triggers. The Supabase adapter gets
      // this for free from a real session subscription.
      return () => {};
    },
  };
}
