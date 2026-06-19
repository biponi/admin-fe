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
import { CalendarIcon, Loader2, BarChart3 } from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import { cn } from "../../lib/utils";
import { toast } from "react-hot-toast";
import useLoginAuth from "../auth/hooks/useLoginAuth";
import { DateRangePicker } from "../../coreComponents/DateRangePicker";
import { DateRange } from "react-day-picker";
import MainView from "../../coreComponents/mainView";

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
      toast.error(
        "No report data available to export. Please generate a report first.",
      );
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
    <MainView title='Daily Reports'>
      <div className='min-h-screen bg-slate-50/60'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
          {/* Page Header */}
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200'>
                <BarChart3 className='h-5 w-5 text-white' />
              </div>
              <div>
                <h1 className='text-xl font-semibold text-slate-900 leading-tight'>
                  Daily Reports
                </h1>
                <p className='text-sm text-slate-500 mt-0.5'>
                  Business performance metrics and insights
                </p>
              </div>
            </div>

            {/* Date Range Picker */}
            <div className='flex flex-wrap items-center gap-2'>
              {/* Quick Select Buttons */}
              <div className='inline-flex items-center bg-white border border-slate-200 rounded-lg shadow-sm'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleQuickDateSelect("today")}
                  className='rounded-none px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all duration-150 border-r border-slate-200'>
                  Today
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleQuickDateSelect("yesterday")}
                  className='rounded-none px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all duration-150 border-r border-slate-200'>
                  Yesterday
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleQuickDateSelect("latest")}
                  className='rounded-none px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all duration-150 rounded-r-lg'>
                  Latest
                </Button>
              </div>

              {/* Date Mode Toggle */}
              <div className='inline-flex items-center bg-white border border-slate-200 rounded-lg shadow-sm'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    setDateMode("single");
                    const today = new Date();
                    setDateRange({
                      from: startOfDay(today),
                      to: endOfDay(today),
                    });
                  }}
                  className={`rounded-none px-3 py-2 text-sm font-medium transition-all duration-150 border-r border-slate-200 ${
                    dateMode === "single"
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}>
                  Single Date
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setDateMode("range")}
                  className={`rounded-none px-3 py-2 text-sm font-medium transition-all duration-150 rounded-r-lg ${
                    dateMode === "range"
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200"
                      : "text-slate-600 hover:bg-slate-50"
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
                      className='justify-start text-left font-normal px-3 py-2 h-auto text-sm bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 rounded-lg shadow-sm transition-all duration-150'>
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
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3'>
              <div className='flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm'>
                <div className='w-2 h-2 rounded-full bg-indigo-400' />
                <div className='min-w-0'>
                  <p className='text-lg font-semibold text-indigo-600 leading-none'>
                    ৳{summaryStats.totalRevenue?.toLocaleString()}
                  </p>
                  <p className='text-xs text-slate-500 mt-0.5'>Total Revenue</p>
                </div>
              </div>
              <div className='flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm'>
                <div className='w-2 h-2 rounded-full bg-emerald-400' />
                <div className='min-w-0'>
                  <p className='text-lg font-semibold text-emerald-600 leading-none'>
                    {summaryStats.totalOrders}
                  </p>
                  <p className='text-xs text-slate-500 mt-0.5'>Total Orders</p>
                </div>
              </div>
              <div className='flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm'>
                <div className='w-2 h-2 rounded-full bg-blue-400' />
                <div className='min-w-0'>
                  <p className='text-lg font-semibold text-blue-600 leading-none'>
                    {summaryStats.totalCustomers}
                  </p>
                  <p className='text-xs text-slate-500 mt-0.5'>Total Customers</p>
                </div>
              </div>
              <div className='flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm'>
                <div className='w-2 h-2 rounded-full bg-amber-400' />
                <div className='min-w-0'>
                  <p className='text-lg font-semibold text-amber-600 leading-none'>
                    {summaryStats.totalProductsUpdated}
                  </p>
                  <p className='text-xs text-slate-500 mt-0.5'>Products Updated</p>
                </div>
              </div>
              <div className='flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm'>
                <div className='w-2 h-2 rounded-full bg-indigo-400' />
                <div className='min-w-0'>
                  <p className='text-lg font-semibold text-indigo-600 leading-none'>
                    ৳{summaryStats.totalPaid?.toLocaleString()}
                  </p>
                  <p className='text-xs text-slate-500 mt-0.5'>Total Paid</p>
                </div>
              </div>
              <div className='flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm'>
                <div className='w-2 h-2 rounded-full bg-slate-400' />
                <div className='min-w-0'>
                  <p className='text-lg font-semibold text-slate-600 leading-none'>
                    {summaryStats.reportCount}
                  </p>
                  <p className='text-xs text-slate-500 mt-0.5'>Report Count</p>
                </div>
              </div>
            </div>
          )}

          {/* Report Info Badge */}
          {currentReport && (
            <div className='flex flex-wrap items-center gap-2 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm'>
              <div className='flex items-center gap-2'>
                <CalendarIcon className='h-4 w-4 text-slate-400' />
                <span className='text-sm text-slate-600'>
                  {format(new Date(currentReport.timestamp), "PPP p")}
                </span>
              </div>

              {currentReport.status && (
                <div className='flex items-center gap-1.5'>
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      currentReport.status === "completed"
                        ? "bg-emerald-400"
                        : "bg-amber-400"
                    }`}
                  />
                  <span className='text-sm font-medium text-slate-700'>
                    {currentReport.status}
                  </span>
                </div>
              )}

              {currentReport.processingTime && (
                <span className='text-xs text-slate-500'>
                  Generated in {currentReport.processingTime}
                </span>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoadingReports && (
            <div className='flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-100 shadow-sm'>
              <Loader2 className='h-8 w-8 animate-spin text-indigo-600' />
              <span className='mt-3 text-sm font-medium text-slate-600'>
                Loading daily reports...
              </span>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingReports && reports.length === 0 && (
            <div className='flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-100 shadow-sm text-center px-4'>
              <div className='w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4'>
                <BarChart3 className='h-8 w-8 text-slate-300' />
              </div>
              <p className='text-base font-medium text-slate-700 mb-1'>
                No reports found
              </p>
              <p className='text-sm text-slate-500'>
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
      </div>
    </MainView>
  );
};

export default DailyReport;
