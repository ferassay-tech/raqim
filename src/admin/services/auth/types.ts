export type AuthBackend = "local" | "supabase";

export interface AuthSession {
  userId: string;
  email: string;
}

/**
 * The seam a real auth provider plugs into — same role as StorageAdapter
 * for file bytes and CollectionAdapter/SingletonAdapter for records.
 * Intentionally narrower than AuthContext's current public surface: no
 * "remember me" concept (a session-persistence choice for whichever UI
 * layer consumes this, not something a generic adapter should encode) and
 * Promise-based throughout, since a real network call can never be
 * synchronous the way today's local-only `login()` is. Reconciling that
 * gap in AuthContext/AdminLoginPage is future-phase work — see the two
 * adapters in this folder for how each backend implements it today.
 */
export interface AuthAdapter {
  id: AuthBackend;
  signIn(email: string, password: string): Promise<AuthSession>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  /** Returns an unsubscribe function. */
  onSessionChange(callback: (session: AuthSession | null) => void): () => void;
}
