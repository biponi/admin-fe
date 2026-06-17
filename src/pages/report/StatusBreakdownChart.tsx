"use client";

import { useId, useMemo } from "react";
import { Inbox, LayoutGrid } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";

export const description = "A multiple bar chart";

type ChartDataPoint = {
  status: string;
  orders: number;
  amount: number;
};

const chartConfig = {
  orders: {
    label: "Orders",
    color: "#6366f1", // indigo-500
  },
  amount: {
    label: "Amount",
    color: "#10b981", // emerald-500
  },
} satisfies ChartConfig;

const numberFormatter = new Intl.NumberFormat("en-US");

function formatNumber(value: number) {
  return numberFormatter.format(Math.round(value));
}

function formatCurrency(value: number, currency: string) {
  return `${currency}${numberFormatter.format(Math.round(value))}`;
}

const StatusBreakdownChart = ({
  chartData = [],
  duration = "",
  currency = "$",
}: {
  chartData?: ChartDataPoint[];
  duration?: string;
  currency?: string;
}) => {
  const uid = useId();
  const ordersGradientId = `orders-gradient-${uid}`;
  const amountGradientId = `amount-gradient-${uid}`;

  const stats = useMemo(() => {
    if (!chartData.length) return null;

    const totalOrders = chartData.reduce((sum, d) => sum + (d.orders || 0), 0);
    const totalAmount = chartData.reduce((sum, d) => sum + (d.amount || 0), 0);
    const leading = chartData.reduce<ChartDataPoint | null>(
      (max, d) => (max === null || d.orders > max.orders ? d : max),
      null,
    );
    const leadingShare =
      totalOrders > 0 && leading
        ? Math.round((leading.orders / totalOrders) * 100)
        : 0;

    return { totalOrders, totalAmount, leading, leadingShare };
  }, [chartData]);

  const hasData = chartData.length > 0;

  return (
    <div className='bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4 p-5 border-b border-slate-100'>
        <div className='flex items-start gap-3'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50'>
            <LayoutGrid className='h-4.5 w-4.5 text-indigo-600' />
          </div>
          <div>
            <h3 className='text-base font-semibold text-slate-900'>
              Order Status Breakdown
            </h3>
            <p className='text-sm text-slate-500 mt-0.5'>
              Orders and revenue by fulfillment status
            </p>
          </div>
        </div>

        {duration ? (
          <span className='shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600'>
            {duration}
          </span>
        ) : null}
      </div>

      {hasData ? (
        <>
          {/* Summary stats */}
          <div className='grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border-b border-slate-100'>
            <div className='px-5 py-4'>
              <p className='text-xs font-medium uppercase tracking-wide text-slate-400'>
                Total orders
              </p>
              <p className='mt-1 text-xl font-semibold text-slate-900 tabular-nums'>
                {formatNumber(stats!.totalOrders)}
              </p>
            </div>
            <div className='px-5 py-4'>
              <p className='text-xs font-medium uppercase tracking-wide text-slate-400'>
                Total amount
              </p>
              <p className='mt-1 text-xl font-semibold text-slate-900 tabular-nums'>
                {formatCurrency(stats!.totalAmount, currency)}
              </p>
            </div>
            <div className='px-5 py-4'>
              <p className='text-xs font-medium uppercase tracking-wide text-slate-400'>
                Leading status
              </p>
              <p className='mt-1 text-xl font-semibold text-slate-900'>
                {stats!.leading?.status ?? "—"}{" "}
                <span className='text-sm font-medium text-slate-400'>
                  {stats!.leadingShare}%
                </span>
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className='p-5'>
            <ChartContainer
              config={chartConfig}
              className='max-h-[320px] w-full'>
              <BarChart accessibilityLayer data={chartData} barGap={6}>
                <defs>
                  <linearGradient
                    id={ordersGradientId}
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'>
                    <stop offset='0%' stopColor='#818cf8' />
                    <stop offset='100%' stopColor='#6366f1' />
                  </linearGradient>
                  <linearGradient
                    id={amountGradientId}
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'>
                    <stop offset='0%' stopColor='#34d399' />
                    <stop offset='100%' stopColor='#10b981' />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray='3 3'
                  stroke='#eef1f6'
                />
                <XAxis
                  dataKey='status'
                  tickLine={false}
                  tickMargin={12}
                  axisLine={false}
                  fontWeight={600}
                  fontSize={11}
                  className='uppercase tracking-wide'
                  tick={{ fill: "#94a3b8" }}
                />
                <ChartTooltip
                  cursor={{ fill: "#f8fafc" }}
                  content={<ChartTooltipContent indicator='dashed' />}
                />
                <YAxis yAxisId='left' orientation='left' hide />
                <YAxis yAxisId='right' orientation='right' hide />
                <Bar
                  yAxisId='left'
                  dataKey='orders'
                  fill={`url(#${ordersGradientId})`}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={42}
                />
                <Bar
                  yAxisId='right'
                  dataKey='amount'
                  fill={`url(#${amountGradientId})`}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={42}
                />
              </BarChart>
            </ChartContainer>
          </div>

          {/* Footer / legend */}
          <div className='flex items-center gap-5 px-5 pb-5 text-sm'>
            <span className='flex items-center gap-1.5 text-slate-600'>
              <span className='h-2.5 w-2.5 rounded-full bg-indigo-500' />
              Orders
            </span>
            <span className='flex items-center gap-1.5 text-slate-600'>
              <span className='h-2.5 w-2.5 rounded-full bg-emerald-500' />
              Amount
            </span>
          </div>
        </>
      ) : (
        /* Empty state */
        <div className='flex flex-col items-center justify-center gap-2 px-5 py-16 text-center'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-100'>
            <Inbox className='h-5 w-5 text-slate-400' />
          </div>
          <p className='text-sm font-medium text-slate-700'>
            No order data yet
          </p>
          <p className='text-sm text-slate-400'>
            Data will appear here once orders come in for this period.
          </p>
        </div>
      )}
    </div>
  );
};

export default StatusBreakdownChart;
