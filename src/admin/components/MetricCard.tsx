import type { DashboardMetric } from "../types/dashboard";
import { IconTrendDown, IconTrendUp } from "../icons";
import { AreaChart } from "./charts/AreaChart";
import { Sparkline } from "./charts/Sparkline";

interface MetricCardProps {
  metric: DashboardMetric;
  variant?: "hero" | "compact";
}

function TrendPill({ trend }: { trend: DashboardMetric["trend"] }) {
  if (!trend) {
    return (
      <span className="inline-flex items-center rounded-full bg-beige px-2.5 py-1 text-xs font-medium text-ink-faint">
        —
      </span>
    );
  }
  if (trend.direction === "flat") {
    return (
      <span className="inline-flex items-center rounded-full bg-beige px-2.5 py-1 text-xs font-medium text-ink-soft">
        {trend.value}
      </span>
    );
  }
  const up = trend.direction === "up";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
        up ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
      }`}
    >
      {up ? <IconTrendUp className="h-3 w-3" /> : <IconTrendDown className="h-3 w-3" />}
      {trend.value}
    </span>
  );
}

export function MetricCard({ metric, variant = "compact" }: MetricCardProps) {
  if (variant === "hero") {
    return (
      <div className="flex flex-col rounded-[10px] border border-beige bg-white/70 p-7 shadow-[0_10px_40px_-24px_rgba(44,36,32,0.25)] backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">{metric.label}</p>
            <p className="mt-3 font-display text-4xl text-ink">{metric.value}</p>
            <p className="mt-1.5 text-xs text-ink-faint">{metric.caption}</p>
          </div>
          <TrendPill trend={metric.trend} />
        </div>
        {metric.chart && metric.chart.length > 0 ? (
          <div className="mt-6 text-gold">
            <AreaChart data={metric.chart} />
          </div>
        ) : (
          <div className="mt-6 flex h-[88px] items-center justify-center rounded-[10px] border border-dashed border-beige">
            <p className="text-xs text-ink-faint">لا توجد بيانات كافية للعرض بعد</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-[10px] border border-beige bg-white/70 p-5 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-ink-faint">{metric.label}</p>
        <p className="mt-2 font-display text-2xl text-ink">{metric.value}</p>
        <p className="mt-1 text-xs text-ink-faint">{metric.caption}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        {metric.chart && (
          <div className="text-gold">
            <Sparkline data={metric.chart} width={64} height={24} />
          </div>
        )}
        <TrendPill trend={metric.trend} />
      </div>
    </div>
  );
}
