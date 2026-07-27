export interface ChartPoint {
  x: number;
  y: number;
}

/** Maps raw values onto an SVG viewBox, y=0 at the top (SVG convention). */
export function scaleToViewBox(
  values: number[],
  width: number,
  height: number,
  padding = 4
): ChartPoint[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const usableHeight = height - padding * 2;
  const step = values.length > 1 ? width / (values.length - 1) : 0;

  return values.map((v, i) => ({
    x: i * step,
    y: padding + usableHeight - ((v - min) / range) * usableHeight,
  }));
}

/** Smooth line through each point — quadratic bezier per segment, control
 * point at the real data point so the curve still visibly passes near it. */
export function buildSmoothPath(points: ChartPoint[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;

  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const midX = (p0.x + p1.x) / 2;
    const midY = (p0.y + p1.y) / 2;
    d += ` Q${p0.x},${p0.y} ${midX},${midY}`;
  }
  const last = points[points.length - 1];
  d += ` L${last.x},${last.y}`;
  return d;
}
