const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Short, unambiguous (no O/0/I/1) marketing-style code — e.g. RAQIM-7K2M. */
export function generateCouponCode(prefix = "RAQIM"): string {
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return `${prefix}-${suffix}`;
}
