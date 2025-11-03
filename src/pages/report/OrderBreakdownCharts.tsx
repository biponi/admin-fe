"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "../../components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import {
  PieChart,
  Pie,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Label,
  Sector,
} from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import {
  TrendingUp,
  Info,
  DollarSign,
  ShoppingCart,
  PieChartIcon,
  Package,
  CheckCircle,
  Truck,
  XCircle,
  Clock,
} from "lucide-react";
import StatusBreakdownChart from "./StatusBreakdownChart";

interface StatusCount {
  count: number;
  percentage: number;
}

const COLORS_SECONDARY = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#ef4444",
];

interface StatusDistribution {
  processing: StatusCount;
  completed: StatusCount;
  shipped: StatusCount;
  pending: StatusCount;
  cancelled: StatusCount;
  failed: StatusCount;
}

interface OrderBreakdown {
  totalOrders: number;
  createdBy: string;
  subtotal: number;
  revenue: number;
  statusDistribution: StatusDistribution;
  percentageOfTotal: number;
}

interface OrderBreakdownChartsProps {
  data: OrderBreakdown[];
  duration: string;
  chartData: chartDataType[];
}

const COLORS = ["#f7f1e3", "#706fd3", "#ff5252", "#33d9b2", "#ff793f"];

type chartDataType = {
  status: string;
  orders: number;
  amount: number;
};

const OrderBreakdownCharts: React.FC<OrderBreakdownChartsProps> = ({
  data,
  duration = "",
  chartData = [],
}) => {
  const [selectedCreator, setSelectedCreator] = useState(
    data[0]?.createdBy || ""
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate dynamic chart config
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      orders: { label: "Orders" },
      revenue: { label: "Revenue" },
    };

    data.forEach((item, index) => {
      const key = item.createdBy.toLowerCase().replace(/\s+/g, "_");
      config[key] = {
        label: item.createdBy,
        color: COLORS[index % COLORS.length],
      };
    });

    return config;
  }, [data]);

  // Prepare pie chart data
  const ordersPieData = useMemo(
    () =>
      data.map((item, index) => ({
        name: item.createdBy,
        value: item.totalOrders,
        percentage: item.percentageOfTotal,
        fill: COLORS[index % COLORS.length],
      })),
    [data]
  );

  const revenuePieData = useMemo(
    () =>
      data.map((item, index) => ({
        name: item.createdBy,
        value: item.revenue,
        percentage: item.percentageOfTotal,
        fill: COLORS[index % COLORS.length],
      })),
    [data]
  );

  // Get active creator index
  const activeIndex = useMemo(
    () => data.findIndex((item) => item.createdBy === selectedCreator),
    [data, selectedCreator]
  );

  const creators = useMemo(() => data.map((item) => item.createdBy), [data]);

  // Status distribution for stacked bar chart
  const statusChartConfig = {
    processing: {
      label: "Processing",
      color: "hsl(var(--chart-1))",
    },
    shipped: {
      label: "Shipped",
      color: "hsl(var(--chart-2))",
    },
    completed: {
      label: "Completed",
      color: "hsl(var(--chart-3))",
    },
    pending: {
      label: "Pending",
      color: "hsl(var(--chart-4))",
    },
    cancelled: {
      label: "Cancelled",
      color: "hsl(var(--chart-5))",
    },
    failed: {
      label: "Failed",
      color: "hsl(220 10% 40%)",
    },
  } satisfies ChartConfig;

  const statusBarData = data.map((item) => ({
    creator:
      item.createdBy.length > 15
        ? item.createdBy.substring(0, 15) + "..."
        : item.createdBy,
    fullName: item.createdBy,
    processing: item.statusDistribution.processing.count,
    shipped: item.statusDistribution.shipped.count,
    completed: item.statusDistribution.completed.count,
    pending: item.statusDistribution.pending.count,
    cancelled: item.statusDistribution.cancelled.count,
    failed: item.statusDistribution.failed.count,
    totalOrders: item.totalOrders,
  }));

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `৳${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `৳${(value / 1000).toFixed(0)}K`;
    return `৳${value}`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  const StatusBadge: React.FC<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    count: number | string;
    percentage: number | string;
    color?: string;
    bgColor?: string;
  }> = ({ icon: Icon, label, count, percentage, color, bgColor }) => (
    <div className='flex items-center justify-between p-2 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors group'>
      <div className='flex items-center gap-2'>
        <div className={`p-1.5 rounded-md ${bgColor}`}>
          <Icon className={`w-3.5 h-3.5 ${color}`} />
        </div>
        <span className='text-xs font-medium text-gray-600'>{label}</span>
      </div>
      <div className='flex items-center gap-2'>
        <span className='text-sm font-bold text-gray-900'>{count}</span>
        <span className='text-xs text-gray-400 font-medium'>{percentage}%</span>
      </div>
    </div>
  );

  const OrderCreatorCard = ({ item, index }: { item: any; index: number }) => {
    const statusConfig = {
      processing: {
        icon: Clock,
        label: "Processing",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      shipped: {
        icon: Truck,
        label: "Shipped",
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
      completed: {
        icon: CheckCircle,
        label: "Completed",
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      cancelled: {
        icon: XCircle,
        label: "Cancelled",
        color: "text-red-600",
        bgColor: "bg-red-50",
      },
    };

    return (
      <div className='group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100'>
        {/* Gradient Header */}
        <div
          className='h-2 w-full'
          style={{
            background: `linear-gradient(90deg, ${
              COLORS_SECONDARY[index % COLORS_SECONDARY.length]
            }, ${COLORS_SECONDARY[(index + 1) % COLORS_SECONDARY.length]})`,
          }}
        />

        {/* Card Content */}
        <div className='p-6'>
          {/* Header Section */}
          <div className='flex items-start justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div
                className='w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg'
                style={{
                  backgroundColor:
                    COLORS_SECONDARY[index % COLORS_SECONDARY.length],
                }}>
                {item.createdBy.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className='text-lg font-bold text-gray-900 capitalize'>
                  {item.createdBy}
                </h3>
                <div className='flex items-center gap-2 mt-1'>
                  <div className='flex items-center gap-1'>
                    <TrendingUp className='w-3.5 h-3.5 text-green-500' />
                    <span className='text-sm font-semibold text-green-600'>
                      {item.percentageOfTotal.toFixed(1)}%
                    </span>
                  </div>
                  <span className='text-xs text-gray-400'>of total orders</span>
                </div>
              </div>
            </div>

            {/* Order Count Badge */}
            <div className='text-right'>
              <div className='flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg'>
                <Package className='w-4 h-4 text-blue-600' />
                <span className='text-2xl font-bold text-blue-600'>
                  {item.totalOrders.toLocaleString()}
                </span>
              </div>
              <span className='text-xs text-gray-500 mt-1 block'>orders</span>
            </div>
          </div>

          {/* Revenue Section */}
          <div className='grid grid-cols-2 gap-4 mb-6'>
            <div className='p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100'>
              <p className='text-xs font-medium text-green-700 mb-1'>Revenue</p>
              <p className='text-2xl font-bold text-green-600'>
                {formatCurrency(item.revenue)}
              </p>
            </div>
            <div className='p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200'>
              <p className='text-xs font-medium text-gray-600 mb-1'>Subtotal</p>
              <p className='text-2xl font-bold text-gray-700'>
                {formatCurrency(item.subtotal)}
              </p>
            </div>
          </div>

          {/* Status Breakdown */}
          <div>
            <div className='flex items-center justify-between mb-3'>
              <h4 className='text-sm font-semibold text-gray-700'>
                Status Distribution
              </h4>
              <div className='h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent ml-3' />
            </div>
            <div className='grid grid-cols-2 gap-2'>
              {Object.entries(statusConfig).map(([key, config]) => (
                <StatusBadge
                  key={key}
                  icon={config.icon}
                  label={config.label}
                  count={item.statusDistribution[key].count}
                  percentage={item.statusDistribution[key].percentage.toFixed(
                    1
                  )}
                  color={config.color}
                  bgColor={config.bgColor}
                />
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className='mt-6 pt-4 border-t border-gray-100'>
            <div className='flex items-center justify-between text-xs mb-2'>
              <span className='text-gray-500 font-medium'>Completion Rate</span>
              <span className='text-gray-900 font-bold'>
                {item.statusDistribution.completed.percentage.toFixed(1)}%
              </span>
            </div>
            <div className='w-full h-2 bg-gray-100 rounded-full overflow-hidden'>
              <div
                className='h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500'
                style={{
                  width: `${item.statusDistribution.completed.percentage}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div className='absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none' />
      </div>
    );
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
      <StatusBreakdownChart chartData={chartData} duration={duration} />
      <Card className='flex-row items-start space-y-0 pb-0 md:col-span-2'>
        <CardHeader className='flex-row items-start space-y-0 pb-0'>
          <div className='grid gap-1 flex-1'>
            <CardTitle className='flex items-center gap-2'>
              <PieChartIcon className='h-5 w-5' />
              Order Source Chart
            </CardTitle>
            <CardDescription>{duration}</CardDescription>
          </div>
          <div className='flex gap-2'>
            <Select value={selectedCreator} onValueChange={setSelectedCreator}>
              <SelectTrigger
                className='h-8 w-[160px] rounded-lg'
                aria-label='Select creator'>
                <SelectValue placeholder='Select creator' />
              </SelectTrigger>
              <SelectContent align='end' className='rounded-xl'>
                {creators.map((creator, index) => (
                  <SelectItem
                    key={creator}
                    value={creator}
                    className='rounded-lg [&_span]:flex'>
                    <div className='flex items-center gap-2 text-xs'>
                      <span
                        className='flex h-3 w-3 shrink-0 rounded-sm'
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      {creator}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button variant='outline' size='sm'>
                  <Info className='h-4 w-4' />
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
                <DialogHeader>
                  <DialogTitle>Creator Performance Details</DialogTitle>
                  <DialogDescription>
                    Complete breakdown of orders and revenue by creator
                  </DialogDescription>
                </DialogHeader>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
                  {data.map((item, index) => (
                    <OrderCreatorCard key={index} item={item} index={index} />
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-2'>
          {/* Interactive Pie Charts */}
          <Card data-chart='orders-pie' className='flex flex-col'>
            <ChartStyle id='orders-pie' config={chartConfig} />
            <CardHeader className='flex-row items-start space-y-0 pb-0'>
              <div className='grid gap-1 flex-1'>
                <CardTitle className='flex items-center gap-2'>
                  <ShoppingCart className='h-5 w-5' />
                  Orders Distribution
                </CardTitle>
                <CardDescription>Orders breakdown by creator</CardDescription>
              </div>
            </CardHeader>
            <CardContent className='flex flex-1 justify-center pb-4'>
              <ChartContainer
                id='orders-pie'
                config={chartConfig}
                className='mx-auto aspect-square w-full max-w-[300px]'>
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={ordersPieData}
                    dataKey='value'
                    nameKey='name'
                    innerRadius={60}
                    strokeWidth={5}
                    activeIndex={activeIndex}
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
                                {formatNumber(
                                  ordersPieData[activeIndex]?.value || 0
                                )}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className='fill-muted-foreground text-sm'>
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
          </Card>

          {/* Revenue Pie Chart */}
          <Card data-chart='revenue-pie' className='flex flex-col'>
            <ChartStyle id='revenue-pie' config={chartConfig} />
            <CardHeader className='flex-row items-start space-y-0 pb-0'>
              <div className='grid gap-1 flex-1'>
                <CardTitle className='flex items-center gap-2'>
                  <DollarSign className='h-5 w-5' />
                  Potential Revenue Distribution
                </CardTitle>
                <CardDescription>Revenue breakdown by creator</CardDescription>
              </div>
            </CardHeader>
            <CardContent className='flex flex-1 justify-center pb-4'>
              <ChartContainer
                id='revenue-pie'
                config={chartConfig}
                className='mx-auto aspect-square w-full max-w-[300px]'>
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={revenuePieData}
                    dataKey='value'
                    nameKey='name'
                    innerRadius={60}
                    strokeWidth={5}
                    activeIndex={activeIndex}
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
                                className='fill-foreground text-2xl font-bold'>
                                {formatCurrency(
                                  revenuePieData[activeIndex]?.value || 0
                                )}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className='fill-muted-foreground text-sm'>
                                Revenue
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
          </Card>
        </CardContent>
      </Card>

      {/* Status Distribution Bar Chart - Full Width */}
      <Card className='md:col-span-3'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Order Status Distribution
          </CardTitle>
          <CardDescription>
            Breakdown of order statuses by each creator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={statusChartConfig}
            className='max-h-[450px] w-full'>
            <BarChart data={statusBarData} margin={{ left: 20, right: 20 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='creator'
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                textAnchor='end'
                height={80}
                fontSize={14}
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator='dashed'
                    labelFormatter={(_, payload) => {
                      if (payload && payload.length > 0) {
                        return payload[0].payload.fullName;
                      }
                      return "";
                    }}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey='processing'
                fill='var(--color-processing)'
                radius={5}
              />
              <Bar dataKey='shipped' fill='var(--color-shipped)' radius={5} />
              <Bar
                dataKey='completed'
                fill='var(--color-completed)'
                radius={5}
              />
              <Bar dataKey='pending' fill='var(--color-pending)' radius={5} />
              <Bar
                dataKey='cancelled'
                fill='var(--color-cancelled)'
                radius={5}
              />
              <Bar dataKey='failed' fill='var(--color-failed)' radius={5} />
            </BarChart>
          </ChartContainer>

          {/* Summary Stats */}
          <div className='mt-4 grid grid-cols-3 gap-4 border-t pt-4'>
            <div className='text-center'>
              <p className='text-xs text-muted-foreground'>Total Orders</p>
              <p className='text-lg font-bold'>
                {data
                  .reduce((sum, item) => sum + item.totalOrders, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className='text-center'>
              <p className='text-xs text-muted-foreground'>Total Revenue</p>
              <p className='text-lg font-bold'>
                {formatCurrency(
                  data.reduce((sum, item) => sum + item.revenue, 0)
                )}
              </p>
            </div>
            <div className='text-center'>
              <p className='text-xs text-muted-foreground'>Avg Order Value</p>
              <p className='text-lg font-bold'>
                {formatCurrency(
                  data.reduce((sum, item) => sum + item.revenue, 0) /
                    data.reduce((sum, item) => sum + item.totalOrders, 0)
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderBreakdownCharts;
