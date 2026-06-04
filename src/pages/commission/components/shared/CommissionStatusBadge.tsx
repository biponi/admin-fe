import { Badge } from "../../../../components/ui/badge";
import { Commission } from "../../../../api/commission";

interface CommissionStatusBadgeProps {
  status: Commission["status"];
  className?: string;
}

export const CommissionStatusBadge: React.FC<CommissionStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const statusConfig = {
    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    unpaid: {
      label: "Unpaid",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    paid: {
      label: "Paid",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    hold: {
      label: "On Hold",
      className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
    removed: {
      label: "Removed",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return <Badge className={`${config.className} ${className}`}>{config.label}</Badge>;
};
