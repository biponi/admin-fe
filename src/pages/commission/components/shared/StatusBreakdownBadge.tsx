import { Badge } from "../../../../components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../components/ui/tooltip";
import { CommissionStatusBadge } from "./CommissionStatusBadge";

interface StatusBreakdownBadgeProps {
  breakdown: {
    [status: string]: { count: number; amount: number };
  };
  className?: string;
}

export const StatusBreakdownBadge = ({
  breakdown,
  className = "",
}: StatusBreakdownBadgeProps) => {
  const totalItems = Object.values(breakdown).reduce(
    (sum, item) => sum + item.count,
    0
  );

  if (totalItems === 0) {
    return <CommissionStatusBadge status="pending" className={className} />;
  }

  // Get the dominant status (highest count)
  const dominantStatus = Object.entries(breakdown).reduce(
    (max, [status, data]) =>
      data.count > max[1].count ? [status, data] : max,
    ["", { count: 0, amount: 0 }]
  )[0];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            <CommissionStatusBadge
              status={dominantStatus as any}
              className={className}
            />
            <span className="text-xs text-muted-foreground">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="p-3" sideOffset={5}>
          <div className="space-y-2">
            <p className="font-medium text-sm">Status Breakdown</p>
            {Object.entries(breakdown).map(([status, data]) => (
              <div
                key={status}
                className="flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-2">
                  <CommissionStatusBadge status={status as any} />
                  <span>{data.count}</span>
                </div>
                <span className="font-mono">৳{data.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
