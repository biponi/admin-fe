/**
 * OrderTable Component - Modern Table View
 * Clean, information-dense table showing all order data
 */

import React from "react";
import { motion } from "framer-motion";
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  Truck,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  Shield,
} from "lucide-react";
import {
  cn,
  formatCurrency,
  formatDate,
  formatOrderNumber,
  getPaymentStatus,
} from "../lib/utils";
import { StatusBadge, PaymentStatusBadge } from "./StatusBadge";
import { Checkbox } from "../../../components/ui/checkbox";
import DeliveryTimelineBadge from "./DeliveryTimelineBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import type { IOrder } from "../types";
import { listItem } from "../lib/animations";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../components/ui/tooltip";

import CustomerIcon from "../../../assets/customer.png";

interface OrderTableProps {
  orders: IOrder[];
  selectedIds: Set<number>;
  onSelectAll?: (selected: boolean) => void;
  onSelect?: (orderId: number) => void;
  onView?: (order: IOrder) => void;
  onEdit?: (order: IOrder) => void;
  onModify?: (order: IOrder) => void;
  onDelete?: (order: IOrder) => void;
  onViewFraud?: (order: IOrder) => void;
  onViewTracking?: (order: IOrder) => void;
  onReturnOrder?: (order: IOrder) => void;
  className?: string;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  selectedIds,
  onSelect,
  onSelectAll,
  onView,
  onEdit,
  onModify,
  onDelete,
  onViewFraud,
  onViewTracking,
  onReturnOrder,
  className,
}) => {
  return (
    <div
      className={cn(
        "rounded-lg border bg-white shadow-sm overflow-hidden",
        className
      )}>
      <Table>
        <TableHeader>
          <TableRow className='bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-50 hover:to-gray-100'>
            <TableHead className='w-12'>
              {onSelectAll && (
                <Checkbox
                  onCheckedChange={(checked) => onSelectAll(checked === true)}
                />
              )}
            </TableHead>
            <TableHead className='font-semibold'>Order #</TableHead>
            <TableHead className='font-semibold'> Created By</TableHead>
            <TableHead className='font-semibold'>Customer</TableHead>
            <TableHead className='font-semibold'>Products</TableHead>
            <TableHead className='font-semibold'>Location</TableHead>
            <TableHead className='font-semibold'>Status</TableHead>
            <TableHead className='font-semibold'>Payment</TableHead>
            <TableHead className='font-semibold'>Fraud</TableHead>
            <TableHead className='font-semibold text-right'>Total</TableHead>
            <TableHead className='font-semibold text-right'>Paid</TableHead>
            <TableHead className='font-semibold text-right'>Due</TableHead>
            <TableHead className='font-semibold'>Date</TableHead>
            <TableHead className='w-12'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={13} className='h-32 text-center'>
                <div className='flex flex-col items-center justify-center text-gray-500'>
                  <Package className='h-12 w-12 mb-2 text-gray-300' />
                  <p className='text-sm'>No orders found</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order, index) => {
              const orderId = order.id;
              if (!orderId) return null;
              const isSelected = selectedIds.has(orderId);
              const paymentStatus = getPaymentStatus(order);
              const hasHighRisk =
                order.customerRiskLevel === "red" || order.requiresManualReview;

              return (
                <motion.tr
                  key={orderId}
                  variants={listItem}
                  custom={index}
                  className={cn(
                    "group transition-colors hover:bg-blue-50/50 cursor-pointer",
                    isSelected && "bg-blue-50",
                    hasHighRisk && "border-l-4 border-l-red-500"
                  )}>
                  {/* Checkbox */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {onSelect && (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onSelect(orderId)}
                      />
                    )}
                  </TableCell>

                  {/* Order Number */}
                  <TableCell className='font-mono font-semibold text-blue-600'>
                    <div
                      className='flex items-center gap-2'
                      onClick={() => onView?.(order)}>
                      {formatOrderNumber(order.orderNumber)}
                      {hasHighRisk && (
                        <AlertTriangle className='h-3.5 w-3.5 text-red-500' />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className='h-8 w-8 rounded-lg'>
                          <AvatarImage
                            src={
                              order?.orderCreatedBy === "customer"
                                ? CustomerIcon
                                : order?.creatorAvatar
                            }
                            alt={"Creator_Avatar"}
                          />
                          <AvatarFallback className='rounded-lg'>
                            CN
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{order?.orderCreatedBy}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>

                  {/* Customer */}
                  <TableCell>
                    <div className='flex flex-col'>
                      <span className='font-medium text-gray-900'>
                        {order.customer.name}
                      </span>
                      <span className='text-xs text-gray-500'>
                        {order.customer.phoneNumber}
                      </span>
                    </div>
                  </TableCell>

                  {/* Products */}
                  <TableCell>
                    <div className='flex items-center gap-1.5'>
                      <Package className='h-4 w-4 text-gray-400' />
                      <span className='text-sm font-medium'>
                        {order.products.length}
                      </span>
                      <span className='text-xs text-gray-500'>
                        (
                        {order.products.reduce((sum, p) => sum + p.quantity, 0)}{" "}
                        pcs)
                      </span>
                    </div>
                  </TableCell>

                  {/* Location */}
                  <TableCell>
                    <div className='flex flex-col max-w-[150px]'>
                      <span className='text-sm truncate'>
                        {order.shipping.district}
                      </span>
                      <span className='text-xs text-gray-500 truncate'>
                        {order.shipping.division}
                      </span>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
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
                        provider={
                          order.status === "shipped"
                            ? order?.courier?.provider
                            : undefined
                        }
                        size='sm'
                        animated={false}
                      />
                    )}
                  </TableCell>

                  {/* Payment Status */}
                  <TableCell>
                    <PaymentStatusBadge
                      status={paymentStatus}
                      size='sm'
                      animated={false}
                    />
                  </TableCell>

                  {/* Fraud Detection */}
                  <TableCell>
                    {order.fraudDetection ? (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer transition-all",
                          order.fraudDetection.riskLevel === "green" &&
                            "bg-green-50 hover:bg-green-100 border border-green-200",
                          order.fraudDetection.riskLevel === "yellow" &&
                            "bg-yellow-50 hover:bg-yellow-100 border border-yellow-200",
                          order.fraudDetection.riskLevel === "red" &&
                            "bg-red-50 hover:bg-red-100 border border-red-200"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewFraud?.(order);
                        }}>
                        {order.fraudDetection.riskLevel === "green" && (
                          <ShieldCheck className='h-3.5 w-3.5 text-green-600' />
                        )}
                        {order.fraudDetection.riskLevel === "yellow" && (
                          <Shield className='h-3.5 w-3.5 text-yellow-600' />
                        )}
                        {order.fraudDetection.riskLevel === "red" && (
                          <ShieldAlert className='h-3.5 w-3.5 text-red-600 animate-pulse' />
                        )}
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            order.fraudDetection.riskLevel === "green" &&
                              "text-green-700",
                            order.fraudDetection.riskLevel === "yellow" &&
                              "text-yellow-700",
                            order.fraudDetection.riskLevel === "red" &&
                              "text-red-700"
                          )}>
                          {order.fraudDetection.riskLevel === "green" && "Low"}
                          {order.fraudDetection.riskLevel === "yellow" &&
                            "Medium"}
                          {order.fraudDetection.riskLevel === "red" && "High"}
                        </span>
                      </motion.div>
                    ) : (
                      <span className='text-xs text-gray-400'>-</span>
                    )}
                  </TableCell>

                  {/* Total */}
                  <TableCell className='text-right font-semibold text-gray-900'>
                    {formatCurrency(order.totalPrice)}
                  </TableCell>

                  {/* Paid */}
                  <TableCell className='text-right'>
                    <span
                      className={cn(
                        "font-medium",
                        order.paid > 0 ? "text-green-600" : "text-gray-400"
                      )}>
                      {formatCurrency(order.paid)}
                    </span>
                  </TableCell>

                  {/* Due */}
                  <TableCell className='text-right'>
                    {order.remaining > 0 ? (
                      <span className='font-medium text-red-600'>
                        {formatCurrency(order.remaining)}
                      </span>
                    ) : (
                      <span className='text-gray-400'>-</span>
                    )}
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <div className='flex flex-col'>
                      <span className='text-sm'>
                        {formatDate(order.timestamps.createdAt, "short")}
                      </span>
                      <span className='text-xs text-gray-500'>
                        {formatDate(order.timestamps.createdAt, "relative")}
                      </span>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity'>
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => onView?.(order)}>
                          <Eye className='mr-2 h-4 w-4' />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit?.(order)}>
                          <Edit className='mr-2 h-4 w-4' />
                          Edit Order
                        </DropdownMenuItem>
                        {order.status === "processing" && (
                          <DropdownMenuItem onClick={() => onModify?.(order)}>
                            <RefreshCcw className='mr-2 h-4 w-4' />
                            Modify Product
                          </DropdownMenuItem>
                        )}
                        {order.courier?.trackingCode && (
                          <DropdownMenuItem
                            onClick={() => onViewTracking?.(order)}>
                            <Truck className='mr-2 h-4 w-4' />
                            Track Delivery
                          </DropdownMenuItem>
                        )}
                        {order.status === "shipped" && (
                          <DropdownMenuItem
                            onClick={() => onReturnOrder?.(order)}>
                            <RefreshCcw className='mr-2 h-4 w-4' />
                            Return Products
                          </DropdownMenuItem>
                        )}
                        {hasHighRisk && (
                          <DropdownMenuItem
                            onClick={() => onViewFraud?.(order)}>
                            <AlertTriangle className='mr-2 h-4 w-4' />
                            Fraud Details
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(order)}
                          className='text-red-600 focus:text-red-600'>
                          <Trash2 className='mr-2 h-4 w-4' />
                          Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
