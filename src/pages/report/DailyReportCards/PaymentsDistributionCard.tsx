// ============================================
// FILE: src/pages/report/DailyReportCards/PaymentsDistributionCard.tsx
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
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../components/ui/chart";
import { Download, Wallet } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import useRoleCheck from "../../auth/hooks/useRoleCheck";

interface PaymentsDistributionCardProps {
  data: {
    byMethod: {
      cash: number;
      bkash: number;
      nagad: number;
      card: number;
      bank: number;
      online: number;
    };
  };
  onDownload: (type: "csv" | "pdf", reportType?: string) => void;
}

const chartConfig = {
  cash: {
    label: "Cash",
    color: "#10b981", // green-500
  },
  bkash: {
    label: "bKash",
    color: "#ec4899", // pink-500
  },
  nagad: {
    label: "Nagad",
    color: "#f97316", // orange-500
  },
  card: {
    label: "Card",
    color: "#3b82f6", // blue-500
  },
  bank: {
    label: "Bank Transfer",
    color: "#8b5cf6", // violet-500
  },
  online: {
    label: "Online",
    color: "#06b6d4", // cyan-500
  },
} satisfies ChartConfig;

const PaymentsDistributionCard: React.FC<PaymentsDistributionCardProps> = ({
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

  const chartData = Object.entries(data.byMethod)
    .filter(([_, amount]) => amount > 0)
    .map(([method, amount]) => ({
      name: chartConfig[method as keyof typeof chartConfig]?.label || method,
      value: amount as number,
      fill: chartConfig[method as keyof typeof chartConfig]?.color || "#9ca3af",
    }))
    .sort((a, b) => b.value - a.value);

  const totalAmount = Object.values(data.byMethod).reduce((sum, amount) => sum + amount, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Payment Methods Distribution
            </CardTitle>
            <CardDescription>
              Total: {formatCurrency(totalAmount)}
            </CardDescription>
          </div>
          {hasRequiredPermission("Report", "download") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload("pdf", "payments-distribution")}
              className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Pie Chart */}
          <div className="h-[280px]">
            <h4 className="text-sm font-medium mb-4 text-center">
              Payment Method Distribution
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
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="h-[220px]">
            <h4 className="text-sm font-medium mb-4 text-center">
              Payment Amount by Method
            </h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="horizontal">
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  content={<ChartTooltipContent />}
                  formatter={(value: number) => [formatCurrency(value), "Amount"]}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Method Cards */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t">
            {chartData.map((item) => {
              const percentage = totalAmount > 0
                ? ((item.value / totalAmount) * 100).toFixed(1)
                : "0";

              return (
                <div
                  key={item.name}
                  className="bg-muted/50 p-3 rounded-lg space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    {item.name}
                  </p>
                  <p className="text-lg font-bold" style={{ color: item.fill }}>
                    {formatCurrency(item.value)}
                  </p>
                  <p className="text-xs text-muted-foreground">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentsDistributionCard;
