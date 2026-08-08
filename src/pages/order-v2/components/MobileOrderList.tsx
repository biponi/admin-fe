/**
 * MobileOrderList Component
 * Mobile-optimized card view for orders
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  MapPin,
  Phone,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  RefreshCcw,
  RotateCcw,
  AlertTriangle,
  Truck,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Shield,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { cn, formatCurrency, formatDate, formatOrderNumber, getPaymentStatus } from '../lib/utils';
import { StatusBadge, PaymentStatusBadge } from './StatusBadge';
import DeliveryTimelineBadge from './DeliveryTimelineBadge';
import type { IOrder } from '../types';
import { listItem } from '../lib/animations';

interface MobileOrderListProps {
  orders: IOrder[];
  selectedIds: Set<number>;
  onSelect?: (orderId: number) => void;
  onView?: (order: IOrder) => void;
  onEdit?: (order: IOrder) => void;
  onDelete?: (order: IOrder) => void;
  onViewFraud?: (order: IOrder) => void;
  onViewTracking?: (order: IOrder) => void;
  onReturnOrder?: (order: IOrder) => void;
  onViewReturnDetails?: (order: IOrder) => void;
}

export const MobileOrderList: React.FC<MobileOrderListProps> = ({
  orders,
  selectedIds,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onViewFraud,
  onViewTracking,
  onReturnOrder,
  onViewReturnDetails,
}) => {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <Package className="h-16 w-16 mb-4 text-gray-300" />
        <p className="text-sm">No orders found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order, index) => {
        const orderId = order.id;
        if (!orderId) return null;
        const isSelected = selectedIds.has(orderId);
        const paymentStatus = getPaymentStatus(order);
        const hasHighRisk = order.customerRiskLevel === 'red' || order.requiresManualReview;

        return (
          <motion.div
            key={orderId}
            variants={listItem}
            custom={index}
            className={cn(
              'bg-white rounded-lg border shadow-sm overflow-hidden',
              isSelected && 'border-blue-500 ring-2 ring-blue-100',
              hasHighRisk && 'border-l-4 border-l-red-500'
            )}
            onClick={() => onView?.(order)}
          >
            {/* Header */}
            <div className="flex items-start gap-3 p-4 pb-3">
              {onSelect && (
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onSelect(orderId)}
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-blue-600">
                      {formatOrderNumber(order.orderNumber)}
                    </span>
                    {hasHighRisk && (
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                    )}
                  </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
                        {order.status === "shipped" && (
                          <DropdownMenuItem onClick={() => onReturnOrder?.(order)}>
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Return Products
                          </DropdownMenuItem>
                        )}
                        {order.isReturn && (
                          <DropdownMenuItem onClick={() => onViewReturnDetails?.(order)}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            View Return Details
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
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-900">{order.customer.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Phone className="h-3 w-3" />
                    <span>{order.customer.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span>{order.shipping.district}, {order.shipping.division}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Payment */}
            <div className="px-4 py-2 bg-gray-50 border-t flex items-center justify-between">
              <div className="flex items-center gap-2">
                {order.status === "shipped" &&
                !!order?.deliveryTimeline &&
                order?.deliveryTimeline.length > 0 ? (
                  <DeliveryTimelineBadge
                    deliveryTimeline={order.deliveryTimeline}
                    provider={order?.courier?.provider ?? ""}
                  />
                ) : (
                  <StatusBadge
                    status={order.status}
                    provider={order.status === "shipped" ? order?.courier?.provider : undefined}
                    size="sm"
                    animated={false}
                  />
                )}
              </div>
              <PaymentStatusBadge status={paymentStatus} size="sm" animated={false} />
            </div>

            {/* Products & Price */}
            <div className="px-4 py-3 border-t space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Package className="h-3.5 w-3.5" />
                  <span>{order.products.length} items</span>
                  <span className="text-gray-400">•</span>
                  <span>{order.products.reduce((sum, p) => sum + p.quantity, 0)} pcs</span>
                </div>

                <div className="font-semibold text-gray-900">
                  {formatCurrency(order.totalPrice)}
                </div>
              </div>

              {/* Payment Details */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'flex items-center gap-1',
                    order.paid > 0 ? 'text-green-600' : 'text-gray-400'
                  )}>
                    <CheckCircle2 className="h-3 w-3" />
                    Paid: {formatCurrency(order.paid)}
                  </span>
                  {order.remaining > 0 && (
                    <span className="text-red-600">
                      Due: {formatCurrency(order.remaining)}
                    </span>
                  )}
                </div>
              </div>

              {/* Fraud Detection */}
              {order.fraudDetection && (
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs",
                    order.fraudDetection.riskLevel === "green" && "bg-green-50 border border-green-200",
                    order.fraudDetection.riskLevel === "yellow" && "bg-yellow-50 border border-yellow-200",
                    order.fraudDetection.riskLevel === "red" && "bg-red-50 border border-red-200"
                  )}
                >
                  {order.fraudDetection.riskLevel === "green" && (
                    <ShieldCheck className="h-3 w-3 text-green-600" />
                  )}
                  {order.fraudDetection.riskLevel === "yellow" && (
                    <Shield className="h-3 w-3 text-yellow-600" />
                  )}
                  {order.fraudDetection.riskLevel === "red" && (
                    <ShieldAlert className="h-3 w-3 text-red-600 animate-pulse" />
                  )}
                  <span className={cn(
                    "font-semibold",
                    order.fraudDetection.riskLevel === "green" && "text-green-700",
                    order.fraudDetection.riskLevel === "yellow" && "text-yellow-700",
                    order.fraudDetection.riskLevel === "red" && "text-red-700"
                  )}>
                    {order.fraudDetection.riskLevel === "green" && "Low Risk"}
                    {order.fraudDetection.riskLevel === "yellow" && "Medium Risk"}
                    {order.fraudDetection.riskLevel === "red" && "High Risk"}
                  </span>
                </motion.div>
              )}

              {/* Date */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(order.timestamps.createdAt, 'relative')}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
