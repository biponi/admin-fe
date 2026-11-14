import type { ChartData, ChartOptions } from "chart.js";
import { claudeChartPalette, claudeChartTheme, foldToPalette } from "../../../lib/claudeChart";

// ── Artifact payload shapes (SSE `part` events / StoredMessage.parts) ──────

/** Bar/column chart payload; single series for doughnut kind. */
export interface ChartArtifactPayload {
  kind: "bar" | "doughnut";
  labels: (string | number)[];
  series: { label: string; values: number[] }[];
  /** Unit suffix for tooltips, e.g. "BDT" */
  unit?: string;
  /** Bar kind only: render horizontal bars */
  horizontal?: boolean;
}

export interface SheetColumn {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
}

export interface SheetArtifactPayload {
  columns: SheetColumn[];
  rows: Record<string, unknown>[];
  /** Total rows server-side if the client rows are truncated */
  totalRows?: number;
}

export interface DocArtifactPayload {
  markdown: string;
}

export type ArtifactPayload = ChartArtifactPayload | SheetArtifactPayload | DocArtifactPayload;

/** The artifact identity shared by live parts and persisted parts. */
export interface ArtifactDescriptor {
  id: string;
  kind: "chart" | "sheet" | "doc";
  title: string;
  payload: ArtifactPayload;
  /** Doc artifacts stream markdown; incomplete until status "done" */
  streaming?: boolean;
}

/** Live SSE part event payload (event: part). */
export interface AssistantPartEvent {
  partId: string;
  type?: "chart" | "sheet" | "doc";
  title?: string;
  status: "start" | "delta" | "done";
  chunk?: string;
  payload?: ArtifactPayload;
}

/** Persisted part on StoredMessage (backward compatible — optional). */
export type StoredPart =
  | { kind: "doc"; id: string; title: string; markdown: string }
  | { kind: "sheet"; id: string; title: string; columns: SheetColumn[]; rows: Record<string, unknown>[]; totalRows?: number }
  | { kind: "chart"; id: string; title: string; chart: ChartArtifactPayload };

// ── Render helpers ─────────────────────────────────────────────────────────

/** Map an artifact payload onto the Claude chart system. */
export const toChartData = (
  payload: ChartArtifactPayload
): { data: ChartData<any>; options: ChartOptions<any> } => {
  const unitSuffix = payload.unit ? ` ${payload.unit}` : "";
  const tooltipCallbacks = {
    label: (ctx: any) => {
      const value = ctx.parsed?.y ?? ctx.parsed;
      return `${ctx.dataset.label ?? ""} ${typeof value === "number" ? value.toLocaleString() : value}${unitSuffix}`;
    },
  };

  if (payload.kind === "doughnut") {
    const series = payload.series[0];
    const folded = foldToPalette(payload.labels, series?.values ?? []);
    return {
      data: {
        labels: folded.labels,
        datasets: [{ data: folded.values, backgroundColor: folded.colors, borderWidth: 0 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: { legend: claudeChartTheme.legend, tooltip: { ...claudeChartTheme.tooltip, callbacks: tooltipCallbacks } },
      },
    };
  }

  const colors = payload.series.map((_, i) => claudeChartPalette[i % claudeChartPalette.length]);
  return {
    data: {
      labels: payload.labels.map((l) => String(l ?? "")),
      datasets: payload.series.map((s, i) => ({
        label: s.label,
        data: s.values,
        backgroundColor: colors[i],
        borderRadius: 6,
        maxBarThickness: 36,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: payload.horizontal ? "y" : "x",
      plugins: { legend: claudeChartTheme.legend, tooltip: { ...claudeChartTheme.tooltip, callbacks: tooltipCallbacks } },
      scales: payload.horizontal
        ? { x: claudeChartTheme.scales.y, y: { ...claudeChartTheme.scales.x, beginAtZero: true } }
        : claudeChartTheme.scales,
    },
  };
};
