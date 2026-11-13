/**
 * Claude-themed chart.js setup for the product analytics page.
 *
 * Centralises registration, the validated categorical palette, the
 * sequential coral ramp, and shared tooltip/legend/scale chrome so every
 * chart on the page reads as one system on the cream surface (#FAF9F6).
 * Consumers import { Bar, Doughnut } from here — never from
 * react-chartjs-2 directly.
 *
 * Palette validated with the dataviz six-checks validator against
 * #FAF9F6 (lightness band, chroma floor, CVD separation ≥ 12, ≥ 3:1
 * contrast). Categorical hues are assigned in fixed order, never cycled;
 * beyond slot 7 fold the tail into "Other" via foldToPalette().
 */
import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { claudeHex } from "./claude";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  ChartTooltip,
  ChartLegend,
);

export type { ChartOptions, ChartData };

/**
 * Sanitize chart data so all legend/axis labels are strings (or string arrays for multiline).
 * Chart.js legend plugin calls `reduce` if label is not a string, which throws on numbers or objects.
 */
const sanitizeChartData = <T extends ChartData<any>>(data: T): T => {
  if (!data || !data.labels) return data;
  return {
    ...data,
    labels: data.labels.map((label) => {
      if (Array.isArray(label)) {
        return label.map((item) => (item === null || item === undefined ? "" : String(item)));
      }
      return label === null || label === undefined ? "" : String(label);
    }),
  };
};

/**
 * Canvas-safe chart components.
 *
 * react-chartjs-2 can throw "Canvas is already in use" when a new Chart
 * attaches to a canvas that still holds a stale instance (StrictMode
 * double-mount, HMR module swaps, fast report switching). These wrappers
 * own the <canvas> and the ChartJS lifecycle directly: any instance still
 * bound to the canvas is destroyed via ChartJS.getChart() before a new
 * one is created, and the instance is always destroyed on unmount — so
 * the error class is unreachable.
 */
const createSafeChart =
  (type: "bar" | "doughnut") =>
  ({ data, options }: { data: ChartData<any>; options?: ChartOptions<any> }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<ChartJS | null>(null);

    // Create once; destroy any stale instance already bound to this canvas.
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      ChartJS.getChart(canvas)?.destroy();
      chartRef.current = new ChartJS(canvas, {
        type,
        data: sanitizeChartData(data),
        options,
      });
      return () => {
        chartRef.current?.destroy();
        chartRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type]);

    // Update in place when data/options change (effect-identity objects).
    useEffect(() => {
      const chart = chartRef.current;
      if (!chart) return;
      chart.data = sanitizeChartData(data);
      if (options) chart.options = options as ChartOptions<any>;
      chart.update();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, options]);

    return <canvas ref={canvasRef} />;
  };

export const SafeBar = createSafeChart("bar");
export const SafeDoughnut = createSafeChart("doughnut");

/** Categorical slots in fixed order — slot 1 harmonizes with the coral accent. */
export const claudeChartPalette = [
  "#C96442", // coral
  "#2E6FA3", // blue
  "#B8860B", // gold
  "#0E8F84", // teal
  "#7B5EA7", // violet
  "#2F9E44", // green
  "#B3365B", // rose
] as const;

/** Single-hue coral ramp, light → dark, for magnitude/ordinal encodings. */
export const claudeSequentialRamp = [
  "#E09B77",
  "#D97757",
  "#C96442",
  "#AE5535",
  "#7E3A1F",
] as const;

/** Fold labels/values longer than the palette into an "Other" bucket. */
export const foldToPalette = (
  labels: (string | number | unknown)[],
  values: number[],
): { labels: string[]; values: number[]; colors: string[] } => {
  const safeLabels = (labels || []).map((l) => (l === null || l === undefined ? "" : String(l)));
  const maxSlots = claudeChartPalette.length;
  if (safeLabels.length <= maxSlots) {
    return {
      labels: safeLabels,
      values,
      colors: safeLabels.map((_, i) => claudeChartPalette[i]),
    };
  }
  const kept = safeLabels.slice(0, maxSlots - 1);
  const keptValues = values.slice(0, maxSlots - 1);
  const otherValue = values.slice(maxSlots - 1).reduce((sum, v) => sum + v, 0);
  return {
    labels: [...kept, "Other"],
    values: [...keptValues, otherValue],
    colors: [
      ...claudeChartPalette.slice(0, maxSlots - 1),
      claudeHex.faintInk,
    ],
  };
};

/**
 * Reserved status colors for DOM badges (stock levels, severity pills).
 * Never use as chart series colors.
 */
export const statusColors = {
  good: { text: "#1A7F37", bg: "#EBF7EE", border: "#CDEBD4" },
  warn: { text: "#8A6A00", bg: "#FBF3D8", border: "#EEDFA8" },
  bad: { text: "#B3365B", bg: "#FBEFF3", border: "#F2D2DC" },
  neutral: { text: "#57554D", bg: "#F5F1EA", border: "#E8E4DC" },
} as const;

/** Shared tooltip / legend / scale chrome (text always in ink tokens). */
export const claudeChartTheme = {
  tooltip: {
    backgroundColor: "#141413",
    titleColor: "#FFFFFF",
    bodyColor: "#D8D3C8",
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    cornerRadius: 8,
    padding: 10,
    titleFont: { size: 12, weight: "bold" as const },
    bodyFont: { size: 12 },
    boxPadding: 4,
    usePointStyle: true,
    displayColors: true,
  },
  legend: {
    labels: {
      usePointStyle: true,
      pointStyle: "circle" as const,
      padding: 14,
      font: { size: 11 },
      color: claudeHex.mutedInk,
      boxWidth: 8,
      boxHeight: 8,
    },
  },
  scales: {
    x: {
      grid: { color: "#E8E4DC", drawTicks: false },
      border: { color: "#D8D3C8" },
      ticks: { color: "#8A877D", font: { size: 11 } },
    },
    y: {
      grid: { color: "#E8E4DC", drawTicks: false },
      border: { color: "#D8D3C8" },
      ticks: { color: "#8A877D", font: { size: 11 } },
      beginAtZero: true,
    },
  },
} as const;
