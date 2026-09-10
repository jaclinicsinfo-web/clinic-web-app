import type { CSSProperties } from "react";

export const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
];

export const chartAxisStyle = { fontSize: 11, fill: "var(--color-muted-foreground)" };

export const chartGridStyle = { stroke: "var(--color-border)" };

export const chartTooltipStyle: CSSProperties = {
  borderRadius: 10,
  border: "1px solid var(--color-border)",
  backgroundColor: "var(--color-card)",
  color: "var(--color-foreground)",
  fontSize: 12,
  boxShadow: "0 8px 24px color-mix(in srgb, var(--color-foreground) 12%, transparent)",
};

export const chartLegendStyle = { fontSize: 12, color: "var(--color-muted-foreground)" };

export const chartCursorFill = "color-mix(in srgb, var(--color-primary) 10%, transparent)";
