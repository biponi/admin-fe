import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import {
  Bar,
  Line,
  Pie,
  Doughnut,
  Radar,
  PolarArea,
  Scatter,
  Bubble,
} from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  ChartTooltip,
  ChartLegend
);

const CHART_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#14b8a6", "#f97316", "#3b82f6",
  "#a855f7", "#22c55e", "#eab308", "#dc2626", "#7c3aed",
];

const CHART_COLORS_ALPHA = [
  "rgba(99,102,241,0.15)", "rgba(16,185,129,0.15)", "rgba(245,158,11,0.15)",
  "rgba(239,68,68,0.15)", "rgba(139,92,246,0.15)", "rgba(6,182,212,0.15)",
  "rgba(236,72,153,0.15)", "rgba(20,184,166,0.15)", "rgba(249,115,22,0.15)",
  "rgba(59,130,246,0.15)",
];

const CHART_COLORS_BRIGHT = [
  "rgba(99,102,241,0.85)", "rgba(16,185,129,0.85)", "rgba(245,158,11,0.85)",
  "rgba(239,68,68,0.85)", "rgba(139,92,246,0.85)", "rgba(6,182,212,0.85)",
  "rgba(236,72,153,0.85)", "rgba(20,184,166,0.85)", "rgba(249,115,22,0.85)",
  "rgba(59,130,246,0.85)",
];

const defaultTooltipStyle = {
  backgroundColor: "rgba(255,255,255,0.98)",
  titleColor: "#1e293b",
  bodyColor: "#475569",
  borderColor: "#e2e8f0",
  borderWidth: 1,
  cornerRadius: 10,
  padding: 12,
  titleFont: { size: 13, weight: "bold" as const },
  bodyFont: { size: 12 },
  boxPadding: 4,
  usePointStyle: true,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

const defaultLegendStyle = {
  labels: {
    usePointStyle: true,
    pointStyle: "circle",
    padding: 16,
    font: { size: 12 },
    color: "#64748b",
  },
};

const defaultScaleOptions = {
  x: {
    grid: { color: "rgba(226,232,240,0.6)", drawBorder: false },
    ticks: { color: "#94a3b8", font: { size: 11 } },
  },
  y: {
    grid: { color: "rgba(226,232,240,0.6)", drawBorder: false },
    ticks: { color: "#94a3b8", font: { size: 11 } },
  },
};

export const ChartComponents = { Bar, Line, Pie, Doughnut, Radar, PolarArea, Scatter, Bubble };
export {
  CHART_COLORS,
  CHART_COLORS_ALPHA,
  CHART_COLORS_BRIGHT,
  defaultTooltipStyle,
  defaultLegendStyle,
  defaultScaleOptions,
};
