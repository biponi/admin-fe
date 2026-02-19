import { Badge } from "../ui/badge";
import type { PackageStatus } from "../../pages/package/interface";

interface PackageStatusBadgeProps {
  status: PackageStatus;
  className?: string;
}

const getStatusColor = (status: PackageStatus): string => {
  const colors: Record<PackageStatus, string> = {
    requested: "bg-yellow-100 text-yellow-800 border-yellow-200",
    packing: "bg-blue-100 text-blue-800 border-blue-200",
    packed: "bg-purple-100 text-purple-800 border-purple-200",
    shipping_requested: "bg-indigo-100 text-indigo-800 border-indigo-200",
    shipped: "bg-cyan-100 text-cyan-800 border-cyan-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    returned: "bg-orange-100 text-orange-800 border-orange-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

const formatStatus = (status: PackageStatus): string => {
  if (!status) return "Unknown";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function PackageStatusBadge({
  status,
  className = "",
}: PackageStatusBadgeProps) {
  return (
    <Badge className={`${getStatusColor(status)} ${className}`} variant="outline">
      {formatStatus(status)}
    </Badge>
  );
}
