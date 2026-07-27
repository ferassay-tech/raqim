/**
 * Single source of truth for every official Raqim contact address. Update
 * an address here and everywhere that imports from this file picks up the
 * change — no page or component should hardcode an email string directly.
 */
export const CONTACT_EMAILS = {
  /** Default/general public contact — used wherever no more specific
   * address below applies. */
  general: "hello@r-aqim.com",
  /** The public Contact page's own address. */
  contact: "contact@r-aqim.com",
  /** Customer support inquiries. */
  support: "support@r-aqim.com",
  /** Orders, payments, and purchase-related correspondence. */
  orders: "orders@r-aqim.com",
  /** General company/business information requests. */
  info: "info@r-aqim.com",
} as const;

export type ContactEmailKey = keyof typeof CONTACT_EMAILS;
