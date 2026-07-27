import { useId } from "react";
import { buildSmoothPath, scaleToViewBox } from "../../lib/chartPath";

interface SparklineProps {
  data: number[];
  className?: string;
  width?: number;
  height?: number;
}

/** Tiny inline trend line for compact metric cards — no axes, no labels,
 * just a calm gesture at direction. Color follows the parent's text color. */
export function Sparkline({ data, className = "", width = 96, height = 32 }: SparklineProps) {
  const gradientId = useId();
  const points = scaleToViewBox(data, width, height, 3);
  const path = buildSmoothPath(points);
  const last = points[points.length - 1];
  const first = points[0];
  const areaPath = first && last ? `${path} L${last.x},${height} L${first.x},${height} Z` : "";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />}
      <path d={path} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
      {last && <circle cx={last.x} cy={last.y} r={2.2} fill="currentColor" />}
    </svg>
  );
}
