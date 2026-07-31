import type { CommunicationVariable } from "../types/variable";

/**
 * Known merge fields available to any template's editor. Seeded with the
 * variables the existing download-link email already conceptually relies
 * on (customer name, order number, book title, download link, expiry) —
 * definitions only, no substitution logic; the registry is what a future
 * "insert variable" chip UI and a future renderer would both read from.
 */
const SEED_VARIABLES: CommunicationVariable[] = [
  { key: "customer.name", label: "اسم العميلة", category: "العميلة", appliesTo: "global", exampleValue: "سارة أحمد" },
  { key: "customer.email", label: "بريد العميلة", category: "العميلة", appliesTo: "global", exampleValue: "sara@example.com" },
  { key: "order.number", label: "رقم الطلب", category: "الطلب", appliesTo: "global", exampleValue: "ORD-A1B2C3D4" },
  { key: "order.total", label: "إجمالي الطلب", category: "الطلب", appliesTo: "global", exampleValue: "120 EGP" },
  { key: "book.title", label: "عنوان الكتاب", category: "الكتاب", appliesTo: "global", exampleValue: "كُني حَجَر" },
  { key: "download.link", label: "رابط التحميل", category: "التحميل", appliesTo: ["email"], exampleValue: "https://r-aqim.com/download/..." },
  { key: "download.expiresAt", label: "تاريخ انتهاء الرابط", category: "التحميل", appliesTo: ["email"], exampleValue: "٧ أيام من الآن" },
];

const VARIABLE_REGISTRY = new Map<string, CommunicationVariable>(SEED_VARIABLES.map((v) => [v.key, v]));

export function listVariables(): CommunicationVariable[] {
  return Array.from(VARIABLE_REGISTRY.values());
}

export function getVariable(key: string): CommunicationVariable | undefined {
  return VARIABLE_REGISTRY.get(key);
}

export function registerVariable(variable: CommunicationVariable): void {
  VARIABLE_REGISTRY.set(variable.key, variable);
}
