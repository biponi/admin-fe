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
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../../components/ui/card"; // Shadcn UI for cards
import axiosInstance from "../../api/axios";
import config from "../../utils/config";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Legend,
  Bar,
  Rectangle,
} from "recharts"; // Import Recharts components
import { COLORS } from "../../utils/contents";

interface Trends {
  _id: string;
  totalProductCount: number; // Replace with correct type for trend data
  totalPaidAmount: number;
  totalAmount: number;
  totalDueAmount: number;
}

interface Props {
  selectedTab: string;
}

// Define some colors for the pie chart

const SecondPage: React.FC<Props> = ({ selectedTab }) => {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(
    null
  );

  const [trends, setTrends] = useState<Trends[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const [orderPaymentStatusData, setOrderPaymentStatusData] = useState<any[]>(
    []
  );

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
  };

  const fetchData = async () => {
    try {
      const { data } = await axiosInstance.get(
        config.dashboard.getDashboardAnalysisData(),
        {
          params: {
            startDate: format(dateRange?.start || new Date(), "yyyy-MM-dd"),
            endDate: format(dateRange?.end || new Date(), "yyyy-MM-dd"),
          },
        }
      );
      //   setCurrentMetrics(data.currentMetrics);
      //   setPreviousMonthMetrics(data.previousMonthMetrics);
      setTrends(data.productAnalysis);
      setOrderStatusData(data.statusAnalysis); // Assuming the API returns order status distribution data

      const productStatusData = [
        { _id: "totalProductCount", count: 0 },
        { _id: "totalAmount", count: 0 },
        { _id: "totalPaidAmount", count: 0 },
        { _id: "totalDueAmount", count: 0 },
      ];

      data.productAnalysis.forEach((data: Trends) => {
        productStatusData[0].count += data?.totalProductCount;
        productStatusData[1].count += data?.totalAmount;
        productStatusData[2].count += data?.totalPaidAmount;
        productStatusData[3].count += data?.totalDueAmount;
      });
      setOrderPaymentStatusData([...productStatusData]);
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
    <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
      <Tabs
        className="hidden"
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

      {/* Orders Trend Chart - Mobile Optimized */}
      <Card className="w-full">
        <CardHeader className='pb-3'>
          <CardTitle className='text-lg sm:text-xl'>Orders Trend</CardTitle>
          <CardDescription className='text-sm text-gray-600'>Daily order analytics and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-64 sm:h-80 lg:h-96'>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trends}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="_id" 
                  fontSize={10}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={10}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Bar
                  dataKey="totalProductCount"
                  name="Product Count"
                  fill={COLORS[0] || '#3b82f6'}
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="totalAmount"
                  name="Total Amount"
                  fill={COLORS[1] || '#10b981'}
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="totalDueAmount"
                  name="Due Amount"
                  fill={COLORS[2] || '#f59e0b'}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pie Charts - Mobile Optimized Stack Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card className="flex flex-col">
          <CardHeader className="text-center pb-3">
            <CardTitle className='text-lg sm:text-xl'>Order Status Distribution</CardTitle>
            {!!dateRange && (
              <CardDescription className='text-sm'>
                {format(dateRange.start, 'MMM dd')} - {format(dateRange.end, 'MMM dd')}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className='flex-1'>
            <div className='h-64 sm:h-80'>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    fill="#8884d8"
                    label={({ name, percent }: any) => 
                      `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="text-center">
            <div className="text-xs sm:text-sm text-gray-600">
              Order status breakdown for selected period
            </div>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="text-center pb-3">
            <CardTitle className='text-lg sm:text-xl'>Payment Status Overview</CardTitle>
            {!!dateRange && (
              <CardDescription className='text-sm'>
                {format(dateRange.start, 'MMM dd')} - {format(dateRange.end, 'MMM dd')}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className='flex-1'>
            <div className='h-64 sm:h-80'>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderPaymentStatusData}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    fill="#8884d8"
                    label={({ name, percent }: any) => 
                      `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {orderPaymentStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="text-center">
            <div className="text-xs sm:text-sm text-gray-600">
              Payment analytics for selected timeframe
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SecondPage;
