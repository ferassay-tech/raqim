// CMS Foundation Phase 1 — shared caching primitive, not activated. No
// CollectionAdapter/SingletonAdapter anywhere is wrapped with this yet, and
// no adapter is even in use yet (see ../data). Ready for a future phase's
// public-facing read path (Books/Articles/Categories/Settings/SiteContent
// per the CMS Foundation master plan's Caching Strategy).
export { createTtlCache } from "./ttlCache";
export type { TtlCacheOptions } from "./ttlCache";
export { withCachedCollection, withCachedSingleton } from "./cachedAdapter";
