import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestStatistics } from "../hooks/useOperationRequests";
import { CheckCircle, XCircle, Clock, Ban, Hourglass, TrendingUp } from "lucide-react";

interface RequestStatisticsProps {
  statistics: RequestStatistics[];
  isLoading?: boolean;
}

export const RequestStatistics = ({ statistics, isLoading = false }: RequestStatisticsProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Get product delete stats (or the first operation type stats)
  const stats = statistics.find((s) => s.operationType === "product_delete") || statistics[0];

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: "Total Requests",
      value: stats.totalRequests,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Approved",
      value: stats.approved,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Cancelled",
      value: stats.cancelled,
      icon: Ban,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      title: "Timeout Expired",
      value: stats.timeoutExpired,
      icon: Hourglass,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
