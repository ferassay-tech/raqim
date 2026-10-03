// Once a visitor has finished or skipped the journey on this device, the
// homepage opens straight on its real content (with a "replay" link).
// localStorage may be unavailable (private mode, blocked site data): the
// journey then simply plays on every visit.
const STORAGE_KEY = "raqim_journey_seen";

export function hasSeenJourney(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markJourneySeen() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* ignore — the journey just plays again next time */
  }
}

export function clearJourneySeen() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Fired on window when the visitor asks to start the journey again (the
 * nav logo, or the "replay" link under the hero). HomePage mounts the
 * journey if it is not mounted; a mounted journey rewinds to its first scene. */
export const JOURNEY_RESTART_EVENT = "raqim:journey-restart";

/** Forget that the journey was seen and ask for it to start from the top.
 * Safe to call from any page: off the homepage nothing is listening, and
 * the cleared flag makes the journey mount on the next visit to it. */
export function requestJourneyRestart() {
  clearJourneySeen();
  window.dispatchEvent(new Event(JOURNEY_RESTART_EVENT));
}
