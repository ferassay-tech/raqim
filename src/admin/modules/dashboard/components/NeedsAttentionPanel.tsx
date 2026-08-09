import { Link } from "react-router-dom";
import type { NeedsAttentionItem, NeedsAttentionSummary } from "@/admin/types/dashboard";
import { Panel } from "@/admin/components/ui/Panel";
import { IconBag, IconCheck, IconMail } from "@/admin/icons";

interface NeedsAttentionPanelProps {
  summary: NeedsAttentionSummary;
}

function itemIcon(kind: NeedsAttentionItem["kind"]) {
  return kind === "order" ? IconBag : IconMail;
}

/**
 * Pending orders and unread conversations, merged into a single list led
 * by whichever has been waiting longest — one transparent rule rather than
 * a hidden priority score, so the lead only changes once it's resolved.
 * Everything else waiting stays visible, just at a quieter visual weight.
 */
export function NeedsAttentionPanel({ summary }: NeedsAttentionPanelProps) {
  const { lead, rest } = summary;

  if (!lead) {
    return (
      <Panel>
        <div className="flex items-start gap-4 py-6">
          <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-success/10 text-success">
            <IconCheck className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-lg text-ink">كل شيء تحت السيطرة</p>
            <p className="mt-1.5 text-xs text-ink-faint">لا توجد طلبات أو رسائل بانتظارك الآن.</p>
          </div>
        </div>
      </Panel>
    );
  }

  const LeadIcon = itemIcon(lead.kind);

  return (
    <Panel>
      <Link
        to={lead.href}
        className="-mx-2 flex items-start gap-4 rounded-lg px-2 py-6 transition-colors hover:bg-cream/50"
      >
        <LeadIcon className="mt-1 h-5 w-5 shrink-0 text-ink-faint" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-lg text-ink">{lead.title}</span>
          <span className="mt-1.5 block truncate text-xs text-ink-faint">{lead.detail}</span>
        </span>
      </Link>

      {rest.length > 0 && (
        <ul className="mt-4 flex flex-col divide-y divide-beige border-t border-beige">
          {rest.map((item) => {
            const ItemIcon = itemIcon(item.kind);
            return (
              <li key={item.id}>
                <Link
                  to={item.href}
                  className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-cream/50"
                >
                  <ItemIcon className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
                  <span className="min-w-0 flex-1 truncate text-xs text-ink-faint">{item.title}</span>
                  <span className="shrink-0 truncate text-xs text-ink-faint">{item.detail}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
