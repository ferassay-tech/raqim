import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { AdminConversation, ConversationStatus } from "../types/message";
import { INITIAL_CONVERSATIONS } from "../data/messagesData";
import { usePersistedState } from "../lib/usePersistedState";

interface MessagesContextValue {
  conversations: AdminConversation[];
  getConversation: (id: string) => AdminConversation | undefined;
  markRead: (id: string) => void;
  sendReply: (id: string, body: string) => void;
  addNote: (id: string, body: string) => void;
  setStatus: (id: string, status: ConversationStatus) => void;
}

const MessagesContext = createContext<MessagesContextValue | null>(null);

const ADMIN_NAME = "المسؤول";

const now = () => new Intl.DateTimeFormat("ar", { hour: "numeric", minute: "numeric" }).format(new Date());

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = usePersistedState<AdminConversation[]>(
    "conversations",
    INITIAL_CONVERSATIONS
  );

  const getConversation = useCallback((id: string) => conversations.find((c) => c.id === id), [conversations]);

  const markRead = useCallback((id: string) => {
    setConversations((prev) => prev.map((c) => (c.id === id && c.unread ? { ...c, unread: false } : c)));
  }, [setConversations]);

  const sendReply = useCallback((id: string, body: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              updatedAt: `اليوم، ${now()}`,
              messages: [
                ...c.messages,
                { id: `${id}-${c.messages.length + 1}`, direction: "outbound", author: ADMIN_NAME, body, time: `اليوم، ${now()}` },
              ],
            }
          : c
      )
    );
  }, [setConversations]);

  const addNote = useCallback((id: string, body: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              messages: [
                ...c.messages,
                { id: `${id}-${c.messages.length + 1}`, direction: "note", author: ADMIN_NAME, body, time: `اليوم، ${now()}` },
              ],
            }
          : c
      )
    );
  }, [setConversations]);

  const setStatus = useCallback((id: string, status: ConversationStatus) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  }, [setConversations]);

  const value = useMemo(
    () => ({ conversations, getConversation, markRead, sendReply, addNote, setStatus }),
    [conversations, getConversation, markRead, sendReply, addNote, setStatus]
  );

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error("useMessages must be used within MessagesProvider");
  return ctx;
}
