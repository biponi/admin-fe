"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";
import { DASHBOARD_THEME, pillClass } from "./dashboardTheme";

const chartConfig = {
  processing: { label: "Processing: ", color: "#F2A992" },
  completed: { label: "Completed: ", color: "#E1573F" },
  shipped: { label: "Shipped: ", color: "#C98A76" },
  cancel: { label: "Cancelled: ", color: "#9A9A98" },
  failed: { label: "Failed: ", color: "#1A1A1A" },
  delete: { label: "Deleted: ", color: "#D9D7D4" },
} satisfies ChartConfig;

const STATUS_COLORS: Record<string, string> = {
  processing: chartConfig.processing.color,
  completed: chartConfig.completed.color,
  shipped: chartConfig.shipped.color,
  cancel: chartConfig.cancel.color,
  failed: chartConfig.failed.color,
  delete: chartConfig.delete.color,
};

const STATUS_KEYS = Object.keys(STATUS_COLORS);

interface Props {
  title: string;
  subTitle: string;
  data: any[];
}

/**
 * Order-status daily timeline in the reference design language: compact
 * smooth area chart with white status filter pills (All / Processing / …)
 * toggling which series render. Replaces the previous single hardcoded
 * gradient defs block (which repeated the same `fillMobile` id six times).
 */
const InteractiveSingleCardComponent: React.FC<Props> = ({
  title,
  subTitle,
  data,
}) => {
  const availableStatuses = useMemo(() => {
    if (!data?.length) return [];
    return STATUS_KEYS.filter((key) =>
      data.some((row) => Number(row[key] ?? 0) > 0)
    );
  }, [data]);

  const [selected, setSelected] = useState<string>("all");

  const activeStatuses =
    selected === "all"
      ? availableStatuses
      : availableStatuses.filter((s) => s === selected);

  return (
    <div className='bg-[#EFEDEB] rounded-3xl p-4 sm:p-5 flex flex-col gap-3 h-full'>
      <div className='min-w-0'>
        <p className='text-base font-semibold text-[#1A1A1A]'>{title}</p>
        <p className='text-xs text-[#9A9A98] mt-0.5 truncate'>{subTitle}</p>
      </div>

      <div className='flex items-center gap-2 flex-wrap'>
        <button
          onClick={() => setSelected("all")}
          className={`${pillClass} px-3 h-7 text-xs font-medium transition-colors ${
            selected === "all"
              ? "bg-[#111111] text-white"
              : "text-[#1A1A1A] hover:bg-[#F7D9D2]/50"
          }`}>
          All
        </button>
        {availableStatuses.map((status) => (
          <button
            key={status}
            onClick={() => setSelected(status)}
            className={`${pillClass} px-3 h-7 text-xs font-medium capitalize transition-colors ${
              selected === status
                ? "bg-[#111111] text-white"
                : "text-[#1A1A1A] hover:bg-[#F7D9D2]/50"
            }`}>
            {status}
          </button>
        ))}
      </div>

      <div className='bg-white rounded-2xl p-2 sm:p-3'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[190px] sm:h-[220px] w-full'>
          <AreaChart data={data}>
            <CartesianGrid vertical={false} stroke='#EFEDEB' />
            <XAxis
              dataKey='_id'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tick={{ fill: DASHBOARD_THEME.label, fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              width={32}
              tickLine={false}
              axisLine={false}
              tick={{ fill: DASHBOARD_THEME.label, fontSize: 11 }}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  indicator='dot'
                />
              }
            />
            {activeStatuses.map((status) => (
              <Area
                key={status}
                dataKey={status}
                type='monotone'
                fill={STATUS_COLORS[status]}
                fillOpacity={0.15}
                stroke={STATUS_COLORS[status]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default InteractiveSingleCardComponent;
