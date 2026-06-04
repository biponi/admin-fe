import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { UserCommissionHistory } from "../../../../api/commission";
import {
  TrendingUp,
  Clock,
  Users,
  Pause,
  XCircle,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

interface StatusTrendsCardProps {
  trends: UserCommissionHistory["statusTrends"];
}

export const StatusTrendsCard: React.FC<StatusTrendsCardProps> = ({ trends }) => {
  const statusConfig = {
    paid: {
      label: "Paid",
      color: "bg-green-500 dark:bg-green-600",
      icon: TrendingUp,
      lightBg: "bg-green-50 dark:bg-green-950/40",
    },
    unpaid: {
      label: "Unpaid",
      color: "bg-blue-500 dark:bg-blue-600",
      icon: Clock,
      lightBg: "bg-blue-50 dark:bg-blue-950/40",
    },
    pending: {
      label: "Pending",
      color: "bg-yellow-500 dark:bg-yellow-600",
      icon: Users,
      lightBg: "bg-yellow-50 dark:bg-yellow-950/40",
    },
    hold: {
      label: "Hold",
      color: "bg-gray-500 dark:bg-gray-600",
      icon: Pause,
      lightBg: "bg-gray-50 dark:bg-gray-950/40",
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-red-500 dark:bg-red-600",
      icon: XCircle,
      lightBg: "bg-red-50 dark:bg-red-950/40",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Status Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(trends).map(([status, trend]) => {
            const config = statusConfig[status as keyof typeof statusConfig];
            const Icon = config.icon;

            return (
              <div
                key={status}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${config.lightBg}`}>
                    <Icon className={`h-4 w-4 ${config.color.replace("bg-", "text-")}`} />
                  </div>
                  <span className="text-sm font-medium">{config.label}</span>
                </div>
                <Badge
                  variant={
                    trend === "up"
                      ? "default"
                      : trend === "down"
                      ? "destructive"
                      : "secondary"
                  }
                  className="gap-1.5"
                >
                  {trend === "up" && <ArrowUp className="h-3 w-3" />}
                  {trend === "down" && <ArrowDown className="h-3 w-3" />}
                  {trend === "stable" && <Minus className="h-3 w-3" />}
                  {trend}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
