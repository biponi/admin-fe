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
    <div className="py-6">
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

      {/* Metrics Cards */}

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Orders Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              width={500}
              height={300}
              data={trends}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="totalProductCount"
                fill={COLORS[COLORS.length - 1]}
                activeBar={<Rectangle fill="pink" stroke="blue" />}
              />
              <Bar
                dataKey="totalAmount"
                fill={COLORS[COLORS.length - 2]}
                activeBar={<Rectangle fill="gold" stroke="purple" />}
              />
              <Bar
                dataKey="totalProductCount"
                fill={COLORS[COLORS.length - 3]}
                activeBar={<Rectangle fill="blue" stroke="blue" />}
              />
              <Bar
                dataKey="totalDueAmount"
                fill={COLORS[COLORS.length - 4]}
                activeBar={<Rectangle fill="yellow" stroke="purple" />}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Line Chart and Pie Chart */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Pie Chart - Order Status</CardTitle>
            {!!dateRange && (
              <CardDescription>
                {dateRange?.start.toDateString()} -{" "}
                {dateRange?.end.toDateString()}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % orderStatusData.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="leading-none text-muted-foreground">
              Showing total order status data from{" "}
              {dateRange?.start.toDateString() ?? ""} to{" "}
              {dateRange?.end.toDateString() ?? ""}
            </div>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Pie Chart - Payment Status</CardTitle>
            {!!dateRange && (
              <CardDescription>
                {dateRange?.start.toDateString()} -{" "}
                {dateRange?.end.toDateString()}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderPaymentStatusData}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {orderPaymentStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % orderPaymentStatusData.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="leading-none text-muted-foreground">
              Showing total payment data from{" "}
              {dateRange?.start.toDateString() ?? ""} to{" "}
              {dateRange?.end.toDateString() ?? ""}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SecondPage;
