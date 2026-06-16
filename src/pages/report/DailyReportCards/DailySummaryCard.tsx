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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Daily Summary</CardTitle>
            <CardDescription>
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
              className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Products Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Package className="h-4 w-4" />
              Products
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Total Processed</span>
                <span className="text-2xl font-bold">{data.products.totalProcessed}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Items Updated</span>
                <span className="text-lg font-semibold">
                  {data.products.itemsUpdated}
                </span>
              </div>
              {data.products.processingTime && (
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-muted-foreground">Processing Time</span>
                  <span className="text-xs font-mono">
                    {data.products.processingTime}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sales Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Sales
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Total Revenue</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.sales.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Total Paid</span>
                <span className="text-lg font-semibold">
                  {formatCurrency(data.sales.totalPaid)}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Avg Order Value</span>
                <span className="text-lg font-semibold">
                  {formatCurrency(data.sales.averageOrderValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Total Orders</span>
                <span className="text-2xl font-bold">{data.orders.totalCount}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="text-lg font-semibold text-green-600">
                  {data.orders.byStatus.completed || 0}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="text-lg font-semibold text-amber-600">
                  {data.orders.byStatus.pending || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="space-y-3 md:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Additional Metrics
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Total Discount</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(data.sales.totalDiscount)}
                </p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Delivery Charge</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(data.sales.totalDeliveryCharge)}
                </p>
              </div>
              {data.processingTime && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Report Generation</p>
                  <p className="text-lg font-semibold">{data.processingTime}</p>
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
