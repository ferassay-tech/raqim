import type { LayoutDefinition } from "../types/layout";

/**
 * Named slot arrangements a Template's content can be built against. This
 * is intentionally the only piece of "editor architecture" with real data
 * in it at this stage — enough for the Template Editor page (and, later,
 * the real block editor) to know what regions exist; no drag-and-drop, no
 * rendering, no per-slot content lives here.
 */
const LAYOUT_REGISTRY = new Map<string, LayoutDefinition>([
  [
    "standardTransactional",
    {
      id: "standardTransactional",
      label: "معاملة قياسية (رأس، محتوى، تذييل)",
      slots: [
        { id: "header", label: "الرأس", minSections: 0, maxSections: 1 },
        { id: "main", label: "المحتوى الرئيسي", minSections: 1 },
        { id: "footer", label: "التذييل", minSections: 0, maxSections: 1 },
      ],
    },
  ],
  [
    "minimal",
    {
      id: "minimal",
      label: "بسيط (محتوى فقط)",
      slots: [{ id: "main", label: "المحتوى", minSections: 1 }],
    },
  ],
]);

export function listLayouts(): LayoutDefinition[] {
  return Array.from(LAYOUT_REGISTRY.values());
}

export function getLayout(id: string): LayoutDefinition | undefined {
  return LAYOUT_REGISTRY.get(id);
}

export function registerLayout(layout: LayoutDefinition): void {
  LAYOUT_REGISTRY.set(layout.id, layout);
}
