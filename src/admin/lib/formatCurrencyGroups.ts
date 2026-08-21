import type { CurrencyGroupedAmount } from "../types/order";
import type { BookCurrency } from "../types/book";
import { CURRENCY_SYMBOLS } from "../types/book";

const LEGACY_LABEL = "غير محدد";

const CURRENCY_ORDER: Record<BookCurrency, number> = { USD: 0, EGP: 1, ILS: 2 };

function rank(currency: BookCurrency | null): number {
  return currency === null ? 99 : CURRENCY_ORDER[currency];
}

/** Stable display order (USD, EGP, ILS, then the legacy/uncurrencied
 * bucket last) — grouping itself has no inherent order (see
 * groupOrderTotalsByCurrency), so every render site needs the same
 * deterministic sort rather than each inventing its own. */
export function sortCurrencyGroups(groups: CurrencyGroupedAmount[]): CurrencyGroupedAmount[] {
  return [...groups].sort((a, b) => rank(a.currency) - rank(b.currency));
}

/** Formats one amount in one known (or legacy/unknown) currency. The
 * legacy bucket's stored number may not even be truly USD-denominated (see
 * A1 remediation plan) — no currency symbol is shown for it, so the
 * uncertainty stays visible instead of implying a currency that was never
 * actually confirmed. */
export function formatCurrencyAmount(currency: BookCurrency | null, amount: number): string {
  if (currency === null) return `${LEGACY_LABEL}: ${amount.toFixed(2)}`;
  return currency === "USD" ? `$${amount.toFixed(2)}` : `${amount.toFixed(2)} ${CURRENCY_SYMBOLS[currency]}`;
}

/** Renders a currency-grouped amount list as one compact string, e.g.
 * "$120.00 · 500.00 ج.م" — never blends groups into a single number. */
export function formatCurrencyGroups(groups: CurrencyGroupedAmount[]): string {
  if (groups.length === 0) return "$0.00";
  return sortCurrencyGroups(groups)
    .map((g) => formatCurrencyAmount(g.currency, g.amount))
    .join(" · ");
}
