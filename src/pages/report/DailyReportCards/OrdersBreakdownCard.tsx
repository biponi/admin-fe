// ============================================
// FILE: src/pages/report/DailyReportCards/OrdersBreakdownCard.tsx
// ============================================
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../components/ui/chart";
import { Download, ShoppingCart } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import useRoleCheck from "../../auth/hooks/useRoleCheck";

interface OrdersBreakdownCardProps {
  data: {
    totalCount: number;
    byStatus: any;
    byPaymentStatus: any;
  };
  onDownload: (type: "csv" | "pdf", reportType?: string) => void;
}

const chartConfig = {
  completed: {
    label: "Completed",
    color: "#10b981", // green-500
  },
  processing: {
    label: "Processing",
    color: "#3b82f6", // blue-500
  },
  shipped: {
    label: "Shipped",
    color: "#8b5cf6", // violet-500
  },
  pending: {
    label: "Pending",
    color: "#f59e0b", // amber-500
  },
  cancelled: {
    label: "Cancelled",
    color: "#ef4444", // red-500
  },
  failed: {
    label: "Failed",
    color: "#dc2626", // red-600
  },
  delete: {
    label: "Deleted",
    color: "#6b7280", // gray-500
  },
  cancel: {
    label: "Cancel",
    color: "#f97316", // orange-500
  },
  fullyPaid: {
    label: "Fully Paid",
    color: "#10b981", // green-500
  },
  partiallyPaid: {
    label: "Partially Paid",
    color: "#f59e0b", // amber-500
  },
  unpaid: {
    label: "Unpaid",
    color: "#ef4444", // red-500
  },
} satisfies ChartConfig;

const OrdersBreakdownCard: React.FC<OrdersBreakdownCardProps> = ({
  data,
  onDownload,
}) => {
  const { hasRequiredPermission } = useRoleCheck();
  const [chartType, setChartType] = useState<"status" | "payment">("status");

  const statusChartData = Object.entries(data.byStatus)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count as number,
      fill: chartConfig[status as keyof typeof chartConfig]?.color || "#9ca3af",
    }))
    .sort((a, b) => b.value - a.value);

  const paymentChartData = Object.entries(data.byPaymentStatus)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace(/([A-Z])/g, " $1").trim(),
      value: count as number,
      fill: chartConfig[status as keyof typeof chartConfig]?.color || "#9ca3af",
    }))
    .sort((a, b) => b.value - a.value);

  const barChartData =
    chartType === "status"
      ? statusChartData
      : paymentChartData;

  const pieChartData =
    chartType === "status"
      ? statusChartData
      : paymentChartData;

  const totalOrders = data.totalCount;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Orders Breakdown
            </CardTitle>
            <CardDescription>
              Total Orders: {totalOrders}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={chartType} onValueChange={(value: "status" | "payment") => setChartType(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select breakdown" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status">Order Status</SelectItem>
                <SelectItem value="payment">Payment Status</SelectItem>
              </SelectContent>
            </Select>
            {hasRequiredPermission("Report", "download") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload("csv", "orders-breakdown")}
                className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Pie Chart */}
          <div className="h-[300px]">
            <h4 className="text-sm font-medium mb-4 text-center">
              {chartType === "status" ? "Order Status Distribution" : "Payment Status Distribution"}
            </h4>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value">
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Bar Chart */}
          <div className="h-[250px]">
            <h4 className="text-sm font-medium mb-4 text-center">
              {chartType === "status" ? "Order Status Count" : "Payment Status Count"}
            </h4>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            {chartType === "status" ? (
              <>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Completed Orders</p>
                  <p className="text-xl font-bold text-green-600">
                    {data.byStatus.completed || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {totalOrders > 0
                      ? `${((data.byStatus.completed / totalOrders) * 100).toFixed(1)}%`
                      : "0%"}
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Pending Orders</p>
                  <p className="text-xl font-bold text-amber-600">
                    {data.byStatus.pending || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {totalOrders > 0
                      ? `${((data.byStatus.pending / totalOrders) * 100).toFixed(1)}%`
                      : "0%"}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Fully Paid</p>
                  <p className="text-xl font-bold text-green-600">
                    {data.byPaymentStatus.fullyPaid || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {totalOrders > 0
                      ? `${((data.byPaymentStatus.fullyPaid / totalOrders) * 100).toFixed(1)}%`
                      : "0%"}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Unpaid Orders</p>
                  <p className="text-xl font-bold text-red-600">
                    {data.byPaymentStatus.unpaid || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {totalOrders > 0
                      ? `${((data.byPaymentStatus.unpaid / totalOrders) * 100).toFixed(1)}%`
                      : "0%"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersBreakdownCard;
