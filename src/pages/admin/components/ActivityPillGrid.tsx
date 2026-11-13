import React, { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import { claude, claudeRamp, claudeRampEmpty } from "../../../lib/claude";

export interface ActivityPillDay {
  date: string;
  count: number;
}

interface ActivityPillGridProps {
  /** Accepts ActivityTrend[] or ActivityStatsResponse.byDay entries. */
  days: ActivityPillDay[];
  title?: string;
  totalDays?: number;
  showLegend?: boolean;
  showDayLabels?: boolean;
  className?: string;
}

/** Tiny width observer so the grid always fits its box. */
const useElementWidth = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
};

const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];
const GAP = 2;
const MIN_CELL = 8;
const MAX_CELL = 14;

/**
 * GitHub-style 90-day activity grid. Cells are sized from the measured
 * container width (clamped 8–14px) so the grid always fits the box
 * without overflowing or scrolling.
 */
export const ActivityPillGrid: React.FC<ActivityPillGridProps> = ({
  days,
  title,
  totalDays = 90,
  showLegend = true,
  showDayLabels = true,
  className = "",
}) => {
  const { ref, width } = useElementWidth();

  const { weeks, monthLabels, cellSize } = useMemo(() => {
    const data: Record<string, number> = {};
    days.forEach((d) => {
      data[dayjs(d.date).format("YYYY-MM-DD")] = d.count;
    });

    const start = dayjs().subtract(totalDays - 1, "day");
    const weeks: { date: dayjs.Dayjs; count: number }[][] = [];
    let currentWeek: { date: dayjs.Dayjs; count: number }[] = [];

    for (let i = 0; i < totalDays; i++) {
      const date = start.add(i, "day");
      if (i > 0 && date.day() === 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push({ date, count: data[date.format("YYYY-MM-DD")] || 0 });
    }
    if (currentWeek.length > 0) weeks.push(currentWeek);

    // Month labels keyed to week index (one per month change).
    const monthLabels: { label: string; weekIndex: number }[] = [];
    weeks.forEach((week, weekIndex) => {
      const firstDay = week[0];
      if (!firstDay) return;
      const label = firstDay.date.format("MMM");
      const last = monthLabels[monthLabels.length - 1];
      if (!last || last.label !== label) {
        monthLabels.push({ label, weekIndex });
      }
    });

    // Fit-the-box cell sizing.
    const gutter = showDayLabels ? 28 : 0;
    const cell = width
      ? Math.max(
          MIN_CELL,
          Math.min(
            MAX_CELL,
            Math.floor(
              (width - gutter - (weeks.length - 1) * GAP) / weeks.length
            )
          )
        )
      : MIN_CELL;

    return { weeks, monthLabels, cellSize: cell };
  }, [days, totalDays, width, showDayLabels]);

  const max = useMemo(
    () => Math.max(...days.map((d) => d.count), 1),
    [days]
  );
  const levelFor = (count: number) =>
    count === 0 ? -1 : Math.min(claudeRamp.length - 1, Math.ceil(count / (max / claudeRamp.length)) - 1);
  const colorFor = (count: number) =>
    count === 0 ? claudeRampEmpty : claudeRamp[levelFor(count)];

  return (
    <div className={`space-y-2 ${className}`}>
      {title && <p className={claude.microLabel}>{title}</p>}

      <div ref={ref} className='min-w-0 overflow-hidden'>
        {/* Month labels */}
        <div
          className='flex'
          style={{
            gap: GAP,
            marginLeft: showDayLabels ? 28 : 0,
            marginBottom: 4,
          }}>
          {weeks.map((week, weekIndex) => {
            const label = monthLabels.find((m) => m.weekIndex === weekIndex);
            return (
              <div
                key={weekIndex}
                style={{ width: cellSize }}
                className='text-[9px] leading-3 text-[#8A877D] font-medium whitespace-nowrap'>
                {label?.label || ""}
              </div>
            );
          })}
        </div>

        {/* Grid */}
        <TooltipProvider delayDuration={100}>
          <div className='flex' style={{ gap: GAP }}>
            {showDayLabels && (
              <div className='flex flex-col shrink-0' style={{ gap: GAP, width: 24 }}>
                {DAY_LABELS.map((label, index) => (
                  <div
                    key={index}
                    style={{ height: cellSize }}
                    className='flex items-center justify-end text-[9px] leading-none text-[#8A877D] font-medium pr-1'>
                    {label}
                  </div>
                ))}
              </div>
            )}
            <div className='flex' style={{ gap: GAP }}>
              {weeks.map((week, wi) => (
                <div key={wi} className='flex flex-col' style={{ gap: GAP }}>
                  {week.map((day, di) => (
                    <Tooltip key={di}>
                      <TooltipTrigger asChild>
                        <div
                          role='img'
                          aria-label={`${day.date.format("MMM DD, YYYY")}: ${day.count} activities`}
                          style={{
                            width: cellSize,
                            height: cellSize,
                            backgroundColor: colorFor(day.count),
                          }}
                          className='rounded-[2px] hover:ring-1 hover:ring-[#D8D3C8] transition-shadow cursor-default'
                        />
                      </TooltipTrigger>
                      <TooltipContent side='top' className={claude.tooltip}>
                        <p className='font-semibold'>
                          {day.date.format("MMM DD, YYYY")}
                        </p>
                        <p className='text-white/70'>
                          {day.count} {day.count === 1 ? "activity" : "activities"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </TooltipProvider>
      </div>

      {showLegend && (
        <div
          className={`flex items-center gap-1.5 ${claude.microLabel} normal-case tracking-normal`}>
          <span className='text-[#8A877D]'>Less</span>
          <div className='flex' style={{ gap: GAP }}>
            <div
              className='w-[10px] h-[10px] rounded-[2px]'
              style={{ backgroundColor: claudeRampEmpty }}
            />
            {claudeRamp.map((color) => (
              <div
                key={color}
                className='w-[10px] h-[10px] rounded-[2px]'
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className='text-[#8A877D]'>More</span>
        </div>
      )}
    </div>
  );
};
