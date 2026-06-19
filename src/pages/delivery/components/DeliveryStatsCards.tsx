import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { DashboardStats } from "../../../services/courierApi";

interface DeliveryStatsCardsProps {
  totalOrders: number;
  statusBreakdown: DashboardStats["data"]["statusBreakdown"];
  balance: number;
}

export const DeliveryStatsCards: React.FC<DeliveryStatsCardsProps> = ({
  totalOrders,
  statusBreakdown,
  balance,
}) => {
  // Calculate individual status counts
  const pending = statusBreakdown.find((s) => s._id === "pending")?.count || 0;
  const inTransit =
    statusBreakdown.find((s) => s._id === "in_transit")?.count || 0;
  const delivered =
    statusBreakdown.find((s) => s._id === "delivered")?.count || 0;
  const cancelled =
    statusBreakdown.find((s) => s._id === "cancelled")?.count || 0;

  // Calculate total COD and collected amounts
  const totalCOD = statusBreakdown.reduce((sum, s) => sum + s.totalCOD, 0);
  const totalCollected = statusBreakdown.reduce(
    (sum, s) => sum + s.totalCollected,
    0
  );

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: Package,
      accentColor: "bg-indigo-400",
      valueColor: "text-indigo-600",
    },
    {
      title: "Pending Pickup",
      value: pending,
      icon: Clock,
      accentColor: "bg-amber-400",
      valueColor: "text-amber-600",
    },
    {
      title: "In Transit",
      value: inTransit,
      icon: Truck,
      accentColor: "bg-blue-400",
      valueColor: "text-blue-600",
    },
    {
      title: "Delivered",
      value: delivered,
      icon: CheckCircle,
      accentColor: "bg-emerald-400",
      valueColor: "text-emerald-600",
    },
    {
      title: "Cancelled",
      value: cancelled,
      icon: XCircle,
      accentColor: "bg-rose-400",
      valueColor: "text-rose-600",
    },
    {
      title: "Account Balance (only steadfast)",
      value: `৳${balance.toLocaleString()}`,
      icon: DollarSign,
      accentColor: "bg-violet-400",
      valueColor: "text-violet-600",
    },
    {
      title: "Total COD",
      value: `৳${totalCOD.toLocaleString()}`,
      icon: AlertCircle,
      accentColor: "bg-orange-400",
      valueColor: "text-orange-600",
    },
    {
      title: "Total Collected",
      value: `৳${totalCollected.toLocaleString()}`,
      icon: CheckCircle,
      accentColor: "bg-teal-400",
      valueColor: "text-teal-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className={`w-2 h-2 rounded-full ${stat.accentColor}`} />
            <div className="min-w-0 flex-1">
              <p className={`text-lg font-semibold ${stat.valueColor} leading-none`}>
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.title}</p>
            </div>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 shrink-0">
              <Icon className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DeliveryStatsCards;
