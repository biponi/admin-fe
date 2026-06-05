import React from "react";
import { Search, X } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { cn } from "../../../utils/functions";
import { IOrderStatusCount } from "../interface";

interface MobileFilterSearchProps {
  searchValue: string;
  orderStatusCount: IOrderStatusCount | null;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  totalOrders: number;
}

const MobileFilterSearch: React.FC<MobileFilterSearchProps> = ({
  searchValue,
  orderStatusCount,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  totalOrders,
}) => {
  const statusConfig = [
    {
      key: "",
      label: "All",
      count: totalOrders,
    },
    {
      key: "processing",
      label: "Processing",
      count: orderStatusCount?.processing ?? 0,
    },
    {
      key: "shipped",
      label: "Shipped",
      count: orderStatusCount?.shipped ?? 0,
    },
    {
      key: "completed",
      label: "Completed",
      count: orderStatusCount?.completed ?? 0,
    },
    {
      key: "cancel",
      label: "Cancelled",
      count: orderStatusCount?.cancel ?? 0,
    },
    {
      key: "return",
      label: "Return",
      count: orderStatusCount?.returnOrderCount ?? 0,
    },
  ];

  const currentStatusConfig =
    statusConfig.find((s) => s.key === selectedStatus) || statusConfig[0];

  // Only show if there are active filters
  if (!selectedStatus && !searchValue) {
    return null;
  }

  return (
    <div className='px-4 py-3'>
      <div className='flex items-center gap-2 flex-wrap'>
        <span className='text-xs font-medium text-gray-600'>
          Active filters:
        </span>
        {selectedStatus && (
          <Badge
            variant='secondary'
            className='flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary border-0 rounded-full text-xs'>
            {currentStatusConfig.label}
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
            className='flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 border-0 rounded-full text-xs'>
            <Search className='h-2.5 w-2.5' />"{searchValue.substring(0, 15)}
            {searchValue.length > 15 ? "..." : ""}"
            <button
              onClick={() => onSearchChange("")}
              className='ml-1 hover:bg-blue-200 rounded-full p-0.5'>
              <X className='h-2.5 w-2.5' />
            </button>
          </Badge>
        )}
        {selectedStatus && (
          <span className='text-xs text-gray-500'>
            {currentStatusConfig.count} orders
          </span>
        )}
      </div>
    </div>
  );
};

export default MobileFilterSearch;
