// ============================================
// FILE: pages/ReportPage.tsx
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
  getSalesOverview,
  getSalesTrend,
  getCustomerInsights,
  getProductPerformance,
  getOrderFulfillment,
  getPaymentMethodBreakdown,
  exportReportCSV,
  exportReportPDF,
} from "../../api/report";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import { toast } from "react-hot-toast";
import useLoginAuth from "../auth/hooks/useLoginAuth";

// Import report components
import SalesOverviewCard from "./SalesOverviewCard";
import SalesTrendChart from "./SalesTrendChart";
import CustomerInsightsCard from "./CustomerInsightsCard";
import ProductPerformanceCard from "./ProductPerformanceCard";
import OrderFulfillmentCard from "./OrderFulfillmentCard";
import PaymentMethodsCard from "./PaymentMethodsCard";
import GeographicDistributionCard from "./GeographicDistributionCard";
import { Badge } from "../../components/ui/badge";

interface DateRange {
  from: Date;
  to: Date;
}

const ReportPage = ({ activeUsers }: { activeUsers: number }) => {
  const { user } = useLoginAuth();
  const [dateMode, setDateMode] = useState<"single" | "range">("range");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const [salesOverview, setSalesOverview] = useState<any>(null);
  const [salesTrend, setSalesTrend] = useState<any>(null);
  const [customerInsights, setCustomerInsights] = useState<any>(null);
  const [productPerformance, setProductPerformance] = useState<any>(null);
  const [orderFulfillment, setOrderFulfillment] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any>(null);

  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [downloadAction, setDownloadAction] = useState<{
    type: "csv" | "pdf";
    reportType?: string;
  } | null>(null);

  // Fetch reports when date range changes
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      fetchAllReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const fetchAllReports = async () => {
    setIsLoadingReports(true);
    const formatLocalDateTime = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };
    const startDate = formatLocalDateTime(dateRange?.from);
    const endDate = formatLocalDateTime(dateRange?.to);

    try {
      const [overview, trend, customer, product, fulfillment, payment] =
        await Promise.all([
          getSalesOverview(startDate, endDate),
          getSalesTrend(startDate, endDate, "day"),
          getCustomerInsights(startDate, endDate),
          getProductPerformance(startDate, endDate),
          getOrderFulfillment(startDate, endDate),
          getPaymentMethodBreakdown(startDate, endDate),
        ]);

      if (overview.success) setSalesOverview(overview.data);
      if (trend.success) setSalesTrend(trend.data);
      if (customer.success) setCustomerInsights(customer.data);
      if (product.success) setProductPerformance(product.data);
      if (fulfillment.success) setOrderFulfillment(fulfillment.data);
      if (payment.success) setPaymentMethods(payment.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to fetch reports");
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleDownloadRequest = (type: "csv" | "pdf") => {
    setDownloadAction({ type });
    setShowOTPDialog(true);
  };

  const handleDownloadAfterVerification = async () => {
    if (!downloadAction) return;

    const startDate = format(dateRange.from, "yyyy-MM-dd");
    const endDate = format(dateRange.to, "yyyy-MM-dd");

    try {
      let response;
      if (downloadAction.type === "csv") {
        response = await exportReportCSV(startDate, endDate);
      } else {
        response = await exportReportPDF(startDate, endDate);
      }

      if (response.success && response.data) {
        const blob = new Blob([response.data], {
          type: downloadAction.type === "csv" ? "text/csv" : "application/pdf",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `orders_export_${startDate}_to_${endDate}.${downloadAction.type}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success(
          `Report downloaded successfully as ${downloadAction.type.toUpperCase()}`
        );
      } else {
        toast.error(response.error || "Failed to download report");
      }
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report");
    } finally {
      setDownloadAction(null);
    }
  };

  return (
    <div className='w-full mx-auto p-2 space-y-6'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight flex items-center'>
            <span>Reports & Analytics</span>
            <Badge
              variant='secondary'
              className='ml-4 p-2 text-sm font-semibold bg-orange-50'>
              {" "}
              <div className='inline rounded-full bg-orange-700 animate-pulse w-[4px] h-[4px] ml-1 mr-2 p-1' />{" "}
              {activeUsers} Active Users
            </Badge>
          </h1>
          <p className='text-muted-foreground'>
            Comprehensive business insights and performance metrics
          </p>
        </div>

        {/* Date Range Picker */}
        <div className='flex gap-2'>
          <div className='flex border rounded-md'>
            <Button
              variant={dateMode === "single" ? "default" : "ghost"}
              size='sm'
              onClick={() => setDateMode("single")}
              className='rounded-r-none'>
              Single Date
            </Button>
            <Button
              variant={dateMode === "range" ? "default" : "ghost"}
              size='sm'
              onClick={() => setDateMode("range")}
              className='rounded-l-none'>
              Date Range
            </Button>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  "justify-start text-left font-normal w-[280px]",
                  !dateRange && "text-muted-foreground"
                )}>
                <CalendarIcon className='mr-2 h-4 w-4' />
                {dateRange.from && dateRange.to ? (
                  dateMode === "single" &&
                  format(dateRange.from, "yyyy-MM-dd") ===
                    format(dateRange.to, "yyyy-MM-dd") ? (
                    <>{format(dateRange.from, "LLL dd, y")}</>
                  ) : (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='end'>
              {dateMode === "single" ? (
                <Calendar
                  mode='single'
                  selected={dateRange.from}
                  onSelect={(date: Date | undefined) => {
                    if (date) {
                      // Set time to 00:00:00 for start of day
                      const startOfDay = new Date(date);
                      startOfDay.setHours(0, 0, 0, 0);

                      // Set time to 23:59:59 for end of day
                      const endOfDay = new Date(date);
                      endOfDay.setHours(23, 59, 59, 999);

                      setDateRange({ from: startOfDay, to: endOfDay });
                    }
                  }}
                  numberOfMonths={1}
                />
              ) : (
                <Calendar
                  mode='range'
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to,
                  }}
                  onSelect={(range: any) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                    }
                  }}
                  numberOfMonths={2}
                />
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingReports && (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          <span className='ml-2 text-muted-foreground'>Loading reports...</span>
        </div>
      )}

      {/* Reports Grid */}
      {!isLoadingReports && (
        <div className='space-y-6'>
          {/* Sales Overview */}
          {salesOverview && (
            <SalesOverviewCard
              data={salesOverview}
              duration={`${format(dateRange.from, "MMM dd")} -
                  ${format(dateRange.to, "MMM dd")}`}
              onDownload={() => handleDownloadRequest("csv")}
            />
          )}

          {/* Sales Trend Chart */}
          {salesTrend && (
            <SalesTrendChart
              data={salesTrend}
              onDownload={() => handleDownloadRequest("pdf")}
            />
          )}

          {/* Two Column Layout */}
          <div className='grid gap-6 md:grid-cols-2'>
            {/* Customer Insights */}
            {customerInsights && (
              <CustomerInsightsCard
                data={customerInsights}
                onDownload={() => handleDownloadRequest("csv")}
              />
            )}

            {/* Payment Methods */}
            {paymentMethods && (
              <PaymentMethodsCard
                data={paymentMethods}
                onDownload={() => handleDownloadRequest("pdf")}
              />
            )}
          </div>

          {/* Order Fulfillment */}
          {orderFulfillment && (
            <OrderFulfillmentCard
              data={orderFulfillment}
              onDownload={() => handleDownloadRequest("pdf")}
            />
          )}

          {/* Geographic Distribution */}
          {customerInsights?.geographicDistribution && (
            <GeographicDistributionCard
              duration={`${format(dateRange.from, "MMM dd")} -
                  ${format(dateRange.to, "MMM dd")}`}
              data={customerInsights.geographicDistribution}
              onDownload={() => handleDownloadRequest("csv")}
            />
          )}

          {/* Product Performance */}
          {productPerformance && (
            <ProductPerformanceCard
              data={productPerformance}
              onDownload={() => handleDownloadRequest("csv")}
            />
          )}
        </div>
      )}

      {/* OTP Verification Dialog */}
      {user?.email && (
        <OTPVerificationDialog
          open={showOTPDialog}
          onOpenChange={(val) => setShowOTPDialog(val)}
          email={user.email}
          purpose='account_verification'
          title='Verify to Download Report'
          description='For security purposes, please verify your email to download the report'
          onVerificationSuccess={handleDownloadAfterVerification}
          autoSendOnMount={true}
        />
      )}
    </div>
  );
};

export default ReportPage;
