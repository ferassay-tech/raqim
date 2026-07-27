import { AdminPagePlaceholder } from "../components/AdminPagePlaceholder";
import { IconChartLine } from "../icons";

export default function AnalyticsPage() {
  return (
    <AdminPagePlaceholder
      icon={IconChartLine}
      title="التحليلات"
      description="ستعرض هذه الصفحة مؤشرات الزوار والإيرادات والاتجاهات الحديثة عبر رسوم بيانية."
    />
  );
}
