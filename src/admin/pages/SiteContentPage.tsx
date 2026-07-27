import { useMemo } from "react";
import { PageHeader } from "../components/PageHeader";
import { TextField } from "../components/form/TextField";
import { TextArea } from "../components/form/TextArea";
import { Repeater } from "../components/form/Repeater";
import { useSiteContent } from "../context/SiteContentContext";
import type { GlobalFaqItem } from "../types/siteContent";

export default function SiteContentPage() {
  const { fields, updateField, faqs, setFaqs } = useSiteContent();

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
      />

      <div className="flex flex-col gap-6">
        {grouped.map(([section, sectionFields]) => (
          <div key={section} className="rounded-[10px] border border-beige bg-white/70 p-6 backdrop-blur">
            <h2 className="font-display text-lg text-ink">{section}</h2>
            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              {sectionFields.map((field) => (
                <div key={field.id} className={field.type === "textarea" ? "lg:col-span-2" : ""}>
                  {field.type === "textarea" ? (
                    <TextArea
                      label={field.label}
                      rows={3}
                      value={field.value}
                      onChange={(v) => updateField(field.id, v)}
                    />
                  ) : (
                    <TextField
                      label={field.label}
                      value={field.value}
                      onChange={(v) => updateField(field.id, v)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-[10px] border border-beige bg-white/70 p-6 backdrop-blur">
          <h2 className="font-display text-lg text-ink">الأسئلة الشائعة العامة</h2>
          <p className="mt-1 text-xs text-ink-faint">
            تظهر في صفحة الأسئلة الشائعة العامة، وكقسم أسئلة افتراضي في صفحات الكتب دون أسئلة خاصة بها.
          </p>
          <div className="mt-5">
            <Repeater<GlobalFaqItem>
              label="الأسئلة"
              items={faqs}
              onChange={setFaqs}
              newItem={() => ({ question: "", answer: "" })}
              addLabel="إضافة سؤال"
              emptyLabel="لا توجد أسئلة بعد."
              renderItem={(item, update) => (
                <div className="flex flex-col gap-3">
                  <TextField label="السؤال" value={item.question} onChange={(v) => update({ ...item, question: v })} />
                  <TextArea label="الإجابة" rows={2} value={item.answer} onChange={(v) => update({ ...item, answer: v })} />
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
