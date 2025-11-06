import React, { useState } from "react";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Grid3X3,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  SlidersHorizontal,
  DollarSign,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../utils/functions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../components/ui/sheet";
import { IOrderStatusCount } from "../interface";

interface MobileFilterSearchProps {
  searchValue: string;
  orderStatusCount: IOrderStatusCount | null;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  totalOrders: number;
  onRefresh: () => void;
}

const MobileFilterSearch: React.FC<MobileFilterSearchProps> = ({
  searchValue,
  orderStatusCount,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  totalOrders,
  onRefresh,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const statusConfig = [
    {
      key: "",
      label: "All Orders",
      icon: Grid3X3,
      color: "bg-gray-100 text-gray-700",
      count: totalOrders,
    },
    {
      key: "processing",
      label: "Processing",
      icon: Clock,
      color: "bg-blue-100 text-blue-700",
      count: orderStatusCount?.processing ?? 0,
    },
    {
      key: "shipped",
      label: "Shipped",
      icon: Truck,
      color: "bg-purple-100 text-purple-700",
      count: orderStatusCount?.shipped ?? 0,
    },
    {
      key: "completed",
      label: "Completed",
      icon: CheckCircle,
      color: "bg-green-100 text-green-700",
      count: orderStatusCount?.completed ?? 0,
    },
    {
      key: "cancel",
      label: "Cancelled",
      icon: XCircle,
      color: "bg-red-100 text-red-700",
      count: orderStatusCount?.cancel ?? 0,
    },
    {
      key: "return",
      label: "Return",
      icon: RefreshCw,
      color: "bg-orange-100 text-orange-700",
      count: orderStatusCount?.returnOrderCount ?? 0,
    },
  ];

  const currentStatus =
    statusConfig.find((s) => s.key === selectedStatus) || statusConfig[0];

  return (
    <div className='space-y-4 px-4'>
      {/* Search Bar */}
      <div className='relative border border-gray-200 rounded-2xl shadow-md'>
        <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10'>
          <Search className='h-4 w-4' />
        </div>
        <Input
          type='text'
          placeholder='Search orders, customers...'
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className='pl-10 pr-12 h-12 bg-gray-50 border-0 rounded-2xl text-base placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all duration-200'
        />
        {searchValue && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onSearchChange("")}
            className='absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-full'>
            <X className='h-4 w-4' />
          </Button>
        )}
      </div>

      {/* Quick Actions Bar */}
      <div className='flex items-center gap-2 justify-between'>
        {/* Status Filter Button */}
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button
              variant='outline'
              className='flex-1 h-11 bg-white border-gray-200 rounded-xl hover:bg-gray-50 transition-colors'>
              <div className='flex items-center gap-2 min-w-0'>
                <div
                  className={cn(
                    "h-2 w-2 rounded-full flex-shrink-0",
                    currentStatus.color.includes("gray")
                      ? "bg-gray-400"
                      : currentStatus.color.includes("blue")
                      ? "bg-blue-500"
                      : currentStatus.color.includes("purple")
                      ? "bg-purple-500"
                      : currentStatus.color.includes("green")
                      ? "bg-green-500"
                      : currentStatus.color.includes("red")
                      ? "bg-red-500"
                      : currentStatus.color.includes("orange")
                      ? "bg-orange-500"
                      : "bg-gray-400"
                  )}
                />
                <span className='truncate text-sm font-medium'>
                  {currentStatus.label}
                </span>
              </div>
              <ChevronDown className='h-4 w-4 ml-auto flex-shrink-0' />
            </Button>
          </SheetTrigger>

          <SheetContent side='bottom' className='h-[80vh] rounded-t-3xl'>
            <SheetHeader className='text-left pb-6'>
              <SheetTitle className='flex items-center gap-2 text-xl'>
                <SlidersHorizontal className='h-5 w-5' />
                Filter Orders
              </SheetTitle>
            </SheetHeader>

            <div className='space-y-6'>
              {/* Status Filter */}
              <div>
                <h3 className='font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <Filter className='h-4 w-4' />
                  Order Status
                </h3>
                <div className='grid grid-cols-2 gap-3'>
                  {statusConfig.map(
                    ({ key, label, icon: Icon, color, count }) => (
                      <Button
                        key={key}
                        variant={selectedStatus === key ? "default" : "outline"}
                        onClick={() => {
                          onStatusChange(key);
                          setIsFilterOpen(false);
                        }}
                        className={cn(
                          "h-14 flex flex-col items-center gap-1 transition-all duration-200 rounded-xl",
                          selectedStatus === key
                            ? "bg-primary text-white shadow-lg scale-105"
                            : "bg-white hover:bg-gray-50 border-gray-200"
                        )}>
                        <Icon className='h-4 w-4' />
                        <span className='text-sm font-medium'>
                          {label}{" "}
                          <span className=' text-xs '>
                            ({count.toLocaleString()})
                          </span>
                        </span>
                      </Button>
                    )
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className='bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4'>
                <h3 className='font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                  <DollarSign className='h-4 w-4' />
                  Quick Stats
                </h3>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='bg-white rounded-xl p-3 text-center'>
                    <div className='text-2xl font-bold text-primary'>
                      {totalOrders}
                    </div>
                    <div className='text-xs text-gray-600'>Total Orders</div>
                  </div>
                  <div className='bg-white rounded-xl p-3 text-center'>
                    <div className='text-2xl font-bold text-green-600'>0</div>
                    <div className='text-xs text-gray-600'>This Week</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className='mt-8 pb-safe'>
              <Button
                onClick={() => setIsFilterOpen(false)}
                className='w-full h-12 bg-primary text-white rounded-2xl text-base font-semibold'>
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Refresh Button */}
        <Button
          variant='outline'
          size='sm'
          onClick={onRefresh}
          className='h-11 px-3 bg-white border-gray-200 rounded-xl hover:bg-gray-50'>
          <RefreshCw className='h-4 w-4' />
        </Button>
      </div>

      {/* Active Filters */}
      {(selectedStatus || searchValue) && (
        <div className='flex items-center gap-2 flex-wrap'>
          <span className='text-xs font-medium text-gray-600'>
            Active filters:
          </span>
          {selectedStatus && (
            <Badge
              variant='secondary'
              className='flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary border-0 rounded-full'>
              {currentStatus.label}
              <button
                onClick={() => onStatusChange("")}
                className='ml-1 hover:bg-primary/20 rounded-full p-0.5'>
                <X className='h-2.5 w-2.5' />
              </button>
            </Badge>
          )}
          {searchValue && (
            <Badge
              variant='secondary'
              className='flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 border-0 rounded-full'>
              <Search className='h-2.5 w-2.5' />"{searchValue.substring(0, 15)}
              {searchValue.length > 15 ? "..." : ""}"
              <button
                onClick={() => onSearchChange("")}
                className='ml-1 hover:bg-blue-200 rounded-full p-0.5'>
                <X className='h-2.5 w-2.5' />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileFilterSearch;
