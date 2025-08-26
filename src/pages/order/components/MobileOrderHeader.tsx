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
      {/* Header Section */}
      <div className='px-4 pt-2 pb-0'>
        <div className=' items-center justify-between mb-6 hidden'>
          <div className='flex items-center gap-3'>
            <div className='h-12 w-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg'>
              <ShoppingBag className='h-6 w-6 text-white' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Orders</h1>
              <p className='text-sm text-gray-600'>
                Manage your business orders
              </p>
            </div>
          </div>

          {hasCreatePermission && (
            <Button
              onClick={() => navigate("/order/create")}
              size='lg'
              className='h-12 px-6 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95'>
              <Settings className='h-5 w-5 mr-2' />
              Create
            </Button>
          )}
        </div>

        {/* Status Indicator */}
        {selectedStatus && (
          <div className='mb-4'>
            <Badge
              variant='secondary'
              className='px-3 py-1.5 bg-primary/10 text-primary border-0 rounded-full text-sm font-medium'>
              Showing:{" "}
              {selectedStatus === ""
                ? "All Orders"
                : selectedStatus.charAt(0).toUpperCase() +
                  selectedStatus.slice(1)}{" "}
              Orders
            </Badge>
          </div>
        )}

        {/* Stats Grid */}
        <div className=' grid-cols-2 gap-3 hidden'>
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={cn(
                  "relative overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-95",
                  stat.color
                )}>
                {/* Background Pattern */}
                <div className='absolute inset-0 bg-black/5' />
                <div className='absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full' />
                <div className='absolute -bottom-2 -left-2 w-12 h-12 bg-white/10 rounded-full' />

                <div className='relative p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <Icon className={cn("h-6 w-6", stat.textColor)} />
                    <div className='flex items-center gap-1'>
                      <TrendingUp className='h-3 w-3 text-white/70' />
                    </div>
                  </div>

                  <div className='space-y-1'>
                    <p className={cn("text-xs font-medium", stat.textColor)}>
                      {stat.title}
                    </p>
                    <p className={cn("text-xl font-bold", stat.valueColor)}>
                      {typeof stat.value === "string"
                        ? stat.value
                        : stat.value.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className='px-4 pb-4'>
        <div className='bg-white rounded-2xl border border-gray-100 p-4 shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center'>
              <Package className='h-5 w-5 text-gray-600' />
            </div>
            <div className='flex-1'>
              <h3 className='font-semibold text-gray-900'>Order Management</h3>
              <p className='text-xs text-gray-600'>
                Track, edit and manage all orders
              </p>
            </div>

            <Button
              variant='ghost'
              size='sm'
              className='h-10 w-10 bg-primary rounded-xl flex items-center justify-center'
              onClick={() => navigate("/order/create")}>
              <CirclePlus className='h-5 w-5 text-white' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileOrderHeader;
