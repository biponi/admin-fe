/**
 * Claude web design-language tokens (claude.ai aesthetic).
 *
 * Precedent: the aiSeo components already ship the cream/ink surfaces
 * (#FAF9F6 / #141413); this module codifies the idiom with the coral
 * #D97757 accent and exports reusable Tailwind class strings.
 * Keep all literal class strings here (never build them dynamically)
 * so Tailwind's JIT picks them up from its src/** content globs.
 */
export const claudeHex = {
  surface: "#FAF9F6", // cream
  ink: "#141413", // warm near-black
  accent: "#D97757", // coral
  accentHover: "#C96442",
  accentDeep: "#B85A3D", // AA-safe coral for white text
  border: "#E8E4DC",
  borderStrong: "#D8D3C8",
  mutedInk: "#57554D", // secondary text
  faintInk: "#8A877D", // micro-labels
  hoverFill: "#F5F1EA",
} as const;

/** Sequential ramp for heatmaps (validated against cream surface). */
export const claudeRamp = ["#E09B77", "#D97757", "#AE5535", "#7E3A1F"] as const;
export const claudeRampEmpty = "#EDE4D6";

export const claude = {
  page: "bg-[#FAF9F6] text-[#141413]",
  card: "bg-white border border-[#E8E4DC] rounded-xl",
  panel: "bg-[#FAF9F6] border border-[#E8E4DC] rounded-lg",
  cardHeader: "border-b border-[#E8E4DC] bg-[#FAF9F6]",
  microLabel: "text-[10px] font-semibold uppercase tracking-wider text-[#8A877D]",
  body: "text-[13px] leading-relaxed text-[#141413]",
  secondary: "text-[13px] text-[#57554D]",
  title: "text-[15px] font-semibold tracking-tight text-[#141413]",
  iconTile:
    "flex h-8 w-8 items-center justify-center rounded-lg border border-[#D97757]/20 bg-[#D97757]/10 text-[#D97757]",
  btnPrimary: "bg-[#D97757] hover:bg-[#C96442] text-white text-[13px] font-medium rounded-md",
  btnDeep: "bg-[#B85A3D] hover:bg-[#A34E34] text-white text-[13px] font-medium rounded-md",
  btnOutline:
    "border border-[#E8E4DC] bg-white text-[#141413] hover:bg-[#F5F1EA] text-[13px] rounded-md",
  badge:
    "inline-flex items-center rounded-full border border-[#D97757]/30 bg-[#D97757]/10 px-2 py-0.5 text-[11px] font-medium text-[#9A4B2E]",
  selectedRow: "bg-[#D97757]/[0.06] hover:bg-[#D97757]/[0.09]",
  spinner: "h-6 w-6 animate-spin rounded-full border-2 border-[#E8E4DC] border-t-[#D97757]",
  input:
    "h-9 rounded-md border border-[#E8E4DC] bg-white text-[13px] text-[#141413] placeholder:text-[#8A877D] focus-visible:border-[#D97757] focus-visible:ring-[#D97757]/30",
  tooltip: "bg-[#141413] text-white text-xs rounded-md border border-white/10 shadow-none",
} as const;
