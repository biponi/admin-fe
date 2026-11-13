/**
 * Scoped design tokens for the renovated dashboard (reference: src/assets/fgfg.webp).
 *
 * These are dashboard-local — they intentionally do NOT touch the app's global
 * theme tokens (index.scss / tailwind.config.js). Literal Tailwind arbitrary
 * classes are used throughout so dark mode and app color themes don't leak in.
 */

export const DASHBOARD_THEME = {
  /** Outer page background */
  pageBg: "#E8E8E6",
  /** Rounded main container */
  containerBg: "#F5F4F2",
  /** Stat/chart tiles */
  tileBg: "#EFEDEB",
  /** White sub-cards, pills, icon circles */
  white: "#FFFFFF",
  /** Orange-red accent (CTAs, chart fills, active states) */
  accent: "#E1573F",
  /** Accent tints (chart fills, badges, avatars) */
  accentTint1: "#F2A992",
  accentTint2: "#F7D9D2",
  /** Dark elements (primary pill buttons, active chips) */
  ink: "#111111",
  /** Primary text */
  text: "#1A1A1A",
  /** Secondary/label text */
  label: "#9A9A98",
} as const;

/** Shared Tailwind class strings for the dashboard design language. */
export const tileClass = "bg-[#EFEDEB] rounded-3xl";
export const pillClass = "bg-white rounded-full";
export const labelClass = "text-[#9A9A98] text-xs font-medium";
export const valueClass = "text-[#1A1A1A] font-bold tracking-tight";
export const iconCircleClass =
  "h-11 w-11 rounded-full bg-white flex items-center justify-center";
export const accentBadgeClass = "bg-[#F7D9D2] text-[#E1573F] rounded-full";
export const inkPillClass = "bg-[#111111] text-white rounded-full";
