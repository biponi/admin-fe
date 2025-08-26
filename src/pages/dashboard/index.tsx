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
    <div className='p-3 sm:p-6'>
      <div className='mb-4 sm:mb-6'>
        <h1 className='text-2xl sm:text-3xl font-bold mb-3 sm:mb-4'>Dashboard</h1>
        <Tabs
          value={selectedTab}
          onValueChange={(value: string) => setRange(value)}>
          <TabsList className='grid w-full grid-cols-2 sm:grid-cols-4 h-9 sm:h-10'>
            <TabsTrigger value='today' className='text-xs sm:text-sm h-full touch-manipulation'>Today</TabsTrigger>
            <TabsTrigger value='lastWeek' className='text-xs sm:text-sm h-full touch-manipulation'>This Week</TabsTrigger>
            <TabsTrigger value='lastMonth' className='text-xs sm:text-sm h-full touch-manipulation'>This Month</TabsTrigger>
            <TabsTrigger value='last6Months' className='text-xs sm:text-sm h-full touch-manipulation'>6 Months</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Metrics Cards - Mobile Optimized */}
      <div className='mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
        <TrendCard
          title='Total Orders'
          dataKey='count'
          trendData={trends.totalOrdersTrend}
          currentMetric={currentMetrics.totalOrders}
          previousMetric={previousMonthMetrics.totalOrders}
        />
        <TrendCard
          title='Total Paid'
          dataKey='count'
          trendData={trends.totalPaidTrend}
          currentMetric={currentMetrics.totalPaid}
          previousMetric={previousMonthMetrics.totalPaid}
        />
        <TrendCard
          title='Total Shipped'
          dataKey='count'
          trendData={trends.totalShippedTrend}
          currentMetric={currentMetrics.totalShipped}
          previousMetric={previousMonthMetrics.totalShipped}
        />
        <TrendCard
          title='Completed Orders'
          dataKey='count'
          trendData={trends.processingOrdersTrend}
          currentMetric={currentMetrics.processingOrders}
          previousMetric={previousMonthMetrics.processingOrders}
        />
      </div>

      <SecondPage selectedTab={selectedTab} />

      {/* Mobile-Friendly Tables */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
        {/* Recent Orders - Mobile Cards */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg sm:text-xl'>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            {/* Desktop Table */}
            <div className='hidden sm:block overflow-x-auto'>
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
                  {orders.slice(0, 10).map((order, index) => (
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
                          }>
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Mobile Card List */}
            <div className='sm:hidden space-y-3 p-4'>
              {orders.slice(0, 8).map((order, index) => (
                <div key={order.id} className='bg-gray-50 rounded-lg p-3 space-y-2'>
                  <div className='flex justify-between items-start'>
                    <div>
                      <p className='font-medium text-sm'>#{order.id}</p>
                      <p className='text-xs text-gray-600'>{order.customer.name}</p>
                    </div>
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
                      className='text-xs'>
                      {order.status}
                    </Badge>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-xs text-gray-500'>Order #{index + 1}</span>
                    <span className='font-semibold text-sm'>৳ {order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trending Products - Mobile Cards */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg sm:text-xl'>Trending Products</CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            {/* Desktop Table */}
            <div className='hidden sm:block overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Variation</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Sales</TableCell>
                    <TableCell>Amount</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trendingProducts.slice(0, 10).map((product, index) => (
                    <TableRow key={product.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className='max-w-32 truncate'>{product.productName}</TableCell>
                      <TableCell>{product.variation}</TableCell>
                      <TableCell>{product.categoryName}</TableCell>
                      <TableCell>{product.totalSales}</TableCell>
                      <TableCell>{product.totalRevenue}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Mobile Card List */}
            <div className='sm:hidden space-y-3 p-4'>
              {trendingProducts.slice(0, 8).map((product, index) => (
                <div key={product.id} className='bg-gray-50 rounded-lg p-3 space-y-2'>
                  <div className='flex justify-between items-start'>
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium text-sm truncate'>{product.productName}</p>
                      <p className='text-xs text-gray-600'>{product.categoryName}</p>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold text-sm'>{product.totalRevenue}</p>
                      <p className='text-xs text-gray-500'>{product.totalSales} sales</p>
                    </div>
                  </div>
                  {product.variation && (
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-gray-500'>#{index + 1}</span>
                      <span className='text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded'>{product.variation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
