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
      bgColor: "bg-gradient-to-r from-blue-500 to-blue-600",
      textColor: "text-blue-100",
      valueColor: "text-white",
    },
    {
      title: "Pending Pickup",
      value: pending,
      icon: Clock,
      bgColor: "bg-gradient-to-r from-yellow-500 to-yellow-600",
      textColor: "text-yellow-100",
      valueColor: "text-white",
    },
    {
      title: "In Transit",
      value: inTransit,
      icon: Truck,
      bgColor: "bg-gradient-to-r from-purple-500 to-purple-600",
      textColor: "text-purple-100",
      valueColor: "text-white",
    },
    {
      title: "Delivered",
      value: delivered,
      icon: CheckCircle,
      bgColor: "bg-gradient-to-r from-green-500 to-green-600",
      textColor: "text-green-100",
      valueColor: "text-white",
    },
    {
      title: "Cancelled",
      value: cancelled,
      icon: XCircle,
      bgColor: "bg-gradient-to-r from-red-500 to-red-600",
      textColor: "text-red-100",
      valueColor: "text-white",
    },
    {
      title: "Account Balance (only steadfast)",
      value: `৳${balance.toLocaleString()}`,
      icon: DollarSign,
      bgColor: "bg-gradient-to-r from-indigo-500 to-indigo-600",
      textColor: "text-indigo-100",
      valueColor: "text-white",
    },
    {
      title: "Total COD",
      value: `৳${totalCOD.toLocaleString()}`,
      icon: AlertCircle,
      bgColor: "bg-gradient-to-r from-orange-500 to-orange-600",
      textColor: "text-orange-100",
      valueColor: "text-white",
    },
    {
      title: "Total Collected",
      value: `৳${totalCollected.toLocaleString()}`,
      icon: CheckCircle,
      bgColor: "bg-gradient-to-r from-teal-500 to-teal-600",
      textColor: "text-teal-100",
      valueColor: "text-white",
    },
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className={`${stat.bgColor} border-0 text-white shadow-lg hover:shadow-xl transition-shadow duration-200`}>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className={`${stat.textColor} text-sm font-medium mb-1`}>
                    {stat.title}
                  </p>
                  <p className={`${stat.valueColor} text-2xl font-bold`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.textColor} opacity-80`}>
                  <Icon className='w-8 h-8' />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DeliveryStatsCards;
