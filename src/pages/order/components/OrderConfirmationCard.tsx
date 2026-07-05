import React, { useState } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Phone,
  MapPin,
  Package,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Info,
  Truck,
  Edit,
  ShoppingCart,
  Mail,
  CreditCard,
} from "lucide-react";
import { IOrder } from "../interface";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import EditCustomerInformation from "../../order/editOrderCustomer";
import { ModifyOrderModal } from "../../../components/order/ModifyOrderModal";
import { cn } from "../../../lib/utils";

interface OrderConfirmationCardProps {
  order: IOrder;
  onConfirm: (order: IOrder) => void;
  onCancel: (order: IOrder) => void;
  onOrderUpdated?: () => void;
}

export const OrderConfirmationCard: React.FC<OrderConfirmationCardProps> = ({
  order,
  onConfirm,
  onCancel,
  onOrderUpdated,
}) => {
  const [productsExpanded, setProductsExpanded] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [localOrder, setLocalOrder] = useState(order);

  const fraudRisk = order.fraudDetection;
  const hasInventoryIssues = order.products.some((p) => p.quantity <= 0);
  const hasAlerts = fraudRisk?.isFraud || hasInventoryIssues;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy · h:mm a");
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) =>
    `৳${new Intl.NumberFormat("en-BD", { minimumFractionDigits: 0 }).format(amount)}`;

  const totalAmount =
    order.totalPrice + order.deliveryCharge - (order.discount || 0);

  return (
    <>
      <div
        className={cn(
          "group flex flex-col rounded-2xl border bg-white overflow-hidden",
          "shadow hover:shadow-md transition-shadow duration-200",
          hasAlerts ? "border-red-200" : "border-gray-100",
        )}>
        {/* ─── Alert strip ─── */}
        {hasAlerts && (
          <div className='flex items-center gap-2 px-4 py-2 bg-red-50 border-b border-red-100'>
            <AlertTriangle className='w-3.5 h-3.5 text-red-500 shrink-0' />
            <div className='flex items-center gap-2 flex-wrap'>
              {fraudRisk?.isFraud && (
                <span className='text-[11px] font-semibold text-red-600'>
                  Fraud risk detected
                </span>
              )}
              {fraudRisk?.isFraud && hasInventoryIssues && (
                <span className='text-red-300'>·</span>
              )}
              {hasInventoryIssues && (
                <span className='text-[11px] font-semibold text-red-600'>
                  Stock issue
                </span>
              )}
            </div>
          </div>
        )}

        {/* ─── Header ─── */}
        <div className='px-4 pt-4 pb-3 flex items-start justify-between gap-3'>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2'>
              <span className='text-base font-bold text-gray-900 tabular-nums'>
                #{order.orderNumber}
              </span>
            </div>
            <div className='flex items-center gap-1.5 mt-1'>
              <Calendar className='w-3 h-3 text-gray-400 shrink-0' />
              <span className='text-[11px] text-gray-400'>
                {formatDate(order.timestamps.createdAt)}
              </span>
            </div>
          </div>

          {/* Amount due + payment popover */}
          <div className='flex items-center gap-2 shrink-0'>
            {order.remaining > 0 && (
              <div className='text-right'>
                <p className='text-[10px] text-red-400 font-medium leading-none mb-0.5'>
                  Due
                </p>
                <p className='text-sm font-bold text-gray-900 tabular-nums'>
                  {formatCurrency(order.remaining)}
                </p>
              </div>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <button className='w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors'>
                  <CreditCard className='w-3.5 h-3.5 text-gray-500' />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align='end'
                className='w-72 p-0 overflow-hidden rounded-xl shadow-lg border-gray-100'>
                <div className='px-4 py-3 border-b border-gray-100 flex items-center gap-2'>
                  <CreditCard className='w-4 h-4 text-gray-500' />
                  <span className='text-sm font-semibold text-gray-900'>
                    Payment summary
                  </span>
                </div>
                <div className='p-3 space-y-1.5'>
                  {[
                    {
                      label: "Subtotal",
                      value: formatCurrency(order.totalPrice),
                    },
                    {
                      label: "Delivery",
                      value: formatCurrency(order.deliveryCharge || 0),
                      icon: <Truck className='w-3 h-3' />,
                    },
                    ...(order.discount > 0
                      ? [
                          {
                            label: "Discount",
                            value: `− ${formatCurrency(order.discount)}`,
                            highlight: "text-emerald-600",
                          },
                        ]
                      : []),
                  ].map(({ label, value, icon, highlight }) => (
                    <div
                      key={label}
                      className='flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 text-sm'>
                      <span className='text-gray-500 flex items-center gap-1.5'>
                        {icon}
                        {label}
                      </span>
                      <span
                        className={cn(
                          "font-semibold text-gray-800",
                          highlight,
                        )}>
                        {value}
                      </span>
                    </div>
                  ))}

                  <div className='flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-900 text-sm mt-2'>
                    <span className='text-gray-300 font-medium'>Total</span>
                    <span className='font-bold text-white tabular-nums'>
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>

                  <div className='flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 text-sm'>
                    <span className='text-emerald-700 flex items-center gap-1.5 font-medium'>
                      <CheckCircle2 className='w-3 h-3' />
                      Paid
                    </span>
                    <span className='font-semibold text-emerald-700 tabular-nums'>
                      {formatCurrency(order.paid)}
                    </span>
                  </div>

                  {order.remaining > 0 && (
                    <div className='flex items-center justify-between px-3 py-2 rounded-lg bg-red-50 text-sm'>
                      <span className='text-red-600 font-medium'>Due</span>
                      <span className='font-bold text-red-600 tabular-nums'>
                        {formatCurrency(order.remaining)}
                      </span>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className='border-t border-gray-100 mx-4' />

        {/* ─── Customer section ─── */}
        <div className='px-4 py-3 space-y-2'>
          <div className='flex items-center justify-between'>
            <p className='text-[11px] font-semibold text-gray-400 uppercase tracking-wide'>
              Customer
            </p>
            <button
              onClick={() => setShowFullDetails(!showFullDetails)}
              className='text-[11px] text-indigo-500 hover:text-indigo-600 font-medium transition-colors'>
              {showFullDetails ? "Less" : "More"} info
            </button>
          </div>

          <div className='flex items-start gap-2.5'>
            {/* Avatar */}
            <div className='w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 mt-0.5'>
              <span className='text-xs font-bold text-indigo-600'>
                {order.customer.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-semibold text-gray-900 leading-none'>
                {order.customer.name}
              </p>
              <a
                href={`tel:${order.customer.phoneNumber}`}
                className='text-xs text-indigo-500 font-medium hover:underline mt-0.5 inline-block'>
                {order.customer.phoneNumber}
              </a>
            </div>
          </div>

          {showFullDetails && (
            <div className='flex items-start gap-2'>
              <MapPin className='w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0' />
              <p className='text-xs text-gray-600 leading-relaxed'>
                {order.shipping.address}
                {showFullDetails &&
                  order.shipping.district &&
                  `, ${order.shipping.district}`}
                {showFullDetails &&
                  order.shipping.division &&
                  `, ${order.shipping.division}`}
                {!showFullDetails && <span className='text-gray-400'> …</span>}
              </p>
            </div>
          )}

          <AnimatePresence>
            {showFullDetails && order.customer.email && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className='flex items-center gap-2'>
                <Mail className='w-3.5 h-3.5 text-gray-400 shrink-0' />
                <span className='text-xs text-gray-600'>
                  {order.customer.email}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className='border-t border-gray-100 mx-4' />

        {/* ─── Products section ─── */}
        <div className='px-4 py-3'>
          <button
            onClick={() => setProductsExpanded(!productsExpanded)}
            className='w-full flex items-center justify-between group/btn'>
            <div className='flex items-center gap-2'>
              <Package className='w-3.5 h-3.5 text-gray-400' />
              <span className='text-[11px] font-semibold text-gray-400 uppercase tracking-wide'>
                Products
              </span>
              <span className='text-[11px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-full'>
                {localOrder.products.length}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModifyModal(true);
                }}
                className='flex items-center gap-1 text-[11px] font-semibold text-indigo-500
                           hover:text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors'>
                <ShoppingCart className='w-3 h-3' />
                Modify
              </button>
              <motion.div
                animate={{ rotate: productsExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}>
                <ChevronDown className='w-4 h-4 text-gray-400' />
              </motion.div>
            </div>
          </button>

          <AnimatePresence>
            {productsExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className='mt-3 space-y-2'>
                {localOrder.products.map((product, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className='flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-2.5'>
                    {/* Thumbnail */}
                    <div className='w-10 h-10 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-white'>
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                          <Package className='w-4 h-4 text-gray-300' />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className='flex-1 min-w-0'>
                      <p className='text-xs font-semibold text-gray-900 truncate leading-snug'>
                        {product.name}
                      </p>
                      <div className='flex items-center gap-1.5 mt-0.5 flex-wrap'>
                        {product.variation?.color && (
                          <span className='text-[10px] text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded capitalize'>
                            {product.variation.color}
                          </span>
                        )}
                        {product.variation?.size && (
                          <span className='text-[10px] text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded'>
                            {product.variation.size}
                          </span>
                        )}
                        <span className='text-[10px] text-gray-400'>
                          ×{product.quantity}
                        </span>
                        {product.quantity <= 0 && (
                          <span className='text-[10px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded'>
                            Out of stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <span className='text-xs font-bold text-gray-900 tabular-nums shrink-0'>
                      ৳{product.totalPrice.toFixed(0)}
                    </span>
                  </motion.div>
                ))}

                {/* Product total */}
                <div className='flex items-center justify-between px-2.5 py-2 rounded-lg bg-gray-900 mt-1'>
                  <span className='text-[11px] font-medium text-gray-400'>
                    Order total
                  </span>
                  <span className='text-sm font-bold text-white tabular-nums'>
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Action footer ─── */}
        <div className='px-4 py-3 mt-auto border-t border-gray-100 flex items-center gap-2'>
          <button
            onClick={() => setShowEditSheet(true)}
            className='flex items-center justify-center gap-1.5 flex-1 h-9 rounded-lg
                       border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold
                       text-gray-600 transition-colors'>
            <Edit className='w-3.5 h-3.5' />
            <span className='hidden sm:inline'>Edit</span>
          </button>

          <button
            onClick={() => onCancel(order)}
            className='flex items-center justify-center gap-1.5 flex-1 h-9 rounded-lg
                       border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-semibold
                       text-red-600 transition-colors'>
            <XCircle className='w-3.5 h-3.5' />
            <span className='hidden sm:inline'>Cancel</span>
          </button>

          <button
            onClick={() => onConfirm(order)}
            className='flex items-center justify-center gap-1.5 flex-[2] h-9 rounded-lg
                       bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white
                       transition-colors shadow-sm shadow-indigo-100'>
            <CheckCircle2 className='w-3.5 h-3.5' />
            Confirm order
          </button>
        </div>
      </div>

      {/* ─── Edit sheet ─── */}
      <AnimatePresence>
        {showEditSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'
            onClick={() => setShowEditSheet(false)}>
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh]
                         flex flex-col overflow-hidden border border-gray-100'>
              {/* Modal header */}
              <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
                <div>
                  <h2 className='text-base font-bold text-gray-900'>
                    Edit order
                  </h2>
                  <p className='text-xs text-gray-400 mt-0.5'>
                    #{order.orderNumber}
                  </p>
                </div>
                <button
                  onClick={() => setShowEditSheet(false)}
                  className='w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-colors'>
                  <XCircle className='w-4 h-4 text-gray-500' />
                </button>
              </div>
              <div className='flex-1 overflow-y-auto p-6'>
                <EditCustomerInformation
                  shipping={order.shipping}
                  customerInfo={order.customer}
                  deliveryCharge={order.deliveryCharge || 0}
                  totalPrice={order.totalPrice}
                  paid={order.paid}
                  remaining={order.remaining}
                  discount={order.discount || 0}
                  notes={order.notes || ""}
                  handleClose={() => setShowEditSheet(false)}
                  handleCustomerDataChange={async (data) => {
                    console.log("Updating order:", data);
                    setShowEditSheet(false);
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Modify order modal ─── */}
      <ModifyOrderModal
        orderId={localOrder.id}
        orderNumber={localOrder.orderNumber}
        initialProducts={localOrder.products}
        open={showModifyModal}
        deliveryCharge={order?.deliveryCharge}
        paid={order?.paid}
        onOpenChange={setShowModifyModal}
        onSuccess={(updatedProducts, newTotal, summary) => {
          setLocalOrder((prev) => ({
            ...prev,
            products: updatedProducts,
            totalPrice: newTotal,
            remaining: newTotal - prev.paid,
          }));
          if (summary) {
            toast.success(
              `Order #${localOrder.orderNumber} updated · ৳${summary.oldTotalPrice.toLocaleString()} → ৳${summary.newTotalPrice.toLocaleString()}`,
            );
          }
          onOrderUpdated?.();
        }}
      />
    </>
  );
};
