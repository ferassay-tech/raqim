import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMessages } from "../context/MessagesContext";
import { SearchInput } from "../components/SearchInput";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { ConversationListItem } from "../components/messages/ConversationListItem";
import { MessageBubble } from "../components/messages/MessageBubble";
import { ReplyComposer } from "../components/messages/ReplyComposer";
import { ConversationCustomerPanel } from "../components/messages/ConversationCustomerPanel";
import { IconChevronStart, IconMail } from "../icons";

const CONVERSATION_STATUS_LABEL = { open: "مفتوحة", closed: "مغلقة" } as const;

export default function MessagesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { conversations, markRead, sendReply, addNote, setStatus } = useMessages();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    return conversations.filter(
      (c) =>
        c.customerName.includes(search) ||
        c.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
        c.messages.some((m) => m.body.includes(search))
    );
  }, [conversations, search]);

  const active = id ? conversations.find((c) => c.id === id) : undefined;

  useEffect(() => {
    if (active?.unread) markRead(active.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  const unreadCount = conversations.filter((c) => c.unread).length;

  return (
    <div className="flex h-full flex-col gap-6 py-2">
      <PageHeader
        title="الرسائل"
        description={unreadCount > 0 ? `${unreadCount} محادثة غير مقروءة` : "لا توجد رسائل غير مقروءة"}
      />

      <div className="flex h-[70vh] min-h-[520px] overflow-hidden rounded-[10px] border border-beige bg-white/70 backdrop-blur">
        <div className={`${id ? "hidden sm:flex" : "flex"} w-full shrink-0 flex-col border-e border-beige sm:w-80`}>
          {conversations.length > 0 && (
            <div className="border-b border-beige p-3">
              <SearchInput value={search} onChange={setSearch} placeholder="ابحثي في الرسائل" />
            </div>
          )}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <EmptyState
                icon={IconMail}
                title="لا توجد محادثات بعد"
                description="ستظهر رسائل عميلاتك هنا فور ورودها."
              />
            ) : filtered.length === 0 ? (
              <EmptyState icon={IconMail} title="لا توجد نتائج" description="جربي تعديل كلمات البحث." />
            ) : (
              filtered.map((conversation) => (
                <ConversationListItem
                  key={conversation.id}
                  conversation={conversation}
                  active={conversation.id === id}
                  onClick={() => navigate(`/admin/messages/${conversation.id}`)}
                />
              ))
            )}
          </div>
        </div>

        <div className={`${id ? "flex" : "hidden sm:flex"} min-w-0 flex-1 flex-col`}>
          {active ? (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-beige px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <Link
                    to="/admin/messages"
                    aria-label="الرسائل"
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-cream sm:hidden"
                  >
                    <IconChevronStart className="h-4 w-4 rotate-180" />
                  </Link>
                  <div>
                    <p className="text-sm text-ink">{active.customerName}</p>
                    <p className="text-xs text-ink-faint" dir="ltr">
                      {active.customerEmail}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStatus(active.id, active.status === "open" ? "closed" : "open")}
                  className="shrink-0 rounded-full border border-beige px-3.5 py-1.5 text-xs text-ink-soft transition-colors hover:border-gold hover:text-ink"
                >
                  {active.status === "open" ? "إغلاق المحادثة" : "إعادة فتح"} · {CONVERSATION_STATUS_LABEL[active.status]}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col gap-3">
                  {active.messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </div>
              </div>

              <ReplyComposer
                onSendReply={(body) => sendReply(active.id, body)}
                onAddNote={(body) => addNote(active.id, body)}
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                icon={IconMail}
                title={conversations.length === 0 ? "لا توجد محادثات بعد" : "اختاري محادثة"}
                description={
                  conversations.length === 0
                    ? "ستظهر رسائل عميلاتك هنا فور ورودها."
                    : "اختاري محادثة من القائمة لعرض تفاصيلها."
                }
              />
            </div>
          )}
        </div>

        {active && (
          <div className="hidden w-72 shrink-0 border-s border-beige lg:block">
            <ConversationCustomerPanel conversation={active} />
          </div>
        )}
      </div>
    </div>
  );
}
