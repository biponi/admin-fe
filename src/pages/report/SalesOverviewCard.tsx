// ============================================
// FILE: components/reports/SalesOverviewCard.tsx
// ============================================
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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
import { Button } from "../../components/ui/button";
import { Download, TrendingUp, ShoppingCart, DollarSign } from "lucide-react";
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
    color: "#3b82f6", // blue-500
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
    color: "#6b7280", // gray-500
  },
  failed: {
    label: "Failed",
    color: "#dc2626", // red-600
  },
  default: {
    label: "Other",
    color: "#9ca3af", // gray-400
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
    0
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
    chartData && chartData.length > 0 ? chartData[0]?.name ?? "" : ""
  );
  const activeIndex = React.useMemo(
    () =>
      chartData.findIndex(
        (item: { name: string }) => item.name === activeStatus
      ),
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [activeStatus]
  );

  return (
    <>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              Sales Overview
            </CardTitle>
            <CardDescription>
              Summary of sales performance for selected period
            </CardDescription>
          </div>
          {useRoleCheck().hasRequiredPermission("Report", "download") && (
            <Button onClick={onDownload} size='sm' variant='outline'>
              <Download className='h-4 w-4 mr-2' />
              Download
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className='grid gap-6 md:grid-cols-2'>
            {/* Summary Metrics */}
            <div className='space-y-4'>
              <div className='grid gap-4 grid-cols-2'>
                <div className='p-4 bg-blue-50 dark:bg-blue-950 rounded-lg'>
                  <div className='flex items-center gap-2 text-blue-600 dark:text-blue-400'>
                    <ShoppingCart className='h-4 w-4' />
                    <p className='text-sm font-medium'>Total Orders</p>
                  </div>
                  <p className='text-2xl font-bold mt-2'>
                    {data.summary?.totalOrders || 0}
                  </p>
                </div>

                <div className='p-4 bg-gray-50 dark:bg-gray-950 rounded-lg'>
                  <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
                    <DollarSign className='h-4 w-4' />
                    <p className='text-sm font-medium'>Subtotal</p>
                  </div>
                  <p className='text-2xl font-bold mt-2'>
                    {formatCurrency(data.summary?.subtotal || 0)}
                  </p>
                </div>

                <div className='p-4 bg-pink-50 dark:bg-pink-950 rounded-lg'>
                  <div className='flex items-center gap-2 text-pink-600 dark:text-pink-400'>
                    <DollarSign className='h-4 w-4' />
                    <p className='text-sm font-medium'>Discounts</p>
                  </div>
                  <p className='text-2xl font-bold mt-2'>
                    {formatCurrency(data.summary?.totalDiscounts || 0)}
                  </p>
                </div>

                <div className='p-4 bg-cyan-50 dark:bg-cyan-950 rounded-lg'>
                  <div className='flex items-center gap-2 text-cyan-600 dark:text-cyan-400'>
                    <DollarSign className='h-4 w-4' />
                    <p className='text-sm font-medium'>Total Delivery Charge</p>
                  </div>
                  <p className='text-2xl font-bold mt-2'>
                    {formatCurrency(data.summary?.totalDeliveryCharges || 0)}
                  </p>
                </div>

                <div className='p-4 bg-green-50 dark:bg-green-950 rounded-lg'>
                  <div className='flex items-center gap-2 text-green-600 dark:text-green-400'>
                    <DollarSign className='h-4 w-4' />
                    <p className='text-sm font-medium'>Total Revenue</p>
                  </div>
                  <p className='text-2xl font-bold mt-2'>
                    {formatCurrency(data.summary?.totalRevenue || 0)}
                  </p>
                </div>

                <div className='p-4 bg-purple-50 dark:bg-purple-950 rounded-lg'>
                  <p className='text-sm font-medium text-purple-600 dark:text-purple-400'>
                    Avg Order Value
                  </p>
                  <p className='text-2xl font-bold mt-2'>
                    {formatCurrency(data.summary?.averageOrderValue || 0)}
                  </p>
                </div>

                <div className='p-4 bg-orange-50 dark:bg-orange-950 rounded-lg'>
                  <p className='text-sm font-medium text-orange-600 dark:text-orange-400'>
                    Total Paid
                  </p>
                  <p className='text-2xl font-bold mt-2'>
                    {formatCurrency(data.summary?.totalPaid || 0)}
                  </p>
                </div>

                <div className='p-4 border rounded-lg  border-red-300'>
                  <p className='text-sm text-muted-foreground'>
                    Remaining Amount
                  </p>
                  <p className='text-xl font-bold text-red-600'>
                    {formatCurrency(data.summary?.totalRemaining || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Breakdown Chart */}
            <Card data-chart={id} className='flex flex-col'>
              <ChartStyle id={id} config={chartConfig} />
              <CardHeader className='flex-row items-start space-y-0 pb-0'>
                <div className='grid gap-1'>
                  <CardTitle>Pie Chart - Interactive</CardTitle>
                  <CardDescription>{duration}</CardDescription>
                </div>
                <Select value={activeStatus} onValueChange={setActiveStatus}>
                  <SelectTrigger
                    className='ml-auto h-7 w-[130px] rounded-lg pl-2.5'
                    aria-label='Select a value'>
                    <SelectValue placeholder='Select month' />
                  </SelectTrigger>
                  <SelectContent align='end' className='rounded-xl'>
                    {chartData.map((item: { name: string }, index: number) => {
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
                    })}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className='flex flex-1 justify-center pb-0'>
                <ChartContainer
                  id={id}
                  config={chartConfig}
                  className='mx-auto aspect-square w-full max-w-[300px]'>
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
                                  className='fill-foreground text-3xl font-bold'>
                                  {chartData && chartData.length > 0
                                    ? chartData[activeIndex].value || 0
                                    : 0}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 24}
                                  className='fill-muted-foreground'>
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
              </CardContent>
              <CardFooter className='flex-col items-center justify-center gap-2 text-sm mt-2'>
                <div className='flex items-center gap-2 leading-none font-semibold text-base'>
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
                <div className='text-muted-foreground leading-none'>
                  Total Orders: {totalOrders}
                </div>
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>

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
