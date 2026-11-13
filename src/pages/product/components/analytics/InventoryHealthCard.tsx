/**
 * Desktop inventory health grid — claude.panel metrics with reserved
 * semantic tones (icon + badge), skeleton while loading.
 */
import { HeartPulse } from "lucide-react";
import { Skeleton } from "../../../../components/ui/skeleton";
import { claude } from "../../../../lib/claude";
import { cn } from "../../../../lib/utils";
import { formatNumber } from "../../../../utils/inventoryReportUtils";
import {
  buildHealthMetrics,
  type HealthTone,
} from "./analyticsConfig";
import type { InventoryHealthResponse } from "../../../../api/inventoryReport";

const toneClasses: Record<HealthTone, string> = {
  good: "bg-[#EBF7EE] text-[#1A7F37]",
  warn: "bg-[#FBF3D8] text-[#8A6A00]",
  bad: "bg-[#FBEFF3] text-[#B3365B]",
  neutral: "bg-[#F5F1EA] text-[#57554D]",
};

const badgeClasses: Record<HealthTone, string> = {
  good: "bg-[#EBF7EE] text-[#1A7F37]",
  warn: "bg-[#FBF3D8] text-[#8A6A00]",
  bad: "bg-[#FBEFF3] text-[#B3365B]",
  neutral: "bg-[#F5F1EA] text-[#57554D]",
};

export const InventoryHealthCard = ({
  health,
}: {
  health: InventoryHealthResponse | null;
}) => {
  const metrics = buildHealthMetrics(health);

  return (
    <div className={cn(claude.card, "p-4 md:p-5")}>
      <div className='mb-4'>
        <h2 className='flex items-center gap-2'>
          <HeartPulse className='h-4 w-4 text-[#D97757]' />
          <span className={claude.title}>Inventory health</span>
        </h2>
        <p className='text-xs text-[#8A877D] mt-1'>
          Real-time stock status across all product lines
        </p>
      </div>

      {metrics.length === 0 ? (
        <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={cn(claude.panel, "p-4")}>
              <Skeleton className='h-5 w-5 rounded bg-[#E8E4DC] mb-3' />
              <Skeleton className='h-3 w-20 rounded bg-[#E8E4DC] mb-2' />
              <Skeleton className='h-6 w-16 rounded bg-[#E8E4DC]' />
            </div>
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className={cn(claude.panel, "p-4 hover:bg-[#F5F1EA] transition-colors")}>
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-lg mb-3",
                  toneClasses[metric.tone],
                )}>
                {metric.icon}
              </span>
              <p className='text-xs text-[#57554D] mb-1'>{metric.label}</p>
              <p className='text-xl font-semibold text-[#141413] tabular-nums leading-none'>
                {formatNumber(metric.value)}
                <span className='text-sm font-normal text-[#8A877D] ml-1'>
                  {metric.unit}
                </span>
              </p>
              <span
                className={cn(
                  "inline-block mt-2 text-[11px] font-medium px-2 py-0.5 rounded-full",
                  badgeClasses[metric.tone],
                )}>
                {metric.badgeText}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryHealthCard;
