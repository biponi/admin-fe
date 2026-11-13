import { cn } from "../../lib/utils";
import { EYEBROW_CLASS, getRiskTheme } from "./fraudTheme";

interface RiskScoreBarProps {
  label: string;
  /** 0–100 */
  value: number;
  level?: string;
  suffix?: string;
  className?: string;
}

/** Labeled 0–100 progress bar in the aiSeo metric-row style */
const RiskScoreBar = ({
  label,
  value,
  level,
  suffix = "%",
  className,
}: RiskScoreBarProps) => {
  const theme = getRiskTheme(level);
  const clamped = Math.max(0, Math.min(100, value ?? 0));

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        <span className={EYEBROW_CLASS}>{label}</span>
        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
          {clamped}
          {suffix}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", theme.barFill)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

export default RiskScoreBar;
