import type { AdminOrder } from "../types/order";

// Production initial state — orders originate from the storefront (or,
// later, a real backend) and start empty here.
export const INITIAL_ORDERS: AdminOrder[] = [];
