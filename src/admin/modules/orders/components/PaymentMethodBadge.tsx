import { StatusBadge } from "@/admin/components/ui/StatusBadge";
import { iconMap } from "@/components/checkout/icons";
import { paymentMethods, resolveOrderPaymentMethodLabel } from "@/config/paymentMethods";
import type { AdminOrder } from "@/admin/types/order";

interface PaymentMethodBadgeProps {
  order: Pick<AdminOrder, "paymentMethodId" | "paymentMethod">;
}

/**
 * Payment-method identity, not order status — deliberately always the same
 * "info" (gold) StatusBadge variant regardless of which method it is, so it
 * never reads as a status color (success/warning/danger already mean
 * something specific elsewhere on the same page/table). The method's own
 * icon (reused from the public checkout flow's icon set, iconMap) plus the
 * resolved label are what actually distinguish the four methods.
 *
 * Label resolution is never duplicated here — always the same
 * resolveOrderPaymentMethodLabel() Phase 2 already wired everywhere else,
 * so legacy (paymentMethodId === null) and unknown-id orders fall back to
 * order.paymentMethod exactly as they already do. When there's no matching
 * icon (legacy/unknown case), StatusBadge's own default dot marker is used
 * instead — never an empty or broken-looking badge.
 */
export function PaymentMethodBadge({ order }: PaymentMethodBadgeProps) {
  const label = resolveOrderPaymentMethodLabel(order);
  const config = order.paymentMethodId ? paymentMethods[order.paymentMethodId] : undefined;
  const Icon = config ? iconMap[config.iconKey] : undefined;

  return (
    <StatusBadge variant="info" icon={Icon ? <Icon className="h-3.5 w-3.5" /> : undefined}>
      {label}
    </StatusBadge>
  );
}
