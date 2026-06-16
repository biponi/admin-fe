// ============================================
// FILE: src/pages/report/DailyReport.tsx
// ============================================
import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Calendar } from "../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { OTPVerificationDialog } from "../../components/OTPVerificationDialog";
import {
  getTodayReport,
  getYesterdayReport,
  getLatestReport,
  getReportByDate,
  getReportsInRange,
  getSummaryStats,
} from "../../api/dailyReport";
import {
  exportSingleReportToCSV,
  exportMultipleReportsToCSV,
  exportGeographicToCSV,
  exportCustomerInsightsToCSV,
  exportOrdersBreakdownToCSV,
  exportPaymentsToCSV,
} from "../../utils/dailyReportExport";
import {
  generateDailyReportPDF,
  generateSingleReportPDF,
} from "../../utils/dailyReportPdfExport";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import { cn } from "../../lib/utils";
import { toast } from "react-hot-toast";
import useLoginAuth from "../auth/hooks/useLoginAuth";
import { DateRangePicker } from "../../coreComponents/DateRangePicker";
import { DateRange } from "react-day-picker";
import { Badge } from "../../components/ui/badge";

// Import daily report card components
import DailySummaryCard from "./DailyReportCards/DailySummaryCard";
import OrdersBreakdownCard from "./DailyReportCards/OrdersBreakdownCard";
import PaymentsDistributionCard from "./DailyReportCards/PaymentsDistributionCard";
import CustomerInsightsCard from "./DailyReportCards/CustomerInsightsCard";
import GeographicDistributionCard from "./DailyReportCards/GeographicDistributionCard";

const DailyReport = () => {
  const { user } = useLoginAuth();
  const [dateMode, setDateMode] = useState<"single" | "range">("single");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });

  // State for reports data
  const [reports, setReports] = useState<any[]>([]);
  const [summaryStats, setSummaryStats] = useState<any>(null);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  // OTP and download state
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [downloadAction, setDownloadAction] = useState<{
    type: "csv" | "pdf";
    reportType?: string;
  } | null>(null);

  // Fetch reports when date range changes
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      fetchDailyReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, dateMode]);

  const fetchDailyReports = async () => {
    setIsLoadingReports(true);
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const startDate = formatDate(dateRange.from);
    const endDate = formatDate(dateRange.to);

    try {
      // Determine if single date or range
      const isSingleDate = startDate === endDate && dateMode === "single";

      let response;
      if (isSingleDate) {
        // For single date, use getReportByDate
        response = await getReportByDate(startDate);
        if (response.success && response.data) {
          setReports([response.data]);
          setSummaryStats(null); // No summary for single date
        } else {
          // If today's report doesn't exist, try latest
          const today = new Date();
          const todayStr = formatDate(today);
          if (startDate === todayStr) {
            const latestResponse = await getLatestReport();
            if (latestResponse.success && latestResponse.data) {
              setReports([latestResponse.data]);
              toast(
                "Today's report is being generated, showing latest available",
              );
            } else {
              setReports([]);
              toast.error("No reports available for this date");
            }
          } else {
            setReports([]);
            toast.error("No report found for this date");
          }
        }
      } else {
        // For date range, use getReportsInRange
        response = await getReportsInRange(startDate, endDate, 100);

        if (response.success && response.data && response.data.length > 0) {
          setReports(response.data);

          // Fetch summary stats for the range
          const summaryResponse = await getSummaryStats(startDate, endDate);
          if (summaryResponse.success && summaryResponse.data) {
            setSummaryStats(summaryResponse.data);
          }
        } else {
          setReports([]);
          setSummaryStats(null);
          toast.error("No reports found for the selected date range");
        }
      }
    } catch (error) {
      console.error("Error fetching daily reports:", error);
      toast.error("Failed to fetch daily reports");
      setReports([]);
      setSummaryStats(null);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleQuickDateSelect = (preset: "today" | "yesterday" | "latest") => {
    const today = new Date();
    const todayDate = startOfDay(today);

    switch (preset) {
      case "today":
        setDateMode("single");
        setDateRange({ from: todayDate, to: endOfDay(today) });
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        setDateMode("single");
        setDateRange({ from: startOfDay(yesterday), to: endOfDay(yesterday) });
        break;
      case "latest":
        setDateMode("single");
        // Latest will use today's date but API will fetch latest available
        setDateRange({ from: todayDate, to: endOfDay(today) });
        break;
    }
  };

  const handleDownloadRequest = (type: "csv" | "pdf", reportType?: string) => {
    setDownloadAction({ type, reportType });
    // Download directly without OTP verification
    handleDownloadAfterVerification();
  };

  const handleDownloadAfterVerification = async () => {
    if (!downloadAction) {
      toast.error("Download action not specified");
      return;
    }

    if (reports.length === 0) {
      toast.error("No report data available to export. Please generate a report first.");
      setDownloadAction(null);
      return;
    }

    const { type, reportType } = downloadAction;

    try {
      let result;

      if (type === "csv") {
        // Handle CSV export based on reportType
        const currentReport = reports[0];

        switch (reportType) {
          case "geographic-distribution":
            result = exportGeographicToCSV(
              currentReport.customers.geographicDistribution,
              currentReport.date,
            );
            break;
          case "customer-insights":
            result = exportCustomerInsightsToCSV(
              currentReport.customers,
              currentReport.date,
            );
            break;
          case "orders-breakdown":
            result = exportOrdersBreakdownToCSV(
              currentReport.orders,
              currentReport.date,
            );
            break;
          case "payments-distribution":
            result = exportPaymentsToCSV(
              currentReport.payments,
              currentReport.date,
            );
            break;
          case "daily-summary":
          default:
            if (reports.length === 1) {
              result = exportSingleReportToCSV(currentReport);
            } else {
              result = exportMultipleReportsToCSV(reports);
            }
            break;
        }

        if (result?.success) {
          toast.success("CSV exported successfully");
          setDownloadAction(null);
        } else {
          toast.error(result?.error || "Failed to export CSV");
        }
      } else if (type === "pdf") {
        // Handle PDF export
        if (reports.length === 1) {
          result = await generateSingleReportPDF(reports[0]);
        } else {
          result = await generateDailyReportPDF(reports);
        }

        if (result?.success) {
          toast.success("PDF generated successfully");
          setDownloadAction(null);
        } else {
          toast.error(result?.error || "Failed to generate PDF");
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to complete download");
    }
  };

  const isSingleDate =
    dateMode === "single" &&
    format(dateRange.from, "yyyy-MM-dd") === format(dateRange.to, "yyyy-MM-dd");

  const currentReport = reports.length > 0 ? reports[0] : null;

  return (
    <div className='w-full mx-auto p-2 space-y-6'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Daily Reports</h1>
          <p className='text-muted-foreground'>
            Daily business performance metrics and insights
          </p>
        </div>

        {/* Date Range Picker */}
        <div className='flex flex-wrap gap-2'>
          {/* Quick Select Buttons */}
          <div className='inline-flex items-center bg-muted p-1 rounded-lg gap-1'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => handleQuickDateSelect("today")}
              className='rounded-md transition-all duration-200 hover:bg-background/50'>
              Today
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => handleQuickDateSelect("yesterday")}
              className='rounded-md transition-all duration-200 hover:bg-background/50'>
              Yesterday
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => handleQuickDateSelect("latest")}
              className='rounded-md transition-all duration-200 hover:bg-background/50'>
              Latest
            </Button>
          </div>

          {/* Date Mode Toggle */}
          <div className='inline-flex items-center bg-muted p-1 rounded-lg gap-1'>
            <Button
              variant={dateMode === "single" ? "default" : "ghost"}
              size='sm'
              onClick={() => {
                setDateMode("single");
                const today = new Date();
                setDateRange({
                  from: startOfDay(today),
                  to: endOfDay(today),
                });
              }}
              className={`rounded-md transition-all duration-200 ${
                dateMode === "single" ? "shadow-sm" : "hover:bg-background/50"
              }`}>
              Single Date
            </Button>
            <Button
              variant={dateMode === "range" ? "default" : "ghost"}
              size='sm'
              onClick={() => setDateMode("range")}
              className={`rounded-md transition-all duration-200 ${
                dateMode === "range" ? "shadow-sm" : "hover:bg-background/50"
              }`}>
              Date Range
            </Button>
          </div>

          {/* Date Picker */}
          {dateMode === "single" ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className={cn(
                    "justify-start text-left font-normal w-[200px]",
                    !dateRange && "text-muted-foreground",
                  )}>
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {dateRange.from ? (
                    format(dateRange.from, "LLL dd, y")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='end'>
                <Calendar
                  mode='single'
                  selected={dateRange.from}
                  onSelect={(date: Date | undefined) => {
                    if (date) {
                      setDateRange({
                        from: startOfDay(date),
                        to: endOfDay(date),
                      });
                    }
                  }}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          ) : (
            <DateRangePicker
              key={dateMode}
              initialDateFrom={dateRange.from}
              initialDateTo={dateRange.to}
              showCompare={false}
              onUpdate={(values: {
                range: DateRange;
                rangeCompare?: DateRange | undefined;
              }) => {
                setDateRange({
                  from: startOfDay(values.range.from || new Date()),
                  to: endOfDay(values.range.to || new Date()),
                });
              }}
            />
          )}
        </div>
      </div>

      {/* Summary Stats for Range */}
      {!isSingleDate && summaryStats && (
        <div className='grid gap-4 md:grid-cols-6'>
          <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border'>
            <p className='text-sm text-muted-foreground'>Total Revenue</p>
            <p className='text-2xl font-bold'>
              ৳{summaryStats.totalRevenue?.toLocaleString()}
            </p>
          </div>
          <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border'>
            <p className='text-sm text-muted-foreground'>Total Orders</p>
            <p className='text-2xl font-bold'>{summaryStats.totalOrders}</p>
          </div>
          <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border'>
            <p className='text-sm text-muted-foreground'>Total Customers</p>
            <p className='text-2xl font-bold'>{summaryStats.totalCustomers}</p>
          </div>
          <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border'>
            <p className='text-sm text-muted-foreground'>Products Updated</p>
            <p className='text-2xl font-bold'>
              {summaryStats.totalProductsUpdated}
            </p>
          </div>
          <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border'>
            <p className='text-sm text-muted-foreground'>Total Paid</p>
            <p className='text-2xl font-bold'>
              ৳{summaryStats.totalPaid?.toLocaleString()}
            </p>
          </div>
          <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border'>
            <p className='text-sm text-muted-foreground'>Report Count</p>
            <p className='text-2xl font-bold'>{summaryStats.reportCount}</p>
          </div>
        </div>
      )}

      {/* Report Info Badge */}
      {currentReport && (
        <div className='flex items-center gap-2'>
          <Badge variant='secondary'>
            {format(new Date(currentReport.timestamp), "PPP p")}
          </Badge>
          {currentReport.status && (
            <Badge
              variant={
                currentReport.status === "completed" ? "default" : "secondary"
              }>
              Status: {currentReport.status}
            </Badge>
          )}
          {currentReport.processingTime && (
            <Badge variant='outline'>
              Generated in {currentReport.processingTime}
            </Badge>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoadingReports && (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          <span className='ml-2 text-muted-foreground'>
            Loading daily reports...
          </span>
        </div>
      )}

      {/* Empty State */}
      {!isLoadingReports && reports.length === 0 && (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <p className='text-muted-foreground text-lg mb-2'>No reports found</p>
          <p className='text-muted-foreground text-sm'>
            Try selecting a different date or date range
          </p>
        </div>
      )}

      {/* Daily Report Cards */}
      {!isLoadingReports && currentReport && (
        <div className='space-y-6'>
          {/* Daily Summary Card */}
          <DailySummaryCard
            data={currentReport}
            isSingleDate={isSingleDate}
            dateRange={dateRange}
            onDownload={handleDownloadRequest}
          />

          {/* Two Column Layout */}
          <div className='grid gap-6 md:grid-cols-2'>
            {/* Orders Breakdown */}
            <OrdersBreakdownCard
              data={currentReport.orders}
              onDownload={handleDownloadRequest}
            />

            {/* Payments Distribution */}
            <PaymentsDistributionCard
              data={currentReport.payments}
              onDownload={handleDownloadRequest}
            />
          </div>

          {/* Customer Insights */}
          <CustomerInsightsCard
            data={currentReport.customers}
            onDownload={handleDownloadRequest}
          />

          {/* Geographic Distribution */}
          {currentReport.customers?.geographicDistribution &&
            currentReport.customers.geographicDistribution.length > 0 && (
              <GeographicDistributionCard
                data={currentReport.customers.geographicDistribution}
                onDownload={handleDownloadRequest}
              />
            )}
        </div>
      )}

      {/* OTP Verification Dialog */}
      {user?.email && (
        <OTPVerificationDialog
          open={showOTPDialog}
          onOpenChange={(val) => setShowOTPDialog(val)}
          mobile_number={user.mobile_number || ""}
          email={user.email || ""}
          purpose='account_verification'
          title='Verify to Download Report'
          description='For security purposes, please verify your phone number to download the report'
          onVerificationSuccess={handleDownloadAfterVerification}
          autoSendOnMount={true}
        />
      )}
    </div>
  );
};

export default DailyReport;
