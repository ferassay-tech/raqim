import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import type {
  CommunicationTemplate,
  CommunicationTemplateRaw,
  CommunicationTemplateStatus,
  DownloadEmailDesignSettings,
} from "../modules/communications/types/template";
import type { CommunicationChannelId } from "../modules/communications/types/channel";
import type { TemplateSection, TemplateSectionRaw, TemplateSectionType } from "../modules/communications/types/section";
import type { LocalizedText } from "../types/siteContent";
import {
  DOWNLOAD_EMAIL_TEMPLATE_ID,
  DEFAULT_DOWNLOAD_EMAIL_DESIGN_SETTINGS,
  DOWNLOAD_EMAIL_ENGLISH_DEFAULTS,
  INITIAL_COMMUNICATION_TEMPLATES,
} from "../data/communicationTemplatesData";
import { usePersistedState } from "../lib/usePersistedState";
import { useLanguage } from "../../context/LanguageContext";
import type { Language } from "../../context/LanguageContext";

export interface CommunicationTemplateFormValues {
  name: string;
  description: string;
  categoryId: string | null;
  channelId: CommunicationChannelId;
  status: CommunicationTemplateStatus;
}

interface CommunicationTemplatesContextValue {
  /** Resolved for the active site language — unchanged public contract. */
  templates: CommunicationTemplate[];
  /** Raw, bilingual — Template Editor only. */
  getRawTemplate: (id: string) => CommunicationTemplateRaw | undefined;
  /** Resolves a template for actually sending a message — always Arabic,
   * regardless of the admin's own active site-language toggle. There is no
   * real recipient-language signal yet (no order.customerLanguage or
   * equivalent), so email rendering is an independent pipeline from the
   * public site's language state: it must never depend on whatever an admin
   * happens to have the site set to when they click "send". */
  resolveTemplateForSending: (id: string) => CommunicationTemplate | undefined;
  createTemplate: (values: CommunicationTemplateFormValues) => CommunicationTemplateRaw;
  updateTemplate: (id: string, values: CommunicationTemplateFormValues) => void;
  duplicateTemplate: (id: string) => void;
  archiveTemplate: (id: string) => void;
  deleteTemplate: (id: string) => void;
  addSection: (templateId: string, type: TemplateSectionType, fields: TemplateSectionRaw["fields"]) => void;
  updateSection: (templateId: string, sectionId: string, fields: TemplateSectionRaw["fields"]) => void;
  deleteSection: (templateId: string, sectionId: string) => void;
  moveSectionUp: (templateId: string, sectionId: string) => void;
  moveSectionDown: (templateId: string, sectionId: string) => void;
  /** `null` for any template with no `designSettings` (i.e. every template
   * other than the download-link one) — nothing calls this for those. */
  updateDesignSettings: (templateId: string, settings: DownloadEmailDesignSettings) => void;
}

const CommunicationTemplatesContext = createContext<CommunicationTemplatesContextValue | null>(null);

const FALLBACK_LANGUAGE: Language = "ar";

function resolveText(value: LocalizedText, language: Language): string {
  return value[language] || value[FALLBACK_LANGUAGE] || "";
}

// Older localStorage records (and the original seed data) stored section
// copy fields as plain strings. Wrapping any plain string into
// { ar: value, en: "" } on read means existing template data is never
// lost — a pure, idempotent transform, so already-migrated data just passes
// through unchanged. Mirrors the SiteContent/Books/Categories/Articles
// migration.
function migrateLocalizedText(value: unknown): LocalizedText {
  if (typeof value === "string") {
    return { ar: value, en: "" };
  }
  if (value && typeof value === "object") {
    const v = value as Partial<LocalizedText>;
    return { ar: v.ar ?? "", en: v.en ?? "" };
  }
  return { ar: "", en: "" };
}

function migrateSection(raw: TemplateSectionRaw): TemplateSectionRaw {
  switch (raw.type) {
    case "header":
      return {
        ...raw,
        fields: { title: migrateLocalizedText(raw.fields.title), subtitle: migrateLocalizedText(raw.fields.subtitle) },
      };
    case "body":
      return { ...raw, fields: { richText: migrateLocalizedText(raw.fields.richText) } };
    case "button":
      return { ...raw, fields: { label: migrateLocalizedText(raw.fields.label), url: raw.fields.url } };
    case "footer":
      return { ...raw, fields: { text: migrateLocalizedText(raw.fields.text) } };
  }
}

function resolveSection(raw: TemplateSectionRaw, language: Language): TemplateSection {
  switch (raw.type) {
    case "header":
      return {
        ...raw,
        fields: { title: resolveText(raw.fields.title, language), subtitle: resolveText(raw.fields.subtitle, language) },
      };
    case "body":
      return { ...raw, fields: { richText: resolveText(raw.fields.richText, language) } };
    case "button":
      return { ...raw, fields: { label: resolveText(raw.fields.label, language), url: raw.fields.url } };
    case "footer":
      return { ...raw, fields: { text: resolveText(raw.fields.text, language) } };
  }
}

// A record persisted before `draft` existed in its current shape (or
// corrupted by any other means) would otherwise crash every render of
// this provider — which is mounted globally — taking down the entire
// app. Treat anything other than a real array as "no sections yet",
// the same defensive posture already used for legacy string-shaped
// localized fields (migrateLocalizedText) and for missing nested
// Settings fields.
function asSectionArray(draft: unknown): TemplateSectionRaw[] {
  return Array.isArray(draft) ? draft : [];
}

// A record persisted before `designSettings` existed (every template saved
// during this session's earlier testing, including tpl-download-link
// itself) would otherwise read as `undefined` forever — real persisted
// data always wins over the seed default, so without this the Design
// section would have nothing to show for an existing download-link
// template. Only the download-link template gets a non-null default here;
// every other template genuinely has no chrome to configure and stays null,
// same as a freshly created one via "قالب جديد".
function migrateDesignSettings(raw: CommunicationTemplateRaw): DownloadEmailDesignSettings | null {
  if (raw.designSettings) return raw.designSettings;
  return raw.id === DOWNLOAD_EMAIL_TEMPLATE_ID ? DEFAULT_DOWNLOAD_EMAIL_DESIGN_SETTINGS : null;
}

// Backfills the known English defaults (see DOWNLOAD_EMAIL_ENGLISH_DEFAULTS)
// onto an already-persisted tpl-download-link record whose sections predate
// them — only when that field's `.en` is still genuinely empty, so any
// English text an admin has actually typed is never overwritten, and only
// for these exact original section ids (a later-added or re-created section
// has no entry in the map and passes through untouched). Arabic, `url`,
// `subtitle`, structure, and order are never touched by this function.
function backfillDownloadEmailEnglish(section: TemplateSectionRaw): TemplateSectionRaw {
  const defaults = DOWNLOAD_EMAIL_ENGLISH_DEFAULTS[section.id];
  if (!defaults) return section;
  switch (section.type) {
    case "header":
      if (section.fields.title.en || !defaults.title) return section;
      return { ...section, fields: { ...section.fields, title: { ...section.fields.title, en: defaults.title } } };
    case "body":
      if (section.fields.richText.en || !defaults.richText) return section;
      return { ...section, fields: { ...section.fields, richText: { ...section.fields.richText, en: defaults.richText } } };
    case "button":
      if (section.fields.label.en || !defaults.label) return section;
      return { ...section, fields: { ...section.fields, label: { ...section.fields.label, en: defaults.label } } };
    case "footer":
      if (section.fields.text.en || !defaults.text) return section;
      return { ...section, fields: { ...section.fields, text: { ...section.fields.text, en: defaults.text } } };
  }
}

function migrateTemplate(raw: CommunicationTemplateRaw): CommunicationTemplateRaw {
  const migratedSections = asSectionArray(raw.draft).map(migrateSection);
  return {
    ...raw,
    draft: raw.id === DOWNLOAD_EMAIL_TEMPLATE_ID ? migratedSections.map(backfillDownloadEmailEnglish) : migratedSections,
    designSettings: migrateDesignSettings(raw),
  };
}

function resolveTemplate(raw: CommunicationTemplateRaw, language: Language): CommunicationTemplate {
  return { ...raw, draft: asSectionArray(raw.draft).map((s) => resolveSection(s, language)) };
}

/** Keeps `order` authoritative and in sync with array position after any
 * add/delete/move — the editor renders sections sorted by `order`. */
function reindex(sections: TemplateSectionRaw[]): TemplateSectionRaw[] {
  return sections.map((s, i) => ({ ...s, order: i }));
}

export function CommunicationTemplatesProvider({ children }: { children: ReactNode }) {
  // Current implementation stores Communication Templates in browser
  // localStorage (via usePersistedState). When templates are eventually
  // moved to a shared database, the renderer's callers (e.g.
  // OrderDownloadsCard) should load templates from that source instead —
  // renderTemplateToHtml() itself only takes sections and doesn't care
  // where they came from.
  const [storedTemplates, setTemplates] = usePersistedState<CommunicationTemplateRaw[]>(
    "communicationTemplates",
    INITIAL_COMMUNICATION_TEMPLATES
  );
  const { language } = useLanguage();

  // A template id introduced after an admin's browser already persisted
  // `communicationTemplates` would otherwise never appear: usePersistedState
  // returns the stored value verbatim once one exists — it doesn't merge in
  // newly-added seed entries the way a fresh install would get them for
  // free. This appends any seed template whose id is genuinely missing —
  // once, actually persisted via setTemplates (not just merged into a
  // derived view), so it becomes a real, editable record from then on, the
  // same as every other template. Never touches/overwrites an existing
  // (possibly admin-edited) record with the same id.
  useEffect(() => {
    const missing = INITIAL_COMMUNICATION_TEMPLATES.filter(
      (seed) => !storedTemplates.some((t) => t.id === seed.id)
    );
    if (missing.length > 0) {
      setTemplates((prev) => [...prev, ...missing]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedTemplates]);

  const rawTemplates = useMemo(() => storedTemplates.map(migrateTemplate), [storedTemplates]);
  const templates = useMemo(() => rawTemplates.map((t) => resolveTemplate(t, language)), [rawTemplates, language]);

  const getRawTemplate = useCallback((id: string) => rawTemplates.find((t) => t.id === id), [rawTemplates]);

  const resolveTemplateForSending = useCallback(
    (id: string) => {
      const raw = rawTemplates.find((t) => t.id === id);
      return raw ? resolveTemplate(raw, "ar") : undefined;
    },
    [rawTemplates]
  );

  const createTemplate = useCallback(
    (values: CommunicationTemplateFormValues) => {
      const now = new Date().toISOString();
      const template: CommunicationTemplateRaw = {
        id: crypto.randomUUID(),
        channelId: values.channelId,
        categoryId: values.categoryId,
        type: "",
        name: values.name,
        description: values.description,
        status: values.status,
        draft: [],
        designSettings: null,
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
        const copy: CommunicationTemplateRaw = {
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
    (templateId: string, type: TemplateSectionType, fields: TemplateSectionRaw["fields"]) => {
      setTemplates((prev) =>
        prev.map((t) => {
          if (t.id !== templateId) return t;
          const draft = asSectionArray(t.draft);
          const section = {
            id: crypto.randomUUID(),
            type,
            order: draft.length,
            fields,
          } as TemplateSectionRaw;
          return { ...t, draft: [...draft, section], updatedAt: new Date().toISOString() };
        })
      );
    },
    [setTemplates]
  );

  const updateSection = useCallback(
    (templateId: string, sectionId: string, fields: TemplateSectionRaw["fields"]) => {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === templateId
            ? {
                ...t,
                draft: asSectionArray(t.draft).map((s) => (s.id === sectionId ? ({ ...s, fields } as TemplateSectionRaw) : s)),
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
                draft: reindex(asSectionArray(t.draft).filter((s) => s.id !== sectionId)),
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
          const sorted = [...asSectionArray(t.draft)].sort((a, b) => a.order - b.order);
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

  const updateDesignSettings = useCallback(
    (templateId: string, settings: DownloadEmailDesignSettings) => {
      setTemplates((prev) =>
        prev.map((t) => (t.id === templateId ? { ...t, designSettings: settings, updatedAt: new Date().toISOString() } : t))
      );
    },
    [setTemplates]
  );

  const value = useMemo(
    () => ({
      templates,
      getRawTemplate,
      resolveTemplateForSending,
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
      updateDesignSettings,
    }),
    [
      templates,
      getRawTemplate,
      resolveTemplateForSending,
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
      updateDesignSettings,
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
