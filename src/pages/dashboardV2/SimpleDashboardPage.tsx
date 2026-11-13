import { useState, useEffect, useMemo } from "react";

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
  Loader,
  PieChart,
  BarChart3,
  ShoppingCart,
  Landmark,
  BanknoteArrowDown,
  BanknoteX,
  HandCoins,
  Wallet2,
  Truck,
  TicketPercent,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/button";
import axiosInstance from "../../api/axios";
import config from "../../utils/config";
import { PageHeader } from "../../components/PageHeader";
import { DateRangePicker } from "../../coreComponents/DateRangePicker";
import PillStatCard, { DashboardPeriod } from "./reportCard";
import DonutGaugeCard from "./radialChart";
import BreakdownRings from "./breakdownRings";
import InteractiveCardComponent from "./interactiveCard";
import InteractiveSingleCardComponent from "./interactiveSingleCard";
import { TopCustomersPanel, TrendingProductsPanel } from "./activityPanels";
import { combineDailyComparison, structureStatusData } from "./utils/functions";

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
      Array<any>, // Purchases
      Array<{
        _id: string; // e.g., date "2024-06-08"
        totalOrders: number;
      }>,
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
    _id: string | null;
    name: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  topCustomers: Array<{
    _id: string;
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
  const [selectedTab, setSelectedTab] = useState<DashboardPeriod>("today");
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(
    null,
  );

  const [analysisData, setAnalysisData] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCSV, setLoadingCSV] = useState(false);

  const setRange = (tab: DashboardPeriod) => {
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
      case "last6Months": {
        const start = startOfMonth(subMonths(new Date(), 6));
        setDateRange({
          start,
          end: endOfMonth(new Date()),
        });
        break;
      }
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
        },
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
        "Report generated successfully!, it will be mailed to admin.",
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

  const current = analysisData?.orderMetrics?.currentMetrics;
  const previous = analysisData?.orderMetrics?.previousMonthMetrics;

  const completedCount = useMemo(
    () =>
      analysisData?.reports?.processingAndCompleted?.find(
        (e) => e._id?.toLowerCase() === "completed",
      )?.count ?? 0,
    [analysisData],
  );

  const processingCount = useMemo(
    () =>
      analysisData?.reports?.processingAndCompleted?.find(
        (e) => e._id?.toLowerCase() === "processing",
      )?.count ?? 0,
    [analysisData],
  );

  const completionPercent = useMemo(() => {
    const total = current?.totalOrders ?? 0;
    if (!total) return 0;
    return Math.round((completedCount / total) * 100);
  }, [completedCount, current]);

  const statusCounts = analysisData?.graphs?.statusCounts ?? [];

  const currencyAmountGrowth = useMemo(() => {
    const prev = previous?.totalAmount ?? 0;
    const curr = current?.totalAmount ?? 0;
    if (!prev) return undefined;
    return ((curr - prev) / prev) * 100;
  }, [current, previous]);

  const dateLabel = `${dateRange?.start.toDateString() ?? ""} - ${
    dateRange?.end.toDateString() ?? ""
  }`;

  const mainReportView = () => {
    return (
      <>
        {/* Hero stats */}
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4'>
          <PillStatCard
            icon={ShoppingCart}
            title='Total Orders'
            subtitle='Growth in total orders this period'
            previousValue={previous?.totalOrders}
            currentValue={current?.totalOrders ?? 0}
            prefix=''
            period={selectedTab}
            onPeriodChange={setRange}
          />
          <PillStatCard
            icon={Landmark}
            title='Total Amount'
            subtitle='Growth in total amount by order this period'
            previousValue={previous?.totalAmount}
            currentValue={current?.totalAmount ?? 0}
            period={selectedTab}
            onPeriodChange={setRange}
          />
          <PillStatCard
            icon={HandCoins}
            title='Total Paid'
            subtitle='Growth in total paid this period'
            previousValue={previous?.totalPaid}
            currentValue={current?.totalPaid ?? 0}
            period={selectedTab}
            onPeriodChange={setRange}
          />
          <PillStatCard
            icon={Wallet2}
            title='Total Remaining'
            subtitle='Growth in order remaining this period'
            previousValue={previous?.totalRemaining}
            currentValue={current?.totalRemaining ?? 0}
            period={selectedTab}
            onPeriodChange={setRange}
          />
        </div>

        {/* Compact stats */}
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4'>
          <PillStatCard
            compact
            icon={BanknoteArrowDown}
            title='Total Purchase'
            currentValue={analysisData?.reports?.purchases ?? 0}
          />
          <PillStatCard
            compact
            icon={BanknoteX}
            title='Total Return'
            currentValue={analysisData?.reports?.returns ?? 0}
          />
          <PillStatCard
            compact
            icon={Truck}
            title='Total Delivery Charge'
            currentValue={current?.totalDeliveryCharge ?? 0}
          />
          <PillStatCard
            compact
            icon={TicketPercent}
            title='Total Discount'
            currentValue={current?.totalDiscount ?? 0}
          />
        </div>

        {/* Insight row: completion gauge / breakdown rings / status timeline */}
        <div className='grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4'>
          <DonutGaugeCard
            percent={completionPercent}
            centerLabel='Completion rate'
            chips={[
              { label: "Completed", value: completedCount },
              { label: "Processing", value: processingCount },
            ]}
          />
          <BreakdownRings
            title='Amount breakdown'
            items={[
              { label: "Sales", value: analysisData?.reports?.sales ?? 0 },
              { label: "Paid", value: current?.totalPaid ?? 0 },
              {
                label: "Purchases",
                value: analysisData?.reports?.purchases ?? 0,
              },
              { label: "Returns", value: analysisData?.reports?.returns ?? 0 },
            ]}
          />
          <InteractiveSingleCardComponent
            title='Order Status Daily'
            subTitle={`Showing data from ${
              dateRange?.start.toDateString() ?? ""
            } to ${dateRange?.end.toDateString() ?? ""}`}
            data={structureStatusData(analysisData).reverse()}
          />
        </div>

        {/* Status chips strip */}
        {statusCounts.length > 0 && (
          <div className='flex items-center gap-2 flex-wrap'>
            {statusCounts.map((status) => (
              <span
                key={status._id}
                className='bg-white rounded-full px-3 h-7 inline-flex items-center gap-1.5 text-xs font-medium text-[#1A1A1A]'>
                <span className='h-2 w-2 rounded-full bg-[#E1573F]' />
                <span className='capitalize'>{status._id}</span>
                <span className='font-bold'>{status.count}</span>
              </span>
            ))}
          </div>
        )}

        {/* Purchase vs Order Amount chart */}
        <InteractiveCardComponent
          title='Purchase Vs Order Amount'
          subTitle={`Showing data from ${
            dateRange?.start.toDateString() ?? ""
          } to ${dateRange?.end.toDateString() ?? ""}`}
          data={combineDailyComparison(
            analysisData?.graphs?.dailyComparison ?? [],
          ).reverse()}
          totalOrder={analysisData?.reports?.sales ?? 0}
          totalPurchase={analysisData?.reports?.purchases ?? 0}
          growthPercentage={currencyAmountGrowth}
        />

        {/* Activity panels */}
        <div className='grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4'>
          <TopCustomersPanel
            customers={analysisData?.topCustomers ?? []}
            dateLabel={dateLabel}
          />
          <TrendingProductsPanel
            products={analysisData?.bestProducts ?? []}
            dateLabel={dateLabel}
          />
        </div>
      </>
    );
  };

  return (
    <div className='min-h-screen bg-[#E8E8E6] pb-6'>
      <div className='bg-white rounded-[32px] md:rounded-[48px] p-3 sm:p-5 lg:p-6 mx-2 sm:mx-4 md:mx-6 my-3 sm:my-4 space-y-3 sm:space-y-4'>
        {/* Header */}
        <PageHeader
          icon={
            <div className='h-10 w-10 rounded-md bg-white flex items-center justify-center text-[#E1573F]'>
              <BarChart3 className='h-5 w-5' strokeWidth={1.5} />
            </div>
          }
          title='Dashboard Overview'
          subtitle='Monitor your business performance and key metrics'
          stackOnMobile
          actions={
            <>
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
                className='bg-[#111111] hover:bg-[#1A1A1A] text-white rounded-full shadow-none h-9 sm:h-10 px-5 text-sm sm:text-base'
                onClick={() => generateReport()}
                disabled={loadingCSV}>
                {loadingCSV ? (
                  <Loader className='animate-spin mr-2 h-4 w-4 sm:h-5 sm:w-5' />
                ) : (
                  <PieChart className='mr-2 h-4 w-4 sm:h-5 sm:w-5' />
                )}
                <span className='hidden md:inline'>Generate Report</span>
                <span className='md:hidden'>Report</span>
              </Button>
            </>
          }
        />

        {loading ? (
          <div className='space-y-3 sm:space-y-4'>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className='h-32 bg-[#EFEDEB] rounded-3xl animate-pulse'
                />
              ))}
            </div>
            <div className='grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4'>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className='h-72 bg-[#EFEDEB] rounded-3xl animate-pulse'
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
