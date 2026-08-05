export interface TtlCacheOptions {
  ttlMs: number;
}

/**
 * Minimal get-or-fetch cache with a time-to-live and in-flight
 * deduplication (concurrent callers during a fetch share the same
 * Promise instead of triggering N requests). Not wired into any live
 * adapter yet — see cachedAdapter.ts for the decorators that will
 * eventually wrap a CollectionAdapter/SingletonAdapter with this.
 */
export function createTtlCache<T>(fetcher: () => Promise<T>, options: TtlCacheOptions) {
  let cached: { value: T; fetchedAt: number } | null = null;
  let pending: Promise<T> | null = null;

  async function get(): Promise<T> {
    if (cached && Date.now() - cached.fetchedAt < options.ttlMs) {
      return cached.value;
    }
    if (pending) return pending;

    pending = fetcher()
      .then((value) => {
        cached = { value, fetchedAt: Date.now() };
        return value;
      })
      .finally(() => {
        pending = null;
      });
    return pending;
  }

  function invalidate() {
    cached = null;
  }

  return { get, invalidate };
}
