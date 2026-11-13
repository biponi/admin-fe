import { cn } from "../../lib/utils";
import {
  CARD_CLASS,
  CARD_HEADER_CLASS,
  EYEBROW_CLASS,
  getRiskTheme,
} from "./fraudTheme";
import type { LucideIcon } from "lucide-react";

interface FraudStatCardProps {
  label: string;
  value: number | string;
  /** Risk level accent for the icon tile (omit for neutral slate) */
  level?: string;
  icon?: LucideIcon;
  sub?: string;
  className?: string;
}

/** Dashboard stat tile — aiSeo card with a header band and tabular numbers */
const FraudStatCard = ({
  label,
  value,
  level,
  icon: Icon,
  sub,
  className,
}: FraudStatCardProps) => {
  const theme = getRiskTheme(level);

  return (
    <div className={cn(CARD_CLASS, className)}>
      <div className={cn(CARD_HEADER_CLASS, "flex items-center gap-2", theme.cardHeader)}>
        {Icon ? (
          <div
            className={cn(
              "flex items-center justify-center w-6 h-6 rounded-md text-white",
              level ? theme.accentBg : "bg-slate-500 dark:bg-slate-600"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
          </div>
        ) : null}
        <span className={cn(EYEBROW_CLASS, level ? theme.accentText : "")}>
          {label}
        </span>
      </div>
      <div className="px-3 py-3">
        <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums leading-none">
          {value}
        </div>
        {sub ? (
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {sub}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FraudStatCard;
