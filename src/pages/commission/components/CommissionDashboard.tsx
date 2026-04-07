import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { DollarSign, TrendingUp, Users, Clock } from "lucide-react";
import { CommissionSummaryResponse } from "../../../api/commission";
import { formatCurrency } from "../../../utils/inventoryReportUtils";

interface CommissionDashboardProps {
  summary: CommissionSummaryResponse["overview"];
}

export const CommissionDashboard: React.FC<CommissionDashboardProps> = ({
  summary,
}) => {
  const cards = [
    {
      title: "Total Commission",
      amount: summary.totalCommissionAmount,
      count: summary.totalCommissions,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900",
    },
    {
      title: "Paid",
      amount: summary.paidAmount,
      count: summary.paidCount,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Unpaid",
      amount: summary.unpaidAmount,
      count: summary.unpaidCount,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Pending",
      amount: summary.pendingAmount,
      count: summary.pendingCount,
      icon: Users,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{formatCurrency(card.amount)}</div>
            <p className="text-xs text-muted-foreground">{card.count} records</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
