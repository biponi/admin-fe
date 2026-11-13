/**
 * Shared claude-themed card wrapper for chart.js canvases.
 *
 * Owns the responsive canvas container (no fixed pixel heights), the
 * card header, and empty/loading states. Charts pass data + options;
 * `maintainAspectRatio: false` is enforced so the height classes drive
 * sizing.
 */
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { claude } from "../../../../../lib/claude";
import { ReportEmptyState } from "../reportScaffold/ReportStates";
import { cn } from "../../../../../lib/utils";

interface ClaudeChartCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** "bar" (fixed responsive heights) | "doughnut" (square, centered) */
  variant?: "bar" | "doughnut";
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  /** content rendered above the canvas (stat tiles, notes) */
  header?: ReactNode;
  /** content rendered below the canvas (footnotes, legends) */
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const ClaudeChartCard = ({
  title,
  description,
  icon: Icon,
  variant = "bar",
  isEmpty = false,
  emptyTitle = "No data available",
  emptyDescription = "There is nothing to chart yet.",
  header,
  footer,
  children,
  className,
}: ClaudeChartCardProps) => (
  <div className={cn(claude.card, "p-4 md:p-5 space-y-4", className)}>
    <div className='flex items-center gap-3'>
      {Icon && (
        <div className={cn(claude.iconTile, "shrink-0")}>
          <Icon className='h-4 w-4' />
        </div>
      )}
      <div className='min-w-0'>
        <p className={cn(claude.title, "truncate")}>{title}</p>
        {description && (
          <p className='text-xs text-[#8A877D] truncate'>{description}</p>
        )}
      </div>
    </div>

    {header}

    {isEmpty ? (
      <ReportEmptyState title={emptyTitle} description={emptyDescription} />
    ) : (
      <div
        className={cn(
          variant === "doughnut"
            ? "aspect-square max-w-[320px] mx-auto"
            : "h-64 md:h-80 relative",
        )}>
        {children}
      </div>
    )}

    {footer}
  </div>
);

export default ClaudeChartCard;
