import { Card, CardContent } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { UserCommissionHistory } from "../../../../api/commission";
import { formatCurrency } from "../../../../utils/inventoryReportUtils";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

interface PerformanceMetricsCardProps {
  performance: UserCommissionHistory["performance"];
  statusTrends: UserCommissionHistory["statusTrends"];
}

export const PerformanceMetricsCard: React.FC<PerformanceMetricsCardProps> = ({
  performance,
  statusTrends,
}) => {
  const metrics = [
    {
      label: "Growth Rate",
      value: `${performance.growthRate >= 0 ? "+" : ""}${performance.growthRate.toFixed(1)}%`,
      trend: performance.growthRate >= 0 ? "up" : "down",
      icon: TrendingUp,
      bgColor:
        performance.growthRate >= 0
          ? "bg-green-50 dark:bg-green-950/40"
          : "bg-red-50 dark:bg-red-950/40",
      textColor:
        performance.growthRate >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400",
      iconColor: performance.growthRate >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      label: "Avg Per Order",
      value: formatCurrency(performance.avgPerOrder),
      trend: "stable" as const,
      icon: DollarSign,
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      textColor: "text-blue-700 dark:text-blue-400",
      iconColor: "text-blue-600",
    },
    {
      label: "Payment Rate",
      value: `${performance.paymentRate.toFixed(1)}%`,
      trend: statusTrends.paid,
      icon: CheckCircle,
      bgColor:
        performance.paymentRate >= 60
          ? "bg-emerald-50 dark:bg-emerald-950/40"
          : "bg-yellow-50 dark:bg-yellow-950/40",
      textColor:
        performance.paymentRate >= 60
          ? "text-emerald-700 dark:text-emerald-400"
          : "text-yellow-700 dark:text-yellow-400",
      iconColor: performance.paymentRate >= 60 ? "text-emerald-600" : "text-yellow-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.label} className={`${metric.bgColor}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                  <p className={`text-2xl font-bold ${metric.textColor}`}>
                    {metric.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-full ${
                    metric.trend === "up"
                      ? "bg-green-100 dark:bg-green-900"
                      : metric.trend === "down"
                      ? "bg-red-100 dark:bg-red-900"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${metric.iconColor}`} />
                </div>
              </div>
              {metric.trend !== "stable" && (
                <div className="flex items-center gap-1.5 mt-3">
                  {metric.trend === "up" ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-red-600" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    vs previous period
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
