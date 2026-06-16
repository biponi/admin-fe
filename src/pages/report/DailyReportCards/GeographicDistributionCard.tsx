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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Geographic Distribution
            </CardTitle>
            <CardDescription>
              Revenue and customer distribution by division
            </CardDescription>
          </div>
          {hasRequiredPermission("Report", "download") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload("csv", "geographic-distribution")}
              className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Revenue Bar Chart */}
          <div className="h-[350px]">
            <h4 className="text-sm font-medium mb-4 text-center">
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
                        <div className="bg-white dark:bg-gray-800 p-2 border rounded shadow-lg">
                          <p className="text-sm font-medium">{payload[0].payload.division}</p>
                          <p className="text-sm">
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
            <h4 className="text-sm font-medium mb-4 text-center">
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
                        <div className="bg-white dark:bg-gray-800 p-2 border rounded shadow-lg">
                          <p className="text-sm font-medium">{payload[0].payload.division}</p>
                          <p className="text-sm">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
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
                  className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{item.division}</p>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="font-semibold">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Customers</span>
                      <span className="font-semibold">{item.count}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                      {revenuePercentage}% rev
                    </span>
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                      {customerPercentage}% cust
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Customers</p>
              <p className="text-2xl font-bold text-blue-600">{totalCustomers}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeographicDistributionCard;
