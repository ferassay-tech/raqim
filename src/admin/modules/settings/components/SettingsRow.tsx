import type { ReactNode } from "react";

interface SettingsRowProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * The label-and-card row every modern CMS settings page is built from
 * (Stripe Dashboard, Shopify Admin, Linear, Vercel): a short title +
 * description on one side, the actual editable card on the other, full
 * width, with generous breathing room between rows. Each Settings tab is a
 * short sequence of these instead of one cramped, centered card holding
 * every field at once.
 */
export function SettingsRow({ title, description, children }: SettingsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-6 border-b border-beige py-10 first:pt-0 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-16">
      <div>
        <h3 className="font-display text-h2 text-ink">{title}</h3>
        {description && <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">{description}</p>}
      </div>
      <div className="min-w-0 rounded-md border border-beige bg-white/70 p-8 backdrop-blur sm:p-10">
        {children}
      </div>
    </div>
  );
}
