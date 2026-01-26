/**
 * OrderCard Component - Unified Responsive Design
 * Single component that works on both mobile and desktop
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  User,
  MapPin,
  Phone,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  Truck,
  MoreVertical,
} from 'lucide-react';
import { cn, formatCurrency, formatDate, formatOrderNumber, getPaymentStatus } from '../lib/utils';
import { cardHover, collapse } from '../lib/animations';
import { StatusBadge, PaymentStatusBadge, FraudRiskBadge } from './StatusBadge';
import { Checkbox } from '../../../components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import type { IOrder } from '../types';

interface OrderCardProps {
  order: IOrder;
  isSelected?: boolean;
  onSelect?: (orderId: string) => void;
  onView?: (order: IOrder) => void;
  onEdit?: (order: IOrder) => void;
  onDelete?: (order: IOrder) => void;
  onViewFraud?: (order: IOrder) => void;
  onViewTracking?: (order: IOrder) => void;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  isSelected = false,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onViewFraud,
  onViewTracking,
  variant = 'default',
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const paymentStatus = getPaymentStatus(order);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on interactive elements
    if (
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('[role="checkbox"]') ||
      (e.target as HTMLElement).closest('[role="menuitem"]')
    ) {
      return;
    }
    if (variant !== 'compact') {
      setIsExpanded(!isExpanded);
    } else {
      onView?.(order);
    }
  };

  const hasHighRisk = order.customerRiskLevel === 'red' || order.requiresManualReview;

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      className={cn(
        'group relative rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md',
        hasHighRisk && 'border-l-4 border-l-red-500',
        isSelected && 'ring-2 ring-blue-500',
        className
      )}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        {onSelect && (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(order._id || '')}
              className="mt-1"
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Order Number & Status */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {formatOrderNumber(order.orderNumber)}
              </h3>
              <p className="text-sm text-gray-500">
                {formatDate(order.timestamps.createdAt, 'relative')}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <StatusBadge status={order.status} size="sm" />
              {hasHighRisk && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewFraud?.(order);
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <AlertTriangle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User className="h-4 w-4 text-gray-400" />
              <span className="font-medium">{order.customer.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{order.customer.phoneNumber}</span>
            </div>
            {variant !== 'compact' && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="truncate">{`${order.shipping.district}, ${order.shipping.division}`}</span>
              </div>
            )}
          </div>

          {/* Products Summary */}
          {variant !== 'compact' && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <Package className="h-4 w-4 text-gray-400" />
              <span>{order.products.length} item(s)</span>
              {order.courier?.provider && (
                <>
                  <span className="text-gray-300">•</span>
                  <Truck className="h-4 w-4 text-gray-400" />
                  <span className="capitalize">{order.courier.provider}</span>
                </>
              )}
            </div>
          )}

          {/* Payment Info */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(order.totalPrice)}
              </span>
              {order.remaining > 0 && (
                <span className="text-xs text-gray-500">
                  Due: {formatCurrency(order.remaining)}
                </span>
              )}
            </div>
            <PaymentStatusBadge status={paymentStatus} size="sm" />
          </div>

          {/* Fraud Risk Indicator */}
          {order.fraudDetection && variant === 'detailed' && (
            <div className="mt-3 flex items-center gap-2">
              <FraudRiskBadge status={order.customerRiskLevel} size="sm" />
              <span className="text-xs text-gray-500">
                Risk Score: {order.customerRiskScore}%
              </span>
            </div>
          )}
        </div>

        {/* Actions Menu */}
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-lg p-2 hover:bg-gray-100 transition-colors">
                <MoreVertical className="h-5 w-5 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onView?.(order)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(order)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Order
              </DropdownMenuItem>
              {order.courier?.trackingCode && (
                <DropdownMenuItem onClick={() => onViewTracking?.(order)}>
                  <Truck className="mr-2 h-4 w-4" />
                  Track Delivery
                </DropdownMenuItem>
              )}
              {hasHighRisk && (
                <DropdownMenuItem onClick={() => onViewFraud?.(order)}>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Fraud Details
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(order)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Expandable Details */}
      {variant !== 'compact' && (
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              variants={collapse}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="border-t overflow-hidden"
            >
              <div className="p-4 bg-gray-50 space-y-3">
                {/* Products List */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Products</h4>
                  <div className="space-y-2">
                    {order.products.map((product, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm bg-white rounded-lg p-2"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {product.thumbnail && (
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{product.name}</p>
                            <p className="text-xs text-gray-500">
                              Qty: {product.quantity} × {formatCurrency(product.unitPrice)}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(product.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Shipping Address</h4>
                  <p className="text-sm text-gray-600">
                    {order.shipping.address}
                    <br />
                    {order.shipping.district}, {order.shipping.division}
                  </p>
                </div>

                {/* Payment Breakdown */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Payment Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">
                        {formatCurrency(order.totalPrice - order.deliveryCharge + order.discount)}
                      </span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-{formatCurrency(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery:</span>
                      <span className="font-medium">{formatCurrency(order.deliveryCharge)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base border-t pt-1">
                      <span>Total:</span>
                      <span>{formatCurrency(order.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Paid:</span>
                      <span>{formatCurrency(order.paid)}</span>
                    </div>
                    {order.remaining > 0 && (
                      <div className="flex justify-between text-red-600 font-semibold">
                        <span>Remaining:</span>
                        <span>{formatCurrency(order.remaining)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600 italic">{order.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Expand/Collapse Button */}
      {variant !== 'compact' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="w-full py-2 flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors border-t"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              <span>Show Less</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              <span>Show More</span>
            </>
          )}
        </button>
      )}
    </motion.div>
  );
};
