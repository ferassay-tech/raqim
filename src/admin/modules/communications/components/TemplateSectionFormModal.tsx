import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { TemplateSection, TemplateSectionType } from "../types/section";
import { Modal } from "@/admin/components/ui/Modal";
import { TextField } from "@/admin/components/forms/TextField";
import { TextArea } from "@/admin/components/forms/TextArea";
import { Select } from "@/admin/components/forms/Select";

interface TemplateSectionFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Absent when adding a new section — a type must be chosen first. */
  initialSection?: TemplateSection | null;
  onSave: (values: { type: TemplateSectionType; fields: TemplateSection["fields"] }) => void;
}

const SECTION_TYPE_OPTIONS: { value: TemplateSectionType; label: string }[] = [
  { value: "header", label: "رأس (Header)" },
  { value: "body", label: "محتوى (Body)" },
  { value: "button", label: "زر (Button)" },
  { value: "footer", label: "تذييل (Footer)" },
];

type FieldsState = {
  title: string;
  subtitle: string;
  richText: string;
  label: string;
  url: string;
  text: string;
};

const EMPTY_FIELDS: FieldsState = { title: "", subtitle: "", richText: "", label: "", url: "", text: "" };

function fieldsToState(section: TemplateSection): FieldsState {
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

function stateToFields(type: TemplateSectionType, state: FieldsState): TemplateSection["fields"] {
  switch (type) {
    case "header":
      return { title: state.title.trim(), subtitle: state.subtitle.trim() };
    case "body":
      return { richText: state.richText.trim() };
    case "button":
      return { label: state.label.trim(), url: state.url.trim() };
    case "footer":
      return { text: state.text.trim() };
  }
}

/** Required-field check per type — this is the milestone's whole
 * validation requirement: prevent saving empty required content. */
function validate(type: TemplateSectionType, state: FieldsState): string | null {
  switch (type) {
    case "header":
      return state.title.trim() ? null : "عنوان الرأس مطلوب.";
    case "body":
      return state.richText.trim() ? null : "محتوى النص مطلوب.";
    case "button":
      if (!state.label.trim()) return "نص الزر مطلوب.";
      if (!state.url.trim()) return "رابط الزر مطلوب.";
      return null;
    case "footer":
      return state.text.trim() ? null : "نص التذييل مطلوب.";
  }
}

export function TemplateSectionFormModal({
  open,
  onClose,
  initialSection,
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
              value={state.title}
              onChange={(v) => {
                setState((p) => ({ ...p, title: v }));
                setError(null);
              }}
              required
            />
            <TextField
              label="العنوان الفرعي"
              value={state.subtitle}
              onChange={(v) => setState((p) => ({ ...p, subtitle: v }))}
            />
          </>
        )}

        {type === "body" && (
          <TextArea
            label="النص"
            rows={5}
            value={state.richText}
            onChange={(v) => {
              setState((p) => ({ ...p, richText: v }));
              setError(null);
            }}
          />
        )}

        {type === "button" && (
          <>
            <TextField
              label="نص الزر"
              value={state.label}
              onChange={(v) => {
                setState((p) => ({ ...p, label: v }));
                setError(null);
              }}
              required
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
            value={state.text}
            onChange={(v) => {
              setState((p) => ({ ...p, text: v }));
              setError(null);
            }}
          />
        )}

        {error && <p className="text-xs text-danger">{error}</p>}
      </form>
    </Modal>
  );
}
