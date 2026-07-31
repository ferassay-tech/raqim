import { AdminPagePlaceholder } from "@/admin/components/ui/AdminPagePlaceholder";
import { IconGear } from "@/admin/icons";

export default function CommunicationSettingsPage() {
  return (
    <AdminPagePlaceholder
      icon={IconGear}
      title="إعدادات نظام التواصل"
      description="ستتيح هذه الصفحة صلاحيات الأدوار وبيانات اعتماد القنوات الإضافية عند تفعيلها."
    />
  );
}
