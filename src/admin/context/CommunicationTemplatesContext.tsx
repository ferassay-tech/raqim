import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type {
  CommunicationTemplate,
  CommunicationTemplateStatus,
} from "../modules/communications/types/template";
import type { CommunicationChannelId } from "../modules/communications/types/channel";
import type { TemplateSection, TemplateSectionType } from "../modules/communications/types/section";
import { INITIAL_COMMUNICATION_TEMPLATES } from "../data/communicationTemplatesData";
import { usePersistedState } from "../lib/usePersistedState";

export interface CommunicationTemplateFormValues {
  name: string;
  description: string;
  categoryId: string | null;
  channelId: CommunicationChannelId;
  status: CommunicationTemplateStatus;
}

interface CommunicationTemplatesContextValue {
  templates: CommunicationTemplate[];
  createTemplate: (values: CommunicationTemplateFormValues) => CommunicationTemplate;
  updateTemplate: (id: string, values: CommunicationTemplateFormValues) => void;
  duplicateTemplate: (id: string) => void;
  archiveTemplate: (id: string) => void;
  deleteTemplate: (id: string) => void;
  addSection: (templateId: string, type: TemplateSectionType, fields: TemplateSection["fields"]) => void;
  updateSection: (templateId: string, sectionId: string, fields: TemplateSection["fields"]) => void;
  deleteSection: (templateId: string, sectionId: string) => void;
  moveSectionUp: (templateId: string, sectionId: string) => void;
  moveSectionDown: (templateId: string, sectionId: string) => void;
}

const CommunicationTemplatesContext = createContext<CommunicationTemplatesContextValue | null>(null);

/** Keeps `order` authoritative and in sync with array position after any
 * add/delete/move — the editor renders sections sorted by `order`. */
function reindex(sections: TemplateSection[]): TemplateSection[] {
  return sections.map((s, i) => ({ ...s, order: i }));
}

export function CommunicationTemplatesProvider({ children }: { children: ReactNode }) {
  // Current implementation stores Communication Templates in browser
  // localStorage (via usePersistedState). When templates are eventually
  // moved to a shared database, the renderer's callers (e.g.
  // OrderDownloadsCard) should load templates from that source instead —
  // renderTemplateToHtml() itself only takes sections and doesn't care
  // where they came from.
  const [templates, setTemplates] = usePersistedState<CommunicationTemplate[]>(
    "communicationTemplates",
    INITIAL_COMMUNICATION_TEMPLATES
  );

  const createTemplate = useCallback(
    (values: CommunicationTemplateFormValues) => {
      const now = new Date().toISOString();
      const template: CommunicationTemplate = {
        id: crypto.randomUUID(),
        channelId: values.channelId,
        categoryId: values.categoryId,
        type: "",
        name: values.name,
        description: values.description,
        status: values.status,
        draft: [],
        publishedVersionId: null,
        createdAt: now,
        updatedAt: now,
      };
      setTemplates((prev) => [...prev, template]);
      return template;
    },
    [setTemplates]
  );

  const updateTemplate = useCallback(
    (id: string, values: CommunicationTemplateFormValues) => {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                name: values.name,
                description: values.description,
                categoryId: values.categoryId,
                channelId: values.channelId,
                status: values.status,
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );
    },
    [setTemplates]
  );

  const duplicateTemplate = useCallback(
    (id: string) => {
      setTemplates((prev) => {
        const source = prev.find((t) => t.id === id);
        if (!source) return prev;
        const now = new Date().toISOString();
        const copy: CommunicationTemplate = {
          ...source,
          id: crypto.randomUUID(),
          name: `${source.name} (نسخة)`,
          status: "draft",
          publishedVersionId: null,
          createdAt: now,
          updatedAt: now,
        };
        return [...prev, copy];
      });
    },
    [setTemplates]
  );

  const archiveTemplate = useCallback(
    (id: string) => {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                status: t.status === "archived" ? "draft" : ("archived" as CommunicationTemplateStatus),
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );
    },
    [setTemplates]
  );

  const deleteTemplate = useCallback(
    (id: string) => {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    },
    [setTemplates]
  );

  const addSection = useCallback(
    (templateId: string, type: TemplateSectionType, fields: TemplateSection["fields"]) => {
      setTemplates((prev) =>
        prev.map((t) => {
          if (t.id !== templateId) return t;
          const section = {
            id: crypto.randomUUID(),
            type,
            order: t.draft.length,
            fields,
          } as TemplateSection;
          return { ...t, draft: [...t.draft, section], updatedAt: new Date().toISOString() };
        })
      );
    },
    [setTemplates]
  );

  const updateSection = useCallback(
    (templateId: string, sectionId: string, fields: TemplateSection["fields"]) => {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === templateId
            ? {
                ...t,
                draft: t.draft.map((s) => (s.id === sectionId ? ({ ...s, fields } as TemplateSection) : s)),
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );
    },
    [setTemplates]
  );

  const deleteSection = useCallback(
    (templateId: string, sectionId: string) => {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === templateId
            ? {
                ...t,
                draft: reindex(t.draft.filter((s) => s.id !== sectionId)),
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );
    },
    [setTemplates]
  );

  const moveSection = useCallback(
    (templateId: string, sectionId: string, direction: -1 | 1) => {
      setTemplates((prev) =>
        prev.map((t) => {
          if (t.id !== templateId) return t;
          const sorted = [...t.draft].sort((a, b) => a.order - b.order);
          const index = sorted.findIndex((s) => s.id === sectionId);
          const targetIndex = index + direction;
          if (index === -1 || targetIndex < 0 || targetIndex >= sorted.length) return t;
          [sorted[index], sorted[targetIndex]] = [sorted[targetIndex], sorted[index]];
          return { ...t, draft: reindex(sorted), updatedAt: new Date().toISOString() };
        })
      );
    },
    [setTemplates]
  );

  const moveSectionUp = useCallback((templateId: string, sectionId: string) => moveSection(templateId, sectionId, -1), [
    moveSection,
  ]);
  const moveSectionDown = useCallback((templateId: string, sectionId: string) => moveSection(templateId, sectionId, 1), [
    moveSection,
  ]);

  const value = useMemo(
    () => ({
      templates,
      createTemplate,
      updateTemplate,
      duplicateTemplate,
      archiveTemplate,
      deleteTemplate,
      addSection,
      updateSection,
      deleteSection,
      moveSectionUp,
      moveSectionDown,
    }),
    [
      templates,
      createTemplate,
      updateTemplate,
      duplicateTemplate,
      archiveTemplate,
      deleteTemplate,
      addSection,
      updateSection,
      deleteSection,
      moveSectionUp,
      moveSectionDown,
    ]
  );

  return (
    <CommunicationTemplatesContext.Provider value={value}>
      {children}
    </CommunicationTemplatesContext.Provider>
  );
}

export function useCommunicationTemplates() {
  const ctx = useContext(CommunicationTemplatesContext);
  if (!ctx) throw new Error("useCommunicationTemplates must be used within CommunicationTemplatesProvider");
  return ctx;
}
