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
import {
  CalendarIcon,
  Loader2,
  BarChart3,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  FileText,
  Clock,
  Zap,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import { cn } from "../../lib/utils";
import { PageHeader } from "../../components/PageHeader";
import { toast } from "react-hot-toast";
import useLoginAuth from "../auth/hooks/useLoginAuth";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import { useIsMobile } from "../../hooks/use-mobile";
import {
  MobilePage,
  MobileListCard,
  MobileStaggeredList,
  MobileStatTile,
  MobileStatRow,
  MobileFilterSheet,
  MobileFilterTrigger,
  MobileActionSheet,
  MobileEmptyState,
  MobileSkeletonList,
  rippleProps,
} from "../../components/mobile";
import { DateRangePicker } from "../../coreComponents/DateRangePicker";
import { DateRange } from "react-day-picker";
import MainView from "../../coreComponents/mainView";
import { Download } from "lucide-react";

// Import daily report card components
import DailySummaryCard from "./DailyReportCards/DailySummaryCard";
import OrdersBreakdownCard from "./DailyReportCards/OrdersBreakdownCard";
import PaymentsDistributionCard from "./DailyReportCards/PaymentsDistributionCard";
import CustomerInsightsCard from "./DailyReportCards/CustomerInsightsCard";
import GeographicDistributionCard from "./DailyReportCards/GeographicDistributionCard";

// ─── Stat Cell ───────────────────────────────────────────────────────────────
interface StatCellProps {
  label: string;
  value: string | number;
  accentColor: string;
  delta?: { value: string; up: boolean };
}

const StatCell: React.FC<StatCellProps> = ({
  label,
  value,
  accentColor,
  delta,
}) => (
  <div className='relative flex-1 px-5 py-4 border-r border-slate-100 last:border-r-0'>
    {/* Left accent bar */}
    <span
      className='absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full'
      style={{ background: accentColor }}
    />
    <p className='text-[11px] font-medium tracking-widest uppercase text-slate-400 mb-1.5'>
      {label}
    </p>
    <p className='text-[22px] font-semibold text-slate-900 leading-none'>
      {value}
    </p>
    {delta && (
      <p
        className={cn(
          "flex items-center gap-1 text-[11px] mt-1.5 font-medium",
          delta.up ? "text-emerald-600" : "text-rose-500",
        )}>
        {delta.up ? (
          <TrendingUp className='h-3 w-3' />
        ) : (
          <TrendingDown className='h-3 w-3' />
        )}
        {delta.value}
      </p>
    )}
  </div>
);

// ─── Range Summary Pill ───────────────────────────────────────────────────────
interface RangePillProps {
  label: string;
  value: string;
  color: string;
}

const RangePill: React.FC<RangePillProps> = ({ label, value, color }) => (
  <div className='flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)]'>
    <span
      className='w-2 h-2 rounded-full flex-shrink-0'
      style={{ background: color }}
    />
    <div className='min-w-0'>
      <p className='text-base font-semibold leading-none' style={{ color }}>
        {value}
      </p>
      <p className='text-[11px] text-slate-500 mt-1'>{label}</p>
    </div>
  </div>
);

// ─── Segment Button Group ─────────────────────────────────────────────────────
interface SegmentGroupProps {
  options: { label: string; value: string }[];
  active: string;
  onChange: (val: string) => void;
}

const SegmentGroup: React.FC<SegmentGroupProps> = ({
  options,
  active,
  onChange,
}) => (
  <div className='inline-flex items-center rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden'>
    {options.map((opt, i) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={cn(
          "px-3 py-1.5 text-[13px] font-medium transition-all duration-150",
          i < options.length - 1 && "border-r border-slate-200",
          active === opt.value
            ? "bg-indigo-600 text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)]"
            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50",
        )}>
        {opt.label}
      </button>
    ))}
  </div>
);

// ─── Export Bar ───────────────────────────────────────────────────────────────
interface ExportBarProps {
  onExport: (type: "csv" | "pdf") => void;
}

const ExportBar: React.FC<ExportBarProps> = ({ onExport }) => (
  <div className='flex items-center justify-between gap-4 bg-white rounded-xl border border-slate-100 px-5 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'>
    <p className='text-[13px] text-slate-500'>Export today's full report</p>
    <div className='flex items-center gap-2'>
      <Button
        variant='outline'
        size='sm'
        onClick={() => onExport("csv")}
        className='h-8 px-3 gap-1.5 text-[13px] font-medium text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'>
        <FileSpreadsheet className='h-3.5 w-3.5' />
        CSV
      </Button>
      <Button
        size='sm'
        onClick={() => onExport("pdf")}
        className='h-8 px-3 gap-1.5 text-[13px] font-medium bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200'>
        <FileText className='h-3.5 w-3.5' />
        PDF
      </Button>
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const DailyReport = () => {
  const { user } = useLoginAuth();
  const { hasRequiredPermission } = useRoleCheck();
  const isMobile = useIsMobile();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileExportOpen, setMobileExportOpen] = useState(false);
  const [dateMode, setDateMode] = useState<"single" | "range">("single");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });

  const [reports, setReports] = useState<any[]>([]);
  const [summaryStats, setSummaryStats] = useState<any>(null);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [downloadAction, setDownloadAction] = useState<{
    type: "csv" | "pdf";
    reportType?: string;
  } | null>(null);

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      fetchDailyReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, dateMode]);

  const fetchDailyReports = async () => {
    setIsLoadingReports(true);
    const formatDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    const startDate = formatDate(dateRange.from);
    const endDate = formatDate(dateRange.to);

    try {
      const isSingleDate = startDate === endDate && dateMode === "single";

      if (isSingleDate) {
        const response = await getReportByDate(startDate);
        if (response.success && response.data) {
          setReports([response.data]);
          setSummaryStats(null);
        } else {
          const today = formatDate(new Date());
          if (startDate === today) {
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
        const response = await getReportsInRange(startDate, endDate, 100);
        //@ts-ignore
        if (response.success && response?.data?.length > 0) {
          //@ts-ignore
          setReports(response?.data);
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
    setDateMode("single");
    if (preset === "yesterday") {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      setDateRange({ from: startOfDay(y), to: endOfDay(y) });
    } else {
      setDateRange({ from: startOfDay(today), to: endOfDay(today) });
    }
  };

  const handleDownloadRequest = (type: "csv" | "pdf", reportType?: string) => {
    setDownloadAction({ type, reportType });
    handleDownloadAfterVerification();
  };

  const handleDownloadAfterVerification = async () => {
    if (!downloadAction) {
      toast.error("Download action not specified");
      return;
    }
    if (reports.length === 0) {
      toast.error("No report data available. Please generate a report first.");
      setDownloadAction(null);
      return;
    }

    const { type, reportType } = downloadAction;
    try {
      let result;
      if (type === "csv") {
        const r = reports[0];
        switch (reportType) {
          case "geographic-distribution":
            result = exportGeographicToCSV(
              r.customers.geographicDistribution,
              r.date,
            );
            break;
          case "customer-insights":
            result = exportCustomerInsightsToCSV(r.customers, r.date);
            break;
          case "orders-breakdown":
            result = exportOrdersBreakdownToCSV(r.orders, r.date);
            break;
          case "payments-distribution":
            result = exportPaymentsToCSV(r.payments, r.date);
            break;
          default:
            result =
              reports.length === 1
                ? exportSingleReportToCSV(r)
                : exportMultipleReportsToCSV(reports);
        }
        result?.success
          ? toast.success("CSV exported successfully")
          : toast.error(result?.error || "Failed to export CSV");
      } else {
        result =
          reports.length === 1
            ? await generateSingleReportPDF(reports[0])
            : await generateDailyReportPDF(reports);
        result?.success
          ? toast.success("PDF generated successfully")
          : toast.error(result?.error || "Failed to generate PDF");
      }
      setDownloadAction(null);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to complete download");
    }
  };

  const isSingleDate =
    dateMode === "single" &&
    format(dateRange.from, "yyyy-MM-dd") === format(dateRange.to, "yyyy-MM-dd");

  const currentReport = reports[0] ?? null;

  // ─── Mobile presentation ─────────────────────────────────────────────────────
  if (isMobile) {
    const humanize = (key: string) => {
      const spaced = key.replace(/([A-Z])/g, " $1").trim();
      return spaced.charAt(0).toUpperCase() + spaced.slice(1);
    };
    const isDefaultDate =
      dateMode === "single" &&
      format(dateRange.from, "yyyy-MM-dd") ===
        format(startOfDay(new Date()), "yyyy-MM-dd");
    const canExport = hasRequiredPermission("Report", "download");

    return (
      <MobilePage
        title='Daily Reports'
        icon={<CalendarIcon className='h-4.5 w-4.5 text-primary' />}
        subtitle='Business performance metrics'
        actions={
          <button
            onClick={() => setMobileExportOpen(true)}
            aria-label='Export report'
            className='m3-ripple grid h-10 w-10 place-items-center rounded-full text-muted-foreground'
            {...rippleProps()}>
            <Download className='h-4.5 w-4.5' />
          </button>
        }>
        <div className='space-y-4 px-4 pt-3'>
          {/* Date toolbar */}
          <div className='flex items-center gap-2.5'>
            <MobileFilterTrigger
              onClick={() => setMobileFiltersOpen(true)}
              activeCount={isDefaultDate ? 0 : 1}
            />
            <div className='min-w-0 flex-1'>
              <p className='truncate text-[13px] font-semibold'>
                {isSingleDate
                  ? format(dateRange.from, "LLL dd, y")
                  : `${format(dateRange.from, "MMM dd")} – ${format(dateRange.to, "MMM dd, y")}`}
              </p>
              <p className='text-[11px] text-muted-foreground'>
                {isSingleDate ? "Single date" : `${reports.length} reports`}
              </p>
            </div>
          </div>

          {/* Range summary tiles */}
          {!isSingleDate && summaryStats && (
            <MobileStatRow>
              <MobileStatTile
                label='Revenue'
                value={`৳${summaryStats.totalRevenue?.toLocaleString() ?? "—"}`}
              />
              <MobileStatTile
                label='Orders'
                value={summaryStats.totalOrders ?? "—"}
              />
              <MobileStatTile
                label='Customers'
                value={summaryStats.totalCustomers ?? "—"}
              />
              <MobileStatTile
                label='Updated'
                value={summaryStats.totalProductsUpdated ?? "—"}
              />
              <MobileStatTile
                label='Paid'
                value={`৳${summaryStats.totalPaid?.toLocaleString() ?? "—"}`}
              />
              <MobileStatTile
                label='Reports'
                value={summaryStats.reportCount ?? "—"}
              />
            </MobileStatRow>
          )}

          {/* Report meta strip */}
          {currentReport && (
            <div className='flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[12px] text-muted-foreground'>
              <span className='flex items-center gap-1.5'>
                <Clock className='h-3.5 w-3.5' />
                {format(new Date(currentReport.timestamp), "PP p")}
              </span>
              {currentReport.status && (
                <span className='flex items-center gap-1.5'>
                  {currentReport.status === "completed" ? (
                    <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' />
                  ) : (
                    <AlertCircle className='h-3.5 w-3.5 text-amber-500' />
                  )}
                  <span className='capitalize font-medium'>
                    {currentReport.status}
                  </span>
                </span>
              )}
              {currentReport.processingTime && (
                <span className='flex items-center gap-1.5'>
                  <Zap className='h-3.5 w-3.5' />
                  {currentReport.processingTime}
                </span>
              )}
            </div>
          )}

          {/* Stats ribbon */}
          {currentReport && (
            <MobileStatRow>
              <MobileStatTile
                label='Revenue'
                value={`৳${currentReport.summary?.totalRevenue?.toLocaleString() ?? "—"}`}
              />
              <MobileStatTile
                label='Orders'
                value={currentReport.orders?.total ?? "—"}
              />
              <MobileStatTile
                label='Customers'
                value={
                  currentReport.customers?.totalCustomers ??
                  currentReport.customers?.total ??
                  "—"
                }
              />
              <MobileStatTile
                label='Avg. order'
                value={`৳${currentReport.summary?.avgOrderValue?.toLocaleString() ?? "—"}`}
              />
              <MobileStatTile
                label='Total paid'
                value={`৳${currentReport.payments?.totalPaid?.toLocaleString() ?? "—"}`}
              />
            </MobileStatRow>
          )}

          {/* Loading state */}
          {isLoadingReports && <MobileSkeletonList count={6} />}

          {/* Empty state */}
          {!isLoadingReports && reports.length === 0 && (
            <MobileEmptyState
              icon={<BarChart3 className='h-7 w-7' strokeWidth={1.5} />}
              title='No reports found'
              description='Try selecting a different date or date range'
              action={
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className='m3-ripple rounded-full border px-5 py-2 text-[13px] font-medium'
                  {...rippleProps()}>
                  Change date
                </button>
              }
            />
          )}

          {/* Report body */}
          {!isLoadingReports && currentReport && (
            <div className='space-y-5'>
              {/* Summary rows */}
              <div className='space-y-2.5'>
                <p className='px-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground'>
                  Daily Summary
                </p>
                <MobileStaggeredList>
                  <MobileListCard
                    static
                    title='Total revenue'
                    trailing={
                      <span className='text-[15px] font-semibold text-emerald-600'>
                        ৳
                        {currentReport.sales?.totalRevenue?.toLocaleString() ??
                          currentReport.summary?.totalRevenue?.toLocaleString() ??
                          "—"}
                      </span>
                    }
                  />
                  <MobileListCard
                    static
                    title='Total paid'
                    trailing={
                      <span className='text-[15px] font-semibold'>
                        ৳
                        {currentReport.sales?.totalPaid?.toLocaleString() ??
                          "—"}
                      </span>
                    }
                  />
                  <MobileListCard
                    static
                    title='Avg order value'
                    trailing={
                      <span className='text-[15px] font-semibold'>
                        ৳
                        {currentReport.sales?.averageOrderValue?.toLocaleString() ??
                          "—"}
                      </span>
                    }
                  />
                  <MobileListCard
                    static
                    title='Total discount'
                    trailing={
                      <span className='text-[15px] font-semibold'>
                        ৳
                        {currentReport.sales?.totalDiscount?.toLocaleString() ??
                          "—"}
                      </span>
                    }
                  />
                  <MobileListCard
                    static
                    title='Delivery charge'
                    trailing={
                      <span className='text-[15px] font-semibold'>
                        ৳
                        {currentReport.sales?.totalDeliveryCharge?.toLocaleString() ??
                          "—"}
                      </span>
                    }
                  />
                  <MobileListCard
                    static
                    title='Products processed'
                    subtitle={
                      currentReport.products?.processingTime
                        ? `Processing time ${currentReport.products.processingTime}`
                        : undefined
                    }
                    trailing={
                      <span className='text-[15px] font-semibold'>
                        {currentReport.products?.totalProcessed ?? "—"}
                      </span>
                    }
                  />
                  <MobileListCard
                    static
                    title='Items updated'
                    trailing={
                      <span className='text-[15px] font-semibold'>
                        {currentReport.products?.itemsUpdated ?? "—"}
                      </span>
                    }
                  />
                </MobileStaggeredList>
              </div>

              {/* Orders by status */}
              <div className='space-y-2.5'>
                <p className='px-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground'>
                  Orders — by Status
                </p>
                <MobileStaggeredList>
                  {Object.entries(currentReport.orders?.byStatus ?? {})
                    .filter(([, count]) => Number(count) > 0)
                    .sort((a, b) => Number(b[1]) - Number(a[1]))
                    .map(([status, count]) => (
                      <MobileListCard
                        key={status}
                        static
                        title={humanize(status)}
                        subtitle={`${(
                          (Number(count) /
                            Math.max(currentReport.orders?.total ?? 0, 1)) *
                          100
                        ).toFixed(1)}% of total orders`}
                        trailing={
                          <span className='text-[15px] font-semibold'>
                            {String(count)}
                          </span>
                        }
                      />
                    ))}
                </MobileStaggeredList>
              </div>

              {/* Orders by payment status */}
              <div className='space-y-2.5'>
                <p className='px-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground'>
                  Orders — by Payment Status
                </p>
                <MobileStaggeredList>
                  {Object.entries(currentReport.orders?.byPaymentStatus ?? {})
                    .filter(([, count]) => Number(count) > 0)
                    .sort((a, b) => Number(b[1]) - Number(a[1]))
                    .map(([status, count]) => (
                      <MobileListCard
                        key={status}
                        static
                        title={humanize(status)}
                        trailing={
                          <span className='text-[15px] font-semibold'>
                            {String(count)}
                          </span>
                        }
                      />
                    ))}
                </MobileStaggeredList>
              </div>

              {/* Payments by method */}
              <div className='space-y-2.5'>
                <p className='px-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground'>
                  Payments by Method
                </p>
                <MobileStaggeredList>
                  {Object.entries(currentReport.payments?.byMethod ?? {})
                    .filter(([, amount]) => Number(amount) > 0)
                    .sort((a, b) => Number(b[1]) - Number(a[1]))
                    .map(([method, amount]) => (
                      <MobileListCard
                        key={method}
                        static
                        title={humanize(method)}
                        trailing={
                          <span className='text-[15px] font-semibold'>
                            ৳{Number(amount).toLocaleString()}
                          </span>
                        }
                      />
                    ))}
                </MobileStaggeredList>
              </div>

              {/* Customer insights */}
              <div className='space-y-2.5'>
                <p className='px-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground'>
                  Customers
                </p>
                <MobileStaggeredList>
                  <MobileListCard
                    static
                    title='Total customers'
                    trailing={
                      <span className='text-[15px] font-semibold'>
                        {currentReport.customers?.totalCustomers ??
                          currentReport.customers?.total ??
                          "—"}
                      </span>
                    }
                  />
                  <MobileListCard
                    static
                    title='New customers'
                    trailing={
                      <span className='text-[15px] font-semibold text-emerald-600'>
                        {currentReport.customers?.newCustomers ?? "—"}
                      </span>
                    }
                  />
                  <MobileListCard
                    static
                    title='Returning customers'
                    trailing={
                      <span className='text-[15px] font-semibold text-blue-600'>
                        {currentReport.customers?.returningCustomers ?? "—"}
                      </span>
                    }
                  />
                </MobileStaggeredList>
              </div>

              {/* Geographic distribution */}
              {(currentReport.customers?.geographicDistribution?.length ?? 0) >
                0 && (
                <div className='space-y-2.5'>
                  <p className='px-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground'>
                    Geographic Distribution
                  </p>
                  <MobileStaggeredList>
                    {currentReport.customers.geographicDistribution
                      .slice()
                      .sort((a: any, b: any) => b.count - a.count)
                      .map((item: any) => (
                        <MobileListCard
                          key={item.division}
                          static
                          title={item.division}
                          subtitle={`${item.count} customers`}
                          trailing={
                            <span className='text-[15px] font-semibold'>
                              ৳{item.revenue?.toLocaleString?.() ?? "—"}
                            </span>
                          }
                        />
                      ))}
                  </MobileStaggeredList>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filter sheet — reuses the same date state/handlers as desktop */}
        <MobileFilterSheet
          open={mobileFiltersOpen}
          onOpenChange={setMobileFiltersOpen}
          title='Date filters'
          onApply={() => {
            /* changes apply live via setDateRange/setDateMode */
          }}
          onReset={() => {
            setDateMode("single");
            const t = new Date();
            setDateRange({ from: startOfDay(t), to: endOfDay(t) });
          }}>
          <div className='space-y-5'>
            <div className='space-y-2'>
              <p className='text-[12px] font-medium text-muted-foreground'>
                Quick select
              </p>
              <div className='grid grid-cols-3 gap-2'>
                {(["today", "yesterday", "latest"] as const).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleQuickDateSelect(preset)}
                    className='m3-ripple rounded-full border bg-card py-2 text-[13px] font-medium capitalize'
                    {...rippleProps()}>
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className='space-y-2'>
              <p className='text-[12px] font-medium text-muted-foreground'>
                Mode
              </p>
              <div className='grid grid-cols-2 gap-2'>
                {(["single", "range"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setDateMode(mode);
                      if (mode === "single") {
                        const t = new Date();
                        setDateRange({ from: startOfDay(t), to: endOfDay(t) });
                      }
                    }}
                    className={cn(
                      "m3-ripple rounded-full border py-2 text-[13px] font-medium",
                      dateMode === mode
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-card",
                    )}
                    {...rippleProps()}>
                    {mode === "single" ? "Single date" : "Date range"}
                  </button>
                ))}
              </div>
            </div>

            {dateMode === "single" ? (
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
            ) : (
              <Calendar
                mode='range'
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range: DateRange | undefined) => {
                  if (range?.from) {
                    setDateRange({
                      from: startOfDay(range.from),
                      to: endOfDay(range.to || range.from),
                    });
                  }
                }}
                numberOfMonths={1}
              />
            )}
          </div>
        </MobileFilterSheet>

        {/* Export action sheet */}
        <MobileActionSheet
          open={mobileExportOpen}
          onOpenChange={setMobileExportOpen}
          title='Export report'
          description='Download the current report data'
          actions={[
            {
              icon: <FileSpreadsheet className='h-4.5 w-4.5' />,
              label: 'Export CSV (full report)',
              onClick: () => handleDownloadRequest("csv"),
            },
            {
              icon: <FileText className='h-4.5 w-4.5' />,
              label: 'Export PDF',
              onClick: () => handleDownloadRequest("pdf"),
            },
            ...(canExport
              ? (
                  [
                    ["daily-summary", "Daily summary CSV"],
                    ["orders-breakdown", "Orders breakdown CSV"],
                    ["payments-distribution", "Payments distribution CSV"],
                    ["customer-insights", "Customer insights CSV"],
                    ["geographic-distribution", "Geographic distribution CSV"],
                  ] as const
                ).map(([reportType, label]) => ({
                  icon: <FileSpreadsheet className='h-4.5 w-4.5' />,
                  label,
                  onClick: () => handleDownloadRequest("csv", reportType),
                }))
              : []),
          ]}
        />

        {/* OTP dialog */}
        {user?.email && (
          <OTPVerificationDialog
            open={showOTPDialog}
            onOpenChange={(val) => setShowOTPDialog(val)}
            mobile_number={user.mobile_number || ""}
            email={user.email || ""}
            purpose='account_verification'
            title='Verify to download report'
            description='Confirm your phone number to download the report securely'
            onVerificationSuccess={handleDownloadAfterVerification}
            autoSendOnMount={true}
          />
        )}
      </MobilePage>
    );
  }

  return (
    <MainView title='Daily Reports'>
      <>
        <div className='min-h-screen bg-slate-50/70'>
          {/* ── Top Bar ─────────────────────────────────────── */}
          <div className='sticky top-0 z-10 bg-white border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
              {/* Brand */}
              <PageHeader
                className='flex-shrink-0'
                icon={<CalendarIcon className='h-5 w-5' />}
                title='Daily Reports'
                subtitle='Business performance metrics'
                count={
                  reports.length > 0 ? (
                    <span className='rounded-md px-2.5 py-1 text-sm font-semibold text-slate-500 tabular-nums'>
                      {reports.length} report{reports.length === 1 ? "" : "s"}
                    </span>
                  ) : undefined
                }
              />

              {/* Controls */}
              <div className='flex flex-wrap items-center gap-2'>
                {/* Quick presets */}
                <SegmentGroup
                  options={[
                    { label: "Today", value: "today" },
                    { label: "Yesterday", value: "yesterday" },
                    { label: "Latest", value: "latest" },
                  ]}
                  active=''
                  onChange={(v) => handleQuickDateSelect(v as any)}
                />

                {/* Single / Range toggle */}
                <SegmentGroup
                  options={[
                    { label: "Single date", value: "single" },
                    { label: "Date range", value: "range" },
                  ]}
                  active={dateMode}
                  onChange={(v) => {
                    setDateMode(v as "single" | "range");
                    if (v === "single") {
                      const t = new Date();
                      setDateRange({ from: startOfDay(t), to: endOfDay(t) });
                    }
                  }}
                />

                {/* Date picker */}
                {dateMode === "single" ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        size='sm'
                        className='h-8 px-3 gap-1.5 text-[13px] font-medium text-slate-600 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'>
                        <CalendarIcon className='h-3.5 w-3.5' />
                        {dateRange.from
                          ? format(dateRange.from, "LLL dd, y")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className='w-auto p-0 shadow-lg border-slate-200'
                      align='end'>
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
                      rangeCompare?: DateRange;
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
          </div>

          {/* ── Page Body ───────────────────────────────────── */}
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5'>
            {/* Range summary pills */}
            {!isSingleDate && summaryStats && (
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3'>
                <RangePill
                  label='Total revenue'
                  value={`৳${summaryStats.totalRevenue?.toLocaleString()}`}
                  color='#4F46E5'
                />
                <RangePill
                  label='Total orders'
                  value={summaryStats.totalOrders?.toString()}
                  color='#10B981'
                />
                <RangePill
                  label='Customers'
                  value={summaryStats.totalCustomers?.toString()}
                  color='#3B82F6'
                />
                <RangePill
                  label='Products updated'
                  value={summaryStats.totalProductsUpdated?.toString()}
                  color='#F59E0B'
                />
                <RangePill
                  label='Total paid'
                  value={`৳${summaryStats.totalPaid?.toLocaleString()}`}
                  color='#8B5CF6'
                />
                <RangePill
                  label='Reports'
                  value={summaryStats.reportCount?.toString()}
                  color='#6B7280'
                />
              </div>
            )}

            {/* Report meta strip */}
            {currentReport && (
              <div className='flex flex-wrap items-center gap-x-5 gap-y-2 bg-white rounded-xl border border-slate-100 px-5 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'>
                <div className='flex items-center gap-2 text-[13px] text-slate-500'>
                  <Clock className='h-3.5 w-3.5 text-slate-400' />
                  {format(new Date(currentReport.timestamp), "PPP p")}
                </div>

                {currentReport.status && (
                  <div className='flex items-center gap-1.5'>
                    {currentReport.status === "completed" ? (
                      <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' />
                    ) : (
                      <AlertCircle className='h-3.5 w-3.5 text-amber-500' />
                    )}
                    <span
                      className={cn(
                        "text-[13px] font-medium capitalize",
                        currentReport.status === "completed"
                          ? "text-emerald-600"
                          : "text-amber-600",
                      )}>
                      {currentReport.status}
                    </span>
                  </div>
                )}

                {currentReport.processingTime && (
                  <div className='flex items-center gap-1.5 text-[13px] text-slate-400'>
                    <Zap className='h-3.5 w-3.5' />
                    Generated in {currentReport.processingTime}
                  </div>
                )}
              </div>
            )}

            {/* ── Stats ribbon ──────────────────────────────── */}
            {currentReport && (
              <div className='flex bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden divide-x divide-slate-100'>
                <StatCell
                  label='Revenue'
                  value={`৳${currentReport.summary?.totalRevenue?.toLocaleString() ?? "—"}`}
                  accentColor='#4F46E5'
                  delta={{ value: "+12.4% vs yesterday", up: true }}
                />
                <StatCell
                  label='Orders'
                  value={currentReport.orders?.total ?? "—"}
                  accentColor='#10B981'
                  delta={{ value: "+8.1%", up: true }}
                />
                <StatCell
                  label='Customers'
                  value={currentReport.customers?.total ?? "—"}
                  accentColor='#3B82F6'
                  delta={{ value: "−3.2%", up: false }}
                />
                <StatCell
                  label='Avg. order'
                  value={`৳${currentReport.summary?.avgOrderValue?.toLocaleString() ?? "—"}`}
                  accentColor='#F59E0B'
                  delta={{ value: "+4.0%", up: true }}
                />
                <StatCell
                  label='Total paid'
                  value={`৳${currentReport.payments?.totalPaid?.toLocaleString() ?? "—"}`}
                  accentColor='#8B5CF6'
                  delta={{ value: "+9.7%", up: true }}
                />
              </div>
            )}

            {/* ── Loading state ─────────────────────────────── */}
            {isLoadingReports && (
              <div className='flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'>
                <Loader2
                  className='h-7 w-7 animate-spin text-indigo-500'
                  strokeWidth={1.5}
                />
                <p className='mt-3 text-[13px] font-medium text-slate-500'>
                  Loading daily reports…
                </p>
              </div>
            )}

            {/* ── Empty state ───────────────────────────────── */}
            {!isLoadingReports && reports.length === 0 && (
              <div className='flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-center px-6'>
                <div className='w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4'>
                  <BarChart3
                    className='h-6 w-6 text-slate-300'
                    strokeWidth={1.5}
                  />
                </div>
                <p className='text-[15px] font-medium text-slate-700 mb-1'>
                  No reports found
                </p>
                <p className='text-[13px] text-slate-400'>
                  Try selecting a different date or date range
                </p>
              </div>
            )}

            {/* ── Report cards ──────────────────────────────── */}
            {!isLoadingReports && currentReport && (
              <div className='space-y-5'>
                {/* Daily summary */}
                <DailySummaryCard
                  data={currentReport}
                  isSingleDate={isSingleDate}
                  dateRange={dateRange}
                  onDownload={handleDownloadRequest}
                />

                {/* Two-column */}
                <div className='grid gap-5 md:grid-cols-2'>
                  <OrdersBreakdownCard
                    data={currentReport.orders}
                    onDownload={handleDownloadRequest}
                  />
                  <PaymentsDistributionCard
                    data={currentReport.payments}
                    onDownload={handleDownloadRequest}
                  />
                </div>

                {/* Customer insights */}
                <CustomerInsightsCard
                  data={currentReport.customers}
                  onDownload={handleDownloadRequest}
                />

                {/* Geographic */}
                {currentReport.customers?.geographicDistribution?.length >
                  0 && (
                  <GeographicDistributionCard
                    data={currentReport.customers.geographicDistribution}
                    onDownload={handleDownloadRequest}
                  />
                )}

                {/* Export bar */}
                <ExportBar onExport={(type) => handleDownloadRequest(type)} />
              </div>
            )}
          </div>
        </div>

        {/* OTP dialog */}
        {user?.email && (
          <OTPVerificationDialog
            open={showOTPDialog}
            onOpenChange={(val) => setShowOTPDialog(val)}
            mobile_number={user.mobile_number || ""}
            email={user.email || ""}
            purpose='account_verification'
            title='Verify to download report'
            description='Confirm your phone number to download the report securely'
            onVerificationSuccess={handleDownloadAfterVerification}
            autoSendOnMount={true}
          />
        )}
      </>
    </MainView>
  );
};

export default DailyReport;
