// ============================================
// FILE: components/reports/SalesTrendChart.tsx
// ============================================
import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Download, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";

import { format } from "date-fns";
import useRoleCheck from "../auth/hooks/useRoleCheck";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#10b981", // emerald-500
  },
  paid: {
    label: "Paid",
    color: "#6366f1", // indigo-500
  },
  orders: {
    label: "Orders",
    color: "#8b5cf6", // violet-500
  },
} satisfies ChartConfig;

interface SalesTrendChartProps {
  data: any;
  onDownload: () => void;
}

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({
  data,
  onDownload,
}) => {
  const [metric, setMetric] = useState<"revenue" | "orders">("revenue");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const chartData =
    data.trend?.map((item: any) => ({
      date: format(new Date(item.period), "dd/MM"),
      revenue: item.revenue,
      orders: item.orderCount,
      paid: item.paid,
    })) || [];

  return (
    <div className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden'>
      {/* Header */}
      <div className='p-5 border-b border-slate-100'>
        <div className='flex items-start justify-between'>
          <div>
            <h3 className='text-lg font-semibold text-slate-900'>
              Sales Trend
            </h3>
            <p className='text-sm text-slate-500 mt-1'>
              Daily sales performance over selected period
            </p>
          </div>
          <div className='flex gap-2'>
            <div className='inline-flex items-center bg-slate-100 p-1 rounded-lg'>
              <Button
                variant={metric === "revenue" ? "default" : "ghost"}
                onClick={() => setMetric("revenue")}
                size='sm'
                className={`rounded-md transition-all duration-200 ${
                  metric === "revenue"
                    ? "bg-white shadow-sm text-indigo-600"
                    : "hover:bg-white/50 text-slate-600"
                }`}>
                Revenue
              </Button>
              <Button
                variant={metric === "orders" ? "default" : "ghost"}
                onClick={() => setMetric("orders")}
                size='sm'
                className={`rounded-md transition-all duration-200 ${
                  metric === "orders"
                    ? "bg-white shadow-sm text-indigo-600"
                    : "hover:bg-white/50 text-slate-600"
                }`}>
                Orders
              </Button>
            </div>
            {useRoleCheck().hasRequiredPermission("Report", "download") && (
              <button
                onClick={onDownload}
                className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors'>
                <Download className='h-3.5 w-3.5' />
                Download
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='p-5'>
        <ChartContainer config={chartConfig} className='h-[350px] w-full'>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              left: 12,
              right: 12,
            }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#64748b" }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='line' />}
            />
            <YAxis
              tickFormatter={(value) =>
                metric === "revenue" ? formatCurrency(value) : value
              }
              hide
            />
            {/* <Line
              dataKey="desktop"
              type="natural"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-desktop)",
              }}
              activeDot={{
                r: 6,
              }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Line> */}

            {metric === "revenue" ? (
              <>
                <Line
                  type='monotone'
                  dataKey='revenue'
                  stroke='var(--color-revenue)'
                  strokeWidth={2}
                  name='Total Revenue'>
                  <LabelList
                    position='top'
                    offset={12}
                    className='fill-slate-700'
                    fontSize={12}
                  />
                </Line>
                <Line
                  type='monotone'
                  dataKey='paid'
                  stroke='var(--color-paid)'
                  strokeWidth={2}
                  name='Paid Amount'>
                  <LabelList
                    position='top'
                    offset={12}
                    className='fill-slate-700'
                    fontSize={12}
                  />
                </Line>
              </>
            ) : (
              <Line
                type='monotone'
                dataKey='orders'
                stroke='var(--color-orders)'
                strokeWidth={2}
                name='Order Count'>
                <LabelList
                  position='top'
                  offset={12}
                  className='fill-slate-700'
                  fontSize={12}
                />
              </Line>
            )}
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default SalesTrendChart;
