import { useState, useEffect, useMemo, useCallback } from "react";
import {
  formatISO,
  startOfDay,
  endOfDay,
  subDays,
  format,
} from "date-fns";
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
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  BarChart3,
  Eye,
  Crown,
  Star,
  Target,
  Percent,
  Download,
  RefreshCw,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Activity,
  Award,
  MapPin,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";
import { DateRangePicker } from "../../coreComponents/DateRangePicker";
import { DateRange } from "react-day-picker";
import axiosInstance from "../../api/axios";
import toast from "react-hot-toast";

// Simplified Types
interface AnalyticsKPI {
  name: string;
  value: number;
  change: number;
  format: "currency" | "percentage" | "number";
  icon: string;
}

interface AnalyticsData {
  kpis: AnalyticsKPI[];
  topCustomers: Array<{
    customerName: string;
    _id: string;
    totalOrders: number;
    totalSpent: number;
    avgOrderValue: number;
    segment: "VIP" | "Premium" | "Loyal" | "Regular";
  }>;
  topProducts: Array<{
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
    orderCount: number;
  }>;
  statusDistribution: Array<{
    label: string;
    value: number;
    percentage: string;
  }>;
  orderFunnel: {
    totalVisitors: number;
    ordersPlaced: number;
    ordersProcessing: number;
    ordersCompleted: number;
    conversionRate: string;
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
  if (change > 0) return <TrendingUp className="h-4 w-4" />;
  if (change < 0) return <TrendingDown className="h-4 w-4" />;
  return <Activity className="h-4 w-4" />;
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
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "processing":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "cancelled":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

// KPI Card Component
const KPICard = ({ kpi }: { kpi: AnalyticsKPI }) => {
  const iconMap: Record<string, JSX.Element> = {
    revenue: <DollarSign className="h-5 w-5" />,
    orders: <ShoppingCart className="h-5 w-5" />,
    customers: <Users className="h-5 w-5" />,
    products: <Package className="h-5 w-5" />,
    percentage: <Percent className="h-5 w-5" />,
    target: <Target className="h-5 w-5" />,
    award: <Award className="h-5 w-5" />,
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {iconMap[kpi.icon] || <Activity className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {kpi.name}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {formatValue(kpi.value, kpi.format)}
              </p>
            </div>
          </div>
          <div className={`flex items-center space-x-1 ${getGrowthColor(kpi.change)}`}>
            {getTrendIcon(kpi.change)}
            <span className="text-sm font-medium">
              {Math.abs(kpi.change).toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Chart Placeholder Components
const ChartPlaceholder = ({ title, icon }: { title: string; icon: JSX.Element }) => (
  <Card className="hover:shadow-lg transition-all duration-300">
    <CardHeader>
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <div className="h-80 bg-gradient-to-br from-muted/20 to-muted/40 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {title}
            <br />
            <span className="text-sm">Chart will render here</span>
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Top Customers Table
const TopCustomersTable = ({ customers }: { customers: AnalyticsData["topCustomers"] }) => (
  <Card className="hover:shadow-lg transition-all duration-300">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-xl">Top Customers</CardTitle>
        </div>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          View All
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell className="font-semibold">Customer</TableCell>
            <TableCell className="font-semibold">Orders</TableCell>
            <TableCell className="font-semibold">Total Spent</TableCell>
            <TableCell className="font-semibold">Segment</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.slice(0, 5).map((customer, index) => (
            <TableRow key={customer._id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{customer.customerName}</div>
                    <div className="text-sm text-muted-foreground">
                      ID: {customer._id}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-medium">{customer.totalOrders}</TableCell>
              <TableCell className="font-medium">
                ৳{customer.totalSpent.toLocaleString()}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSegmentBadgeColor(
                    customer.segment
                  )}`}
                >
                  {customer.segment}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

// Top Products Table
const TopProductsTable = ({ products }: { products: AnalyticsData["topProducts"] }) => (
  <Card className="hover:shadow-lg transition-all duration-300">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Star className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-xl">Top Products</CardTitle>
        </div>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          View All
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell className="font-semibold">Product</TableCell>
            <TableCell className="font-semibold">Revenue</TableCell>
            <TableCell className="font-semibold">Quantity</TableCell>
            <TableCell className="font-semibold">Orders</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.slice(0, 5).map((product, index) => (
            <TableRow key={index} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <div className="font-medium">{product.productName}</div>
                </div>
              </TableCell>
              <TableCell className="font-medium">
                ৳{product.totalRevenue.toLocaleString()}
              </TableCell>
              <TableCell className="font-medium">{product.totalQuantity}</TableCell>
              <TableCell className="font-medium">{product.orderCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

// Order Funnel Card
const OrderFunnelCard = ({ funnel }: { funnel: AnalyticsData["orderFunnel"] }) => {
  const steps = [
    { label: "Visitors", value: funnel.totalVisitors, icon: Eye },
    { label: "Orders Placed", value: funnel.ordersPlaced, icon: ShoppingCart },
    { label: "Processing", value: funnel.ordersProcessing, icon: Clock },
    { label: "Completed", value: funnel.ordersCompleted, icon: CheckCircle },
  ];

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Order Funnel</CardTitle>
            <CardDescription>Conversion Rate: {funnel.conversionRate}%</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.label} className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{step.label}</span>
                  <span className="text-lg font-bold">{step.value}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-1">
                  <div
                    className="bg-primary rounded-full h-2 transition-all duration-300"
                    style={{
                      width: `${(step.value / funnel.totalVisitors) * 100}%`,
                    }}
                  ></div>
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
const AdvancedDashboardPageSimplified: React.FC = () => {
  const { theme } = useSettings();
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: startOfDay(subDays(new Date(), 30)),
    end: endOfDay(new Date()),
  });
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isThemed = theme !== "light" && theme !== "dark";

  // Mock data
  const mockData: AnalyticsData = useMemo(() => ({
    kpis: [
      { name: "Total Revenue", value: 150000, change: 15.5, format: "currency", icon: "revenue" },
      { name: "Total Orders", value: 45, change: 12.5, format: "number", icon: "orders" },
      { name: "Average Order Value", value: 3333.33, change: 2.7, format: "currency", icon: "target" },
      { name: "Return Rate", value: 3.33, change: -0.5, format: "percentage", icon: "percentage" },
      { name: "Profit Margin", value: 46.67, change: 8.2, format: "percentage", icon: "award" },
      { name: "Collection Rate", value: 80, change: 5.3, format: "percentage", icon: "target" },
    ],
    topCustomers: [
      { customerName: "John Doe", _id: "CUST001", totalOrders: 15, totalSpent: 45000, avgOrderValue: 3000, segment: "VIP" },
      { customerName: "Jane Smith", _id: "CUST002", totalOrders: 12, totalSpent: 36000, avgOrderValue: 3000, segment: "Premium" },
      { customerName: "Bob Wilson", _id: "CUST003", totalOrders: 8, totalSpent: 24000, avgOrderValue: 3000, segment: "Loyal" },
      { customerName: "Alice Brown", _id: "CUST004", totalOrders: 6, totalSpent: 18000, avgOrderValue: 3000, segment: "Regular" },
      { customerName: "Charlie Davis", _id: "CUST005", totalOrders: 10, totalSpent: 30000, avgOrderValue: 3000, segment: "Premium" },
    ],
    topProducts: [
      { productName: "Premium Widget", totalQuantity: 50, totalRevenue: 25000, orderCount: 25 },
      { productName: "Standard Tool", totalQuantity: 100, totalRevenue: 20000, orderCount: 50 },
      { productName: "Deluxe Package", totalQuantity: 30, totalRevenue: 18000, orderCount: 15 },
      { productName: "Basic Item", totalQuantity: 200, totalRevenue: 15000, orderCount: 100 },
      { productName: "Pro Version", totalQuantity: 40, totalRevenue: 12000, orderCount: 20 },
    ],
    statusDistribution: [
      { label: "completed", value: 25, percentage: "55.6" },
      { label: "processing", value: 12, percentage: "26.7" },
      { label: "cancelled", value: 8, percentage: "17.7" },
    ],
    orderFunnel: {
      totalVisitors: 135,
      ordersPlaced: 45,
      ordersProcessing: 12,
      ordersCompleted: 25,
      conversionRate: "33.3",
    },
  }), []);

  const getBackgroundClasses = () => {
    if (isThemed) {
      const themeGradients = {
        blue: "min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100/50",
        green: "min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100/50",
        purple: "min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100/50",
        orange: "min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100/50",
      };
      return (
        themeGradients[theme as keyof typeof themeGradients] ||
        "min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50"
      );
    }
    return "min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50";
  };

  const fetchAnalyticsData = useCallback(async (showToast = false) => {
    try {
      setError(null);
      if (!refreshing) setLoading(true);

      // Real API call
      const response = await axiosInstance.get('/v1/dashboard/advanced-analytics', {
        params: {
          startDate: formatISO(dateRange.start),
          endDate: formatISO(dateRange.end),
        },
        timeout: 30000,
      });

      const apiData = response.data?.data || response.data;
      
      if (apiData && apiData.kpis) {
        setAnalyticsData(apiData);
      } else {
        setAnalyticsData(mockData);
      }

      if (showToast) {
        toast.success('Analytics data updated successfully');
      }
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      
      if (process.env.NODE_ENV === 'development') {
        setAnalyticsData(mockData);
        toast.error('Using demo data (API unavailable)');
      } else {
        setError('Failed to load analytics data');
        toast.error('Failed to load analytics data');
      }
    } finally {
      setLoading(false);
      if (refreshing) setRefreshing(false);
    }
  }, [dateRange, refreshing, mockData]);

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAnalyticsData(true);
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, fetchAnalyticsData]);

  return (
    <div className={getBackgroundClasses()}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="p-6 lg:p-8">
          <div className="flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl">
                <Activity className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Advanced Analytics
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  Comprehensive business intelligence and insights
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="hidden lg:flex items-center space-x-2 text-sm text-muted-foreground px-4 py-2 bg-muted/50 rounded-full border">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(dateRange.start, "MMM dd")} - {format(dateRange.end, "MMM dd, yyyy")}
                </span>
              </div>

              <DateRangePicker
                initialDateFrom={dateRange.start}
                initialDateTo={dateRange.end}
                showCompare={false}
                onUpdate={(values: { range: DateRange }) => {
                  if (values.range.from && values.range.to) {
                    setDateRange({
                      start: startOfDay(values.range.from),
                      end: endOfDay(values.range.to),
                    });
                  }
                }}
              />

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={refreshData}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Refresh
                </Button>

                <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 lg:p-8 space-y-8">
        {error && !loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Unable to Load Analytics Data
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchAnalyticsData()} className="bg-primary hover:bg-primary/90">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Loading Analytics</h3>
            <p className="text-muted-foreground">Fetching your latest data...</p>
          </div>
        ) : analyticsData ? (
          <>
            {/* KPI Cards */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Key Performance Indicators</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {analyticsData.kpis.map((kpi, index) => (
                  <KPICard key={index} kpi={kpi} />
                ))}
              </div>
            </section>

            {/* Charts */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Performance Trends</h2>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                  <ChartPlaceholder
                    title="Revenue & Orders Trend"
                    icon={<LineChartIcon className="h-5 w-5 text-primary" />}
                  />
                </div>
                <div>
                  <ChartPlaceholder
                    title="Order Status Distribution"
                    icon={<PieChartIcon className="h-5 w-5 text-primary" />}
                  />
                </div>
              </div>
            </section>

            {/* Secondary Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <ChartPlaceholder
                title="Top Products by Revenue"
                icon={<BarChart3 className="h-5 w-5 text-primary" />}
              />
              <OrderFunnelCard funnel={analyticsData.orderFunnel} />
            </div>

            {/* Tables */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Detailed Analytics</h2>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <TopCustomersTable customers={analyticsData.topCustomers} />
                <TopProductsTable products={analyticsData.topProducts} />
              </div>
            </section>

            {/* Status Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <span>Order Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.statusDistribution.map((status, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(status.label)}
                          <span className="font-medium capitalize">{status.label}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{status.percentage}%</div>
                          <div className="text-sm text-muted-foreground">{status.value} orders</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <span>Payment Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Cash on Delivery</span>
                      <div className="text-right">
                        <div className="font-bold">65%</div>
                        <div className="text-sm text-muted-foreground">29 orders</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Mobile Banking</span>
                      <div className="text-right">
                        <div className="font-bold">25%</div>
                        <div className="text-sm text-muted-foreground">11 orders</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Bank Transfer</span>
                      <div className="text-right">
                        <div className="font-bold">10%</div>
                        <div className="text-sm text-muted-foreground">5 orders</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <span>Top Locations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Dhaka</span>
                      <div className="text-right">
                        <div className="font-bold">25 orders</div>
                        <div className="text-sm text-muted-foreground">৳75,000</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Chittagong</span>
                      <div className="text-right">
                        <div className="font-bold">12 orders</div>
                        <div className="text-sm text-muted-foreground">৳36,000</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Sylhet</span>
                      <div className="text-right">
                        <div className="font-bold">8 orders</div>
                        <div className="text-sm text-muted-foreground">৳24,000</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Data Available</h3>
            <p className="text-muted-foreground">No analytics data found for the selected date range.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdvancedDashboardPageSimplified;