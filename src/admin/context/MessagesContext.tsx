import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AdminConversation, ConversationMessage, ConversationStatus } from "../types/message";
import { INITIAL_CONVERSATIONS } from "../data/messagesData";
import { conversationFromSupabaseRow, conversationToSupabaseRow, insertConversation, messagesRepository } from "./messagesRepository.ts";
import { useAuth } from "./AuthContext";

export interface SubmitConversationInput {
  name: string;
  email: string;
  message: string;
}

interface MessagesContextValue {
  conversations: AdminConversation[];
  getConversation: (id: string) => AdminConversation | undefined;
  markRead: (id: string) => void;
  /** Phase 7B — Promise-returning so ReplyComposer can await and show a
   * real failure (with the typed text preserved for retry) instead of
   * the previous fire-and-forget-with-console-only behavior. */
  sendReply: (id: string, body: string) => Promise<void>;
  addNote: (id: string, body: string) => Promise<void>;
  setStatus: (id: string, status: ConversationStatus) => void;
  /** Phase 7A — the public contact form's only entry point into this
   * module. Anonymous-safe: does not touch local `conversations` state
   * (an anonymous visitor never reads it), and rethrows on failure so
   * the caller can show its own error UI. */
  submitConversation: (input: SubmitConversationInput) => Promise<void>;
}

const MessagesContext = createContext<MessagesContextValue | null>(null);

const ADMIN_NAME = "المسؤول";

const now = () => new Intl.DateTimeFormat("ar", { hour: "numeric", minute: "numeric" }).format(new Date());

/**
 * Conversations, backed by the Supabase `conversations` table since
 * Phase 6G. The mount-fetch is auth-gated (unlike Categories/Books/
 * Coupons/Articles) because there is no anon SELECT policy — this table
 * holds customer PII with no public consumer, so an ungated fetch would
 * fail RLS and log a console error on every page load for every
 * non-admin session.
 */
export function MessagesProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<AdminConversation[]>(INITIAL_CONVERSATIONS);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    messagesRepository
      .list()
      .then((rows) => {
        if (cancelled) return;
        setConversations(rows.map(conversationFromSupabaseRow));
      })
      .catch((error) => {
        console.error("Failed to load conversations from Supabase:", error);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const getConversation = useCallback((id: string) => conversations.find((c) => c.id === id), [conversations]);

  const markRead = useCallback(
    (id: string) => {
      const conversation = conversations.find((c) => c.id === id);
      if (!conversation || !conversation.unread) return;
      void messagesRepository
        .update(id, { unread: false })
        .then(() => {
          setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: false } : c)));
        })
        .catch((error) => {
          console.error("Failed to mark conversation as read:", error);
        });
    },
    [conversations]
  );

  const sendReply = useCallback(
    async (id: string, body: string) => {
      const conversation = conversations.find((c) => c.id === id);
      if (!conversation) return;
      const updatedAt = `اليوم، ${now()}`;
      const messages: ConversationMessage[] = [
        ...conversation.messages,
        {
          id: `${id}-${conversation.messages.length + 1}`,
          direction: "outbound",
          author: ADMIN_NAME,
          body,
          time: updatedAt,
        },
      ];
      try {
        await messagesRepository.update(id, { updated_at: updatedAt, messages });
      } catch (error) {
        console.error("Failed to send reply:", { conversationId: id, error });
        throw error;
      }
      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, updatedAt, messages } : c)));
    },
    [conversations]
  );

  const addNote = useCallback(
    async (id: string, body: string) => {
      const conversation = conversations.find((c) => c.id === id);
      if (!conversation) return;
      const messages: ConversationMessage[] = [
        ...conversation.messages,
        {
          id: `${id}-${conversation.messages.length + 1}`,
          direction: "note",
          author: ADMIN_NAME,
          body,
          time: `اليوم، ${now()}`,
        },
      ];
      try {
        await messagesRepository.update(id, { messages });
      } catch (error) {
        console.error("Failed to add note:", { conversationId: id, error });
        throw error;
      }
      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, messages } : c)));
    },
    [conversations]
  );

  const setStatus = useCallback((id: string, status: ConversationStatus) => {
    void messagesRepository
      .update(id, { status })
      .then(() => {
        setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
      })
      .catch((error) => {
        console.error("Failed to update conversation status:", error);
      });
  }, []);

  const submitConversation = useCallback(async (input: SubmitConversationInput) => {
    const id = `conv-${Date.now().toString(36)}`;
    const time = `اليوم، ${now()}`;
    const conversation: AdminConversation = {
      id,
      customerId: null,
      customerName: input.name,
      customerEmail: input.email,
      status: "open",
      unread: true,
      updatedAt: time,
      messages: [{ id: `${id}-1`, direction: "inbound", author: input.name, body: input.message, time }],
    };
    await insertConversation(conversationToSupabaseRow(conversation));

    // Best-effort — never blocks or affects the visitor's success
    // feedback, which is already driven by the insert above succeeding.
    // fetch() only rejects on a network-level failure, not on an HTTP
    // error status, so response.ok is checked explicitly — otherwise a
    // 500 (e.g. missing RESEND_API_KEY) would fail completely silently.
    fetch("/api/notify-new-conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName: input.name, customerEmail: input.email, message: input.message }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          console.error("Failed to send new-conversation notification email:", {
            conversationId: id,
            customerEmail: input.email,
            status: response.status,
            body,
          });
        }
      })
      .catch((error) => {
        console.error("Failed to send new-conversation notification email:", {
          conversationId: id,
          customerEmail: input.email,
          error,
        });
      });
  }, []);

  const value = useMemo(
    () => ({ conversations, getConversation, markRead, sendReply, addNote, setStatus, submitConversation }),
    [conversations, getConversation, markRead, sendReply, addNote, setStatus, submitConversation]
  );

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error("useMessages must be used within MessagesProvider");
  return ctx;
}
