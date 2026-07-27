import { useId } from "react";
import { buildSmoothPath, scaleToViewBox } from "../../lib/chartPath";

interface AreaChartProps {
  data: number[];
  className?: string;
  width?: number;
  height?: number;
}

/** Larger area chart for the hero metric card — same restrained language as
 * Sparkline (no axes, no gridlines, no tooltips) but with more breathing
 * room and a slightly bolder line, since it's the page's visual anchor. */
export function AreaChart({ data, className = "", width = 280, height = 88 }: AreaChartProps) {
  const gradientId = useId();
  const points = scaleToViewBox(data, width, height, 6);
  const path = buildSmoothPath(points);
  const first = points[0];
  const last = points[points.length - 1];
  const areaPath = first && last ? `${path} L${last.x},${height} L${first.x},${height} Z` : "";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line
        x1={0}
        y1={height - 1}
        x2={width}
        y2={height - 1}
        stroke="currentColor"
        strokeOpacity={0.08}
        strokeWidth={1}
      />
      {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />}
      <path d={path} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      {last && <circle cx={last.x} cy={last.y} r={3} fill="currentColor" />}
    </svg>
  );
}
