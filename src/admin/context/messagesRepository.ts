import type { AdminConversation, ConversationMessage, ConversationStatus } from "../types/message";
import { createCollectionAdapter } from "../services/data/index.ts";
import type { CollectionAdapter } from "../services/data/index.ts";

/**
 * CMS Phase 6G — repository for conversations. Not wired into
 * MessagesContext yet.
 */

export interface ConversationRow {
  id: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string;
  status: ConversationStatus;
  unread: boolean;
  updated_at: string;
  messages: ConversationMessage[];
}

export function conversationToSupabaseRow(conversation: AdminConversation): ConversationRow {
  return {
    id: conversation.id,
    customer_id: conversation.customerId,
    customer_name: conversation.customerName,
    customer_email: conversation.customerEmail,
    status: conversation.status,
    unread: conversation.unread,
    updated_at: conversation.updatedAt,
    messages: conversation.messages,
  };
}

export function conversationFromSupabaseRow(row: ConversationRow): AdminConversation {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    status: row.status,
    unread: row.unread,
    updatedAt: row.updated_at,
    messages: row.messages,
  };
}

// Deliberately the plain generic adapter, not a bespoke repository like
// ordersRepository's insertOrder() — .create()/.remove() already exist
// here and need no future rework; only a new RLS policy (not this file)
// would be needed to enable them for a future real intake mechanism.
export const messagesRepository: CollectionAdapter<ConversationRow> = createCollectionAdapter<ConversationRow>(
  "supabase",
  "conversations",
  []
);
