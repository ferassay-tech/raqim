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
