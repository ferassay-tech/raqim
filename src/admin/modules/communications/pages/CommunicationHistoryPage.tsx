import { AdminPagePlaceholder } from "@/admin/components/ui/AdminPagePlaceholder";
import { IconCheck } from "@/admin/icons";

export default function CommunicationHistoryPage() {
  return (
    <AdminPagePlaceholder
      icon={IconCheck}
      title="السجل"
      description="ستعرض هذه الصفحة كل إصدار منشور من كل قالب، مع إمكانية العودة لإصدار سابق."
    />
  );
}
