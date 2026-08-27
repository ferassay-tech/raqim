import { PageHeader } from "@/admin/components/ui/PageHeader";
import { EmptyState } from "@/admin/components/ui/EmptyState";
import { IconImage } from "@/admin/icons";
import { listGlobalComponents } from "../services/componentRegistry";

/** Real registry read (empty today — nothing has been registered yet); the
 * "create component" flow itself is later-milestone work. */
export default function GlobalComponentsPage() {
  const components = listGlobalComponents();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="المكوّنات المشتركة"
        description="عناصر رأس/تذييل/دعوة لاتخاذ إجراء يمكن إعادة استخدامها في أكثر من قالب."
      />
      {components.length === 0 ? (
        <div className="rounded-md border border-beige bg-white/70">
          <EmptyState
            icon={IconImage}
            title="لا توجد مكوّنات مشتركة بعد"
            description="سيتم بناء إنشاء وإدارة المكوّنات المشتركة في مرحلة لاحقة."
          />
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {components.map((c) => (
            <li key={c.id} className="rounded-md border border-beige bg-white/70 p-4 text-sm text-ink">
              {c.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
