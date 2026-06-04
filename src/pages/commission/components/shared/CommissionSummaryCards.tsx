import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  ShoppingCart,
  Package,
  Pause,
  XCircle,
  Trash2,
} from "lucide-react";
import { CommissionSummaryResponse } from "../../../../api/commission";
import { OrderCommissionListResponse } from "../../../../api/commission";
import { UserCommissionListResponse } from "../../../../api/commission";
import { formatCurrency } from "../../../../utils/inventoryReportUtils";
import { LucideIcon } from "lucide-react";

interface CommissionSummaryCardsProps {
  type: "product" | "order" | "user";
  summary?:
    | CommissionSummaryResponse["overview"]
    | OrderCommissionListResponse["summary"]
    | UserCommissionListResponse["summary"];
  className?: string;
}

interface CardType {
  title: string;
  amount: number;
  count?: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  isCount?: boolean;
  showPercentage?: boolean;
}

export const CommissionSummaryCards: React.FC<CommissionSummaryCardsProps> = ({
  type,
  summary,
  className = "grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
}) => {
  if (!summary) return null;

  const productCards: CardType[] = [
    {
      title: "Total Commission",
      amount: (summary as CommissionSummaryResponse["overview"]).totalCommissionAmount,
      count: (summary as CommissionSummaryResponse["overview"]).totalCommissions,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900",
    },
    {
      title: "Paid",
      amount: (summary as CommissionSummaryResponse["overview"]).paidAmount,
      count: (summary as CommissionSummaryResponse["overview"]).paidCount,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Unpaid",
      amount: (summary as CommissionSummaryResponse["overview"]).unpaidAmount,
      count: (summary as CommissionSummaryResponse["overview"]).unpaidCount,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Pending",
      amount: (summary as CommissionSummaryResponse["overview"]).pendingAmount,
      count: (summary as CommissionSummaryResponse["overview"]).pendingCount,
      icon: Users,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
    },
    {
      title: "Hold",
      amount: (summary as CommissionSummaryResponse["overview"]).holdAmount,
      count: (summary as CommissionSummaryResponse["overview"]).holdCount,
      icon: Pause,
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-900",
    },
    {
      title: "Cancelled",
      amount: (summary as CommissionSummaryResponse["overview"]).cancelledAmount,
      count: (summary as CommissionSummaryResponse["overview"]).cancelledCount,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900",
    },
    {
      title: "Removed",
      amount: (summary as CommissionSummaryResponse["overview"]).removedAmount,
      count: (summary as CommissionSummaryResponse["overview"]).removedCount,
      icon: Trash2,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900",
    },
  ];

  const orderCards: CardType[] = [
    {
      title: "Total Orders",
      amount: (summary as OrderCommissionListResponse["summary"]).totalOrders,
      count: (summary as OrderCommissionListResponse["summary"]).totalOrders,
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900",
      isCount: true,
    },
    {
      title: "Total Commission",
      amount: (summary as OrderCommissionListResponse["summary"]).totalCommissionAmount,
      count: (summary as OrderCommissionListResponse["summary"]).totalOrders,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Paid",
      amount: (summary as OrderCommissionListResponse["summary"]).paidAmount,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Unpaid",
      amount: (summary as OrderCommissionListResponse["summary"]).unpaidAmount,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Pending",
      amount: (summary as OrderCommissionListResponse["summary"]).pendingAmount,
      icon: Users,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
    },
    {
      title: "Hold",
      amount: (summary as OrderCommissionListResponse["summary"]).holdAmount,
      icon: Pause,
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-900",
    },
    {
      title: "Cancelled",
      amount: (summary as OrderCommissionListResponse["summary"]).cancelledAmount,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900",
    },
  ];

  const userCards: CardType[] = [
    {
      title: "Total Users",
      amount: (summary as UserCommissionListResponse["summary"]).totalUsers,
      count: (summary as UserCommissionListResponse["summary"]).totalUsers,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900",
      isCount: true,
    },
    {
      title: "Total to Receive",
      amount: (summary as UserCommissionListResponse["summary"]).totalCommissionAmount,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Paid",
      amount: (summary as UserCommissionListResponse["summary"]).paidAmount,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
      showPercentage: true,
    },
    {
      title: "Unpaid",
      amount: (summary as UserCommissionListResponse["summary"]).unpaidAmount,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Pending",
      amount: (summary as UserCommissionListResponse["summary"]).pendingAmount,
      icon: Users,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
    },
    {
      title: "Hold",
      amount: (summary as UserCommissionListResponse["summary"]).holdAmount,
      icon: Pause,
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-900",
    },
    {
      title: "Cancelled",
      amount: (summary as UserCommissionListResponse["summary"]).cancelledAmount,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900",
    },
    {
      title: "Removed",
      amount: (summary as UserCommissionListResponse["summary"]).removedAmount,
      icon: Trash2,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900",
    },
  ];

  const cards = type === "product" ? productCards : type === "order" ? orderCards : userCards;

  return (
    <div className={className}>
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {card.isCount ? card.amount : formatCurrency(card.amount as number)}
            </div>
            {card.showPercentage && type === "user" && (
              <p className="text-xs text-green-600 mt-1">
                {(((summary as UserCommissionListResponse["summary"]).paidAmount /
                   (summary as UserCommissionListResponse["summary"]).totalCommissionAmount) * 100).toFixed(1)}% of total
              </p>
            )}
            {card.count !== undefined && !card.showPercentage && (
              <p className="text-xs text-muted-foreground">
                {card.count} {card.count === 1 ? "record" : "records"}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
