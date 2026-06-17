// ============================================
// FILE: components/reports/SalesOverviewCard.tsx
// ============================================
import React from "react";
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Download, ShoppingCart, DollarSign } from "lucide-react";
import { PieChart, Pie, Sector, Label } from "recharts";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import OrderBreakdownCharts from "./OrderBreakdownCharts";

interface SalesOverviewCardProps {
  data: any;
  duration?: string;
  onDownload: () => void;
}

const chartConfig = {
  pending: {
    label: "Pending",
    color: "#f59e0b", // amber-500
  },
  processing: {
    label: "Processing",
    color: "#6366f1", // indigo-500
  },
  shipped: {
    label: "Shipped",
    color: "#8b5cf6", // violet-500
  },
  completed: {
    label: "Completed",
    color: "#10b981", // emerald-500
  },
  cancelled: {
    label: "Cancelled",
    color: "#ef4444", // red-500
  },
  cancel: {
    label: "Cancel",
    color: "#dc2626", // red-600
  },
  delete: {
    label: "Deleted",
    color: "#64748b", // slate-500
  },
  failed: {
    label: "Failed",
    color: "#dc2626", // red-600
  },
  default: {
    label: "Other",
    color: "#94a3b8", // slate-400
  },
} satisfies ChartConfig;

const SalesOverviewCard: React.FC<SalesOverviewCardProps> = ({
  data,
  duration = "",
  onDownload,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalOrders = data.statusBreakdown.reduce(
    (sum: number, item: any) => sum + item.count,
    0,
  );

  const chartData =
    data.statusBreakdown?.map((item: any) => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item.count,
      percent: (item.count / totalOrders) * 100,
      revenue: item.revenue,
      fill: `var(--color-${item.status})`,
    })) || [];

  const id = "pie-interactive";
  const [activeStatus, setActiveStatus] = React.useState(
    chartData && chartData.length > 0 ? (chartData[0]?.name ?? "") : "",
  );
  const activeIndex = React.useMemo(
    () =>
      chartData.findIndex(
        (item: { name: string }) => item.name === activeStatus,
      ),
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [activeStatus],
  );

  return (
    <>
      <div className='bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden'>
        {/* Header */}
        <div className='p-5 border-b border-slate-100'>
          <div className='flex items-start justify-between'>
            <div>
              <h3 className='text-lg font-semibold text-slate-900'>
                Sales Overview
              </h3>
              <p className='text-sm text-slate-500 mt-1'>
                Summary of sales performance for selected period
              </p>
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

        {/* Content */}
        <div className='p-5'>
          <div className='grid gap-6 lg:grid-cols-2'>
            {/* Summary Metrics */}
            <div className='space-y-3'>
              <div className='grid gap-3 grid-cols-2'>
                <div className='bg-indigo-50 rounded-lg p-4'>
                  <div className='flex items-center gap-2 text-indigo-600 mb-2'>
                    <ShoppingCart className='h-4 w-4' />
                    <p className='text-sm font-medium'>Total Orders</p>
                  </div>
                  <p className='text-2xl font-bold text-slate-900'>
                    {data.summary?.totalOrders || 0}
                  </p>
                </div>

                <div className='bg-slate-50 rounded-lg p-4'>
                  <div className='flex items-center gap-2 text-slate-600 mb-2'>
                    <DollarSign className='h-4 w-4' />
                    <p className='text-sm font-medium'>Subtotal</p>
                  </div>
                  <p className='text-2xl font-bold text-slate-900'>
                    {formatCurrency(data.summary?.subtotal || 0)}
                  </p>
                </div>

                <div className='bg-pink-50 rounded-lg p-4'>
                  <div className='flex items-center gap-2 text-pink-600 mb-2'>
                    <DollarSign className='h-4 w-4' />
                    <p className='text-sm font-medium'>Discounts</p>
                  </div>
                  <p className='text-2xl font-bold text-slate-900'>
                    {formatCurrency(data.summary?.totalDiscounts || 0)}
                  </p>
                </div>

                <div className='bg-sky-50 rounded-lg p-4'>
                  <div className='flex items-center gap-2 text-sky-600 mb-2'>
                    <DollarSign className='h-4 w-4' />
                    <p className='text-sm font-medium'>Total Delivery Charge</p>
                  </div>
                  <p className='text-2xl font-bold text-slate-900'>
                    {formatCurrency(data.summary?.totalDeliveryCharges || 0)}
                  </p>
                </div>

                <div className='bg-emerald-50 rounded-lg p-4'>
                  <div className='flex items-center gap-2 text-emerald-600 mb-2'>
                    <DollarSign className='h-4 w-4' />
                    <p className='text-sm font-medium'>Total Revenue</p>
                  </div>
                  <p className='text-2xl font-bold text-slate-900'>
                    {formatCurrency(data.summary?.totalRevenue || 0)}
                  </p>
                </div>

                <div className='bg-violet-50 rounded-lg p-4'>
                  <p className='text-sm font-medium text-violet-600 mb-2'>
                    Avg Order Value
                  </p>
                  <p className='text-2xl font-bold text-slate-900'>
                    {formatCurrency(data.summary?.averageOrderValue || 0)}
                  </p>
                </div>

                <div className='bg-amber-50 rounded-lg p-4'>
                  <p className='text-sm font-medium text-amber-600 mb-2'>
                    Total Paid
                  </p>
                  <p className='text-2xl font-bold text-slate-900'>
                    {formatCurrency(data.summary?.totalPaid || 0)}
                  </p>
                </div>

                <div className='bg-rose-50 border border-rose-200 rounded-lg p-4'>
                  <p className='text-sm text-rose-700 mb-2'>Remaining Amount</p>
                  <p className='text-xl font-bold text-rose-700'>
                    {formatCurrency(data.summary?.totalRemaining || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Breakdown Chart */}
            <div data-chart={id} className='flex flex-col'>
              <ChartStyle id={id} config={chartConfig} />
              <div className='flex-row items-start space-y-0 pb-4'>
                <div className='grid gap-1 w-full'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <h4 className='text-sm font-semibold text-slate-900'>
                        Order Status Distribution
                      </h4>
                      <p className='text-xs text-slate-500 mt-1'>{duration}</p>
                    </div>
                    <Select
                      value={activeStatus}
                      onValueChange={setActiveStatus}>
                      <SelectTrigger
                        className='ml-auto h-8 w-[140px] rounded-lg border-slate-200 text-xs'
                        aria-label='Select a value'>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                      <SelectContent align='end' className='rounded-lg'>
                        {chartData.map(
                          (item: { name: string }, index: number) => {
                            return (
                              <SelectItem
                                key={index}
                                value={item.name}
                                className='rounded-lg [&_span]:flex'>
                                <div className='flex items-center gap-2 text-xs'>
                                  <span
                                    className='flex h-3 w-3 shrink-0 rounded-xs'
                                    style={{
                                      backgroundColor: `var(--color-${item.name})`,
                                    }}
                                  />
                                  {item.name}
                                </div>
                              </SelectItem>
                            );
                          },
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className='flex flex-1 justify-center pb-0'>
                <ChartContainer
                  id={id}
                  config={chartConfig}
                  className='mx-auto aspect-square w-full max-w-[280px]'>
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Pie
                      data={chartData}
                      dataKey='value'
                      nameKey='name'
                      activeIndex={activeIndex}
                      isAnimationActive={true}
                      innerRadius={60}
                      strokeWidth={5}
                      activeShape={({
                        outerRadius = 0,
                        ...props
                      }: PieSectorDataItem) => (
                        <g>
                          <Sector {...props} outerRadius={outerRadius + 10} />
                          <Sector
                            {...props}
                            outerRadius={outerRadius + 25}
                            innerRadius={outerRadius + 12}
                          />
                        </g>
                      )}>
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor='middle'
                                dominantBaseline='middle'>
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className='fill-slate-900 text-3xl font-bold'>
                                  {chartData && chartData.length > 0
                                    ? chartData[activeIndex].value || 0
                                    : 0}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 24}
                                  className='fill-slate-500'>
                                  Orders
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </div>
              <div className='flex flex-col items-center justify-center gap-2 text-sm mt-2'>
                <div className='flex items-center gap-2 leading-none font-semibold text-base text-slate-900'>
                  {chartData && chartData.length > 0
                    ? chartData[activeIndex].name
                    : ""}
                  :{" "}
                  {chartData && chartData.length > 0
                    ? chartData[activeIndex].value
                    : ""}{" "}
                  orders (
                  {chartData && chartData.length > 0
                    ? (chartData[activeIndex].percent ?? 0 * 100).toFixed(2)
                    : "0.00"}
                  % of total volume)
                </div>
                <div className='text-slate-500 leading-none'>
                  Total Orders: {totalOrders}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OrderBreakdownCharts
        data={data?.creatorBreakdown}
        duration={duration}
        chartData={data?.statusBreakdown.map((item: any) => ({
          status: item.status,
          orders: item.count,
          amount: item.revenue,
        }))}
      />
    </>
  );
};

export default SalesOverviewCard;
