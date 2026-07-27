import type { AdminConversation } from "../types/message";

// Production initial state — the inbox starts empty; conversations arrive
// from the storefront (or, later, a real backend).
export const INITIAL_CONVERSATIONS: AdminConversation[] = [];
