import { PageHeader } from "@/admin/components/ui/PageHeader";
import { DataTable } from "@/admin/components/ui/DataTable";
import type { DataTableColumn } from "@/admin/components/ui/DataTable";
import { listVariables } from "../services/variableRegistry";
import type { CommunicationVariable } from "../types/variable";

const COLUMNS: DataTableColumn<CommunicationVariable>[] = [
  { key: "label", header: "المتغيّر", render: (v) => <span className="font-medium text-ink">{v.label}</span> },
  { key: "key", header: "المفتاح", render: (v) => <code dir="ltr" className="text-xs text-ink-faint">{`{{${v.key}}}`}</code> },
  { key: "category", header: "التصنيف", render: (v) => v.category },
  { key: "example", header: "مثال", render: (v) => <span className="text-ink-soft">{v.exampleValue}</span> },
];

/** Real registry read — the seeded merge fields any template can reference.
 * Read-only here; insertion into an editor is later-milestone work. */
export default function CommunicationVariablesPage() {
  const variables = listVariables();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="المتغيرات"
        description="الحقول القابلة للدمج المتاحة لاستخدامها داخل أي قالب."
      />
      <DataTable columns={COLUMNS} rows={variables} rowKey={(v) => v.key} />
    </div>
  );
}
