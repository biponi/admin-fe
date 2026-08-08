import { IReturnOrder, ReturnOrderStatus } from "../interface";
import dayjs from "dayjs";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Eye, Package, User, RotateCcw } from "lucide-react";
import PlaceHolderImage from "../../../assets/placeholder.svg";

interface ReturnOrderListProps {
  returnOrders: IReturnOrder[];
  onViewDetails: (order: IReturnOrder) => void;
}

export function ReturnOrderList({
  returnOrders,
  onViewDetails,
}: ReturnOrderListProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string; label: string }> = {
      return: {
        className: "bg-orange-100 text-orange-800 border-orange-200",
        label: "Returned",
      },
      pending_refund: {
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Pending Refund",
      },
      refunded: {
        className: "bg-green-100 text-green-800 border-green-200",
        label: "Refunded",
      },
      rejected: {
        className: "bg-red-100 text-red-800 border-red-200",
        label: "Rejected",
      },
      processing: {
        className: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Processing",
      },
    };

    const config = statusConfig[status] || {
      className: "bg-gray-100 text-gray-800 border-gray-200",
      label: status,
    };

    return (
      <Badge variant='outline' className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getReturnReasonBadge = (reason: string) => {
    const reasonConfig: Record<string, { className: string; label: string }> = {
      defective: {
        className: "bg-red-100 text-red-800 border-red-200",
        label: "Defective",
      },
      wrong_item: {
        className: "bg-purple-100 text-purple-800 border-purple-200",
        label: "Wrong Item",
      },
      not_as_described: {
        className: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Not As Described",
      },
      customer_request: {
        className: "bg-gray-100 text-gray-800 border-gray-200",
        label: "Customer Request",
      },
      damaged: {
        className: "bg-orange-100 text-orange-800 border-orange-200",
        label: "Damaged",
      },
      other: {
        className: "bg-gray-100 text-gray-800 border-gray-200",
        label: "Other",
      },
    };

    const config = reasonConfig[reason] || {
      className: "bg-gray-100 text-gray-800 border-gray-200",
      label: reason,
    };

    return (
      <Badge variant='outline' className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!returnOrders || returnOrders.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <div className='w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4'>
          <RotateCcw className='w-8 h-8 text-orange-600' />
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
          No Return Orders
        </h3>
        <p className='text-gray-500'>
          No return orders found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className=' grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
      {returnOrders.map((order) => (
        <div
          key={order.id}
          className='border border-orange-200 rounded-lg p-4 hover:bg-orange-50/30 transition-colors bg-white'>
          <div className='flex items-start justify-between gap-4'>
            {/* Left section: Order info */}
            <div className='flex items-start gap-3 min-w-0'>
              {/* Product thumbnail */}
              {order.products?.[0]?.thumbnail ? (
                <img
                  src={order.products[0].thumbnail}
                  alt={order.products[0].name}
                  className='w-12 h-12 rounded-lg object-cover border border-gray-100 flex-shrink-0'
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PlaceHolderImage;
                  }}
                />
              ) : (
                <div className='w-12 h-12 rounded-lg border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0'>
                  <Package className='h-5 w-5 text-gray-300' />
                </div>
              )}

              <div className='min-w-0'>
                {/* Order number and status */}
                <div className='flex items-center gap-2 flex-wrap'>
                  <h3 className='text-sm font-semibold text-gray-900'>
                    Return #{order.orderNumber}
                  </h3>
                  {getStatusBadge(order.status)}
                </div>

                {/* Original order number */}
                {order.originalOrderNumber && (
                  <p className='text-xs text-gray-500 mt-1'>
                    Original Order: #{order.originalOrderNumber}
                  </p>
                )}

                {/* Customer info */}
                <div className='flex items-center gap-2 mt-1.5'>
                  <User className='h-3 w-3 text-gray-400' />
                  <span className='text-xs font-medium text-gray-600 truncate'>
                    {order.customer?.name}
                  </span>
                  <span className='text-xs text-gray-400'>•</span>
                  <span className='text-xs text-gray-500'>
                    {order.customer?.phoneNumber}
                  </span>
                </div>

                {/* Return reason */}
                <div className='flex items-center gap-2 mt-1.5'>
                  <RotateCcw className='h-3 w-3 text-orange-500' />
                  {getReturnReasonBadge(order.returnReason)}
                  {order.returnReasonDetails && (
                    <span className='text-xs text-gray-500 truncate max-w-[200px]'>
                      ({order.returnReasonDetails})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right section: Amount and actions */}
            <div className='text-right flex-shrink-0'>
              <p className='text-sm font-bold text-orange-600'>
                {formatCurrency(order.refundAmount)}
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                {dayjs(order.timestamps?.createdAt).format("MMM D, YYYY")}
              </p>
              <Button
                variant='outline'
                size='sm'
                className='mt-2 h-7 text-xs border-orange-200 text-orange-700 hover:bg-orange-50'
                onClick={() => onViewDetails(order)}>
                <Eye className='h-3 w-3 mr-1' />
                View
              </Button>
            </div>
          </div>

          {/* Products preview */}
          {order.products && order.products.length > 0 && (
            <div className='mt-3 pt-3 border-t border-orange-100'>
              <div className='flex flex-wrap gap-2'>
                {order.products.slice(0, 3).map((product, idx) => (
                  <span
                    key={idx}
                    className='inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-md border border-orange-100'>
                    <span className='font-medium truncate max-w-[150px]'>
                      {product.name}
                    </span>
                    <span className='text-orange-500'>x{product.quantity}</span>
                  </span>
                ))}
                {order.products.length > 3 && (
                  <span className='text-xs text-gray-500 px-2 py-1'>
                    +{order.products.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
