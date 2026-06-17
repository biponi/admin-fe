// ============================================
// FILE: components/reports/OrderFulfillmentCard.tsx
// ============================================
import React from "react";
import { Download, Package, AlertCircle, Clock } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";
import useRoleCheck from "../auth/hooks/useRoleCheck";

interface OrderFulfillmentCardProps {
  data: any;
  onDownload: () => void;
}

const chartConfig = {
  count: {
    label: "Count",
    color: "#6366f1",
  },
  value: {
    label: "Value",
    color: "#8b5cf6",
  },
} satisfies ChartConfig;

const OrderFulfillmentCard: React.FC<OrderFulfillmentCardProps> = ({
  data,
  onDownload,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statusChartData =
    data.statusDistribution?.map((item: any) => ({
      status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      count: item.count,
      value: item.totalValue,
    })) || [];

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Order Fulfillment
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Order status distribution and fulfillment metrics
            </p>
          </div>
          {useRoleCheck().hasRequiredPermission("Report", "download") && (
            <button
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-6">
        {/* Stuck Orders Alert */}
        <div className="w-full grid grid-cols-1 gap-3 md:grid-cols-2">
          {data.stuckOrders && data.stuckOrders.count > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
              <div className="flex items-center gap-2 text-rose-700 mb-3">
                <AlertCircle className="h-5 w-5" />
                <p className="font-semibold">
                  {data.stuckOrders.count} Orders Need Attention
                </p>
              </div>
              <div className="space-y-2">
                {data.stuckOrders.orders
                  ?.slice(0, 4)
                  .map((order: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100">
                      <div>
                        <p className="font-medium text-slate-900">
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-sm text-slate-500">
                          {order.customerName} • {order.customerPhone}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          {formatCurrency(order.totalPrice)}
                        </p>
                        <p className="text-sm text-rose-600">
                          {order.ageInDays} days old
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Status Distribution Chart */}
          <div className="h-96 grid grid-cols-1 gap-3">
            <div className="bg-slate-50 rounded-lg p-4 h-full">
              <h4 className="text-sm font-semibold text-slate-900 mb-1">
                Order Status Distribution
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Number of orders by status
              </p>
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <BarChart accessibilityLayer data={statusChartData}>
                  <CartesianGrid vertical={true} strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="status"
                    tickLine={false}
                    tickMargin={5}
                    axisLine={false}
                    fontWeight={500}
                    fontSize={12}
                    tick={{ fill: "#64748b" }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  <YAxis yAxisId="left" orientation="left" hide />
                  <YAxis yAxisId="right" orientation="right" hide />
                  <Bar
                    yAxisId="left"
                    dataKey="count"
                    fill="var(--color-count)"
                    radius={5}
                    name="Orders"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="value"
                    fill="var(--color-value)"
                    radius={5}
                    name="Total Value: "
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </div>

        {/* Average Age by Status */}
        {data.averageAgeByStatus && data.averageAgeByStatus.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Average Order Age by Status
            </h3>
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
              {data.averageAgeByStatus.map((item: any, index: number) => (
                <div
                  key={index}
                  className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                    {item.status}
                  </p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {item.averageAgeInDays.toFixed(1)} days
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderFulfillmentCard;
