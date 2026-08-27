import type { DashboardMetric } from "@/admin/types/dashboard";
import { IconTrendDown, IconTrendUp } from "@/admin/icons";
import { AreaChart } from "@/admin/components/charts/AreaChart";
import { Sparkline } from "@/admin/components/charts/Sparkline";
import { StatusBadge } from "@/admin/components/ui/StatusBadge";

interface MetricCardProps {
  metric: DashboardMetric;
  variant?: "hero" | "compact" | "row";
}

function TrendPill({ trend }: { trend: DashboardMetric["trend"] }) {
  if (!trend) return null;
  if (trend.direction === "flat") {
    return (
      <StatusBadge variant="neutral" icon={null}>
        {trend.value}
      </StatusBadge>
    );
  }
  const up = trend.direction === "up";
  return (
    <StatusBadge
      variant={up ? "success" : "danger"}
      icon={up ? <IconTrendUp className="h-3 w-3" /> : <IconTrendDown className="h-3 w-3" />}
    >
      {trend.value}
    </StatusBadge>
  );
}

export function MetricCard({ metric, variant = "compact" }: MetricCardProps) {
  if (variant === "row") {
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">{metric.label}</p>
          <p className="mt-1.5 truncate text-xs text-ink-faint">{metric.caption}</p>
        </div>
        <p className="shrink-0 font-display text-3xl tabular-nums text-ink">{metric.value}</p>
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div className="flex flex-col rounded-md border border-beige bg-white/70 p-8 shadow-[0_10px_40px_-24px_rgba(44,36,32,0.25)] backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">{metric.label}</p>
            <p className="mt-3 font-display text-4xl text-ink">{metric.value}</p>
            <p className="mt-2 text-xs text-ink-faint">{metric.caption}</p>
          </div>
          <TrendPill trend={metric.trend} />
        </div>
        {metric.chart && metric.chart.length > 0 ? (
          <div className="mt-7 text-gold">
            <AreaChart data={metric.chart} />
          </div>
        ) : (
          <div className="mt-7 flex h-[88px] items-center justify-center rounded-md border border-dashed border-beige">
            <p className="text-xs text-ink-faint">لا توجد بيانات كافية للعرض بعد</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-beige bg-white/70 p-5 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-ink-faint">{metric.label}</p>
        <p className="mt-2 font-display text-2xl text-ink">{metric.value}</p>
        <p className="mt-1 text-xs text-ink-faint">{metric.caption}</p>
      </div>
      {(metric.chart || metric.trend) && (
        <div className="flex flex-col items-end gap-2">
          {metric.chart && (
            <div className="text-gold">
              <Sparkline data={metric.chart} width={64} height={24} />
            </div>
          )}
          <TrendPill trend={metric.trend} />
        </div>
      )}
    </div>
  );
}
