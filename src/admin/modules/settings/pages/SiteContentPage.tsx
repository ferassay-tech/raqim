import { useMemo, useState } from "react";
import { PageHeader } from "@/admin/components/ui/PageHeader";
import { TextField } from "@/admin/components/forms/TextField";
import { TextArea } from "@/admin/components/forms/TextArea";
import { Repeater } from "@/admin/components/forms/Repeater";
import { useSiteContent } from "@/admin/context/SiteContentContext";
import type { GlobalFaqItem } from "@/admin/types/siteContent";
import type { Language } from "@/context/LanguageContext";

const EDITING_LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
];

export default function SiteContentPage() {
  const { fields, updateField, rawFaqs, setFaqs } = useSiteContent();
  const [editingLanguage, setEditingLanguage] = useState<Language>("ar");

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof fields>();
    for (const field of fields) {
      const list = groups.get(field.section) ?? [];
      list.push(field);
      groups.set(field.section, list);
    }
    return Array.from(groups.entries());
  }, [fields]);

  return (
    <div className="flex flex-col gap-6 py-2">
      <PageHeader
        title="محتوى الموقع"
        description="نصوص الموقع العام — التنقّل، التذييل، ونصوص الصفحات — تُحفظ فورًا وتنعكس على الموقع مباشرة."
        actions={
          <div className="flex items-center gap-1 rounded-full border border-beige p-1">
            {EDITING_LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setEditingLanguage(option.value)}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                  editingLanguage === option.value ? "bg-ink text-ivory" : "text-ink-soft hover:text-ink"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="flex flex-col gap-6">
        {grouped.map(([section, sectionFields]) => (
          <div key={section} className="rounded-md border border-beige bg-white/70 p-6 backdrop-blur">
            <h2 className="font-display text-h2 text-ink">{section}</h2>
            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              {sectionFields.map((field) => (
                <div key={field.id} className={field.type === "textarea" ? "lg:col-span-2" : ""}>
                  {field.type === "textarea" ? (
                    <TextArea
                      label={field.label}
                      rows={3}
                      value={field.value[editingLanguage]}
                      onChange={(v) => updateField(field.id, editingLanguage, v)}
                    />
                  ) : (
                    <TextField
                      label={field.label}
                      value={field.value[editingLanguage]}
                      onChange={(v) => updateField(field.id, editingLanguage, v)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-md border border-beige bg-white/70 p-6 backdrop-blur">
          <h2 className="font-display text-h2 text-ink">الأسئلة الشائعة العامة</h2>
          <p className="mt-1 text-xs text-ink-faint">
            تظهر في صفحة الأسئلة الشائعة العامة، وكقسم أسئلة افتراضي في صفحات الكتب دون أسئلة خاصة بها.
          </p>
          <div className="mt-5">
            <Repeater<GlobalFaqItem>
              label="الأسئلة"
              items={rawFaqs}
              onChange={setFaqs}
              newItem={() => ({ question: { ar: "", en: "" }, answer: { ar: "", en: "" } })}
              addLabel="إضافة سؤال"
              emptyLabel="لا توجد أسئلة بعد."
              renderItem={(item, update) => (
                <div className="flex flex-col gap-3">
                  <TextField
                    label="السؤال"
                    value={item.question[editingLanguage]}
                    onChange={(v) => update({ ...item, question: { ...item.question, [editingLanguage]: v } })}
                  />
                  <TextArea
                    label="الإجابة"
                    rows={2}
                    value={item.answer[editingLanguage]}
                    onChange={(v) => update({ ...item, answer: { ...item.answer, [editingLanguage]: v } })}
                  />
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
