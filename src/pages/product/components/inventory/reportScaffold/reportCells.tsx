/**
 * Shared cell renderers for report tables.
 *
 * Pure presentational components referenced from column configs so the
 * 17 report components stay declarative. Text wears ink tokens, never
 * series/status colors; status colors ship with icon + label.
 */
import type { ReactNode } from "react";
import { Star, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatRelativeTime,
} from "../../../../../utils/inventoryReportUtils";
import { claude } from "../../../../../lib/claude";
import { statusColors } from "../../../../../lib/claudeChart";
import { cn } from "../../../../../lib/utils";

// ─── Numeric cells (right-aligned, tabular) ─────────────────────────────────

export const NumberCell = ({
  value,
  unit,
  className,
}: {
  value: number | undefined;
  unit?: string;
  className?: string;
}) => (
  <span className={cn("tabular-nums text-[#141413]", className)}>
    {formatNumber(value)}
    {unit && (
      <span className='ml-1 text-xs text-[#8A877D] font-normal'>{unit}</span>
    )}
  </span>
);

export const CurrencyCell = ({ value }: { value: number | undefined }) => (
  <span className='tabular-nums text-[#141413] font-medium'>
    {formatCurrency(value)}
  </span>
);

export const PercentCell = ({
  value,
  decimals = 1,
}: {
  value: number | string | undefined;
  decimals?: number;
}) => {
  const n = Number(value);
  return (
    <span className='tabular-nums text-[#141413]'>
      {value === undefined || value === null || Number.isNaN(n)
        ? "—"
        : `${n.toFixed(decimals)}%`}
    </span>
  );
};

// ─── Text cells ──────────────────────────────────────────────────────────────

export const DateCell = ({ value }: { value: string | null | undefined }) => (
  <span className='text-[13px] text-[#57554D] whitespace-nowrap'>
    {value ? formatDate(value) : "—"}
  </span>
);

export const RelativeTimeCell = ({
  value,
}: {
  value: string | null | undefined;
}) => (
  <span className='text-[13px] text-[#57554D] whitespace-nowrap'>
    {value ? formatRelativeTime(value) : "Never"}
  </span>
);

export const MonoCell = ({
  value,
}: {
  value: string | null | undefined;
}) => (
  <span className='font-mono text-xs text-[#57554D]'>
    {value || "—"}
  </span>
);

export const ProductNameCell = ({
  name,
  hasVariation,
}: {
  name: string;
  hasVariation?: boolean;
}) => (
  <div className='flex items-center gap-2 min-w-0'>
    <span className='truncate max-w-[240px] font-medium text-[#141413]'>
      {name}
    </span>
    {hasVariation && <span className={cn("shrink-0", claude.badge)}>Variants</span>}
  </div>
);

// ─── Status / semantic cells ─────────────────────────────────────────────────

type Tone = keyof typeof statusColors;

export const ToneBadge = ({
  tone,
  children,
  icon,
}: {
  tone: Tone;
  children: ReactNode;
  icon?: ReactNode;
}) => {
  const c = statusColors[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
      )}
      style={{ color: c.text, backgroundColor: c.bg, borderColor: c.border }}>
      {icon}
      {children}
    </span>
  );
};

/** Stock level badge — 3-step reserved status set with icon + label. */
export const StockBadgeCell = ({ stock }: { stock: number | undefined }) => {
  const s = stock ?? 0;
  if (s <= 0) {
    return (
      <ToneBadge tone='bad' icon={<XCircle className='h-3 w-3' />}>
        Out of stock
      </ToneBadge>
    );
  }
  if (s <= 10) {
    return (
      <ToneBadge tone='warn' icon={<AlertTriangle className='h-3 w-3' />}>
        {formatNumber(s)} left
      </ToneBadge>
    );
  }
  return (
    <ToneBadge tone='good' icon={<CheckCircle2 className='h-3 w-3' />}>
      {formatNumber(s)} in stock
    </ToneBadge>
  );
};

export const ActiveBadgeCell = ({ active }: { active: boolean | null }) => (
  <ToneBadge tone={active !== false ? "good" : "neutral"}>
    {active !== false ? "Active" : "Inactive"}
  </ToneBadge>
);

export const RatingCell = ({
  rating,
  votes,
}: {
  rating: number | string | undefined;
  votes?: number;
}) => {
  const n = Number(rating);
  return (
  <span className='inline-flex items-center gap-1.5 whitespace-nowrap'>
    <Star className='h-3.5 w-3.5 fill-[#B8860B] text-[#B8860B]' />
    <span className='tabular-nums font-medium text-[#141413]'>
      {rating === undefined || rating === null || Number.isNaN(n)
        ? "—"
        : n.toFixed(1)}
    </span>
    {votes !== undefined && (
      <span className='text-xs text-[#8A877D]'>({formatNumber(votes)})</span>
    )}
  </span>
  );
};

/** In-cell magnitude bar (single coral hue) — e.g. share of sales. */
export const ProgressBarCell = ({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label?: string;
}) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className='flex items-center gap-2 min-w-[140px]'>
      <div className='h-1.5 flex-1 rounded-full bg-[#F5F1EA] overflow-hidden min-w-[60px]'>
        <div
          className='h-full rounded-full bg-[#C96442]'
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className='text-xs tabular-nums text-[#8A877D] w-11 text-right'>
        {label ?? `${pct.toFixed(1)}%`}
      </span>
    </div>
  );
};
