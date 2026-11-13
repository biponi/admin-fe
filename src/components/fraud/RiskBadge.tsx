import { cn } from "../../lib/utils";
import { getRiskTheme } from "./fraudTheme";

interface RiskBadgeProps {
  level?: string | null;
  /** Show "Low/Medium/High" instead of "Low Risk/Medium Risk/High Risk" */
  compact?: boolean;
  className?: string;
}

/** Pill badge for the computed/manual risk level (green/yellow/red) */
const RiskBadge = ({ level, compact = false, className }: RiskBadgeProps) => {
  const theme = getRiskTheme(level);
  const Icon = theme.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap",
        theme.badge,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {compact ? theme.shortLabel : theme.label}
    </span>
  );
};

export default RiskBadge;
