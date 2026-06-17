// ============================================
// FILE: components/reports/CustomerInsightsCard.tsx
// ============================================
import React from "react";
import { Download, Users, UserPlus, UserCheck } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";
import useRoleCheck from "../auth/hooks/useRoleCheck";

interface CustomerInsightsCardProps {
  data: any;
  onDownload: () => void;
}

const chartConfig = {
  name: {
    label: "Name",
    color: "#64748b",
  },
  spent: {
    label: "Spent",
    color: "#6366f1",
  },
  label: {
    color: "#94a3b8",
  },
} satisfies ChartConfig;

const CustomerInsightsCard: React.FC<CustomerInsightsCardProps> = ({
  data,
  onDownload,
}) => {
  const topCustomersData =
    data.topCustomers?.slice(0, 5).map((customer: any) => ({
      name:
        `${customer.customerName} (${customer.phoneNumber})` ||
        customer.phoneNumber,
      spent: customer.totalSpent,
      orders: customer.orderCount,
    })) || [];

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Customer Insights
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Customer analytics and top performers
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
        {/* Summary Metrics */}
        <div className="grid gap-3 grid-cols-3">
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Users className="h-4 w-4" />
              <p className="text-sm font-medium">Total</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {data.summary?.totalUniqueCustomers || 0}
            </p>
          </div>

          <div className="bg-emerald-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <UserPlus className="h-4 w-4" />
              <p className="text-sm font-medium">New</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {data.summary?.newCustomers || 0}
            </p>
          </div>

          <div className="bg-violet-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-violet-600 mb-2">
              <UserCheck className="h-4 w-4" />
              <p className="text-sm font-medium">Returning</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {data.summary?.returningCustomers || 0}
            </p>
          </div>
        </div>

        {/* Top Customers Chart */}
        {topCustomersData.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              Top 5 Customers by Spending
            </h3>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <BarChart
                accessibilityLayer
                data={topCustomersData}
                layout="vertical"
                margin={{
                  right: 16,
                }}>
                <CartesianGrid horizontal={false} vertical={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 10)}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  width={75}
                />
                <XAxis dataKey="spent" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar dataKey="spent" fill="var(--color-spent)" radius={5}>
                  <LabelList
                    dataKey="name"
                    position="insideLeft"
                    className="fill-slate-700"
                    fontSize={12}
                    fontWeight={500}
                  />
                  <LabelList
                    dataKey="spent"
                    position="right"
                    className="fill-slate-900"
                    fontSize={12}
                    fontWeight={600}
                    formatter={(value: number) =>
                      new Intl.NumberFormat("en-BD", {
                        style: "currency",
                        currency: "BDT",
                        minimumFractionDigits: 0,
                      }).format(value)
                    }
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerInsightsCard;
