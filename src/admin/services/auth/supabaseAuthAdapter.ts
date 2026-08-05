import { getSupabaseClient } from "../../../lib/supabaseClient";
import type { AuthAdapter, AuthSession } from "./types";

function toSession(user: { id: string; email?: string | null } | null | undefined): AuthSession | null {
  if (!user) return null;
  return { userId: user.id, email: user.email ?? "" };
}

/**
 * Real Supabase Auth. Needs no new table — `auth.users` ships with every
 * Supabase project — and no new env var, reusing the VITE_SUPABASE_URL/
 * VITE_SUPABASE_ANON_KEY already required for Supabase Storage. Not wired
 * into AuthContext yet: ProtectedRoute/AdminLoginPage still run entirely on
 * the local fake session until a later phase switches this in, at which
 * point AuthContext's synchronous `login(): boolean` also needs to become
 * async to honestly reflect what a real network call is.
 */
export const supabaseAuthAdapter: AuthAdapter = {
  id: "supabase",

  async signIn(email, password) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const session = toSession(data.user);
    if (!session) throw new Error("Supabase sign-in succeeded but returned no user.");
    return session;
  },

  async signOut() {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return toSession(data.session?.user);
  },

  onSessionChange(callback) {
    const supabase = getSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(toSession(session?.user));
    });
    return () => subscription.unsubscribe();
  },
};
