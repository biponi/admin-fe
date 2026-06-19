// ============================================
// FILE: src/pages/report/DailyReportCards/GeographicDistributionCard.tsx
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
import { Download, MapPin } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import useRoleCheck from "../../auth/hooks/useRoleCheck";

interface GeographicDistribution {
  division: string;
  count: number;
  revenue: number;
}

interface GeographicDistributionCardProps {
  data: GeographicDistribution[];
  onDownload: (type: "csv" | "pdf", reportType?: string) => void;
}

const COLORS = [
  "#10b981", // green
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
];

const GeographicDistributionCard: React.FC<GeographicDistributionCardProps> = ({
  data,
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

  // Sort by revenue descending
  const sortedData = [...data].sort((a, b) => b.revenue - a.revenue);

  const chartData = sortedData.map((item, index) => ({
    division: item.division,
    customers: item.count,
    revenue: item.revenue,
    fill: COLORS[index % COLORS.length],
  }));

  const totalRevenue = sortedData.reduce((sum, item) => sum + item.revenue, 0);
  const totalCustomers = sortedData.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
              <MapPin className="h-4 w-4" />
              Geographic Distribution
            </CardTitle>
            <CardDescription className="text-[12px] text-slate-400">
              Revenue and customer distribution by division
            </CardDescription>
          </div>
          {hasRequiredPermission("Report", "download") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload("csv", "geographic-distribution")}
              className="h-8 px-3 gap-1.5 text-[13px] font-medium text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150">
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Revenue Bar Chart */}
          <div className="h-[350px]">
            <h4 className="text-[13px] font-semibold text-slate-900 mb-4 text-center">
              Revenue by Division
            </h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="division"
                  type="category"
                  width={100}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border border-slate-200 rounded shadow-lg">
                          <p className="text-sm font-medium text-slate-900">{payload[0].payload.division}</p>
                          <p className="text-sm text-slate-600">
                            Revenue: {formatCurrency(payload[0].value as number)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="revenue" radius={[0, 8, 8, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Customer Count Bar Chart */}
          <div className="h-[250px]">
            <h4 className="text-[13px] font-semibold text-slate-900 mb-4 text-center">
              Customer Count by Division
            </h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="division"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border border-slate-200 rounded shadow-lg">
                          <p className="text-sm font-medium text-slate-900">{payload[0].payload.division}</p>
                          <p className="text-sm text-slate-600">
                            Customers: {payload[0].value as number}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="customers" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Division Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            {sortedData.slice(0, 6).map((item, index) => {
              const revenuePercentage = totalRevenue > 0
                ? ((item.revenue / totalRevenue) * 100).toFixed(1)
                : "0";
              const customerPercentage = totalCustomers > 0
                ? ((item.count / totalCustomers) * 100).toFixed(1)
                : "0";

              return (
                <div
                  key={item.division}
                  className="bg-white border border-slate-100 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 space-y-2 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-[13px] text-slate-900">{item.division}</p>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-[12px] text-slate-500">Revenue</span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[12px] text-slate-500">Customers</span>
                      <span className="font-semibold text-slate-900">{item.count}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-200">
                      {revenuePercentage}% rev
                    </span>
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                      {customerPercentage}% cust
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div className="bg-white border border-slate-100 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
              <p className="text-[11px] text-slate-500 mb-1">Total Revenue</p>
              <p className="text-[22px] font-semibold text-emerald-600 leading-none">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
              <p className="text-[11px] text-slate-500 mb-1">Total Customers</p>
              <p className="text-[22px] font-semibold text-blue-600 leading-none">{totalCustomers}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeographicDistributionCard;
