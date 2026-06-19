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
    <Card className="border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
              <Wallet className="h-4 w-4" />
              Payment Methods Distribution
            </CardTitle>
            <CardDescription className="text-[12px] text-slate-400">
              Total: {formatCurrency(totalAmount)}
            </CardDescription>
          </div>
          {hasRequiredPermission("Report", "download") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload("csv", "payments-distribution")}
              className="h-8 px-3 gap-1.5 text-[13px] font-medium text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150">
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Pie Chart */}
          <div className="h-[280px]">
            <h4 className="text-[13px] font-semibold text-slate-900 mb-4 text-center">
              Payment Method Distribution
            </h4>
            <ChartContainer config={chartConfig}>
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
            </ChartContainer>
          </div>

          {/* Bar Chart */}
          <div className="h-[220px]">
            <h4 className="text-[13px] font-semibold text-slate-900 mb-4 text-center">
              Payment Amount by Method
            </h4>
            <ChartContainer config={chartConfig}>
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
            </ChartContainer>
          </div>

          {/* Payment Method Cards */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200">
            {chartData.map((item) => {
              const percentage = totalAmount > 0
                ? ((item.value / totalAmount) * 100).toFixed(1)
                : "0";

              return (
                <div
                  key={item.name}
                  className="bg-white border border-slate-100 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-3 space-y-1 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: item.fill }} />
                  <p className="text-[11px] font-medium text-slate-500">
                    {item.name}
                  </p>
                  <p className="text-[15px] font-semibold text-slate-900" style={{ color: item.fill }}>
                    {formatCurrency(item.value)}
                  </p>
                  <p className="text-[11px] text-slate-400">{percentage}%</p>
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
