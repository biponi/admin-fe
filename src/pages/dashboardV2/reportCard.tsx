import { TrendingDown, TrendingUp, Activity, ChevronDown } from "lucide-react";
import { BRAND_CONFIG } from "../../config/brand";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  accentBadgeClass,
  iconCircleClass,
  labelClass,
  pillClass,
  valueClass,
} from "./dashboardTheme";

/** Percentage delta between the previous and current period. */
export const calculateGrowthPercentage = (
  previousValue: number,
  currentValue: number
) => {
  if (previousValue === 0) {
    return currentValue > 0 ? 100 : 0;
  }
  return ((currentValue - previousValue) / previousValue) * 100;
};

export type DashboardPeriod = "today" | "lastWeek" | "lastMonth" | "last6Months";

const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  today: "Today",
  lastWeek: "This week",
  lastMonth: "Last month",
  last6Months: "6 months",
};

interface PillStatCardProps {
  title: string;
  subtitle?: string;
  previousValue?: number;
  currentValue: number;
  icon?: any;
  /** Currency/units prefix (defaults to the brand currency for money cards). */
  prefix?: string;
  suffix?: string;
  /** Compact tile (smaller value + icon) for secondary metrics. */
  compact?: boolean;
  /** When true, hides the misleading growth badge (no previous data). */
  hideGrowth?: boolean;
  /** Selected period label for the dropdown pill. */
  period?: DashboardPeriod;
  onPeriodChange?: (period: DashboardPeriod) => void;
}

/**
 * Stat tile in the reference design language: light-gray tile, gray label,
 * big bold value, white circular icon button, functional period pill and a
 * growth badge (reference: src/assets/fgfg.webp).
 */
const PillStatCard: React.FC<PillStatCardProps> = ({
  title,
  subtitle,
  previousValue,
  currentValue,
  icon: Icon = Activity,
  prefix = BRAND_CONFIG.currency + " ",
  suffix = "",
  compact = false,
  hideGrowth = false,
  period,
  onPeriodChange,
}) => {
  const hasPrevious =
    typeof previousValue === "number" && previousValue !== undefined;
  const growthPercentage = hasPrevious
    ? calculateGrowthPercentage(previousValue!, currentValue)
    : 0;

  return (
    <div className='bg-[#EFEDEB] rounded-3xl p-4 sm:p-5 flex flex-col gap-3 justify-between hover:bg-[#EAE7E4] transition-colors duration-200'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className={labelClass}>{title}</p>
          <p
            className={`${valueClass} ${
              compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
            } mt-1 truncate`}>
            {prefix}
            {currentValue.toLocaleString()}
            {suffix}
          </p>
          {subtitle && !compact && (
            <p className='text-[11px] text-[#9A9A98] mt-1 truncate'>
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`${iconCircleClass} ${
            compact ? "h-9 w-9" : ""
          } shrink-0 text-[#E1573F]`}>
          <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} strokeWidth={1.5} />
        </div>
      </div>

      <div className='flex items-center justify-between gap-2 flex-wrap'>
        {period && onPeriodChange ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`${pillClass} inline-flex items-center gap-1 px-3 h-7 text-xs font-medium text-[#1A1A1A] hover:bg-[#F7D9D2]/50 transition-colors`}>
                {PERIOD_LABELS[period]}
                <ChevronDown className='h-3 w-3' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start'>
              {(Object.keys(PERIOD_LABELS) as DashboardPeriod[]).map((p) => (
                <DropdownMenuItem
                  key={p}
                  onClick={() => onPeriodChange(p)}
                  className={
                    p === period ? "bg-[#F7D9D2]/60 focus:bg-[#F7D9D2]" : ""
                  }>
                  {PERIOD_LABELS[p]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span
            className={`${pillClass} inline-flex items-center px-3 h-7 text-xs font-medium text-[#9A9A98]`}>
            This period
          </span>
        )}

        {hasPrevious && !hideGrowth && (
          <span
            className={`${accentBadgeClass} inline-flex items-center gap-1 px-2.5 h-7 text-xs font-semibold`}>
            {growthPercentage > 0 ? (
              <TrendingUp className='h-3 w-3' strokeWidth={2} />
            ) : growthPercentage < 0 ? (
              <TrendingDown className='h-3 w-3' strokeWidth={2} />
            ) : null}
            {Math.abs(growthPercentage).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default PillStatCard;
