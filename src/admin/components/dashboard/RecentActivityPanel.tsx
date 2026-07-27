import type { ActivityItem } from "../../types/dashboard";
import { DashboardPanel } from "./DashboardPanel";
import { Timeline } from "../Timeline";
import { EmptyState } from "../EmptyState";
import { IconChartLine } from "../../icons";

interface RecentActivityPanelProps {
  items: ActivityItem[];
}

export function RecentActivityPanel({ items }: RecentActivityPanelProps) {
  if (items.length === 0) {
    return (
      <DashboardPanel title="النشاط الأخير">
        <EmptyState
          icon={IconChartLine}
          title="لا يوجد نشاط بعد"
          description="سيظهر سجل النشاط هنا بمجرد توفر بيانات حقيقية من الطلبات والمحتوى."
        />
      </DashboardPanel>
    );
  }

  return (
    <DashboardPanel title="النشاط الأخير">
      <Timeline items={items.map((item) => ({ id: item.id, title: item.text, time: item.time }))} />
    </DashboardPanel>
  );
}
