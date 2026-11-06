import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { CalendarRange, LocateFixed, Pause, Play } from "lucide-react";
import { TimelineEvent } from "../../../api/stockTimeline";
import {
  NODE_STYLES,
  TimelineEmptyState,
  formatChange,
} from "./timelineShared";

type Zoom = "auto" | "day" | "week" | "month";
type Granularity = Exclude<Zoom, "auto">;

interface QuantityTimelineBoardProps {
  items: TimelineEvent[];
  onSelect: (event: TimelineEvent) => void;
}

const COL_W: Record<Granularity, number> = { day: 56, week: 80, month: 112 };
const LEFT_W = 280;
const MIN_CANVAS = 720;
const DAY_MS = 86400000;

const startOfDayLocal = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const monthKeyOf = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;

interface Column {
  start: Date;
  end: Date;
  label: string;
  monthKey: string;
  weekend: boolean;
}

interface GanttRow {
  event: TimelineEvent;
  start: number;
  end: number;
}

const QuantityTimelineBoard = ({
  items,
  onSelect,
}: QuantityTimelineBoardProps) => {
  const [zoom, setZoom] = useState<Zoom>("auto");
  const [autoScroll, setAutoScroll] = useState(false);
  const pausedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // chronological order for the chart, Product Created always pinned first
  const sorted = useMemo(
    () =>
      [...items].sort((a, b) => {
        const aFirst = a.movementType === "creation" ? 0 : 1;
        const bFirst = b.movementType === "creation" ? 0 : 1;
        if (aFirst !== bFirst) return aFirst - bFirst;
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }),
    [items],
  );

  const nowTime = Date.now();

  const { columns, granularity, rangeStart, rangeEnd, canvasWidth } =
    useMemo(() => {
      if (!sorted.length) {
        return {
          columns: [] as Column[],
          granularity: "day" as Granularity,
          rangeStart: 0,
          rangeEnd: 1,
          canvasWidth: MIN_CANVAS,
        };
      }

      const times = sorted.map((i) => new Date(i.createdAt).getTime());
      const minDate = startOfDayLocal(new Date(Math.min(...times)));
      // include "now" so the last bar (running stock) always fits the range
      const maxDate = new Date(Math.max(...times, Date.now()));
      const spanDays = Math.ceil(
        (maxDate.getTime() - minDate.getTime()) / DAY_MS,
      );

      let g: Granularity = "day";
      if (zoom !== "auto") g = zoom;
      else if (spanDays > 120) g = "month";
      else if (spanDays > 14) g = "week";

      const cols: Column[] = [];
      if (g === "day") {
        let cursor = minDate;
        while (cursor.getTime() <= maxDate.getTime()) {
          const next = addDays(cursor, 1);
          cols.push({
            start: cursor,
            end: next,
            label: format(cursor, "dd"),
            monthKey: monthKeyOf(cursor),
            weekend: cursor.getDay() === 0 || cursor.getDay() === 6,
          });
          cursor = next;
        }
      } else if (g === "week") {
        // weeks starting Sunday
        let cursor = addDays(minDate, -minDate.getDay());
        while (cursor.getTime() <= maxDate.getTime()) {
          const next = addDays(cursor, 7);
          cols.push({
            start: cursor,
            end: next,
            label: format(cursor, "dd MMM"),
            monthKey: monthKeyOf(cursor),
            weekend: false,
          });
          cursor = next;
        }
      } else {
        let cursor = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
        while (cursor.getTime() <= maxDate.getTime()) {
          const next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
          cols.push({
            start: cursor,
            end: next,
            label: format(cursor, "MMM"),
            monthKey: monthKeyOf(cursor),
            weekend: false,
          });
          cursor = next;
        }
      }

      const start = cols[0].start.getTime();
      const end = cols[cols.length - 1].end.getTime();
      const width = Math.max(cols.length * COL_W[g], MIN_CANVAS);

      return {
        columns: cols,
        granularity: g,
        rangeStart: start,
        rangeEnd: end,
        canvasWidth: width,
      };
    }, [sorted, zoom]);

  const pctOf = (time: number) =>
    ((time - rangeStart) / (rangeEnd - rangeStart)) * 100;

  const today = new Date();
  const todayTime = startOfDayLocal(today).getTime() + 12 * 3600000;
  const todayInRange =
    columns.length > 0 && todayTime >= rangeStart && todayTime <= rangeEnd;

  // bars: each event spans until the next event (last one runs to "now")
  const ganttRows: GanttRow[] = useMemo(
    () =>
      sorted.map((event, i) => {
        const start = new Date(event.createdAt).getTime();
        const nextStart =
          i + 1 < sorted.length
            ? new Date(sorted[i + 1].createdAt).getTime()
            : Math.max(nowTime, start + 3600000);
        const end = nextStart > start ? nextStart : start + 60000;
        return { event, start, end };
      }),
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [sorted, nowTime],
  );

  // scroll to the newest activity when data / scale changes
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !columns.length) return;
    el.scrollLeft = el.scrollWidth;
    //eslint-disable-next-line
  }, [columns.length, canvasWidth]);

  const scrollToToday = () => {
    const el = scrollRef.current;
    if (!el || !todayInRange) return;
    const x =
      LEFT_W + (pctOf(todayTime) / 100) * canvasWidth - el.clientWidth / 2;
    el.scrollTo({ left: Math.max(0, x), behavior: "smooth" });
  };

  // auto pan: horizontal + vertical, wraps to the start at the end
  useEffect(() => {
    if (!autoScroll) return;
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    let last = performance.now();
    const H_PPS = 28; // px / second horizontal
    const V_PPS = 18; // px / second vertical
    const tick = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      if (!pausedRef.current) {
        el.scrollLeft += H_PPS * dt;
        el.scrollTop += V_PPS * dt;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
          el.scrollLeft = 0;
        }
        if (el.scrollTop >= el.scrollHeight - el.clientHeight - 1) {
          el.scrollTop = 0;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoScroll]);

  if (!items.length) return <TimelineEmptyState />;

  // month bands
  const rows: (
    | { kind: "band"; key: string; label: string }
    | { kind: "event"; row: GanttRow }
  )[] = [];
  let lastMonth: string | null = null;
  for (const row of ganttRows) {
    const d = new Date(row.start);
    const key = monthKeyOf(d);
    if (key !== lastMonth) {
      rows.push({
        kind: "band",
        key: `band-${key}`,
        label: format(d, "MMMM yyyy"),
      });
      lastMonth = key;
    }
    rows.push({ kind: "event", row });
  }

  // group columns into header month cells
  const monthCells: { key: string; label: string; span: number }[] = [];
  for (const col of columns) {
    const last = monthCells[monthCells.length - 1];
    if (last && last.key === col.monthKey) {
      last.span += 1;
    } else {
      monthCells.push({
        key: `${col.monthKey}-${monthCells.length}`,
        label: format(col.start, "MMMM yyyy"),
        span: 1,
      });
    }
  }

  const zoomOptions: { value: Zoom; label: string }[] = [
    { value: "auto", label: "Auto" },
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
  ];

  return (
    <div className='flex h-full min-h-0 flex-col'>
      {/* toolbar */}
      <div className='flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-2.5'>
        <div className='flex items-center gap-2 text-xs text-slate-500'>
          <CalendarRange className='h-4 w-4 text-indigo-600' />
          <span>
            {columns.length} {granularity}
            {columns.length === 1 ? "" : "s"} · bars show stock qty held until
            the next event
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={() => setAutoScroll((v) => !v)}
            title='Continuously pan the chart (pause on hover)'
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              autoScroll
                ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}>
            {autoScroll ? (
              <Pause className='h-3.5 w-3.5' />
            ) : (
              <Play className='h-3.5 w-3.5' />
            )}
            Auto-scroll
          </button>
          <div className='flex items-center rounded-lg border border-slate-200 p-0.5'>
            {zoomOptions.map((opt) => (
              <button
                key={opt.value}
                type='button'
                onClick={() => setZoom(opt.value)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  zoom === opt.value
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type='button'
            onClick={scrollToToday}
            disabled={!todayInRange}
            className='inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent'>
            <LocateFixed className='h-3.5 w-3.5' />
            Today
          </button>
        </div>
      </div>

      {/* gantt */}
      <div
        ref={scrollRef}
        onPointerEnter={() => {
          pausedRef.current = true;
        }}
        onPointerLeave={() => {
          pausedRef.current = false;
        }}
        className='min-h-0 flex-1 overflow-auto'>
        <div
          className='relative'
          style={{ width: LEFT_W + canvasWidth, minWidth: "100%" }}>
          {/* header */}
          <div className='flex border-b border-slate-200 bg-white'>
            <div
              className='sticky left-0 z-20 shrink-0 border-r border-slate-200 bg-white'
              style={{ width: LEFT_W }}>
              <div className='flex h-7 items-end px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400'>
                Event
              </div>
            </div>
            <div className='relative' style={{ width: canvasWidth }}>
              {/* month row */}
              <div className='flex h-7 border-b border-slate-100'>
                {monthCells.map((cell) => (
                  <div
                    key={cell.key}
                    className='flex items-center overflow-hidden border-l border-slate-100 px-2 text-[11px] font-semibold text-slate-500'
                    style={{ width: cell.span * COL_W[granularity] }}>
                    {cell.label}
                  </div>
                ))}
              </div>
              {/* column row */}
              <div className='flex h-8'>
                {columns.map((col, i) => (
                  <div
                    key={i}
                    className={`flex shrink-0 items-center justify-center border-l border-slate-100 text-[10px] font-medium ${
                      col.weekend
                        ? "bg-slate-50 text-slate-400"
                        : "text-slate-500"
                    }`}
                    style={{ width: COL_W[granularity] }}>
                    {col.label}
                  </div>
                ))}
                {todayInRange && (
                  <div
                    className='absolute bottom-0 z-10 -translate-x-1/2'
                    style={{
                      left: (pctOf(todayTime) / 100) * canvasWidth,
                    }}>
                    <span className='inline-flex -translate-y-1 items-center rounded-full bg-indigo-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm'>
                      Today
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* rows */}
          <div className='relative'>
            {/* today line */}
            {todayInRange && (
              <div
                aria-hidden
                className='pointer-events-none absolute inset-y-0 z-[5] w-px border-l border-dashed border-indigo-400'
                style={{
                  left: LEFT_W + (pctOf(todayTime) / 100) * canvasWidth,
                }}
              />
            )}

            {rows.map((entry) => {
              if (entry.kind === "band") {
                return (
                  <div key={entry.key} className='flex bg-slate-50/80'>
                    <div
                      className='sticky left-0 z-10 shrink-0 border-r border-slate-200 bg-slate-50 px-3 py-1.5'
                      style={{ width: LEFT_W }}>
                      <span className='text-[11px] font-semibold text-slate-600'>
                        {entry.label}
                      </span>
                    </div>
                    <div
                      className='border-l border-slate-200 py-1.5'
                      style={{
                        width: canvasWidth,
                        backgroundImage:
                          "repeating-linear-gradient(to right, #e2e8f0 0 1px, transparent 1px " +
                          COL_W[granularity] +
                          "px)",
                      }}
                    />
                  </div>
                );
              }

              const { event, start, end } = entry.row;
              const nodeColor =
                NODE_STYLES[event.movementType] || "bg-slate-500";
              const tooltip = [
                event.label,
                event.reference.display || "Internal event",
                format(new Date(start), "dd MMM yyyy, HH:mm"),
                `${formatChange(event.impact.change)} → Qty ${
                  event.impact.after ?? "-"
                }`,
                event.reason || "",
              ]
                .filter(Boolean)
                .join(" · ");

              const leftPct = pctOf(start);
              const widthPct = Math.max(pctOf(end) - leftPct, 0);
              const barPx = (widthPct / 100) * canvasWidth;
              // label always lives inside the bar; the bar only stretches to
              // fit it when the actual timeline span is shorter than the text
              const barLabel =
                barPx >= 132
                  ? `${formatChange(event.impact.change)} · Qty ${
                      event.impact.after ?? "-"
                    }`
                  : `Qty ${event.impact.after ?? "-"}`;

              return (
                <div
                  key={event.id}
                  role='button'
                  tabIndex={0}
                  title={tooltip}
                  onClick={() => onSelect(event)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(event);
                    }
                  }}
                  className='group flex cursor-pointer border-b border-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500'>
                  {/* left pane */}
                  <div
                    className='sticky left-0 z-50 flex h-11 shrink-0 items-center gap-2 border-r border-slate-200 bg-white px-3 group-hover:bg-slate-50'
                    style={{ width: LEFT_W }}>
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white ${nodeColor}`}
                    />
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-xs font-semibold text-slate-800'>
                        {event.label}
                      </p>
                      <p className='truncate text-[11px] text-slate-500'>
                        {event.reference.display ||
                          event.reason ||
                          "Internal event"}
                      </p>
                    </div>
                    <span className='shrink-0 text-[10px] font-bold text-slate-500'>
                      {format(new Date(start), "dd MMM, HH:mm")}
                    </span>
                  </div>

                  {/* canvas */}
                  <div
                    className='relative h-11 group-hover:bg-slate-50/60'
                    style={{
                      width: canvasWidth,
                      backgroundImage:
                        "repeating-linear-gradient(to right, #f1f5f9 0 1px, transparent 1px " +
                        COL_W[granularity] +
                        "px)",
                    }}>
                    {/* gantt node: single rounded bar holding its label */}
                    <div
                      className={`absolute top-1/2 z-10 flex -translate-y-1/2 items-center overflow-hidden rounded-full px-2.5 text-[10px] font-bold text-white shadow-sm transition-[filter] group-hover:brightness-110 ${nodeColor}`}
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        minWidth: 84,
                        height: 28,
                      }}>
                      <span className='whitespace-nowrap'>{barLabel}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantityTimelineBoard;
