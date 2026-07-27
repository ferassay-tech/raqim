export type MessageDirection = "inbound" | "outbound" | "note";
export type ConversationStatus = "open" | "closed";

export interface ConversationMessage {
  id: string;
  direction: MessageDirection;
  author: string;
  body: string;
  time: string;
}

export interface AdminConversation {
  id: string;
  /** Links to a real derived Customer (see lib/deriveCustomers.ts) when the
   * sender has an order history — null for messages with no matching
   * customer record yet. */
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  status: ConversationStatus;
  unread: boolean;
  updatedAt: string;
  messages: ConversationMessage[];
}
