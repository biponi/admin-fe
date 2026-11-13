/**
 * Row of claude-themed stat tiles — replaces the old gradient summary
 * cards above report tables. Values in ink; icon tiles carry the accent.
 */
import type { ReactNode } from "react";
import { claude } from "../../../../../lib/claude";
import { cn } from "../../../../../lib/utils";

export interface ReportStatTile {
  label: string;
  value: ReactNode;
  sub?: string;
  /** semantic tone for the icon chip: good | warn | bad | neutral */
  tone?: "good" | "warn" | "bad" | "neutral";
  icon?: ReactNode;
}

const toneClasses = {
  good: "bg-[#EBF7EE] text-[#1A7F37]",
  warn: "bg-[#FBF3D8] text-[#8A6A00]",
  bad: "bg-[#FBEFF3] text-[#B3365B]",
  neutral: "bg-[#F5F1EA] text-[#57554D]",
} as const;

export const ReportStatTiles = ({
  tiles,
  className,
}: {
  tiles: ReportStatTile[];
  className?: string;
}) => (
  <div
    className={cn(
      "grid grid-cols-2 md:grid-cols-4 gap-2.5",
      className,
    )}>
    {tiles.map((tile) => (
      <div key={tile.label} className={cn(claude.panel, "px-3.5 py-3")}>
        <div className='flex items-center justify-between gap-2'>
          <p className={claude.microLabel}>{tile.label}</p>
          {tile.icon && (
            <span
              className={cn(
                "grid h-6 w-6 shrink-0 place-items-center rounded-full",
                toneClasses[tile.tone ?? "neutral"],
              )}>
              {tile.icon}
            </span>
          )}
        </div>
        <p className='mt-1.5 text-lg font-semibold text-[#141413] tabular-nums leading-none'>
          {tile.value}
        </p>
        {tile.sub && (
          <p className='mt-1 text-[11px] text-[#8A877D]'>{tile.sub}</p>
        )}
      </div>
    ))}
  </div>
);

export default ReportStatTiles;
