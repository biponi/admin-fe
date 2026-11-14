import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { getActivityStats } from "../../../api/activityLog";
import { ActivityPillGrid, ActivityPillDay } from "./ActivityPillGrid";
import { Activity } from "lucide-react";
import { claude } from "../../../lib/claude";
import { InlineLoader } from "@/components/loaders";

/**
 * Dashboard-level 90-day activity grid — combined activity across all
 * users, sourced from the activity-log stats endpoint (`byDay`).
 */
export const CombinedActivityCard: React.FC = () => {
  const [days, setDays] = useState<ActivityPillDay[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const response = await getActivityStats({
        startDate: dayjs()
          .subtract(89, "day")
          .startOf("day")
          .toISOString(),
        endDate: new Date().toISOString(),
      });

      if (cancelled) return;

      if (response.success && response.data) {
        const byDay = response.data.byDay || [];
        setDays(byDay.map((d) => ({ date: d.date, count: d.count })));
        setTotal(byDay.reduce((sum, d) => sum + d.count, 0));
      } else {
        setError(response.error || "Failed to load activity");
      }
      setIsLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={`${claude.card} overflow-hidden`}>
      <div
        className={`flex items-center gap-2.5 px-4 py-3 ${claude.cardHeader}`}>
        <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#D97757]/20 bg-[#D97757]/10 text-[#D97757]'>
          <Activity className='h-3.5 w-3.5' />
        </span>
        <div>
          <h3 className='text-[13px] font-semibold text-[#141413] leading-tight'>
            Combined Activity
          </h3>
          <p className='text-[11px] text-[#8A877D] mt-0.5'>
            All users — last 90 days
          </p>
        </div>
        <span className='ml-auto text-[13px] font-semibold tabular-nums text-[#141413]'>
          {total.toLocaleString()}
        </span>
      </div>
      <div className='p-5'>
        {isLoading ? (
          <InlineLoader domain='system' text='Loading Activity' />
        ) : error ? (
          <div className='rounded-md border border-rose-200 bg-rose-50 px-3 py-2'>
            <p className='text-[13px] text-rose-700'>Error: {error}</p>
          </div>
        ) : days.length === 0 ? (
          <div className={`${claude.panel} p-4 text-center`}>
            <p className={claude.secondary}>No activity in this period</p>
          </div>
        ) : (
          <ActivityPillGrid
            title='Activity — Last 90 Days'
            days={days}
          />
        )}
      </div>
    </div>
  );
};
