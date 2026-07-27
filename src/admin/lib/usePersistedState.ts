import { useEffect, useState } from "react";

const PREFIX = "raqim_admin:";

function readStorage<T>(key: string, initial: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return initial;
    return JSON.parse(raw) as T;
  } catch {
    return initial;
  }
}

/**
 * The one mechanism that makes "single source of truth" real without a
 * backend: every admin store (books, orders, categories, coupons, articles,
 * media, messages, theme, site content, auth session) persists here, so a
 * change survives a refresh and — since the public site now shares these
 * same context instances (see App.tsx) — is visible there instantly, no
 * separate sync step required.
 */
export function usePersistedState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => readStorage(key, initial));

  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(state));
    } catch {
      /* ignore quota/availability errors — state still works in-memory */
    }
  }, [key, state]);

  return [state, setState] as const;
}
