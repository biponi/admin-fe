// ============================================
// FILE: src/pages/report/DailyReportCards/CustomerInsightsCard.tsx
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
import { Download, Users, UserPlus, Repeat } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import useRoleCheck from "../../auth/hooks/useRoleCheck";

interface CustomerInsightsCardProps {
  data: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    geographicDistribution: any[];
  };
  onDownload: (type: "csv" | "pdf", reportType?: string) => void;
}

const chartConfig = {
  new: {
    label: "New Customers",
    color: "#10b981", // green-500
  },
  returning: {
    label: "Returning Customers",
    color: "#3b82f6", // blue-500
  },
};

const CustomerInsightsCard: React.FC<CustomerInsightsCardProps> = ({
  data,
  onDownload,
}) => {
  const { hasRequiredPermission } = useRoleCheck();

  const chartData = [
    {
      name: "New Customers",
      value: data.newCustomers,
      fill: chartConfig.new.color,
    },
    {
      name: "Returning Customers",
      value: data.returningCustomers,
      fill: chartConfig.returning.color,
    },
  ];

  const newCustomerPercentage =
    data.totalCustomers > 0
      ? ((data.newCustomers / data.totalCustomers) * 100).toFixed(1)
      : "0";

  const returningCustomerPercentage =
    data.totalCustomers > 0
      ? ((data.returningCustomers / data.totalCustomers) * 100).toFixed(1)
      : "0";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Insights
            </CardTitle>
            <CardDescription>
              Total Customers: {data.totalCustomers}
            </CardDescription>
          </div>
          {hasRequiredPermission("Report", "download") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload("csv", "customer-insights")}
              className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Customer Distribution Pie Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[250px]">
              <h4 className="text-sm font-medium mb-4 text-center">
                Customer Type Distribution
              </h4>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Customer Metrics */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Customer Metrics</h4>

              {/* Total Customers */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Total Customers
                  </p>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {data.totalCustomers}
                </p>
              </div>

              {/* New Customers */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    New Customers
                  </p>
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold text-green-600">
                    {data.newCustomers}
                  </p>
                  <p className="text-sm font-semibold text-green-700">
                    {newCustomerPercentage}%
                  </p>
                </div>
              </div>

              {/* Returning Customers */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-4 rounded-lg border border-blue-200 dark:border-indigo-800">
                <div className="flex items-center gap-2 mb-2">
                  <Repeat className="h-5 w-5 text-indigo-600" />
                  <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                    Returning Customers
                  </p>
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold text-indigo-600">
                    {data.returningCustomers}
                  </p>
                  <p className="text-sm font-semibold text-indigo-700">
                    {returningCustomerPercentage}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Acquisition Insights */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-3">Acquisition Insights</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {newCustomerPercentage}%
                </p>
                <p className="text-xs text-muted-foreground">New Customer Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {returningCustomerPercentage}%
                </p>
                <p className="text-xs text-muted-foreground">Retention Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {data.totalCustomers > 0 && data.newCustomers > 0
                    ? (data.totalCustomers / data.newCustomers).toFixed(1)
                    : "0"}
                </p>
                <p className="text-xs text-muted-foreground">Ratio (Total/New)</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerInsightsCard;
