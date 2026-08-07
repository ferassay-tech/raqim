import type { AdminConversation, ConversationMessage, ConversationStatus } from "../types/message";
import { createCollectionAdapter } from "../services/data/index.ts";
import type { CollectionAdapter } from "../services/data/index.ts";
import { getSupabaseClient } from "../../lib/supabaseClient.ts";

/**
 * CMS Phase 6G — repository for conversations.
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

// The plain generic adapter, used by every authenticated admin call
// (list/update) — .select() after these works fine since
// conversations_select_authenticated permits the caller to read it back.
export const messagesRepository: CollectionAdapter<ConversationRow> = createCollectionAdapter<ConversationRow>(
  "supabase",
  "conversations",
  []
);

/**
 * CMS Phase 7A — the public contact form's insert path. Can't go through
 * messagesRepository.create(): that always does `.insert(row).select()`,
 * and Postgres requires INSERT ... RETURNING to also satisfy the
 * table's SELECT policy, not just INSERT's WITH CHECK.
 * conversations_select_authenticated excludes anon, so an anonymous
 * submission would pass conversations_insert_contact_form's own check
 * and then fail purely because it can't read the row back — the same
 * interaction ordersRepository.ts's insertOrder() already worked around.
 * This does a plain insert with no read-back; the caller already knows
 * every field it sent (id is client-generated, matching every other
 * table's convention).
 */
export async function insertConversation(row: ConversationRow): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("conversations").insert(row);
  if (error) throw error;
}
