import { Card, CardContent } from "../../../components/ui/card";
import { DollarSign, Clock, TrendingUp } from "lucide-react";
import { formatCurrency } from "../../../utils/inventoryReportUtils";

interface CommissionHeaderProps {
  userName: string;
  totalEarned: number;
  pending: number;
  unpaid: number;
}

export const CommissionHeader: React.FC<CommissionHeaderProps> = ({
  userName,
  totalEarned,
  pending,
  unpaid,
}) => {
  const stats = [
    {
      label: "Total Earned",
      value: totalEarned,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
    },
    {
      label: "Unpaid",
      value: unpaid,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">{userName}'s Commissions</h1>
        <p className="text-muted-foreground">Track your earnings and commission history</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold">{formatCurrency(stat.value)}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
