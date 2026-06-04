import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react";
import { OrderCommissionListResponse } from "../../../../api/commission";
import { formatCurrency } from "../../../../utils/inventoryReportUtils";

interface OrderCommissionDashboardProps {
  summary: OrderCommissionListResponse["summary"];
}

export const OrderCommissionDashboard: React.FC<
  OrderCommissionDashboardProps
> = ({ summary }) => {
  const cards = [
    {
      title: "Total Orders",
      amount: summary.totalOrders,
      count: summary.totalOrders,
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900",
      isCurrency: false,
    },
    {
      title: "Total Commission",
      amount: summary.totalCommissionAmount,
      count: summary.totalOrders,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
      isCurrency: true,
    },
    {
      title: "Paid",
      amount: summary.paidAmount,
      count: summary.totalOrders, // Will be calculated from status breakdown
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
      isCurrency: true,
    },
    {
      title: "Unpaid",
      amount: summary.unpaidAmount,
      count: summary.totalOrders,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
      isCurrency: true,
    },
    {
      title: "Pending",
      amount: summary.pendingAmount,
      count: summary.totalOrders,
      icon: Users,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
      isCurrency: true,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon
                className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {card.isCurrency ? formatCurrency(card.amount) : card.amount}
            </div>
            <p className="text-xs text-muted-foreground">
              {card.count} {card.count === 1 ? "order" : "orders"}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
