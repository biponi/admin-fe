import { Badge } from "../../../../components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  ShoppingCart,
  Pause,
  XCircle,
  Trash2,
} from "lucide-react";
import { CommissionSummaryResponse } from "../../../../api/commission";
import { OrderCommissionListResponse } from "../../../../api/commission";
import { UserCommissionListResponse } from "../../../../api/commission";
import { formatCurrency } from "../../../../utils/inventoryReportUtils";
import { LucideIcon } from "lucide-react";

interface CommissionSummaryBadgesProps {
  type: "product" | "order" | "user";
  summary?:
    | CommissionSummaryResponse["overview"]
    | OrderCommissionListResponse["summary"]
    | UserCommissionListResponse["summary"];
}

interface BadgeType {
  label: string;
  amount: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  isCount?: boolean;
}

export const CommissionSummaryBadges: React.FC<
  CommissionSummaryBadgesProps
> = ({ type, summary }) => {
  if (!summary) return null;

  const productBadges: BadgeType[] = [
    {
      label: "Total",
      amount: (summary as CommissionSummaryResponse["overview"])
        .totalCommissionAmount,
      icon: DollarSign,
      color: "text-purple-700 dark:text-purple-300",
      bgColor: "bg-purple-100 dark:bg-purple-900/50",
    },
    {
      label: "Paid",
      amount: (summary as CommissionSummaryResponse["overview"]).paidAmount,
      icon: TrendingUp,
      color: "text-green-700 dark:text-green-300",
      bgColor: "bg-green-100 dark:bg-green-900/50",
    },
    {
      label: "Unpaid",
      amount: (summary as CommissionSummaryResponse["overview"]).unpaidAmount,
      icon: Clock,
      color: "text-blue-700 dark:text-blue-300",
      bgColor: "bg-blue-100 dark:bg-blue-900/50",
    },
    {
      label: "Pending",
      amount: (summary as CommissionSummaryResponse["overview"]).pendingAmount,
      icon: Users,
      color: "text-yellow-700 dark:text-yellow-300",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/50",
    },
    {
      label: "Hold",
      amount: (summary as CommissionSummaryResponse["overview"]).holdAmount,
      icon: Pause,
      color: "text-gray-700 dark:text-gray-300",
      bgColor: "bg-gray-100 dark:bg-gray-900/50",
    },
    {
      label: "Cancelled",
      amount: (summary as CommissionSummaryResponse["overview"])
        .cancelledAmount,
      icon: XCircle,
      color: "text-red-700 dark:text-red-300",
      bgColor: "bg-red-100 dark:bg-red-900/50",
    },
    {
      label: "Removed",
      amount: (summary as CommissionSummaryResponse["overview"]).removedAmount,
      icon: Trash2,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/50",
    },
  ];

  const orderBadges: BadgeType[] = [
    {
      label: "Orders",
      amount: (summary as OrderCommissionListResponse["summary"]).totalOrders,
      icon: ShoppingCart,
      color: "text-purple-700 dark:text-purple-300",
      bgColor: "bg-purple-100 dark:bg-purple-900/50",
      isCount: true,
    },
    {
      label: "Total",
      amount: (summary as OrderCommissionListResponse["summary"])
        .totalCommissionAmount,
      icon: DollarSign,
      color: "text-green-700 dark:text-green-300",
      bgColor: "bg-green-100 dark:bg-green-900/50",
    },
    {
      label: "Paid",
      amount: (summary as OrderCommissionListResponse["summary"]).paidAmount,
      icon: TrendingUp,
      color: "text-green-700 dark:text-green-300",
      bgColor: "bg-green-100 dark:bg-green-900/50",
    },
    {
      label: "Unpaid",
      amount: (summary as OrderCommissionListResponse["summary"]).unpaidAmount,
      icon: Clock,
      color: "text-blue-700 dark:text-blue-300",
      bgColor: "bg-blue-100 dark:bg-blue-900/50",
    },
    {
      label: "Pending",
      amount: (summary as OrderCommissionListResponse["summary"]).pendingAmount,
      icon: Users,
      color: "text-yellow-700 dark:text-yellow-300",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/50",
    },
    {
      label: "Hold",
      amount: (summary as OrderCommissionListResponse["summary"]).holdAmount,
      icon: Pause,
      color: "text-gray-700 dark:text-gray-300",
      bgColor: "bg-gray-100 dark:bg-gray-900/50",
    },
    {
      label: "Cancelled",
      amount: (summary as OrderCommissionListResponse["summary"])
        .cancelledAmount,
      icon: XCircle,
      color: "text-red-700 dark:text-red-300",
      bgColor: "bg-red-100 dark:bg-red-900/50",
    },
  ];

  const userBadges: BadgeType[] = [
    {
      label: "Users",
      amount: (summary as UserCommissionListResponse["summary"]).totalUsers,
      icon: Users,
      color: "text-purple-700 dark:text-purple-300",
      bgColor: "bg-purple-100 dark:bg-purple-900/50",
      isCount: true,
    },
    {
      label: "Total",
      amount: (summary as UserCommissionListResponse["summary"])
        .totalCommissionAmount,
      icon: DollarSign,
      color: "text-green-700 dark:text-green-300",
      bgColor: "bg-green-100 dark:bg-green-900/50",
    },
    {
      label: "Paid",
      amount: (summary as UserCommissionListResponse["summary"]).paidAmount,
      icon: TrendingUp,
      color: "text-green-700 dark:text-green-300",
      bgColor: "bg-green-100 dark:bg-green-900/50",
    },
    {
      label: "Unpaid",
      amount: (summary as UserCommissionListResponse["summary"]).unpaidAmount,
      icon: Clock,
      color: "text-blue-700 dark:text-blue-300",
      bgColor: "bg-blue-100 dark:bg-blue-900/50",
    },
    {
      label: "Pending",
      amount: (summary as UserCommissionListResponse["summary"]).pendingAmount,
      icon: Users,
      color: "text-yellow-700 dark:text-yellow-300",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/50",
    },
    {
      label: "Hold",
      amount: (summary as UserCommissionListResponse["summary"]).holdAmount,
      icon: Pause,
      color: "text-gray-700 dark:text-gray-300",
      bgColor: "bg-gray-100 dark:bg-gray-900/50",
    },
    {
      label: "Cancelled",
      amount: (summary as UserCommissionListResponse["summary"]).cancelledAmount,
      icon: XCircle,
      color: "text-red-700 dark:text-red-300",
      bgColor: "bg-red-100 dark:bg-red-900/50",
    },
    {
      label: "Removed",
      amount: (summary as UserCommissionListResponse["summary"]).removedAmount,
      icon: Trash2,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/50",
    },
  ];

  const badges = type === "product" ? productBadges : type === "order" ? orderBadges : userBadges;

  return (
    <div className='flex flex-wrap gap-2 flex-col'>
      {badges.map((badge) => (
        <Badge
          key={badge.label}
          className={`${badge.bgColor} ${badge.color} gap-1.5 px-3 py-1.5 font-medium border-0`}>
          <badge.icon className='h-3.5 w-3.5' />
          <span className='text-xs'>{badge.label}:</span>
          <span className='text-xs font-bold'>
            {badge.isCount
              ? badge.amount.toLocaleString()
              : formatCurrency(badge.amount)}
          </span>
        </Badge>
      ))}
    </div>
  );
};
