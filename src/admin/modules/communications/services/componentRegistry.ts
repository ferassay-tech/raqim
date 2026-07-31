import type { GlobalComponent } from "../types/globalComponent";

/**
 * In-memory Global Components registry — a placeholder store, not a
 * persistence layer. A real CRUD-backed store (mirroring the pattern every
 * other module uses — a Context + usePersistedState) is later-milestone
 * work; this exists now so the Global Components page and the future
 * editor's "insert component" flow both code against one stable API
 * regardless of what backs it later.
 */
let components: GlobalComponent[] = [];

export function listGlobalComponents(): GlobalComponent[] {
  return components;
}

export function getGlobalComponent(id: string): GlobalComponent | undefined {
  return components.find((c) => c.id === id);
}

export function registerGlobalComponent(component: GlobalComponent): void {
  components = [...components.filter((c) => c.id !== component.id), component];
}
