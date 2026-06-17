import { useEffect, useState } from "react";
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Timer,
  Zap,
  Info,
} from "lucide-react";
import { useBulkCommunication } from "../hooks/useBulkCommunication";
import { BulkMessageType } from "../interface";

interface QueueStatsProps {
  type: BulkMessageType;
}

const STATS_CONFIG = [
  {
    key: "waiting" as const,
    label: "Waiting",
    description: "Queued to process",
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-50",
    ring: "ring-blue-100",
    bar: "bg-blue-500",
  },
  {
    key: "active" as const,
    label: "Active",
    description: "Processing now",
    icon: Zap,
    color: "text-amber-600",
    bg: "bg-amber-50",
    ring: "ring-amber-100",
    bar: "bg-amber-500",
  },
  {
    key: "completed" as const,
    label: "Completed",
    description: "Successfully sent",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-100",
    bar: "bg-emerald-500",
  },
  {
    key: "failed" as const,
    label: "Failed",
    description: "After 3 retries",
    icon: XCircle,
    color: "text-rose-600",
    bg: "bg-rose-50",
    ring: "ring-rose-100",
    bar: "bg-rose-500",
  },
  {
    key: "delayed" as const,
    label: "Delayed",
    description: "Retry backoff",
    icon: Timer,
    color: "text-violet-600",
    bg: "bg-violet-50",
    ring: "ring-violet-100",
    bar: "bg-violet-500",
  },
];

const LEGEND = [
  { label: "Waiting", detail: "Jobs in the queue, not yet picked up" },
  { label: "Active", detail: "Jobs currently being processed" },
  { label: "Completed", detail: "Jobs successfully delivered" },
  { label: "Failed", detail: "Jobs that failed after 3 retry attempts" },
  { label: "Delayed", detail: "Jobs waiting for exponential-backoff retry" },
];

const QueueStats = ({ type }: QueueStatsProps) => {
  const { queueStats, fetchQueueStats } = useBulkCommunication(type);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchQueueStats().then(() => setLastUpdated(new Date()));
  }, [fetchQueueStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchQueueStats();
    setLastUpdated(new Date());
    setRefreshing(false);
  };

  const total = queueStats?.total ?? 0;
  const successRate =
    total > 0 ? ((queueStats!.completed / total) * 100).toFixed(1) : "0.0";
  const failureRate =
    total > 0 ? ((queueStats!.failed / total) * 100).toFixed(1) : "0.0";
  const pending = queueStats
    ? queueStats.waiting + queueStats.active + queueStats.delayed
    : 0;

  if (!queueStats) {
    return (
      <div className='flex flex-col items-center justify-center h-64 gap-3'>
        <div className='w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin' />
        <p className='text-sm text-slate-500'>Loading queue statistics…</p>
      </div>
    );
  }

  return (
    <div className='space-y-5'>
      {/* Section header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-sm font-semibold text-slate-800'>Live Queue</h3>
          {lastUpdated && (
            <p className='text-xs text-slate-400 mt-0.5'>
              Updated{" "}
              {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm'>
          <RefreshCw
            className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'>
        {STATS_CONFIG.map(
          ({ key, label, description, icon: Icon, color, bg, ring }) => {
            const value = queueStats[key] ?? 0;
            const pct = total > 0 ? Math.round((value / total) * 100) : 0;
            return (
              <div
                key={key}
                className={`relative flex flex-col gap-3 p-4 rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden`}>
                {/* top row */}
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-medium text-slate-500'>
                    {label}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${bg} ring-2 ${ring}`}>
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                  </div>
                </div>
                {/* value */}
                <div>
                  <p className={`text-2xl font-bold tabular-nums ${color}`}>
                    {value.toLocaleString()}
                  </p>
                  <p className='text-xs text-slate-400 mt-0.5'>{description}</p>
                </div>
                {/* mini progress */}
                <div className='h-1 bg-slate-100 rounded-full overflow-hidden'>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      STATS_CONFIG.find((s) => s.key === key)?.bar
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className='text-[10px] text-slate-400 tabular-nums'>
                  {pct}% of total
                </span>
              </div>
            );
          },
        )}
      </div>

      {/* Summary row */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
        {[
          {
            label: "Total Jobs",
            value: total.toLocaleString(),
            valueClass: "text-slate-800",
          },
          {
            label: "Success Rate",
            value: `${successRate}%`,
            valueClass: "text-emerald-600",
          },
          {
            label: "Failure Rate",
            value: `${failureRate}%`,
            valueClass: "text-rose-600",
          },
          {
            label: "Still Pending",
            value: pending.toLocaleString(),
            valueClass: "text-blue-600",
          },
        ].map(({ label, value, valueClass }) => (
          <div
            key={label}
            className='flex flex-col gap-1 px-4 py-3.5 bg-white rounded-xl border border-slate-100 shadow-sm'>
            <p className='text-xs text-slate-500'>{label}</p>
            <p className={`text-xl font-bold tabular-nums ${valueClass}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className='rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-4'>
        <div className='flex items-center gap-2 mb-3'>
          <Info className='h-3.5 w-3.5 text-slate-400' />
          <span className='text-xs font-semibold text-slate-500 uppercase tracking-wide'>
            Status definitions
          </span>
        </div>
        <dl className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5'>
          {LEGEND.map(({ label, detail }) => (
            <div key={label} className='flex gap-2 text-xs text-slate-600'>
              <dt className='font-semibold text-slate-700 shrink-0'>
                {label}:
              </dt>
              <dd className='text-slate-500'>{detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

export default QueueStats;
