import React from "react";
import {
  ShoppingBag,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Package,
  Settings,
  CirclePlus,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../utils/functions";
import { useNavigate } from "react-router-dom";

interface MobileOrderHeaderProps {
  totalOrders: number;
  todayOrders?: number;
  totalRevenue?: number;
  activeCustomers?: number;
  hasCreatePermission: boolean;
  selectedStatus: string;
}

const MobileOrderHeader: React.FC<MobileOrderHeaderProps> = ({
  totalOrders,
  todayOrders = 0,
  totalRevenue = 0,
  activeCustomers = 0,
  hasCreatePermission,
  selectedStatus,
}) => {
  const navigate = useNavigate();

  const statsCards = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      textColor: "text-blue-100",
      valueColor: "text-white",
    },
    {
      title: "Today",
      value: todayOrders,
      icon: Calendar,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      textColor: "text-green-100",
      valueColor: "text-white",
    },
    {
      title: "Revenue",
      value: `৳${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      textColor: "text-purple-100",
      valueColor: "text-white",
    },
    {
      title: "Customers",
      value: activeCustomers,
      icon: Users,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      textColor: "text-orange-100",
      valueColor: "text-white",
    },
  ];

  return (
    <div className='bg-gradient-to-br from-gray-50 to-white'>
      {/* Header Section - Quick Actions Style */}
      <div className='pb-1'>
        <div className='bg-white rounded-lg border border-gray-100 p-4 shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg'>
              <ShoppingBag className='h-6 w-6 text-white' />
            </div>
            <div className='flex-1'>
              <h3 className='text-xl font-bold text-gray-900'>Orders</h3>
              <p className='text-sm text-gray-600'>
                Manage your business orders
              </p>
            </div>

            {hasCreatePermission && (
              <Button
                onClick={() => navigate("/order/create")}
                size='lg'
                className='h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 p-0'>
                <CirclePlus className='h-8 w-8' />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      {selectedStatus && (
        <div className='px-4 pb-4'>
          <Badge
            variant='secondary'
            className='px-3 py-1.5 bg-blue-100 text-blue-700 border-0 rounded-full text-sm font-medium'>
            Showing:{" "}
            {selectedStatus === ""
              ? "All Orders"
              : selectedStatus.charAt(0).toUpperCase() +
                selectedStatus.slice(1)}{" "}
            Orders
          </Badge>
        </div>
      )}
    </div>
  );
};

export default MobileOrderHeader;
