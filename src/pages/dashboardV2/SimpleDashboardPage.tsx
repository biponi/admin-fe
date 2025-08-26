import { useState, useEffect } from "react";

import {
  formatISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  subMonths,
} from "date-fns";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "../../components/ui/table";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "../../components/ui/card";
import axiosInstance from "../../api/axios";
import config from "../../utils/config";
import RadialChartComponent from "./radialChart";
import DynamicCard from "./reportCard";
import InteractiveCardComponent from "./interactiveCard";
import {
  combineDailyComparison,
  getRankWithEmoji,
  structureStatusData,
} from "./utils/functions";
import InteractiveSingleCardComponent from "./interactiveSingleCard";
import { DateRangePicker } from "../../coreComponents/DateRangePicker";
import { DateRange } from "react-day-picker";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/button";
import { Loader, PieChart, BarChart3, Crown, Star } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";
export interface ReportResponse {
  reports: {
    sales: number;
    purchases: number;
    returns: number;
    failedAndCancelled: Array<{
      _id: string; // e.g., "failed" or "cancelled"
      count: number;
      total: number;
    }>;
    processingAndCompleted: Array<{
      _id: string; // e.g., "processing" or "completed"
      count: number;
      total: number;
    }>;
  };
  graphs: {
    statusCounts: Array<{
      _id: string; // e.g., "failed", "completed", etc.
      count: number;
    }>;
    comparison: {
      purchases: number;
      processingOrders: number;
      completedOrders: number;
    };
    dailyComparison: [
      Array<any>, // Empty array for purchases
      Array<{
        _id: string; // e.g., date "2024-06-08"
        totalOrders: number;
      }>
    ];
    orderStatusDailyComparison: Array<{
      _id: string; // e.g., date "2024-06-08"
      statuses: Array<{
        status: string; // e.g., "processing", "completed"
        count: number;
      }>;
    }>;
  };
  bestProducts: Array<{
    _id: string | null; // Can be null
    name: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  topCustomers: Array<{
    _id: string; // Customer identifier
    name: string;
    mobile: string;
    totalSpent: number;
    totalOrders: number;
  }>;
  orderMetrics: {
    currentMetrics: {
      totalOrders: number;
      totalAmount: number;
      totalPaid: number;
      totalRemaining: number;
      totalDeliveryCharge: number;
      totalDiscount: number;
      processingOrders: number;
    };
    previousMonthMetrics: {
      totalOrders: number;
      totalAmount: number;
      totalPaid: number;
      totalDeliveryCharge: number;
      totalDiscount: number;
      totalRemaining: number;
      processingOrders: number;
    };
  };
}

const DashboardPage: React.FC = () => {
  const { theme } = useSettings();
  const [selectedTab, setSelectedTab] = useState("today");
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(
    null
  );

  const [analysisData, setAnalysisData] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCSV, setLoadingCSV] = useState(false);

  const isThemed = theme !== "light" && theme !== "dark";

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
      setLoading(true);
      const { data } = await axiosInstance.get(
        config.dashboard.getDashboardAnalysis(),
        {
          params: {
            startDate: formatISO(dateRange?.start || new Date()),
            endDate: formatISO(dateRange?.end || new Date()),
          },
        }
      );
      setAnalysisData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const generateReport = async () => {
    setLoadingCSV(true);
    try {
      await axiosInstance.get(config.dashboard.generateAnalysisReport(), {
        params: {
          startDate: formatISO(dateRange?.start || new Date()),
          endDate: formatISO(dateRange?.end || new Date()),
        },
      });
      toast.success(
        "Report generated successfully!, it will be mailed to admin."
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to generate report. Please try again later.");
    }
    setLoadingCSV(false);
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

  const mainReportView = () => {
    return (
      <>
        {/* Key Metrics Overview - Mobile Optimized */}
        <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8'>
          <DynamicCard
            title='Total Orders'
            subtitle='Growth in total orders this period'
            previousValue={
              analysisData?.orderMetrics?.previousMonthMetrics?.totalOrders ?? 0
            }
            currentValue={
              analysisData?.orderMetrics?.currentMetrics?.totalOrders ?? 0
            }
          />
          <DynamicCard
            title='Total Amount'
            subtitle='Growth in total amount by order this period'
            previousValue={
              analysisData?.orderMetrics?.previousMonthMetrics?.totalAmount ?? 0
            }
            currentValue={
              analysisData?.orderMetrics?.currentMetrics?.totalAmount ?? 0
            }
          />
          <DynamicCard
            title='Total Purchase'
            subtitle='This is only the total purchase amount this period'
            previousValue={0}
            currentValue={analysisData?.reports?.purchases ?? 0}
          />
          <DynamicCard
            title='Total Return'
            subtitle='This is only the order return amount this period'
            previousValue={0}
            currentValue={analysisData?.reports?.returns ?? 0}
          />
        </div>

        {/* Financial Metrics - Mobile Optimized */}
        <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8'>
          <DynamicCard
            title='Total Paid'
            subtitle='Growth in total paid this period'
            previousValue={
              analysisData?.orderMetrics?.previousMonthMetrics?.totalPaid ?? 0
            }
            currentValue={
              analysisData?.orderMetrics?.currentMetrics?.totalPaid ?? 0
            }
          />
          <DynamicCard
            title='Total Remaining'
            subtitle='Growth in order remaining this period'
            previousValue={
              analysisData?.orderMetrics?.previousMonthMetrics
                ?.totalRemaining ?? 0
            }
            currentValue={
              analysisData?.orderMetrics?.currentMetrics?.totalRemaining ?? 0
            }
          />
          <DynamicCard
            title='Total Delivery Charge'
            subtitle='Growth in total delivery charge this period'
            previousValue={
              analysisData?.orderMetrics?.previousMonthMetrics
                ?.totalDeliveryCharge ?? 0
            }
            currentValue={
              analysisData?.orderMetrics?.currentMetrics?.totalDeliveryCharge ??
              0
            }
          />
          <DynamicCard
            title='Total Discount Amount'
            subtitle='Growth in total discount amount by order this period'
            previousValue={
              analysisData?.orderMetrics?.previousMonthMetrics?.totalDiscount ??
              0
            }
            currentValue={
              analysisData?.orderMetrics?.currentMetrics?.totalDiscount ?? 0
            }
          />
        </div>

        {/* Charts Section - Mobile Optimized */}
        <div className='grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8'>
          <InteractiveCardComponent
            title='Purchase Vs Order Amount'
            subTitle={`Showing data from ${
              dateRange?.start.toDateString() ?? ""
            } to ${dateRange?.end.toDateString() ?? ""}`}
            data={combineDailyComparison(
              analysisData?.graphs?.dailyComparison ?? []
            ).reverse()}
            totalOrder={analysisData?.reports?.sales ?? 0}
            totalPurchase={analysisData?.reports?.purchases ?? 0}
          />

          <InteractiveSingleCardComponent
            title='Order Stauts Daily Comparison'
            subTitle={`Showing data from ${
              dateRange?.start.toDateString() ?? ""
            } to ${dateRange?.end.toDateString() ?? ""}`}
            data={structureStatusData(analysisData).reverse()}
          />
        </div>

        {/* Status Analytics - Mobile Optimized */}
        <div className='mb-4 sm:mb-8'>
          <h2 className='text-lg sm:text-2xl font-bold mb-3 sm:mb-6 text-foreground'>
            Order Status Analytics
          </h2>
          <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-6'>
            {!!analysisData?.reports?.processingAndCompleted &&
              analysisData?.reports?.processingAndCompleted.length > 0 &&
              !!analysisData?.reports?.processingAndCompleted[0]._id && (
                <RadialChartComponent
                  label={
                    analysisData?.reports?.processingAndCompleted[0]._id ?? ""
                  }
                  title={`Total ${
                    analysisData?.reports?.processingAndCompleted[0]._id ?? ""
                  }`}
                  subTitle={`${dateRange?.start.toDateString() ?? ""} - ${
                    dateRange?.end.toDateString() ?? ""
                  }`}
                  footerSrting={` Showing total ${
                    analysisData?.reports?.processingAndCompleted[0]._id ?? ""
                  } data `}
                  chartData={[
                    {
                      browser: "safari",
                      [analysisData?.reports?.processingAndCompleted[0]._id ??
                      ""]:
                        analysisData?.reports?.processingAndCompleted[0]
                          .count ?? 0,
                      fill: "var(--color-safari)",
                    },
                  ]}
                  total={
                    analysisData?.orderMetrics?.currentMetrics?.totalOrders ?? 0
                  }
                />
              )}

            {!!analysisData?.reports?.processingAndCompleted &&
              analysisData?.reports?.processingAndCompleted.length > 1 &&
              !!analysisData?.reports?.processingAndCompleted[1]._id && (
                <RadialChartComponent
                  label={
                    analysisData?.reports?.processingAndCompleted[1]._id ?? ""
                  }
                  title={`Total ${
                    analysisData?.reports?.processingAndCompleted[1]._id ?? ""
                  }`}
                  subTitle={`${dateRange?.start.toDateString() ?? ""} - ${
                    dateRange?.end.toDateString() ?? ""
                  }`}
                  footerSrting={` Showing total ${
                    analysisData?.reports?.processingAndCompleted[1]._id ?? ""
                  } data `}
                  chartData={[
                    {
                      browser: "safari",
                      [analysisData?.reports?.processingAndCompleted[1]._id ??
                      ""]:
                        analysisData?.reports?.processingAndCompleted[1]
                          .count ?? 0,
                      fill: "var(--color-safari)",
                    },
                  ]}
                  total={
                    analysisData?.orderMetrics?.currentMetrics?.totalOrders ?? 0
                  }
                />
              )}

            {!!analysisData?.reports?.failedAndCancelled &&
              analysisData?.reports?.failedAndCancelled.length > 0 &&
              !!analysisData?.reports?.failedAndCancelled[0]._id && (
                <RadialChartComponent
                  label={analysisData?.reports?.failedAndCancelled[0]._id ?? ""}
                  title={`Total ${
                    analysisData?.reports?.failedAndCancelled[0]._id ?? ""
                  }`}
                  subTitle={`${dateRange?.start.toDateString() ?? ""} - ${
                    dateRange?.end.toDateString() ?? ""
                  }`}
                  footerSrting={` Showing total ${
                    analysisData?.reports?.failedAndCancelled[0]._id ?? ""
                  } data`}
                  chartData={[
                    {
                      browser: "safari",
                      [analysisData?.reports?.failedAndCancelled[0]._id ?? ""]:
                        analysisData?.reports?.failedAndCancelled[0].count ?? 0,
                      fill: "var(--color-safari)",
                    },
                  ]}
                  total={
                    analysisData?.orderMetrics?.currentMetrics?.totalOrders ?? 0
                  }
                />
              )}

            {!!analysisData?.reports?.failedAndCancelled &&
              analysisData?.reports?.failedAndCancelled.length > 1 &&
              !!analysisData?.reports?.failedAndCancelled[1]._id && (
                <RadialChartComponent
                  label={analysisData?.reports?.failedAndCancelled[1]._id ?? ""}
                  title={`Total ${
                    analysisData?.reports?.failedAndCancelled[1]._id ?? ""
                  }`}
                  subTitle={`${dateRange?.start.toDateString() ?? ""} - ${
                    dateRange?.end.toDateString() ?? ""
                  }`}
                  footerSrting={` Showing total ${
                    analysisData?.reports?.failedAndCancelled[1]._id ?? ""
                  } data`}
                  chartData={[
                    {
                      browser: "safari",
                      [analysisData?.reports?.failedAndCancelled[1]._id ?? ""]:
                        analysisData?.reports?.failedAndCancelled[1].count ?? 0,
                      fill: "var(--color-safari)",
                    },
                  ]}
                  total={
                    analysisData?.orderMetrics?.currentMetrics?.totalOrders ?? 0
                  }
                />
              )}

            {!!analysisData?.reports?.failedAndCancelled &&
              analysisData?.reports?.failedAndCancelled.length > 2 &&
              !!analysisData?.reports?.failedAndCancelled[2]._id && (
                <RadialChartComponent
                  label={analysisData?.reports?.failedAndCancelled[2]._id ?? ""}
                  title={`Total ${
                    analysisData?.reports?.failedAndCancelled[2]._id ?? ""
                  }`}
                  subTitle={`${dateRange?.start.toDateString() ?? ""} - ${
                    dateRange?.end.toDateString() ?? ""
                  }`}
                  footerSrting={` Showing total ${
                    analysisData?.reports?.failedAndCancelled[2]._id ?? ""
                  } data`}
                  chartData={[
                    {
                      browser: "safari",
                      [analysisData?.reports?.failedAndCancelled[2]._id ?? ""]:
                        analysisData?.reports?.failedAndCancelled[2].count ?? 0,
                      fill: "var(--color-safari)",
                    },
                  ]}
                  total={
                    analysisData?.orderMetrics?.currentMetrics?.totalOrders ?? 0
                  }
                />
              )}
          </div>
        </div>

        {/* Performance Tables - Mobile Optimized */}
        <div>
          <h2 className='text-lg sm:text-2xl font-bold mb-3 sm:mb-6 text-foreground'>
            Performance Insights
          </h2>
          <div className='grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8'>
            <Card className='hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/80 border-0 shadow-md'>
              <CardHeader className='pb-2 sm:pb-4'>
                <div className='flex items-center space-x-2 sm:space-x-3'>
                  <div className='p-1 sm:p-2 bg-primary/10 rounded-lg'>
                    <Crown className='h-4 w-4 sm:h-5 sm:w-5 text-primary' />
                  </div>
                  <CardTitle className='text-base sm:text-xl'>Top Customers</CardTitle>
                </div>
              </CardHeader>
              <CardContent className='pt-0'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Customer Name</TableCell>
                      <TableCell>Mobile Number</TableCell>
                      <TableCell>Total Order</TableCell>
                      <TableCell>Total Spent</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysisData?.topCustomers.map((customer, index) => (
                      <TableRow key={index}>
                        <TableCell>{getRankWithEmoji(index + 1)}</TableCell>
                        <TableCell>{customer?.name}</TableCell>
                        <TableCell>{customer?.mobile}</TableCell>
                        <TableCell>{customer?.totalOrders}</TableCell>
                        <TableCell>৳ {customer?.totalSpent}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className='hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/80 border-0 shadow-md'>
              <CardHeader className='pb-2 sm:pb-4'>
                <div className='flex items-center space-x-2 sm:space-x-3'>
                  <div className='p-1 sm:p-2 bg-primary/10 rounded-lg'>
                    <Star className='h-4 w-4 sm:h-5 sm:w-5 text-primary' />
                  </div>
                  <CardTitle className='text-base sm:text-xl'>Trending Products</CardTitle>
                </div>
              </CardHeader>
              <CardContent className='pt-0'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Product</TableCell>
                      <TableCell>Total Sales</TableCell>
                      <TableCell>Estimate Amount</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysisData?.bestProducts.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{product?.name}</TableCell>
                        <TableCell>{product?.totalQuantity}</TableCell>
                        <TableCell>{product?.totalRevenue}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  };

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

  const getHeaderClasses = () => {
    return "bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200";
  };

  return (
    <div className={getBackgroundClasses()}>
      {/* Enhanced Header Section - Mobile Optimized */}
      <div className={getHeaderClasses()}>
        <div className='p-3 sm:p-6 lg:p-8'>
          <div className='flex flex-col space-y-4 sm:space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0'>
            <div className='space-y-2 sm:space-y-3'>
              <div className='flex items-center space-x-2 sm:space-x-3'>
                <div className='p-2 sm:p-3 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg sm:rounded-xl'>
                  <BarChart3 className='h-5 w-5 sm:h-8 sm:w-8 text-primary' />
                </div>
                <div className='min-w-0 flex-1'>
                  <h1 className='text-base sm:text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent truncate'>
                    Dashboard Overview
                  </h1>
                  <p className='text-muted-foreground text-xs sm:text-sm mt-1 line-clamp-1'>
                    Monitor your business performance and key metrics
                  </p>
                </div>
              </div>
            </div>

            {/* Control Panel - Mobile Optimized */}
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3'>
              <DateRangePicker
                initialDateFrom={startOfDay(new Date())}
                initialDateTo={endOfDay(new Date())}
                showCompare={false}
                onUpdate={(values: {
                  range: DateRange;
                  rangeCompare?: DateRange | undefined;
                }) => {
                  setDateRange({
                    start: values.range.from || new Date(),
                    end: endOfDay(values.range.to || new Date()),
                  });
                }}
              />

              <Button
                className='bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 touch-manipulation text-sm sm:text-base h-9 sm:h-10'
                onClick={() => generateReport()}
                disabled={loadingCSV}>
                {loadingCSV ? (
                  <Loader className='animate-spin mr-2 h-4 w-4 sm:h-5 sm:w-5' />
                ) : (
                  <PieChart className='mr-2 h-4 w-4 sm:h-5 sm:w-5' />
                )}
                <span className='hidden sm:inline'>Generate Report</span>
                <span className='sm:hidden'>Report</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className='p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-8'>
        {loading ? (
          <div className='space-y-8'>
            <div className='text-center py-8 sm:py-12'>
              <div className='inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full mb-4'>
                <Loader className='h-6 w-6 sm:h-8 sm:w-8 text-primary animate-spin' />
              </div>
              <h3 className='text-lg sm:text-xl font-semibold text-foreground mb-2'>
                Loading Dashboard Data
              </h3>
              <p className='text-sm sm:text-base text-muted-foreground'>
                Please wait while we fetch your latest metrics...
              </p>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6'>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className='h-32 bg-card rounded-xl animate-pulse border shadow-sm'
                />
              ))}
            </div>
          </div>
        ) : (
          mainReportView()
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
