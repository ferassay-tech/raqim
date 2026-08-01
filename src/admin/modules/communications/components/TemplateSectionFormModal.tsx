import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { TemplateSectionRaw, TemplateSectionType } from "../types/section";
import type { LocalizedText } from "@/admin/types/siteContent";
import type { Language } from "@/context/LanguageContext";
import { Modal } from "@/admin/components/ui/Modal";
import { TextField } from "@/admin/components/forms/TextField";
import { TextArea } from "@/admin/components/forms/TextArea";
import { Select } from "@/admin/components/forms/Select";

interface TemplateSectionFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Absent when adding a new section — a type must be chosen first. */
  initialSection?: TemplateSectionRaw | null;
  /** The template editor's own AR/EN toggle — this modal has no toggle of
   * its own, so every bilingual field here reads/writes whichever language
   * the editor page currently has selected. */
  editingLanguage: Language;
  onSave: (values: { type: TemplateSectionType; fields: TemplateSectionRaw["fields"] }) => void;
}

const SECTION_TYPE_OPTIONS: { value: TemplateSectionType; label: string }[] = [
  { value: "header", label: "رأس (Header)" },
  { value: "body", label: "محتوى (Body)" },
  { value: "button", label: "زر (Button)" },
  { value: "footer", label: "تذييل (Footer)" },
];

const EMPTY_LOCALIZED: LocalizedText = { ar: "", en: "" };

type FieldsState = {
  title: LocalizedText;
  subtitle: LocalizedText;
  richText: LocalizedText;
  label: LocalizedText;
  url: string;
  text: LocalizedText;
};

const EMPTY_FIELDS: FieldsState = {
  title: { ...EMPTY_LOCALIZED },
  subtitle: { ...EMPTY_LOCALIZED },
  richText: { ...EMPTY_LOCALIZED },
  label: { ...EMPTY_LOCALIZED },
  url: "",
  text: { ...EMPTY_LOCALIZED },
};

function fieldsToState(section: TemplateSectionRaw): FieldsState {
  switch (section.type) {
    case "header":
      return { ...EMPTY_FIELDS, title: section.fields.title, subtitle: section.fields.subtitle };
    case "body":
      return { ...EMPTY_FIELDS, richText: section.fields.richText };
    case "button":
      return { ...EMPTY_FIELDS, label: section.fields.label, url: section.fields.url };
    case "footer":
      return { ...EMPTY_FIELDS, text: section.fields.text };
  }
}

function trimLocalized(v: LocalizedText): LocalizedText {
  return { ar: v.ar.trim(), en: v.en.trim() };
}

function stateToFields(type: TemplateSectionType, state: FieldsState): TemplateSectionRaw["fields"] {
  switch (type) {
    case "header":
      return { title: trimLocalized(state.title), subtitle: trimLocalized(state.subtitle) };
    case "body":
      return { richText: trimLocalized(state.richText) };
    case "button":
      return { label: trimLocalized(state.label), url: state.url.trim() };
    case "footer":
      return { text: trimLocalized(state.text) };
  }
}

/** Required-field check per type — always against the Arabic value,
 * regardless of which language is currently being edited, matching every
 * other bilingual editor in this app (Arabic is the required source of
 * truth; English is optional). */
function validate(type: TemplateSectionType, state: FieldsState): string | null {
  switch (type) {
    case "header":
      return state.title.ar.trim() ? null : "عنوان الرأس مطلوب (بالعربية).";
    case "body":
      return state.richText.ar.trim() ? null : "محتوى النص مطلوب (بالعربية).";
    case "button":
      if (!state.label.ar.trim()) return "نص الزر مطلوب (بالعربية).";
      if (!state.url.trim()) return "رابط الزر مطلوب.";
      return null;
    case "footer":
      return state.text.ar.trim() ? null : "نص التذييل مطلوب (بالعربية).";
  }
}

export function TemplateSectionFormModal({
  open,
  onClose,
  initialSection,
  editingLanguage,
  onSave,
}: TemplateSectionFormModalProps) {
  const [type, setType] = useState<TemplateSectionType>("header");
  const [state, setState] = useState<FieldsState>(EMPTY_FIELDS);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initialSection) {
      setType(initialSection.type);
      setState(fieldsToState(initialSection));
    } else {
      setType("header");
      setState(EMPTY_FIELDS);
    }
    setError(null);
  }, [open, initialSection]);

  const setLocalizedField = (key: "title" | "subtitle" | "richText" | "label" | "text", value: string) => {
    setState((p) => ({ ...p, [key]: { ...p[key], [editingLanguage]: value } }));
    setError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationError = validate(type, state);
    if (validationError) {
      setError(validationError);
      return;
    }
    onSave({ type, fields: stateToFields(type, state) });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialSection ? "تعديل القسم" : "قسم جديد"}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-sm text-ink-soft transition-colors hover:bg-beige"
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="template-section-form"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-gold-deep"
          >
            {initialSection ? "حفظ التغييرات" : "إضافة القسم"}
          </button>
        </>
      }
    >
      <form
        id="template-section-form"
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        {initialSection ? (
          <p className="text-sm text-ink-soft">
            نوع القسم: <span className="text-ink">{SECTION_TYPE_OPTIONS.find((o) => o.value === type)?.label}</span>
          </p>
        ) : (
          <Select
            label="نوع القسم"
            value={type}
            onChange={(v) => {
              setType(v as TemplateSectionType);
              setError(null);
            }}
            options={SECTION_TYPE_OPTIONS}
            required
          />
        )}

        {type === "header" && (
          <>
            <TextField
              label="العنوان"
              value={state.title[editingLanguage]}
              onChange={(v) => setLocalizedField("title", v)}
              required={editingLanguage === "ar"}
            />
            <TextField
              label="العنوان الفرعي"
              value={state.subtitle[editingLanguage]}
              onChange={(v) => setLocalizedField("subtitle", v)}
            />
          </>
        )}

        {type === "body" && (
          <TextArea
            label="النص"
            rows={5}
            value={state.richText[editingLanguage]}
            onChange={(v) => setLocalizedField("richText", v)}
          />
        )}

        {type === "button" && (
          <>
            <TextField
              label="نص الزر"
              value={state.label[editingLanguage]}
              onChange={(v) => setLocalizedField("label", v)}
              required={editingLanguage === "ar"}
            />
            <TextField
              label="رابط الزر"
              value={state.url}
              onChange={(v) => {
                setState((p) => ({ ...p, url: v }));
                setError(null);
              }}
              dir="ltr"
              required
            />
          </>
        )}

        {type === "footer" && (
          <TextArea
            label="نص التذييل"
            rows={3}
            value={state.text[editingLanguage]}
            onChange={(v) => setLocalizedField("text", v)}
          />
        )}

        {error && <p className="text-xs text-danger">{error}</p>}
      </form>
    </Modal>
  );
}
