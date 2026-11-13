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
  RotateCcw,
  MinusSquare,
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
import DeliveryTimelineBadge from "@/components/order/ShippedItem";
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
import useRoleCheck from "../../auth/hooks/useRoleCheck";
import RiskBadge from "../../../components/fraud/RiskBadge";
import BlockedBadge from "../../../components/fraud/BlockedBadge";
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
  onViewReturnDetails?: (order: IOrder) => void;
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
  onViewReturnDetails,
  className,
}) => {
  const { canModifyOrder } = useRoleCheck();

  return (
    <div
      className={cn(
        "rounded-lg border bg-white shadow-sm overflow-hidden ",
        className,
      )}>
      <Table className=' relative' divClass='max-h-[68vh] overflow-y-auto'>
        <TableHeader className='bg-gray-50 sticky top-0 z-10'>
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
        <TableBody className='divide-y max-h-[50vh] overflow-y-auto bg-white'>
          {orders.length === 0 ? (
            <TableRow className='bg-white'>
              <TableCell colSpan={13} className='h-32 text-center bg-white'>
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
                order.customerRiskLevel === "red" ||
                order.requiresManualReview ||
                order.fraudDetection?.blocked;

              return (
                <motion.tr
                  key={orderId}
                  variants={listItem}
                  custom={index}
                  className={cn(
                    "group bg-white hover:bg-blue-50/50 cursor-pointer",
                    isSelected && "bg-blue-50",
                    hasHighRisk && "border-l-4 border-l-red-500",
                  )}>
                  {/* Checkbox */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {[
                      "cancel",
                      "cancelled",
                      "fail",
                      "failed",
                      "delete",
                    ].includes(order.status) ? (
                      <MinusSquare className='w-5 h-5 font-semibold text-red-600' />
                    ) : (
                      <Checkbox
                        disabled={[
                          "cancel",
                          "cancelled",
                          "fail",
                          "failed",
                          "delete",
                        ].includes(order.status)}
                        checked={isSelected}
                        onCheckedChange={() => onSelect && onSelect(orderId)}
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
                        deliveryTimeline={
                          !!order?.deliveryTimeline
                            ? order?.deliveryTimeline.reverse()
                            : []
                        }
                        provider={order?.courier?.provider ?? ""}
                        orderNumber={order?.orderNumber}
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
                        className='inline-flex items-center gap-1.5 cursor-pointer'
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewFraud?.(order);
                        }}>
                        <RiskBadge
                          level={order.fraudDetection.riskLevel}
                          compact
                        />
                        {order.fraudDetection.blocked ? <BlockedBadge /> : null}
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
                        order.paid > 0 ? "text-green-600" : "text-gray-400",
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
                        {canModifyOrder("order", "edit", order) && (
                          <DropdownMenuItem onClick={() => onEdit?.(order)}>
                            <Edit className='mr-2 h-4 w-4' />
                            Edit Order
                          </DropdownMenuItem>
                        )}
                        {order.status === "processing" &&
                          canModifyOrder("order", "modify", order) && (
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
                        {order.status === "shipped" &&
                          canModifyOrder("order", "modify", order) && (
                            <DropdownMenuItem
                              onClick={() => onReturnOrder?.(order)}>
                              <RefreshCcw className='mr-2 h-4 w-4' />
                              Return Products
                            </DropdownMenuItem>
                          )}
                        {order.isReturn && (
                          <DropdownMenuItem
                            onClick={() => onViewReturnDetails?.(order)}>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            View Return Details
                          </DropdownMenuItem>
                        )}
                        {(order.fraudDetection || hasHighRisk) && (
                          <DropdownMenuItem
                            onClick={() => onViewFraud?.(order)}>
                            <AlertTriangle className='mr-2 h-4 w-4' />
                            Fraud Details
                          </DropdownMenuItem>
                        )}
                        {canModifyOrder("order", "cancel", order) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete?.(order)}
                              className='text-red-600 focus:text-red-600'>
                              <Trash2 className='mr-2 h-4 w-4' />
                              Cancel
                            </DropdownMenuItem>
                          </>
                        )}
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
