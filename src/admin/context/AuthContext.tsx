import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AdminUser } from "../types/auth";
import { usePersistedState } from "../lib/usePersistedState";

// Local-only placeholder auth — there is no backend yet, so "credentials"
// just means a password string sitting in this browser's storage. This is
// deliberately NOT how real authentication should work; it exists only to
// verify the login/logout/session/remember-me flow end-to-end before a
// real backend replaces it. Modeled around a `users` array (not a single
// hardcoded account) so adding a second admin later is one more array
// entry, not a restructure.
const SEED_USER: AdminUser = {
  id: "admin-1",
  name: "المسؤول",
  email: "admin@localhost",
  role: "owner",
};
const SEED_CREDENTIALS: Record<string, string> = { [SEED_USER.id]: "admin123" };

const SESSION_LOCAL_KEY = "raqim_admin:session";
const SESSION_TAB_KEY = "raqim_admin:session_tab";

interface StoredSession {
  userId: string;
}

function readSession(): StoredSession | null {
  try {
    const local = localStorage.getItem(SESSION_LOCAL_KEY);
    if (local) return JSON.parse(local) as StoredSession;
    const tab = sessionStorage.getItem(SESSION_TAB_KEY);
    if (tab) return JSON.parse(tab) as StoredSession;
  } catch {
    /* ignore malformed storage */
  }
  return null;
}

function writeSession(session: StoredSession | null, rememberMe: boolean) {
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
  login: (email: string, password: string, rememberMe: boolean) => boolean;
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
  const [session, setSession] = useState<StoredSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSession(readSession());
    setIsReady(true);
  }, []);

  const currentUser = useMemo(
    () => (session ? users.find((u) => u.id === session.userId) ?? null : null),
    [session, users]
  );

  const login = useCallback(
    (email: string, password: string, rememberMe: boolean) => {
      const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user || credentials[user.id] !== password) return false;
      const next: StoredSession = { userId: user.id };
      writeSession(next, rememberMe);
      setSession(next);
      return true;
    },
    [users, credentials]
  );

  const logout = useCallback(() => {
    writeSession(null, false);
    setSession(null);
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
