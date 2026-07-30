/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL — see .env.example. Only required when Settings
   * → Storage's active provider is Supabase. */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon (public) key — never the service-role key. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}