import { ShieldCheck, Shield, ShieldAlert, Ban } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RiskLevel } from "../../api/fraud";

/**
 * Single source of truth for fraud risk visuals — every surface that shows
 * risk info (order tables, sheets, drawers, the fraud page) renders from
 * this config instead of hand-rolling its own color maps.
 *
 * Palette follows the aiSeo design language: slate neutrals, emerald/amber/
 * rose accents, border-based depth (no shadows), uppercase micro-labels.
 */

export interface RiskTheme {
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  // Pill badge (RiskBadge)
  badge: string;
  // Solid accent used for icon tiles / emphasis
  accentBg: string;
  accentText: string;
  // Card with header band (FraudStatCard / detail sections)
  card: string;
  cardHeader: string;
  // Full-width banner
  banner: string;
  // Progress bar fill
  barFill: string;
}

export const FRAUD_RISK_THEME: Record<RiskLevel, RiskTheme> = {
  green: {
    label: "Low Risk",
    shortLabel: "Low",
    icon: ShieldCheck,
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    accentBg: "bg-emerald-600",
    accentText: "text-emerald-600 dark:text-emerald-400",
    card: "border-emerald-200 dark:border-emerald-800",
    cardHeader: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900",
    banner:
      "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200",
    barFill: "bg-emerald-500",
  },
  yellow: {
    label: "Medium Risk",
    shortLabel: "Medium",
    icon: Shield,
    badge:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    accentBg: "bg-amber-500",
    accentText: "text-amber-600 dark:text-amber-400",
    card: "border-amber-200 dark:border-amber-800",
    cardHeader: "bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900",
    banner:
      "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200",
    barFill: "bg-amber-500",
  },
  red: {
    label: "High Risk",
    shortLabel: "High",
    icon: ShieldAlert,
    badge:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
    accentBg: "bg-rose-600",
    accentText: "text-rose-600 dark:text-rose-400",
    card: "border-rose-200 dark:border-rose-800",
    cardHeader: "bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900",
    banner:
      "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200",
    barFill: "bg-rose-500",
  },
};

/** Fallback for missing/unknown levels — treated as unassessed */
export const DEFAULT_RISK_THEME: RiskTheme = {
  ...FRAUD_RISK_THEME.green,
  label: "Not Analyzed",
  shortLabel: "N/A",
  icon: Shield,
  badge:
    "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  barFill: "bg-slate-400",
};

export const getRiskTheme = (level?: string | null): RiskTheme =>
  (level && FRAUD_RISK_THEME[level as RiskLevel]) || DEFAULT_RISK_THEME;

/** Blocked (manual fraud group) visuals — intentionally heavier than red */
export const BLOCKED_THEME = {
  label: "Blocked",
  icon: Ban,
  badge:
    "bg-rose-600 text-white border-rose-600 dark:bg-rose-700 dark:border-rose-700",
  banner:
    "bg-rose-600 border-rose-600 text-white dark:bg-rose-700 dark:border-rose-700",
  chip: "bg-rose-600/10 text-rose-700 border-rose-300 dark:text-rose-300",
};

/** aiSeo-style eyebrow micro-label */
export const EYEBROW_CLASS =
  "text-[10px] font-semibold uppercase tracking-wider text-slate-400";

/** Shared card primitives (borders over shadows, aiSeo style) */
export const CARD_CLASS =
  "rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden";
export const CARD_HEADER_CLASS =
  "px-3 py-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50";

/** Human date formatting shared across fraud surfaces */
export const formatFraudDate = (value?: string | Date | null): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** Days remaining on a temporary fraud-group entry */
export const expiryLabel = (expiresAt?: string | null): string => {
  if (!expiresAt) return "Permanent";
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return `Expires in ${days} day${days === 1 ? "" : "s"}`;
};
