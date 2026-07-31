import { AdminPagePlaceholder } from "@/admin/components/ui/AdminPagePlaceholder";
import { IconChartLine } from "@/admin/icons";

export default function AnalyticsPage() {
  return (
    <AdminPagePlaceholder
      icon={IconChartLine}
      title="التحليلات"
      description="ستعرض هذه الصفحة مؤشرات الزوار والإيرادات والاتجاهات الحديثة عبر رسوم بيانية."
    />
  );
}
