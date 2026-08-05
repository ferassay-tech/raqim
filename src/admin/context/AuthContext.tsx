import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AdminUser } from "../types/auth";
import { usePersistedState } from "../lib/usePersistedState";
import { createLocalAuthAdapter } from "../services/auth/localAuthAdapter";
import { supabaseAuthAdapter } from "../services/auth/supabaseAuthAdapter";
import type { AuthSession } from "../services/auth/types";

// CMS Foundation Phase 2 — real Supabase Auth is now the primary sign-in
// path (see login() below), with the original local check kept as an
// automatic fallback: this project has no way to guarantee a real Supabase
// user has been provisioned yet, and locking every admin out the moment
// this shipped would be a worse outcome than a transitional dual path.
// SEED_USER/SEED_CREDENTIALS remain exactly what they were — the fallback,
// not a second, competing source of truth — and changePassword/
// updateProfile are unchanged, still local-only (out of this phase's
// scope; see the Phase 2 report for why).
const SEED_USER: AdminUser = {
  id: "admin-1",
  name: "المسؤول",
  email: "admin@localhost",
  role: "owner",
};
const SEED_CREDENTIALS: Record<string, string> = { [SEED_USER.id]: "admin123" };

const SESSION_LOCAL_KEY = "raqim_admin:session";
const SESSION_TAB_KEY = "raqim_admin:session_tab";

// Was `{ userId }` only; now the same AuthSession shape both adapters
// return, so a Supabase-authenticated session (whose id has nothing to do
// with `users`) can still be resolved to a display name via its email —
// see currentUser below. Reading an old, already-stored `{ userId }`
// session (from before this change) still works: `email` simply defaults
// to "", and userId-based lookup (the very first check) resolves it
// exactly as before.
function readSession(): AuthSession | null {
  try {
    const local = localStorage.getItem(SESSION_LOCAL_KEY);
    if (local) {
      const parsed = JSON.parse(local) as Partial<AuthSession>;
      return { userId: parsed.userId ?? "", email: parsed.email ?? "" };
    }
    const tab = sessionStorage.getItem(SESSION_TAB_KEY);
    if (tab) {
      const parsed = JSON.parse(tab) as Partial<AuthSession>;
      return { userId: parsed.userId ?? "", email: parsed.email ?? "" };
    }
  } catch {
    /* ignore malformed storage */
  }
  return null;
}

function writeSession(session: AuthSession | null, rememberMe: boolean) {
  try {
    if (!session) {
      localStorage.removeItem(SESSION_LOCAL_KEY);
      sessionStorage.removeItem(SESSION_TAB_KEY);
      return;
    }
    if (rememberMe) {
      localStorage.setItem(SESSION_LOCAL_KEY, JSON.stringify(session));
      sessionStorage.removeItem(SESSION_TAB_KEY);
    } else {
      sessionStorage.setItem(SESSION_TAB_KEY, JSON.stringify(session));
      localStorage.removeItem(SESSION_LOCAL_KEY);
    }
  } catch {
    /* ignore quota/availability errors */
  }
}

interface AuthContextValue {
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
  updateProfile: (patch: Partial<Pick<AdminUser, "name" | "email">>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = usePersistedState<AdminUser[]>("auth_users", [SEED_USER]);
  const [credentials, setCredentials] = usePersistedState<Record<string, string>>(
    "auth_credentials",
    SEED_CREDENTIALS
  );
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSession(readSession());
    setIsReady(true);
  }, []);

  // Reads the exact same "auth_users"/"auth_credentials" localStorage keys
  // usePersistedState above already owns, so it always sees whatever
  // changePassword/updateProfile most recently saved — not a second,
  // independent credential store.
  const localAdapter = useMemo(() => createLocalAuthAdapter(users, credentials), [users, credentials]);

  const currentUser = useMemo(() => {
    if (!session) return null;
    const byId = users.find((u) => u.id === session.userId);
    if (byId) return byId;
    const byEmail = session.email
      ? users.find((u) => u.email.toLowerCase() === session.email.toLowerCase())
      : undefined;
    if (byEmail) return byEmail;
    if (!session.email) return null;
    // A Supabase-authenticated session with no matching local profile
    // record — synthesized so currentUser is never unexpectedly null after
    // a real sign-in. changePassword/updateProfile remain no-ops for this
    // user until a future phase reconciles local profiles with real
    // Supabase accounts.
    return { id: session.userId, name: session.email, email: session.email, role: "owner" as const };
  }, [session, users]);

  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      let resolved: AuthSession | null = null;
      try {
        // Race against a short timeout: an unreachable/slow Supabase
        // network path must not hang the whole login indefinitely — that's
        // "unavailable" too, not just a thrown error, and needs the same
        // fallback.
        resolved = await Promise.race<AuthSession>([
          supabaseAuthAdapter.signIn(email, password),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Supabase sign-in timed out")), 4000)),
        ]);
      } catch {
        // Supabase not configured, unreachable, timed out, or these
        // credentials don't match a real Supabase account — fall back
        // rather than fail outright. See this file's top comment for why
        // both paths coexist during this phase.
        try {
          resolved = await localAdapter.signIn(email, password);
        } catch {
          resolved = null;
        }
      }
      if (!resolved) return false;
      writeSession(resolved, rememberMe);
      setSession(resolved);
      return true;
    },
    [localAdapter]
  );

  const logout = useCallback(() => {
    writeSession(null, false);
    setSession(null);
    // Best-effort: AuthContext's own session marker above is what actually
    // gates isAuthenticated, so this never blocks or throws logout even if
    // Supabase itself is unreachable.
    void supabaseAuthAdapter.signOut().catch(() => {});
  }, []);

  const changePassword = useCallback(
    (currentPassword: string, newPassword: string) => {
      if (!currentUser) return false;
      if (credentials[currentUser.id] !== currentPassword) return false;
      setCredentials((prev) => ({ ...prev, [currentUser.id]: newPassword }));
      return true;
    },
    [currentUser, credentials, setCredentials]
  );

  const updateProfile = useCallback(
    (patch: Partial<Pick<AdminUser, "name" | "email">>) => {
      if (!currentUser) return;
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, ...patch } : u)));
    },
    [currentUser, setUsers]
  );

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: currentUser !== null,
      isReady,
      login,
      logout,
      changePassword,
      updateProfile,
    }),
    [currentUser, isReady, login, logout, changePassword, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
