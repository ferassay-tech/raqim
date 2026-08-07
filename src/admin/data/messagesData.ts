import type { AdminConversation } from "../types/message";

// Production initial state — the inbox starts empty; conversations now
// arrive from the public contact form (see MessagesContext.submitConversation).
export const INITIAL_CONVERSATIONS: AdminConversation[] = [];
