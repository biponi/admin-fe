"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";
import { DASHBOARD_THEME, accentBadgeClass, pillClass } from "./dashboardTheme";
import { calculateGrowthPercentage } from "./reportCard";

const chartConfig = {
  totalOrders: {
    label: "Order Amount: ",
    color: DASHBOARD_THEME.accent,
  },
  totalPurchases: {
    label: "Purchase Amount: ",
    color: DASHBOARD_THEME.accentTint1,
  },
} satisfies ChartConfig;

interface Props {
  title: string;
  subTitle: string;
  data: any[];
  totalOrder: number;
  totalPurchase: number;
  /** Optional MoM growth % shown as an accent badge pill. */
  growthPercentage?: number;
}

/**
 * "Purchase vs Order Amount" smooth area chart in the reference design
 * language: light-gray tile, white inner chart panel, accent + tint areas,
 * and two inline stat chips instead of the previous disabled header buttons.
 */
const InteractiveCardComponent: React.FC<Props> = ({
  title,
  subTitle,
  data,
  totalOrder,
  totalPurchase,
  growthPercentage,
}) => {
  const [showOrders, setShowOrders] = useState(true);
  const [showPurchases, setShowPurchases] = useState(true);

  const growth =
    typeof growthPercentage === "number"
      ? growthPercentage
      : calculateGrowthPercentage(0, totalOrder);

  return (
    <div className='bg-[#EFEDEB] rounded-3xl p-4 sm:p-5 flex flex-col gap-4 h-full'>
      <div className='flex items-start justify-between gap-3 flex-wrap'>
        <div className='min-w-0'>
          <p className='text-base font-semibold text-[#1A1A1A]'>{title}</p>
          <p className='text-xs text-[#9A9A98] mt-0.5 truncate'>{subTitle}</p>
        </div>
        <span
          className={`${accentBadgeClass} inline-flex items-center gap-1 px-2.5 h-7 text-xs font-semibold shrink-0`}>
          {growth > 0 ? (
            <TrendingUp className='h-3 w-3' strokeWidth={2} />
          ) : growth < 0 ? (
            <TrendingDown className='h-3 w-3' strokeWidth={2} />
          ) : null}
          {Math.abs(growth).toFixed(1)}%
        </span>
      </div>

      <div className='flex items-center gap-2 flex-wrap'>
        <span className={`${pillClass} px-3 h-7 flex items-center text-xs font-medium text-[#1A1A1A]`}>
          Orders&nbsp;<span className='font-bold'>{totalOrder.toLocaleString()}</span>
        </span>
        <span className={`${pillClass} px-3 h-7 flex items-center text-xs font-medium text-[#1A1A1A]`}>
          Purchases&nbsp;<span className='font-bold'>{totalPurchase.toLocaleString()}</span>
        </span>
      </div>

      <div className='bg-white rounded-2xl p-2 sm:p-3'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[220px] sm:h-[260px] w-full'>
          <AreaChart data={data}>
            <defs>
              <linearGradient id='dashOrders' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor={DASHBOARD_THEME.accent}
                  stopOpacity={0.35}
                />
                <stop
                  offset='95%'
                  stopColor={DASHBOARD_THEME.accent}
                  stopOpacity={0.02}
                />
              </linearGradient>
              <linearGradient id='dashPurchases' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor={DASHBOARD_THEME.accentTint1}
                  stopOpacity={0.4}
                />
                <stop
                  offset='95%'
                  stopColor={DASHBOARD_THEME.accentTint1}
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
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
              width={40}
              tickLine={false}
              axisLine={false}
              tick={{ fill: DASHBOARD_THEME.label, fontSize: 11 }}
              tickFormatter={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`
              }
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
            {showOrders && (
              <Area
                dataKey='totalOrders'
                type='monotone'
                fill='url(#dashOrders)'
                stroke={DASHBOARD_THEME.accent}
                strokeWidth={2}
                dot={false}
              />
            )}
            {showPurchases && (
              <Area
                dataKey='totalPurchases'
                type='monotone'
                fill='url(#dashPurchases)'
                stroke={DASHBOARD_THEME.accentTint1}
                strokeWidth={2}
                dot={false}
              />
            )}
          </AreaChart>
        </ChartContainer>

        <div className='flex items-center gap-2 flex-wrap px-1 pt-2'>
          {(
            [
              ["Orders", showOrders, setShowOrders, DASHBOARD_THEME.accent],
              [
                "Purchases",
                showPurchases,
                setShowPurchases,
                DASHBOARD_THEME.accentTint1,
              ],
            ] as const
          ).map(([label, visible, setVisible, color]) => (
            <button
              key={label}
              onClick={() => setVisible(!visible)}
              className={`${pillClass} inline-flex items-center gap-1.5 px-3 h-7 text-xs font-medium transition-opacity ${
                visible ? "text-[#1A1A1A]" : "opacity-40"
              }`}>
              <span
                className='h-2 w-2 rounded-full'
                style={{ backgroundColor: color }}
              />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InteractiveCardComponent;
