/**
 * Desktop stat cards row — claude-themed tiles (ink values, accent icon
 * tiles). Values come from the shared analyticsConfig builders.
 */
import { claude } from "../../../../lib/claude";
import { cn } from "../../../../lib/utils";
import {
  buildStatsData,
  formatStatValue,
  type AnalyticsStat,
} from "./analyticsConfig";
import type { StockSummaryResponse } from "../../../interface";

const StatCard = ({ stat }: { stat: AnalyticsStat }) => (
  <div
    className={cn(
      claude.card,
      "px-4 py-4 flex items-center gap-3 hover:border-[#D8D3C8] transition-colors",
    )}>
    <div className={cn(claude.iconTile, "shrink-0")}>{stat.icon}</div>
    <div className='min-w-0'>
      <p className='text-xl font-semibold text-[#141413] leading-none tabular-nums truncate'>
        {formatStatValue(stat)}
      </p>
      <p className='text-xs text-[#8A877D] mt-1 truncate'>{stat.label}</p>
    </div>
  </div>
);

export const StatCardsRow = ({
  summary,
}: {
  summary: StockSummaryResponse | null;
}) => (
  <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
    {buildStatsData(summary).map((stat) => (
      <StatCard key={stat.key} stat={stat} />
    ))}
  </div>
);

export default StatCardsRow;
