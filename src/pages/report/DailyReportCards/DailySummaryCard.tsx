// ============================================
// FILE: src/pages/report/DailyReportCards/DailySummaryCard.tsx
// ============================================
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Download,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import useRoleCheck from "../../auth/hooks/useRoleCheck";

interface DailySummaryCardProps {
  data: {
    date: string;
    products: any;
    sales: any;
    orders: any;
    timestamp: string;
    processingTime?: string;
  };
  isSingleDate: boolean;
  dateRange: { from: Date; to: Date };
  onDownload: (type: "csv" | "pdf", reportType?: string) => void;
}

const DailySummaryCard: React.FC<DailySummaryCardProps> = ({
  data,
  isSingleDate,
  dateRange,
  onDownload,
}) => {
  const { hasRequiredPermission } = useRoleCheck();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) {
      return "Date not available";
    }
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    return format(date, "PPP");
  };

  const formatRangeDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return "Invalid date";
    }
    return format(date, "MMM dd, yyyy");
  };

  return (
    <Card className="border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[15px] font-semibold text-slate-900">Daily Summary</CardTitle>
            <CardDescription className="text-[12px] text-slate-400">
              {isSingleDate
                ? `Report for ${data.date ? formatDate(data.date) : "Date not available"}`
                : `Reports from ${formatRangeDate(dateRange.from)} to ${formatRangeDate(
                    dateRange.to
                  )}`}
            </CardDescription>
          </div>
          {hasRequiredPermission("Report", "download") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload("csv", "daily-summary")}
              className="h-8 px-3 gap-1.5 text-[13px] font-medium text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150">
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Products Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase text-slate-400">
              <Package className="h-3.5 w-3.5" />
              Products
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-[12px] text-slate-500">Total Processed</span>
                <span className="text-[22px] font-semibold text-slate-900 leading-none">{data.products.totalProcessed}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[12px] text-slate-500">Items Updated</span>
                <span className="text-[15px] font-semibold text-slate-900">
                  {data.products.itemsUpdated}
                </span>
              </div>
              {data.products.processingTime && (
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] text-slate-500">Processing Time</span>
                  <span className="text-[11px] font-mono text-slate-600">
                    {data.products.processingTime}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sales Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase text-slate-400">
              <DollarSign className="h-3.5 w-3.5" />
              Sales
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-[12px] text-slate-500">Total Revenue</span>
                <span className="text-[22px] font-semibold text-emerald-600 leading-none">
                  {formatCurrency(data.sales.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[12px] text-slate-500">Total Paid</span>
                <span className="text-[15px] font-semibold text-slate-900">
                  {formatCurrency(data.sales.totalPaid)}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[12px] text-slate-500">Avg Order Value</span>
                <span className="text-[15px] font-semibold text-slate-900">
                  {formatCurrency(data.sales.averageOrderValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase text-slate-400">
              <ShoppingCart className="h-3.5 w-3.5" />
              Orders
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-[12px] text-slate-500">Total Orders</span>
                <span className="text-[22px] font-semibold text-slate-900 leading-none">{data.orders.totalCount}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[12px] text-slate-500">Completed</span>
                <span className="text-[15px] font-semibold text-emerald-600">
                  {data.orders.byStatus.completed || 0}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[12px] text-slate-500">Pending</span>
                <span className="text-[15px] font-semibold text-amber-600">
                  {data.orders.byStatus.pending || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="space-y-3 md:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase text-slate-400">
              <TrendingUp className="h-3.5 w-3.5" />
              Additional Metrics
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-white border border-slate-100 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-3">
                <p className="text-[11px] text-slate-500">Total Discount</p>
                <p className="text-[15px] font-semibold text-slate-900">
                  {formatCurrency(data.sales.totalDiscount)}
                </p>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-3">
                <p className="text-[11px] text-slate-500">Delivery Charge</p>
                <p className="text-[15px] font-semibold text-slate-900">
                  {formatCurrency(data.sales.totalDeliveryCharge)}
                </p>
              </div>
              {data.processingTime && (
                <div className="bg-white border border-slate-100 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-3">
                  <p className="text-[11px] text-slate-500">Report Generation</p>
                  <p className="text-[15px] font-semibold text-slate-900">{data.processingTime}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailySummaryCard;
