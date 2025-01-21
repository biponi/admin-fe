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
import RadialChartComponent from "./radialChart";
import DynamicCard from "./reportCard";
import InteractiveCardComponent from "./interactiveCard";
import {
  combineDailyComparison,
  getRankWithEmoji,
  structureStatusData,
} from "./utils/functions";
import { SkeletonCard } from "../../coreComponents/sekeleton";
import InteractiveSingleCardComponent from "./interactiveSingleCard";
import { DateRangePicker } from "../../coreComponents/DateRangePicker";
import { DateRange } from "react-day-picker";
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
  const [selectedTab, setSelectedTab] = useState("today");
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(
    null
  );

  const [analysisData, setAnalysisData] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(false);

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
            startDate: format(dateRange?.start || new Date(), "yyyy-MM-dd"),
            endDate: format(dateRange?.end || new Date(), "yyyy-MM-dd"),
          },
        }
      );
      setAnalysisData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
          <DynamicCard
            title="Total Orders"
            subtitle="Growth in total orders this period"
            previousValue={
              analysisData?.orderMetrics?.previousMonthMetrics?.totalOrders ?? 0
            }
            currentValue={
              analysisData?.orderMetrics?.currentMetrics?.totalOrders ?? 0
            }
          />
          <DynamicCard
            title="Total Amount"
            subtitle="Growth in total amount by order this period"
            previousValue={
              analysisData?.orderMetrics?.previousMonthMetrics?.totalAmount ?? 0
            }
            currentValue={
              analysisData?.orderMetrics?.currentMetrics?.totalAmount ?? 0
            }
          />
          <DynamicCard
            title="Total Purchase"
            subtitle="This is only the total purchase amount this period"
            previousValue={0}
            currentValue={analysisData?.reports?.purchases ?? 0}
          />
          <DynamicCard
            title="Total Return"
            subtitle="This is only the order return amount this period"
            previousValue={0}
            currentValue={analysisData?.reports?.returns ?? 0}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4">
          <DynamicCard
            title="Total Paid"
            subtitle="Growth in total paid this period"
            previousValue={
              analysisData?.orderMetrics?.previousMonthMetrics?.totalPaid ?? 0
            }
            currentValue={
              analysisData?.orderMetrics?.currentMetrics?.totalPaid ?? 0
            }
          />
          <DynamicCard
            title="Total Remaining"
            subtitle="Growth in order remaining this period"
            previousValue={
              analysisData?.orderMetrics?.previousMonthMetrics
                ?.totalRemaining ?? 0
            }
            currentValue={
              analysisData?.orderMetrics?.currentMetrics?.totalRemaining ?? 0
            }
          />
          <DynamicCard
            title="Total Delivery Charge"
            subtitle="Growth in total delivery charge this period"
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
            title="Total Discount Amount"
            subtitle="Growth in total discount amount by order this period"
            previousValue={
              analysisData?.orderMetrics?.previousMonthMetrics?.totalDiscount ??
              0
            }
            currentValue={
              analysisData?.orderMetrics?.currentMetrics?.totalDiscount ?? 0
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InteractiveCardComponent
            title="Purchase Vs Order Amount"
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
            title="Order Stauts Daily Comparison"
            subTitle={`Showing data from ${
              dateRange?.start.toDateString() ?? ""
            } to ${dateRange?.end.toDateString() ?? ""}`}
            data={structureStatusData(analysisData).reverse()}
          />
        </div>

        {/* Metrics Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 py-4">
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
                      analysisData?.reports?.processingAndCompleted[0].count ??
                      0,
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
                      analysisData?.reports?.processingAndCompleted[1].count ??
                      0,
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

        {/* Tables */}
        <div className="mt-6 grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-6 ">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardContent>
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
      </>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="flex justify-between items-center">
        <p className="text-base font-normal text-gray-600 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 shadow">
          Showing data from{" "}
          <span className="font-semibold text-gray-900">
            {dateRange?.start.toDateString()}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-gray-900">
            {dateRange?.end.toDateString()}
          </span>
        </p>

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
              end: values.range.to || new Date(),
            });
          }}
        />
      </div>

      {loading ? (
        <SkeletonCard title="Data is loading, please wait..." />
      ) : (
        mainReportView()
      )}
    </div>
  );
};

export default DashboardPage;
