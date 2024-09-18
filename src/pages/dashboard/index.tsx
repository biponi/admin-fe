import { useState, useEffect } from "react";

import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  subMonths,
} from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"; // Assuming you have a Tabs component
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "../../components/ui/table"; // Assuming you have a Table component
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "../../components/ui/card"; // Assuming you are using Shadcn UI for cards
import axiosInstance from "../../api/axios";
import config from "../../utils/config";
import { Badge } from "../../components/ui/badge";
import TrendCard from "./trendCard";
import SecondPage from "./secondPage";

interface Metrics {
  totalOrders: number;
  totalPaid: number;
  totalShipped: number;
  processingOrders: number;
}

interface PreviousMonthMetrics {
  totalOrders: number;
  totalPaid: number;
  totalShipped: number;
  processingOrders: number;
}

interface Trends {
  totalOrdersTrend: any[]; // Replace `any[]` with the correct type for your trend data
  totalPaidTrend: any[];
  totalShippedTrend: any[];
  processingOrdersTrend: any[];
}

const DashboardPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("today");
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(
    null
  );
  const [orders, setOrders] = useState<any[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<Metrics>({
    totalOrders: 0,
    totalPaid: 0,
    totalShipped: 0,
    processingOrders: 0,
  });
  const [previousMonthMetrics, setPreviousMonthMetrics] =
    useState<PreviousMonthMetrics>({
      totalOrders: 0,
      totalPaid: 0,
      totalShipped: 0,
      processingOrders: 0,
    });
  const [trends, setTrends] = useState<Trends>({
    totalOrdersTrend: [],
    totalPaidTrend: [],
    totalShippedTrend: [],
    processingOrdersTrend: [],
  });

  const setRange = (tab: string) => {
    switch (tab) {
      case "lastWeek":
        setDateRange({
          start: startOfWeek(new Date(), { weekStartsOn: 1 }),
          end: endOfWeek(new Date(), { weekStartsOn: 1 }),
        });
        break;
      case "lastMonth":
        setDateRange({
          start: startOfMonth(subMonths(new Date(), 1)),
          end: endOfMonth(subMonths(new Date(), 1)),
        });
        break;
      case "last6Months":
        const start = startOfMonth(subMonths(new Date(), 6));
        setDateRange({
          start,
          end: endOfMonth(new Date()),
        });
        break;
      case "today":
      default:
        setDateRange({
          start: startOfDay(new Date()),
          end: endOfDay(new Date()),
        });
        break;
    }
    setSelectedTab(tab);
  };

  const fetchData = async () => {
    try {
      const { data } = await axiosInstance.get(
        config.dashboard.getDashboardAnalysis(),
        {
          params: {
            startDate: format(dateRange?.start || new Date(), "yyyy-MM-dd"),
            endDate: format(dateRange?.end || new Date(), "yyyy-MM-dd"),
          },
        }
      );
      setOrders(data.orders);
      setTrendingProducts(data.trendingProducts);
      setCurrentMetrics(data.currentMetrics);
      setPreviousMonthMetrics(data.previousMonthMetrics);
      setTrends(data.trends);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (dateRange) {
      fetchData();
    }

    //eslint-disable-next-line
  }, [dateRange]);

  useEffect(() => {
    setRange(selectedTab);
    //eslint-disable-next-line
  }, [selectedTab]);
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <Tabs
        value={selectedTab}
        onValueChange={(value: string) => setRange(value)}
      >
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="lastWeek">Last Week</TabsTrigger>
          <TabsTrigger value="lastMonth">Last Month</TabsTrigger>
          <TabsTrigger value="last6Months">Last 6 Months</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Metrics Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TrendCard
          title="Total Orders"
          dataKey="count"
          trendData={trends.totalOrdersTrend}
          currentMetric={currentMetrics.totalOrders}
          previousMetric={previousMonthMetrics.totalOrders}
        />
        <TrendCard
          title="Total Paid"
          dataKey="count"
          trendData={trends.totalPaidTrend}
          currentMetric={currentMetrics.totalPaid}
          previousMetric={previousMonthMetrics.totalPaid}
        />
        <TrendCard
          title="Total Shipped"
          dataKey="count"
          trendData={trends.totalShippedTrend}
          currentMetric={currentMetrics.totalShipped}
          previousMetric={previousMonthMetrics.totalShipped}
        />
        <TrendCard
          title="Completed Orders"
          dataKey="count"
          trendData={trends.processingOrdersTrend}
          currentMetric={currentMetrics.processingOrders}
          previousMetric={previousMonthMetrics.processingOrders}
        />
      </div>

      <SecondPage selectedTab={selectedTab} />

      {/* Tables */}
      <div className="mt-6 grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-6 ">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.slice(0, 20).map((order, index) => (
                    <TableRow key={order.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.customer.name}</TableCell>
                      <TableCell>৳ {order.totalPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order?.status === "completed"
                              ? "default"
                              : order?.status === "shipped"
                              ? "outline"
                              : order?.status === "processing"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trending Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Variation</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Total Sales</TableCell>
                  <TableCell>Estimate Amount</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trendingProducts.map((product, index) => (
                  <TableRow key={product.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{product.productName}</TableCell>
                    <TableCell>{product.variation}</TableCell>
                    <TableCell>{product.categoryName}</TableCell>
                    <TableCell>{product.totalSales}</TableCell>
                    <TableCell>{product.totalRevenue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
