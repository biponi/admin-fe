import { useEffect, useRef, useState, ReactNode } from "react";
import { Badge } from "../../../components/ui/badge";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { TimelineEvent } from "../../../api/stockTimeline";
import { useIsMobile } from "../../../hooks/use-mobile";
import {
  ACTION_BADGE,
  ACTION_SOLID,
  NODE_STYLES,
  TimelineEmptyState,
  changePillClass,
  dayLabel,
  formatChange,
  getEventIcon,
  groupByDay,
} from "./timelineShared";

interface QuantityTimelineRailProps {
  items: TimelineEvent[];
  onSelect: (event: TimelineEvent) => void;
}

// reveal-on-scroll wrapper (fade + slide up, staggered)
const useInView = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, inView };
};

const Reveal = ({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-500 ease-out ${
        inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}>
      {children}
    </div>
  );
};

const QuantityTimelineRail = ({
  items,
  onSelect,
}: QuantityTimelineRailProps) => {
  const isMobile = useIsMobile();
  // Product Created always first, remaining events keep their API order
  const ordered = [...items].sort((a, b) => {
    const aFirst = a.movementType === "creation" ? 0 : 1;
    const bFirst = b.movementType === "creation" ? 0 : 1;
    return aFirst - bFirst;
  });
  const groups = groupByDay(ordered);

  if (groups.length === 0) {
    return <TimelineEmptyState />;
  }

  return (
    <div className='px-4 sm:px-6 py-6'>
      {groups.map((group) => {
        const isTodayLabel = dayLabel(group.date) === "Today";
        return (
          <div key={group.key} className='mb-12 last:mb-0'>
            {/* Day header (centered on the line for the zigzag layout) */}
            <Reveal>
              <div
                className={`relative flex items-center mb-8 ${
                  isMobile ? "justify-start" : "justify-center"
                }`}>
                {!isMobile && (
                  <span
                    aria-hidden
                    className='absolute left-0 right-0 top-1/2 h-px bg-slate-200'
                  />
                )}
                <span
                  className={`relative z-10 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide shadow-sm ring-4 ring-white ${
                    isTodayLabel
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}>
                  {dayLabel(group.date)}
                </span>
              </div>
            </Reveal>

            {/* Events: center spine with alternating cards */}
            <ul className='relative'>
              {!isMobile && (
                <span
                  aria-hidden
                  className='absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-slate-200'
                />
              )}

              {group.events.map((event, index) => {
                const nodeColor =
                  NODE_STYLES[event.movementType] || "bg-slate-500";
                const onLeft = !isMobile && index % 2 === 1;

                return (
                  <li key={event.id} className='relative flex items-stretch'>
                    {/* connector from spine to the card */}
                    {!isMobile && (
                      <span
                        aria-hidden
                        className={`absolute top-7 h-px bg-slate-300 ${
                          onLeft ? "right-1/2 mr-5 w-11" : "left-1/2 ml-5 w-11"
                        }`}
                      />
                    )}

                    {/* spine node */}
                    <div
                      className={`relative z-10 mt-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm ring-4 ring-white ${
                        isMobile ? "" : "absolute left-1/2 -translate-x-1/2"
                      } ${nodeColor}`}>
                      {getEventIcon(event.movementType, "h-4 w-4")}
                    </div>

                    {/* card slot */}
                    <div
                      className={`${
                        isMobile
                          ? "ml-4 flex-1"
                          : `w-1/2 ${onLeft ? "pr-16" : "pl-16 ml-auto"}`
                      }`}>
                      <Reveal delay={(index % 5) * 70}>
                        <button
                          type='button'
                          onClick={() => onSelect(event)}
                          className={`group/card block w-full max-w-[420px] rounded-xl border bg-white p-4 text-left transition-all duration-150 border-slate-200 hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 mb-6 ${
                            !isMobile && onLeft ? "ml-auto" : ""
                          }`}>
                          <div className='flex flex-wrap items-start justify-between gap-2'>
                            <div className='min-w-0'>
                              <div className='flex flex-wrap items-center gap-2'>
                                <Badge
                                  variant='outline'
                                  className={`h-6 px-2.5 text-[11px] font-semibold ${
                                    ACTION_BADGE[event.movementType] || ""
                                  }`}>
                                  {event.label}
                                </Badge>
                                <Badge
                                  variant='outline'
                                  className={`h-6 px-2.5 text-xs font-bold ${
                                    ACTION_SOLID[event.movementType] || ""
                                  }`}>
                                  Qty {event.impact.after ?? "-"}
                                </Badge>
                                <span
                                  className='truncate text-sm font-semibold text-slate-900'
                                  title={event.reference.display || ""}>
                                  {event.reference.display ||
                                    "Internal event"}
                                </span>
                              </div>
                              {event.reason && (
                                <p className='mt-1 truncate text-xs text-slate-500'>
                                  {event.reason}
                                </p>
                              )}
                            </div>
                            <span className='shrink-0 text-xs font-medium text-slate-400'>
                              {format(new Date(event.createdAt), "HH:mm")}
                            </span>
                          </div>

                          {/* quantity flow */}
                          <div className='mt-3 flex flex-wrap items-center gap-2'>
                            <span className='inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600'>
                              {event.impact.before ?? "-"}
                            </span>
                            <ArrowRight className='h-3.5 w-3.5 text-slate-400' />
                            <span
                              className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-bold ${changePillClass(
                                event.impact.change,
                              )}`}>
                              {formatChange(event.impact.change)}
                            </span>
                            <ArrowRight className='h-3.5 w-3.5 text-slate-400' />
                            <span className='inline-flex items-center rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700'>
                              {event.impact.after ?? "-"}
                            </span>

                            <span className='ml-auto flex items-center gap-3 text-[11px] text-slate-500'>
                              {event.variationCount > 0 && (
                                <span className='rounded bg-slate-100 px-1.5 py-0.5'>
                                  {event.variationCount} variant
                                  {event.variationCount > 1 ? "s" : ""}
                                </span>
                              )}
                              <span className='capitalize'>
                                {event.performedBy || "system"}
                              </span>
                            </span>
                          </div>
                        </button>
                      </Reveal>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default QuantityTimelineRail;
