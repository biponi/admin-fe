import { useState, useEffect, useCallback, useRef } from "react";
import { formatISO, startOfDay, endOfDay, subDays, format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  BarChart3,
  Eye,
  Crown,
  Star,
  Target,
  Percent,
  RefreshCw,
  HelpCircle,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Activity,
  Award,
  MapPin,
  CreditCard,
  Truck,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";
import { DateRangePicker } from "../../coreComponents/DateRangePicker";
import { DateRange } from "react-day-picker";
import axiosInstance from "../../api/axios";
import config from "../../utils/config";
import toast from "react-hot-toast";
import AnalyticsGuideComponent from "./Expnanation";

// Types based on the analytics guide
// TypeScript Interfaces matching the actual backend API response
interface AdvancedAnalyticsResponse {
  summary: {
    currentPeriod: {
      startDate: string;
      endDate: string;
      revenue: number;
      orders: number;
      aov: number;
      paid: number;
      remaining: number;
      purchases: number;
      returns: number;
      returnRate: number;
      profitMargin: number;
    };
    growth: {
      revenue: number;
      orders: number;
      aov: number;
      purchases: number;
    };
    comparison: {
      previousPeriod: {
        startDate: string;
        endDate: string;
        revenue: number;
        orders: number;
        aov: number;
        purchases: number;
      };
    };
  };
  charts: {
    dailyTrends: {
      type: "line";
      data: Array<{
        date: string;
        totalRevenue: number;
        totalOrders: number;
        statuses: Record<string, number>;
      }>;
      config: {
        xAxis: string;
        yAxes: string[];
        dateFormat: string;
        colors: string[];
        labels: string[];
      };
    };
    statusDistribution: {
      type: "pie";
      data: Array<{
        label: string;
        value: number;
        revenue: number;
        percentage: string;
      }>;
      config: {
        colors: Record<string, string>;
      };
    };
    topProductsRevenue: {
      type: "bar";
      data: Array<{
        label: string;
        value: number;
        quantity: number;
        orders: number;
      }>;
      config: {
        xAxis: string;
        yAxis: string;
        color: string;
      };
    };
    geographicDistribution: {
      type: "horizontalBar";
      data: Array<{
        label: string;
        orders: number;
        revenue: number;
      }>;
      config: {
        xAxis: string;
        yAxis: string;
        color: string;
      };
    };
    timeHeatmap: {
      type: "heatmap";
      data: Array<{
        hour: number;
        dayOfWeek: number;
        orders: number;
        revenue: number;
      }>;
      config: {
        xAxis: string;
        yAxis: string;
        value: string;
        colorScale: string[];
      };
    };
    customerSegments: {
      type: "donut";
      data: Array<{
        label: string;
        value: number;
        percentage: string;
      }>;
      config: {
        colors: Record<string, string>;
      };
    };
  };
  analytics: {
    topCustomers: Array<{
      _id: string;
      customerName: string;
      totalOrders: number;
      totalSpent: number;
      avgOrderValue: number;
      lastOrderDate: string;
      segment: string;
    }>;
    topProducts: Array<{
      _id: string;
      productName: string;
      totalQuantity: number;
      totalRevenue: number;
      orderCount: number;
      avgPrice: number;
      avgOrderSize: number;
      revenuePerUnit: number;
    }>;
    paymentMethods: Array<{
      _id: string;
      count: number;
      totalAmount: number;
      avgAmount: number;
    }>;
    geographicBreakdown: Array<{
      _id: {
        division: string;
        district: string;
      };
      count: number;
      revenue: number;
    }>;
    orderFunnel: {
      totalVisitors: number;
      ordersPlaced: number;
      ordersProcessing: number;
      ordersCompleted: number;
      conversionRate: string;
    };
  };
  kpis: Array<{
    name: string;
    value: number;
    change?: number;
    format: "currency" | "number" | "percentage";
  }>;
  implementationGuide?: {
    dashboardLayout: Record<string, string[]>;
    chartLibraryRecommendations: Record<string, string>;
    colorPalette: Record<string, string>;
    responsiveDesign: Record<string, string>;
  };
  metadata?: {
    generatedAt: string;
    dataPoints: number;
    comparisonPeriod: string;
    refreshRecommendation: string;
  };
}

// Utility functions
const formatValue = (value: number, format: string): string => {
  switch (format) {
    case "currency":
      return `৳${value.toLocaleString()}`;
    case "percentage":
      return `${value.toFixed(1)}%`;
    case "number":
      return value.toLocaleString();
    default:
      return value.toString();
  }
};

const getGrowthColor = (change: number): string => {
  if (change > 0) return "text-green-600 dark:text-green-400";
  if (change < 0) return "text-red-600 dark:text-red-400";
  return "text-muted-foreground";
};

const getTrendIcon = (change: number) => {
  if (change > 0) return <TrendingUp className='h-4 w-4' />;
  if (change < 0) return <TrendingDown className='h-4 w-4' />;
  return <Activity className='h-4 w-4' />;
};

const getSegmentBadgeColor = (segment: string): string => {
  switch (segment) {
    case "VIP":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "Premium":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "Loyal":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className='h-4 w-4 text-green-500' />;
    case "processing":
      return <Clock className='h-4 w-4 text-yellow-500' />;
    case "shipped":
      return <Truck className='h-4 w-4 text-blue-500' />;
    case "cancelled":
      return <XCircle className='h-4 w-4 text-red-500' />;
    default:
      return <AlertCircle className='h-4 w-4 text-gray-500' />;
  }
};

// KPI Card Component
const KPICard = ({
  kpi,
  className = "",
}: {
  kpi: AdvancedAnalyticsResponse["kpis"][0];
  className?: string;
}) => {
  const iconMap: Record<string, JSX.Element> = {
    "Total Revenue": <DollarSign className='h-5 w-5' />,
    "Total Orders": <ShoppingCart className='h-5 w-5' />,
    "Average Order Value": <Target className='h-5 w-5' />,
    "Collection Rate": <Percent className='h-5 w-5' />,
    "Return Rate": <Percent className='h-5 w-5' />,
    "Profit Margin": <Award className='h-5 w-5' />,
  };

  return (
    <Card
      className={`hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/80 border-0 shadow-md ${className}`}
      role='article'
      aria-label={`${kpi.name} metric`}>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='p-2 bg-primary/10 rounded-lg' aria-hidden='true'>
              {iconMap[kpi.name] || <Activity className='h-5 w-5' />}
            </div>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                {kpi.name}
              </p>
              <p
                className='text-2xl font-bold text-foreground'
                aria-live='polite'>
                {formatValue(kpi.value, kpi.format)}
              </p>
            </div>
          </div>
          {kpi.change !== undefined && (
            <div
              className={`flex items-center space-x-1 ${getGrowthColor(
                kpi.change
              )}`}
              aria-label={`Change: ${
                kpi.change > 0 ? "increased" : "decreased"
              } by ${Math.abs(kpi.change).toFixed(1)} percent`}>
              {getTrendIcon(kpi.change)}
              <span className='text-sm font-medium'>
                {Math.abs(kpi.change).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Simple Chart Components (mockup for now - would use react-chartjs-2 in production)
const DailyTrendsChart = ({
  data,
  title,
}: {
  data: AdvancedAnalyticsResponse["charts"]["dailyTrends"];
  title: string;
}) => {
  // Prepare data for Recharts
  const chartData = data.data.map((item) => ({
    date: format(new Date(item.date), "MMM dd"),
    fullDate: item.date,
    revenue: item.totalRevenue,
    orders: item.totalOrders,
    formattedRevenue: `৳${item.totalRevenue.toLocaleString()}`,
    formattedOrders: `${item.totalOrders} orders`,
  }));

  return (
    <Card className='hover:shadow-lg transition-all duration-300'>
      <CardHeader>
        <div className='flex items-center space-x-3'>
          <div className='p-2 bg-primary/10 rounded-lg'>
            <LineChartIcon className='h-5 w-5 text-primary' />
          </div>
          <CardTitle className='text-xl'>{title}</CardTitle>
        </div>
        <CardDescription>Revenue and order trends over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='h-80 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}>
              <CartesianGrid strokeDasharray='3 3' className='opacity-30' />
              <XAxis
                dataKey='date'
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId='revenue'
                orientation='left'
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId='orders'
                orientation='right'
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className='bg-background border border-border rounded-lg shadow-lg p-3'>
                        <p className='font-medium'>{label}</p>
                        {payload.map((entry, index) => (
                          <p
                            key={index}
                            style={{ color: entry.color }}
                            className='text-sm'>
                            {entry.dataKey === "revenue"
                              ? `Revenue: ৳${entry.value?.toLocaleString()}`
                              : `Orders: ${entry.value}`}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line
                yAxisId='revenue'
                type='monotone'
                dataKey='revenue'
                stroke='#3B82F6'
                strokeWidth={2}
                name='Revenue (৳)'
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId='orders'
                type='monotone'
                dataKey='orders'
                stroke='#10B981'
                strokeWidth={2}
                name='Orders'
                dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className='mt-4 flex justify-between text-sm text-muted-foreground'>
          <span>📈 Revenue Trend</span>
          <span>📦 Orders Trend</span>
        </div>
      </CardContent>
    </Card>
  );
};

const StatusDistributionChart = ({
  data,
  title,
}: {
  data: AdvancedAnalyticsResponse["charts"]["statusDistribution"];
  title: string;
}) => {
  // Prepare data for pie chart
  const pieData = data.data.map((item) => ({
    name: item.label,
    value: item.value,
    percentage: parseFloat(item.percentage),
    revenue: item.revenue,
    color: data.config.colors[item.label] || "#8884d8",
  }));

  return (
    <Card className='hover:shadow-lg transition-all duration-300'>
      <CardHeader>
        <div className='flex items-center space-x-3'>
          <div className='p-2 bg-primary/10 rounded-lg'>
            <PieChartIcon className='h-5 w-5 text-primary' />
          </div>
          <CardTitle className='text-xl'>{title}</CardTitle>
        </div>
        <CardDescription>Order status breakdown by count</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='h-64 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={pieData}
                cx='50%'
                cy='50%'
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey='value'>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className='bg-background border border-border rounded-lg shadow-lg p-3'>
                        <p className='font-medium capitalize'>{data.name}</p>
                        <p className='text-sm'>Orders: {data.value}</p>
                        <p className='text-sm'>
                          Percentage: {data.percentage}%
                        </p>
                        <p className='text-sm'>
                          Revenue: ৳{data.revenue.toLocaleString()}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className='space-y-2 mt-4'>
          {data.data.map((item, index) => (
            <div key={index} className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <div
                  className='w-3 h-3 rounded-full'
                  style={{
                    backgroundColor:
                      data.config.colors[item.label] || "#8884d8",
                  }}
                />
                {getStatusIcon(item.label)}
                <span className='text-sm font-medium capitalize'>
                  {item.label}
                </span>
              </div>
              <div className='text-right'>
                <div className='text-sm font-medium'>{item.percentage}%</div>
                <div className='text-xs text-muted-foreground'>
                  {item.value} orders
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ProductRevenueChart = ({
  data,
  title,
}: {
  data: AdvancedAnalyticsResponse["charts"]["topProductsRevenue"];
  title: string;
}) => {
  return (
    <Card className='hover:shadow-lg transition-all duration-300'>
      <CardHeader>
        <div className='flex items-center space-x-3'>
          <div className='p-2 bg-primary/10 rounded-lg'>
            <BarChart3 className='h-5 w-5 text-primary' />
          </div>
          <CardTitle className='text-xl'>{title}</CardTitle>
        </div>
        <CardDescription>Top performing products by revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='h-80 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={data.data.slice(0, 8).map((product) => ({
                name:
                  product.label.length > 15
                    ? `${product.label.substring(0, 15)}...`
                    : product.label,
                fullName: product.label,
                revenue: product.value,
                quantity: product.quantity,
                orders: product.orders,
              }))}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}>
              <CartesianGrid strokeDasharray='3 3' className='opacity-30' />
              <XAxis
                dataKey='name'
                fontSize={12}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor='end'
                height={80}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className='bg-background border border-border rounded-lg shadow-lg p-3 max-w-xs'>
                        <p className='font-medium'>{data.fullName}</p>
                        <p className='text-sm'>
                          Revenue: ৳{data.revenue.toLocaleString()}
                        </p>
                        <p className='text-sm'>
                          Quantity: {data.quantity} units
                        </p>
                        <p className='text-sm'>Orders: {data.orders}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey='revenue'
                fill='#8B5CF6'
                radius={[4, 4, 0, 0]}
                name='Revenue (৳)'
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className='mt-4 space-y-2'>
          {data.data.slice(0, 5).map((product, index) => (
            <div
              key={index}
              className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>{product.label}</span>
              <div className='text-right'>
                <div className='font-medium'>
                  ৳{product.value.toLocaleString()}
                </div>
                <div className='text-xs text-muted-foreground'>
                  {product.quantity} units, {product.orders} orders
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Geographic Distribution Chart Component
const GeographicDistributionChart = ({
  data,
  title,
}: {
  data: AdvancedAnalyticsResponse["charts"]["geographicDistribution"];
  title: string;
}) => {
  return (
    <Card className='hover:shadow-lg transition-all duration-300'>
      <CardHeader>
        <div className='flex items-center space-x-3'>
          <div className='p-2 bg-primary/10 rounded-lg'>
            <MapPin className='h-5 w-5 text-primary' />
          </div>
          <CardTitle className='text-xl'>{title}</CardTitle>
        </div>
        <CardDescription>
          Order distribution by geographic location
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='h-80 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={data.data.slice(0, 6).map((location) => ({
                name:
                  location.label.length > 15
                    ? `${location.label.substring(0, 15)}...`
                    : location.label,
                fullName: location.label,
                orders: location.orders,
                revenue: location.revenue,
              }))}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 80,
              }}>
              <CartesianGrid strokeDasharray='3 3' className='opacity-30' />
              <XAxis
                dataKey='name'
                fontSize={12}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor='end'
                height={80}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{ value: "Orders", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className='bg-background border border-border rounded-lg shadow-lg p-3 max-w-xs'>
                        <p className='font-medium'>{data.fullName}</p>
                        <p className='text-sm'>Orders: {data.orders}</p>
                        <p className='text-sm'>
                          Revenue: ৳{data.revenue.toLocaleString()}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey='orders'
                fill='#06B6D4'
                radius={[4, 4, 0, 0]}
                name='Orders'
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className='space-y-2 max-h-40 overflow-y-auto'>
          {data.data.map((location, index) => (
            <div
              key={index}
              className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground truncate pr-2'>
                {location.label}
              </span>
              <div className='text-right'>
                <div className='font-medium'>{location.orders} orders</div>
                <div className='text-xs text-muted-foreground'>
                  ৳{location.revenue.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Time Heatmap Chart Component
const TimeHeatmapChart = ({
  data,
  title,
}: {
  data: AdvancedAnalyticsResponse["charts"]["timeHeatmap"];
  title: string;
}) => {
  return (
    <Card className='hover:shadow-lg transition-all duration-300'>
      <CardHeader>
        <div className='flex items-center space-x-3'>
          <div className='p-2 bg-primary/10 rounded-lg'>
            <Clock className='h-5 w-5 text-primary' />
          </div>
          <CardTitle className='text-xl'>{title}</CardTitle>
        </div>
        <CardDescription>Peak ordering times by day and hour</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='h-80 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
              }}>
              <CartesianGrid strokeDasharray='3 3' className='opacity-30' />
              <XAxis
                type='number'
                dataKey='hour'
                domain={[0, 23]}
                ticks={[0, 6, 12, 18, 23]}
                tickFormatter={(hour) => {
                  if (hour === 0) return "12 AM";
                  if (hour === 6) return "6 AM";
                  if (hour === 12) return "12 PM";
                  if (hour === 18) return "6 PM";
                  if (hour === 23) return "11 PM";
                  return `${hour}`;
                }}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type='number'
                dataKey='dayOfWeek'
                domain={[1, 7]}
                tickFormatter={(day) => {
                  const days = [
                    "",
                    "Sun",
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                  ];
                  return days[day] || "";
                }}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const days = [
                      "",
                      "Sunday",
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                    ];
                    const hour12 =
                      data.hour === 0
                        ? 12
                        : data.hour > 12
                        ? data.hour - 12
                        : data.hour;
                    const ampm = data.hour >= 12 ? "PM" : "AM";

                    return (
                      <div className='bg-background border border-border rounded-lg shadow-lg p-3'>
                        <p className='font-medium'>
                          {days[data.dayOfWeek]} at {hour12} {ampm}
                        </p>
                        <p className='text-sm'>Orders: {data.orders}</p>
                        <p className='text-sm'>
                          Revenue: ৳{data.revenue.toLocaleString()}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                data={data.data.map((item) => ({
                  ...item,
                  size: Math.max(50, item.orders * 20), // Dynamic size based on orders
                }))}
                fill='#F59E0B'>
                {data.data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.orders > 5
                        ? "#F59E0B" // High activity - orange
                        : entry.orders > 2
                        ? "#FCD34D" // Medium activity - yellow
                        : "#FEF3C7" // Low activity - light yellow
                    }
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className='mt-4 text-sm text-muted-foreground'>
          <div className='flex justify-between items-center'>
            <span>🔥 Peak Hours Analysis</span>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-1'>
                <div className='w-3 h-3 rounded-full bg-orange-500'></div>
                <span className='text-xs'>High (5+ orders)</span>
              </div>
              <div className='flex items-center space-x-1'>
                <div className='w-3 h-3 rounded-full bg-yellow-400'></div>
                <span className='text-xs'>Medium (3-4)</span>
              </div>
              <div className='flex items-center space-x-1'>
                <div className='w-3 h-3 rounded-full bg-yellow-100'></div>
                <span className='text-xs'>Low (1-2)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Analytics Tables
const TopCustomersTable = ({
  customers,
}: {
  customers: AdvancedAnalyticsResponse["analytics"]["topCustomers"];
}) => {
  return (
    <Card className='hover:shadow-lg transition-all duration-300'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='p-2 bg-primary/10 rounded-lg'>
              <Crown className='h-5 w-5 text-primary' />
            </div>
            <CardTitle className='text-xl'>Top Customers</CardTitle>
          </div>
          <Button variant='outline' size='sm'>
            <Eye className='h-4 w-4 mr-2' />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className='font-semibold'>Customer</TableCell>
                <TableCell className='font-semibold'>Orders</TableCell>
                <TableCell className='font-semibold'>Total Spent</TableCell>
                <TableCell className='font-semibold'>AOV</TableCell>
                <TableCell className='font-semibold'>Segment</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.slice(0, 5).map((customer, index) => (
                <TableRow key={customer._id} className='hover:bg-muted/50'>
                  <TableCell>
                    <div className='flex items-center space-x-3'>
                      <div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                        <span className='text-xs font-semibold text-primary'>
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className='font-medium'>
                          {customer.customerName}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          ID: {customer._id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='font-medium'>
                    {customer.totalOrders}
                  </TableCell>
                  <TableCell className='font-medium'>
                    ৳{customer.totalSpent.toLocaleString()}
                  </TableCell>
                  <TableCell className='font-medium'>
                    ৳{customer.avgOrderValue.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSegmentBadgeColor(
                        customer.segment
                      )}`}>
                      {customer.segment}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

const TopProductsTable = ({
  products,
}: {
  products: AdvancedAnalyticsResponse["analytics"]["topProducts"];
}) => {
  return (
    <Card className='hover:shadow-lg transition-all duration-300'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='p-2 bg-primary/10 rounded-lg'>
              <Star className='h-5 w-5 text-primary' />
            </div>
            <CardTitle className='text-xl'>Top Products</CardTitle>
          </div>
          <Button variant='outline' size='sm'>
            <Eye className='h-4 w-4 mr-2' />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className='font-semibold'>Product</TableCell>
                <TableCell className='font-semibold'>Revenue</TableCell>
                <TableCell className='font-semibold'>Quantity</TableCell>
                <TableCell className='font-semibold'>Orders</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.slice(0, 5).map((product, index) => (
                <TableRow key={index} className='hover:bg-muted/50'>
                  <TableCell>
                    <div className='flex items-center space-x-3'>
                      <div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                        <span className='text-xs font-semibold text-primary'>
                          {index + 1}
                        </span>
                      </div>
                      <div className='font-medium'>{product.productName}</div>
                    </div>
                  </TableCell>
                  <TableCell className='font-medium'>
                    ৳{product.totalRevenue.toLocaleString()}
                  </TableCell>
                  <TableCell className='font-medium'>
                    {product.totalQuantity}
                  </TableCell>
                  <TableCell className='font-medium'>
                    {product.orderCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

// Order Funnel Component
const OrderFunnelCard = ({
  funnel,
}: {
  funnel: AdvancedAnalyticsResponse["analytics"]["orderFunnel"];
}) => {
  const steps = [
    { label: "Visitors", value: funnel.totalVisitors, icon: Eye },
    { label: "Orders Placed", value: funnel.ordersPlaced, icon: ShoppingCart },
    { label: "Processing", value: funnel.ordersProcessing, icon: Clock },
    { label: "Completed", value: funnel.ordersCompleted, icon: CheckCircle },
  ];

  return (
    <Card className='hover:shadow-lg transition-all duration-300'>
      <CardHeader>
        <div className='flex items-center space-x-3'>
          <div className='p-2 bg-primary/10 rounded-lg'>
            <Target className='h-5 w-5 text-primary' />
          </div>
          <div>
            <CardTitle className='text-xl'>Order Funnel</CardTitle>
            <CardDescription>
              Conversion Rate: {funnel.conversionRate}%
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {steps.map((step, index) => (
            <div key={step.label} className='flex items-center space-x-4'>
              <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center'>
                <step.icon className='h-5 w-5 text-primary' />
              </div>
              <div className='flex-1'>
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>{step.label}</span>
                  <span className='text-lg font-bold'>{step.value}</span>
                </div>
                <div className='w-full bg-muted rounded-full h-2 mt-1'>
                  <div
                    className='bg-primary rounded-full h-2 transition-all duration-300'
                    style={{
                      width: `${(step.value / funnel.totalVisitors) * 100}%`,
                    }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component
const AdvancedDashboardPage: React.FC = () => {
  const { theme } = useSettings();
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: startOfDay(subDays(new Date(), 30)),
    end: endOfDay(new Date()),
  });
  const [analyticsData, setAnalyticsData] =
    useState<AdvancedAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Performance optimizations
  //const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce date range changes
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isThemed = theme !== "light" && theme !== "dark";

  const getBackgroundClasses = () => {
    if (isThemed) {
      const themeGradients = {
        blue: "min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100/50",
        green:
          "min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100/50",
        purple:
          "min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100/50",
        orange:
          "min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100/50",
      };
      return (
        themeGradients[theme as keyof typeof themeGradients] ||
        "min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50"
      );
    }
    return "min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50";
  };

  // Validation function for date range
  const validateDateRange = useCallback(
    (start: Date, end: Date): string | null => {
      const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year
      const diffTime = end.getTime() - start.getTime();

      if (diffTime < 0) {
        return "End date must be after start date";
      }
      if (diffTime > maxRange) {
        return "Date range cannot exceed 1 year";
      }
      if (end > new Date()) {
        return "End date cannot be in the future";
      }
      return null;
    },
    []
  );

  const fetchAdvancedAnalytics = useCallback(
    async (showToast = false, bypassCache = false) => {
      try {
        setError(null);
        if (!refreshing) setLoading(true);

        // Validate date range
        const validationError = validateDateRange(
          dateRange.start,
          dateRange.end
        );
        if (validationError) {
          setError(validationError);
          toast.error(validationError);
          setLoading(false);
          return;
        }

        // Real API call to getAdvancedOrderAnalytics endpoint
        const response = await axiosInstance.get(
          config.dashboard.getDashboardAdvanceAnalysis(), // Maps to /getAdvancedOrderAnalytics endpoint
          {
            params: {
              startDate: formatISO(dateRange.start),
              endDate: formatISO(dateRange.end),
              compareWith: "previous",
            },
            timeout: 30000, // 30 second timeout
          }
        );

        if (!response.data || response.data.success === false) {
          throw new Error(response.data?.error || "API returned error");
        }

        const apiData = response.data.data;

        // Validate required data structure
        if (
          !apiData ||
          !apiData.summary ||
          !apiData.charts ||
          !apiData.analytics ||
          !apiData.kpis
        ) {
          throw new Error("Invalid API response structure");
        } else {
          setAnalyticsData(apiData);
        }

        setRetryCount(0);
        if (showToast) {
          toast.success("Analytics data updated successfully");
        }
      } catch (error: any) {
        console.error("Error fetching advanced analytics:", error);

        let errorMessage = "Failed to fetch analytics data";

        if (error.code === "ECONNABORTED") {
          errorMessage = "Request timed out. Please try again.";
        } else if (error.response?.status === 401) {
          errorMessage = "Unauthorized. Please log in again.";
        } else if (error.response?.status === 403) {
          errorMessage =
            "Access denied. You don't have permission to view this data.";
        } else if (error.response?.status === 429) {
          errorMessage =
            "Too many requests. Please wait a moment before trying again.";
        } else if (error.response?.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);
        toast.error(errorMessage);
        setRetryCount((prev) => prev + 1);
      } finally {
        setLoading(false);
        if (refreshing) setRefreshing(false);
      }
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [dateRange]
  );

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAdvancedAnalytics(true, true); // bypass cache on manual refresh
  };

  const retryFetch = () => {
    setError(null);
    setRetryCount(0);
    fetchAdvancedAnalytics();
  };

  // Debounced effect for date range changes
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      fetchAdvancedAnalytics();
    }, 500); // 500ms debounce

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [dateRange, fetchAdvancedAnalytics]);

  // Cleanup effect
  // useEffect(() => {
  //   return () => {
  //     // Cancel any pending requests
  //     if (abortControllerRef.current) {
  //       //@ts-ignore
  //       abortControllerRef?.current.abort();
  //     }
  //     // Clear debounce timeout
  //     if (debounceTimeoutRef.current) {
  //       clearTimeout(debounceTimeoutRef.current);
  //     }
  //   };
  // }, []);

  return (
    <div className={getBackgroundClasses()}>
      {/* Enhanced Header Section */}
      <header className='bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-10'>
        <div className='p-6 lg:p-8'>
          <div className='flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0'>
            <div className='space-y-3'>
              <div className='flex items-center space-x-3'>
                <div
                  className='p-3 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl'
                  aria-hidden='true'>
                  <Activity className='h-8 w-8 text-primary' />
                </div>
                <div>
                  <h1 className='text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent'>
                    Advanced Analytics
                  </h1>
                  <p className='text-muted-foreground text-sm mt-1'>
                    Comprehensive business intelligence and insights
                  </p>
                </div>
              </div>
            </div>

            {/* Control Panel */}
            <nav
              className='flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4'
              aria-label='Dashboard controls'>
              <div
                className='hidden lg:flex items-center space-x-2 text-sm text-muted-foreground px-4 py-2 bg-muted/50 rounded-full border'
                role='status'
                aria-label='Current date range'>
                <Calendar className='h-4 w-4' aria-hidden='true' />
                <span>
                  {format(dateRange.start, "MMM dd")} -{" "}
                  {format(dateRange.end, "MMM dd, yyyy")}
                </span>
              </div>

              <DateRangePicker
                initialDateFrom={dateRange.start}
                initialDateTo={dateRange.end}
                showCompare={false}
                onUpdate={(values: {
                  range: DateRange;
                  rangeCompare?: DateRange | undefined;
                }) => {
                  if (values.range.from && values.range.to) {
                    setDateRange({
                      start: startOfDay(values.range.from),
                      end: endOfDay(values.range.to),
                    });
                  }
                }}
              />

              <div className='flex space-x-2'>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant='outline'
                      size='lg'
                      aria-label='Show chart explanations and calculations'>
                      <HelpCircle className='mr-2 h-4 w-4' aria-hidden='true' />
                      Help
                    </Button>
                  </SheetTrigger>
                  <SheetContent className='md:min-w-[600px] md:max-w-[800px] overflow-y-auto'>
                    <AnalyticsGuideComponent />
                  </SheetContent>
                </Sheet>

                <Button
                  variant='outline'
                  size='lg'
                  onClick={refreshData}
                  disabled={refreshing}
                  aria-label={
                    refreshing ? "Refreshing data..." : "Refresh analytics data"
                  }>
                  {refreshing ? (
                    <Loader2
                      className='animate-spin mr-2 h-4 w-4'
                      aria-hidden='true'
                    />
                  ) : (
                    <RefreshCw className='mr-2 h-4 w-4' aria-hidden='true' />
                  )}
                  Refresh
                </Button>

                {/* <Button
                  size='lg'
                  className=' bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300'
                  aria-label='Export analytics data'>
                  <Download className='mr-2 h-4 w-4' aria-hidden='true' />
                  Export
                </Button> */}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className='p-6 lg:p-8 space-y-8'
        role='main'
        aria-label='Analytics dashboard content'>
        {error && !loading ? (
          <div className='space-y-8'>
            <div className='text-center py-12'>
              <div className='inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mb-4'>
                <AlertCircle className='h-8 w-8 text-destructive' />
              </div>
              <h3 className='text-xl font-semibold text-foreground mb-2'>
                Unable to Load Analytics Data
              </h3>
              <p className='text-muted-foreground mb-4 max-w-md mx-auto'>
                {error}
              </p>
              <div className='flex justify-center space-x-4'>
                <Button
                  onClick={retryFetch}
                  className='bg-primary hover:bg-primary/90'>
                  <RefreshCw className='h-4 w-4 mr-2' />
                  Retry
                </Button>
                {retryCount > 2 && (
                  <Button variant='outline' onClick={retryFetch}>
                    <RefreshCw className='h-4 w-4 mr-2' />
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className='space-y-8'>
            <div className='text-center py-12'>
              <div className='inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4'>
                <Loader2 className='h-8 w-8 text-primary animate-spin' />
              </div>
              <h3 className='text-xl font-semibold text-foreground mb-2'>
                Loading Advanced Analytics
              </h3>
              <p className='text-muted-foreground'>
                Analyzing your business data and generating insights...
              </p>
            </div>
            {/* Skeleton Loading */}
            <div>
              <div className='h-6 bg-muted rounded w-48 mb-6 animate-pulse' />
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6'>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className='space-y-3'>
                    <div className='h-32 bg-card rounded-xl animate-pulse border shadow-sm' />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className='h-6 bg-muted rounded w-36 mb-6 animate-pulse' />
              <div className='grid grid-cols-1 xl:grid-cols-3 gap-8'>
                <div className='xl:col-span-2'>
                  <div className='h-96 bg-card rounded-xl animate-pulse border shadow-sm' />
                </div>
                <div className='h-96 bg-card rounded-xl animate-pulse border shadow-sm' />
              </div>
            </div>
          </div>
        ) : analyticsData ? (
          <>
            {/* KPI Cards */}
            <section aria-labelledby='kpi-section'>
              <h2
                id='kpi-section'
                className='text-2xl font-bold mb-6 text-foreground'>
                Key Performance Indicators
              </h2>
              <div
                className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                role='region'
                aria-label='Key performance metrics'>
                {analyticsData.kpis.map((kpi, index) => (
                  <KPICard key={index} kpi={kpi} />
                ))}
              </div>
            </section>

            {/* Main Content - Charts Section */}
            <section aria-labelledby='charts-section'>
              <h2
                id='charts-section'
                className='text-2xl font-bold mb-6 text-foreground'>
                Performance Trends & Analytics
              </h2>

              {/* Primary Charts Grid - Following Implementation Guide */}
              <div className='grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8'>
                {/* Main Content: Daily Trends (spans 2 columns) */}
                <div className='xl:col-span-2'>
                  <DailyTrendsChart
                    data={analyticsData.charts.dailyTrends}
                    title='Revenue & Orders Trend'
                  />
                </div>

                {/* Sidebar: Order Status Distribution */}
                <div>
                  <StatusDistributionChart
                    data={analyticsData.charts.statusDistribution}
                    title='Order Status Distribution'
                  />
                </div>
              </div>

              {/* Secondary Charts Grid */}
              <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8'>
                {/* Main Content: Top Products */}
                <ProductRevenueChart
                  data={analyticsData.charts.topProductsRevenue}
                  title='Top Products by Revenue'
                />

                {/* Sidebar: Customer Segments */}
                <div className='lg:col-span-1'>
                  <Card className='hover:shadow-lg transition-all duration-300'>
                    <CardHeader>
                      <div className='flex items-center space-x-3'>
                        <div className='p-2 bg-primary/10 rounded-lg'>
                          <Users className='h-5 w-5 text-primary' />
                        </div>
                        <CardTitle className='text-xl'>
                          Customer Segments
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='h-64 w-full mb-4'>
                        <ResponsiveContainer width='100%' height='100%'>
                          <PieChart>
                            <Pie
                              data={analyticsData.charts.customerSegments.data.map(
                                (segment) => ({
                                  name: segment.label,
                                  value: segment.value,
                                  percentage: parseFloat(segment.percentage),
                                  color:
                                    analyticsData.charts.customerSegments.config
                                      .colors[segment.label] || "#8884d8",
                                })
                              )}
                              cx='50%'
                              cy='50%'
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey='value'>
                              {analyticsData.charts.customerSegments.data.map(
                                (segment, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      analyticsData.charts.customerSegments
                                        .config.colors[segment.label] ||
                                      "#8884d8"
                                    }
                                  />
                                )
                              )}
                            </Pie>
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className='bg-background border border-border rounded-lg shadow-lg p-3'>
                                      <p className='font-medium'>
                                        {data.name} Customers
                                      </p>
                                      <p className='text-sm'>
                                        Count: {data.value}
                                      </p>
                                      <p className='text-sm'>
                                        Percentage: {data.percentage}%
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className='space-y-3'>
                        {analyticsData.charts.customerSegments.data.map(
                          (segment, index) => (
                            <div
                              key={index}
                              className='flex items-center justify-between'>
                              <div className='flex items-center space-x-2'>
                                <div
                                  className='w-3 h-3 rounded-full'
                                  style={{
                                    backgroundColor:
                                      analyticsData.charts.customerSegments
                                        .config.colors[segment.label] ||
                                      "#8884d8",
                                  }}
                                />
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSegmentBadgeColor(
                                    segment.label
                                  )}`}>
                                  {segment.label}
                                </span>
                              </div>
                              <div className='text-right'>
                                <div className='text-sm font-bold'>
                                  {segment.percentage}%
                                </div>
                                <div className='text-xs text-muted-foreground'>
                                  {segment.value} customers
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar: Geographic Distribution */}
                <GeographicDistributionChart
                  data={analyticsData.charts.geographicDistribution}
                  title='Geographic Distribution'
                />
              </div>

              {/* Additional Sections - Time Heatmap & Order Funnel */}
              <div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
                <TimeHeatmapChart
                  data={analyticsData.charts.timeHeatmap}
                  title='Time Patterns'
                />
                <OrderFunnelCard funnel={analyticsData.analytics.orderFunnel} />
              </div>
            </section>

            {/* Analytics Tables */}
            <section aria-labelledby='analytics-section'>
              <h2
                id='analytics-section'
                className='text-2xl font-bold mb-6 text-foreground'>
                Detailed Analytics
              </h2>
              <div
                className='grid grid-cols-1 xl:grid-cols-2 gap-8'
                role='region'
                aria-label='Detailed analytics tables'>
                <TopCustomersTable
                  customers={analyticsData.analytics.topCustomers}
                />
                <TopProductsTable
                  products={analyticsData.analytics.topProducts}
                />
              </div>
            </section>

            {/* Additional Insights - Payment Methods */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              <Card className='hover:shadow-lg transition-all duration-300'>
                <CardHeader>
                  <div className='flex items-center space-x-3'>
                    <div className='p-2 bg-primary/10 rounded-lg'>
                      <CreditCard className='h-5 w-5 text-primary' />
                    </div>
                    <CardTitle className='text-lg'>Payment Methods</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {analyticsData.analytics.paymentMethods.map(
                      (method, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between'>
                          <span className='text-sm font-medium'>
                            {method._id ?? "Unknown Method"} ({method.count})
                          </span>
                          <div className='text-right'>
                            <div className='text-sm font-bold'>
                              ৳{Number(method?.avgAmount || 0).toFixed(2)}
                            </div>
                            <div className='text-xs text-muted-foreground'>
                              ৳{method.totalAmount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Business Metrics Summary */}
              <Card className='hover:shadow-lg transition-all duration-300'>
                <CardHeader>
                  <div className='flex items-center space-x-3'>
                    <div className='p-2 bg-primary/10 rounded-lg'>
                      <Target className='h-5 w-5 text-primary' />
                    </div>
                    <CardTitle className='text-lg'>Business Summary</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Collection Rate
                      </span>
                      <span className='font-medium'>
                        {analyticsData.summary.currentPeriod.revenue > 0
                          ? (
                              (analyticsData.summary.currentPeriod.paid /
                                analyticsData.summary.currentPeriod.revenue) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Profit Margin
                      </span>
                      <span className='font-medium'>
                        {analyticsData.summary.currentPeriod.profitMargin.toFixed(
                          1
                        )}
                        %
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Return Rate</span>
                      <span className='font-medium'>
                        {analyticsData.summary.currentPeriod.returnRate.toFixed(
                          1
                        )}
                        %
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>
                        Active Orders
                      </span>
                      <span className='font-medium'>
                        {analyticsData.summary.currentPeriod.orders}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Insights */}
              <Card className='hover:shadow-lg transition-all duration-300'>
                <CardHeader>
                  <div className='flex items-center space-x-3'>
                    <div className='p-2 bg-primary/10 rounded-lg'>
                      <BarChart3 className='h-5 w-5 text-primary' />
                    </div>
                    <CardTitle className='text-lg'>Data Insights</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Data Points</span>
                      <span className='font-medium'>
                        {analyticsData.metadata?.dataPoints || 0}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Generated</span>
                      <span className='font-medium'>
                        {analyticsData.metadata?.generatedAt
                          ? format(
                              new Date(analyticsData.metadata.generatedAt),
                              "MMM dd, HH:mm"
                            )
                          : "Now"}
                      </span>
                    </div>
                    <div className='text-xs text-muted-foreground mt-2'>
                      Comparison:{" "}
                      {analyticsData.metadata?.comparisonPeriod ||
                        "Previous period"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className='text-center py-12'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-muted/10 rounded-full mb-4'>
              <BarChart3 className='h-8 w-8 text-muted-foreground' />
            </div>
            <h3 className='text-xl font-semibold text-foreground mb-2'>
              No Data Available
            </h3>
            <p className='text-muted-foreground mb-4'>
              No analytics data found for the selected date range.
            </p>
            <Button onClick={() => fetchAdvancedAnalytics()} variant='outline'>
              <RefreshCw className='h-4 w-4 mr-2' />
              Refresh Data
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdvancedDashboardPage;
