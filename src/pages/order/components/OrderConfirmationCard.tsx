import React, { useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
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
  ChevronUp,
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
import { Separator } from "../../../components/ui/separator";
import EditCustomerInformation from "../../order/editOrderCustomer";
import { ModifyOrderModal } from "../../../components/order/ModifyOrderModal";

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
  // const riskColor =
  //   fraudRisk?.riskLevel === "red"
  //     ? "bg-red-100 text-red-800 border-red-200"
  //     : fraudRisk?.riskLevel === "yellow"
  //       ? "bg-yellow-100 text-yellow-800 border-yellow-200"
  //       : "bg-green-100 text-green-800 border-green-200";

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' h:mm a");
    } catch {
      return dateString;
    }
  };

  const hasInventoryIssues = order.products.some((p) => p.quantity <= 0);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalAmount =
    order.totalPrice + order.deliveryCharge - (order.discount || 0);

  return (
    <Card className='group hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white overflow-hidden'>
      {/* Minimalistic Header */}
      <div className='relative bg-gray-700 p-6 pb-8'>
        {/* Subtle Pattern */}
        <div className='absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,_white_1px,_transparent_1px)] bg-[length:24px_24px]'></div>

        {/* Header Content */}
        <div className='relative flex items-start justify-between'>
          <div className='flex-1'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='bg-white px-4 py-1.5 rounded-md border border-gray-200'>
                <h3 className='font-bold text-xl text-black tracking-tight'>
                  #{order.orderNumber}
                </h3>
              </div>
              {fraudRisk && fraudRisk.isFraud && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}>
                  <Badge className='bg-black text-white border border-white/20'>
                    <AlertTriangle className='h-3 w-3 mr-1' />
                    Fraud Risk
                  </Badge>
                </motion.div>
              )}
              {hasInventoryIssues && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}>
                  <Badge className='bg-black text-white border border-white/20'>
                    <AlertTriangle className='h-3 w-3 mr-1' />
                    Stock Issue
                  </Badge>
                </motion.div>
              )}
            </div>
            <div className='flex flex-col items-start gap-1 text-white/80'>
              {/* <div className='flex items-center gap-1.5'>
                <Package className='h-4 w-4' />
                <span className='text-sm font-medium'>
                  {order.products.length} item
                  {order.products.length !== 1 && "s"}
                </span>
              </div> */}
              <div className='flex items-center gap-1.5'>
                <Calendar className='h-4 w-4' />
                <span className='text-sm'>
                  {formatDate(order.timestamps.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Status Badge */}
          <div className='flex flex-col items-end gap-1'>
            <div className='bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm flex justify-between items-center gap-2'>
              <div className='text-xs text-red-500 font-medium mb-0.5'>
                Amount Due
              </div>
              <div className='text-sm font-bold text-black'>
                ৳{order.remaining.toFixed(2)}
              </div>
            </div>

            {/* Payment Summary Popover Button */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 bg-white hover:bg-gray-100 text-black border border-gray-200'>
                  <Info className='h-4 w-4' />
                  Payment Details
                </Button>
              </PopoverTrigger>
              <PopoverContent align='end' className='w-80'>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='space-y-3'>
                  <h3 className='font-semibold text-base text-black flex items-center gap-2'>
                    <div className='p-1.5 bg-gray-100 rounded-lg border border-gray-200'>
                      <CreditCard className='h-4 w-4 text-black' />
                    </div>
                    Payment Summary
                  </h3>
                  <div className='space-y-2 text-sm'>
                    <div className='flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100'>
                      <span className='text-gray-600'>Subtotal</span>
                      <span className='font-semibold text-black'>
                        {formatCurrency(order.totalPrice)}
                      </span>
                    </div>
                    <div className='flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100'>
                      <span className='text-gray-600 flex items-center gap-1.5'>
                        <Truck className='h-3.5 w-3.5' />
                        Delivery
                      </span>
                      <span className='font-semibold text-black'>
                        {formatCurrency(order.deliveryCharge || 0)}
                      </span>
                    </div>
                    {order.discount > 0 && (
                      <div className='flex items-center justify-between p-2.5 bg-gray-100 border border-gray-300 rounded-lg'>
                        <span className='text-black font-medium'>Discount</span>
                        <span className='font-semibold text-black'>
                          - {formatCurrency(order.discount)}
                        </span>
                      </div>
                    )}
                    <Separator className='my-2 bg-gray-200' />
                    <div className='flex items-center justify-between p-3 bg-black rounded-lg text-white'>
                      <span className='font-bold'>Total</span>
                      <span className='font-bold text-lg'>
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                    <div className='flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-lg'>
                      <span className='text-black font-medium flex items-center gap-1.5'>
                        <CheckCircle2 className='h-3.5 w-3.5' />
                        Paid
                      </span>
                      <span className='font-bold text-black'>
                        {formatCurrency(order.paid)}
                      </span>
                    </div>
                    {order.remaining > 0 && (
                      <div className='flex items-center justify-between p-2.5 bg-gray-100 border border-gray-300 rounded-lg'>
                        <span className='text-black font-medium flex items-center gap-1.5'>
                          <AlertTriangle className='h-3.5 w-3.5' />
                          Due
                        </span>
                        <span className='font-bold text-black'>
                          {formatCurrency(order.remaining)}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <CardContent className='p-6 space-y-5'>
        {/* Customer Information Section */}
        <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
          <div className='flex items-center justify-between mb-3'>
            <h4 className='text-sm font-semibold text-black flex items-center gap-2'>
              <div className='w-8 h-8 rounded-full bg-black flex items-center justify-center'>
                <Phone className='h-4 w-4 text-white' />
              </div>
              Customer Details
            </h4>
            <Button
              variant='ghost'
              size='sm'
              className='h-7 text-xs text-black hover:text-black hover:bg-gray-200'
              onClick={() => setShowFullDetails(!showFullDetails)}>
              {showFullDetails ? (
                <>
                  <ChevronUp className='h-3 w-3 mr-1' />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className='h-3 w-3 mr-1' />
                  Show More
                </>
              )}
            </Button>
          </div>

          <div className='space-y-2.5'>
            <div className='flex items-center gap-2.5 text-sm'>
              <div className='w-7 h-7 rounded-lg bg-white flex items-center justify-center border border-gray-200'>
                <Phone className='h-3.5 w-3.5 text-black' />
              </div>
              <div className='flex items-center gap-2 flex-1 min-w-0'>
                <span className='font-semibold text-black'>
                  {order.customer.name}
                </span>
                <span className='text-gray-400'>•</span>
                <span className='text-blue-500 font-medium'>
                  {order.customer.phoneNumber}
                </span>
              </div>
            </div>

            <div className='flex items-start gap-2.5 text-sm'>
              <div className='w-7 h-7 rounded-lg bg-white flex items-center justify-center border border-gray-200 flex-shrink-0'>
                <MapPin className='h-3.5 w-3.5 text-black' />
              </div>
              <span className='text-gray-700 flex-1 leading-relaxed'>
                {order.shipping.address}
                {showFullDetails &&
                  order.shipping.district &&
                  `, ${order.shipping.district}`}
                {showFullDetails &&
                  order.shipping.division &&
                  `, ${order.shipping.division}`}
                {!showFullDetails && "..."}
              </span>
            </div>

            <AnimatePresence>
              {showFullDetails && order.customer.email && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className='flex items-center gap-2.5 text-sm'>
                  <div className='w-7 h-7 rounded-lg bg-white flex items-center justify-center border border-gray-200'>
                    <Mail className='h-3.5 w-3.5 text-black' />
                  </div>
                  <span className='text-gray-700'>{order.customer.email}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Products Section */}
        <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
          <div className='flex items-center justify-between mb-3'>
            <button
              onClick={() => setProductsExpanded(!productsExpanded)}
              className='flex items-center gap-2 text-sm font-semibold hover:text-black transition-colors group/btn'>
              <div className='w-8 h-8 rounded-full bg-black flex items-center justify-center group-hover/btn:bg-gray-800 transition-colors'>
                <Package className='h-4 w-4 text-white' />
              </div>
              <span className='text-black'>
                Products ({localOrder.products.length})
              </span>
              <motion.div
                animate={{ rotate: productsExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}>
                <ChevronDown className='h-4 w-4 text-gray-500' />
              </motion.div>
            </button>
            <Button
              variant='ghost'
              size='sm'
              className='h-7 text-xs text-black hover:text-black hover:bg-gray-200'
              onClick={() => setShowModifyModal(true)}>
              <ShoppingCart className='h-3 w-3 mr-1' />
              Modify Order
            </Button>
          </div>

          <AnimatePresence>
            {productsExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className='space-y-3'>
                {localOrder.products.map((product, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className='rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-all overflow-hidden'>
                    {/* Main Product Row */}
                    <div className='flex items-center justify-between p-3'>
                      <div className='flex items-center gap-3 flex-1 min-w-0'>
                        <div className='w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-100 flex-shrink-0'>
                          {product.thumbnail ? (
                            <img
                              alt={product?.name}
                              src={product?.thumbnail}
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <div className='w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center'>
                              <Package className='w-6 h-6 text-gray-400' />
                            </div>
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='font-medium text-black truncate'>
                            {product.name}
                          </p>
                          <div className='flex items-center gap-2 mt-1'>
                            {/* Variation Badge */}
                            {product.variation &&
                              (product.variation.color ||
                                product.variation.size) && (
                                <Badge
                                  variant='outline'
                                  className='text-xs px-2 py-0 h-5'>
                                  {product.variation.color && (
                                    <span className='capitalize'>
                                      {product.variation.color}
                                    </span>
                                  )}
                                  {product.variation.color &&
                                    product.variation.size && <span> • </span>}
                                  {product.variation.size && (
                                    <span>{product.variation.size}</span>
                                  )}
                                </Badge>
                              )}
                            <p className='text-xs text-gray-500'>
                              Qty: {product.quantity} × ৳
                              {product.unitPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Badge className='bg-black text-white border-0 font-semibold flex-shrink-0 ml-2'>
                        ৳{product.totalPrice.toFixed(2)}
                      </Badge>
                    </div>

                    {/* Nested Variation Details */}
                    {(product.variation || product.hasVariation) && (
                      <div className='bg-gray-50 border-t border-gray-200 px-3 py-2'>
                        <div className='grid grid-cols-2 gap-2 text-xs'>
                          {product.variation?.color && (
                            <div className='flex items-center gap-1.5'>
                              <span className='text-gray-500'>Color:</span>
                              <span className='font-medium text-gray-900 capitalize'>
                                {product.variation.color}
                              </span>
                            </div>
                          )}
                          {product.variation?.size && (
                            <div className='flex items-center gap-1.5'>
                              <span className='text-gray-500'>Size:</span>
                              <span className='font-medium text-gray-900'>
                                {product.variation.size}
                              </span>
                            </div>
                          )}
                          {product.variantId && (
                            <div className='flex items-center gap-1.5 col-span-2'>
                              <span className='text-gray-500'>Variant ID:</span>
                              <span className='font-mono text-gray-900 text-xs'>
                                {product.variantId}
                              </span>
                            </div>
                          )}
                          {product.discount && product.discount > 0 && (
                            <div className='flex items-center gap-1.5 col-span-2'>
                              <span className='text-gray-500'>Discount:</span>
                              <span className='font-medium text-green-600'>
                                -৳{product.discount.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>

      {/* Minimalistic Footer with Actions */}
      <div className='bg-white px-4 py-3 border-t border-gray-200'>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='flex-1 h-9 bg-white hover:bg-gray-50 border-gray-300 text-xs sm:text-sm'
            onClick={() => setShowEditSheet(true)}>
            <Edit className='h-3.5 w-3.5 sm:mr-1.5' />
            <span className='hidden sm:inline'>Edit</span>
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='flex-1 h-9 bg-white text-black hover:text-black hover:bg-gray-100 border-gray-300 text-xs sm:text-sm'
            onClick={() => onCancel(order)}>
            <XCircle className='h-3.5 w-3.5 sm:mr-1.5' />
            <span className='hidden sm:inline'>Cancel</span>
          </Button>
          <Button
            size='sm'
            className='flex-1 h-9 bg-black hover:bg-gray-800 text-white transition-all text-xs sm:text-sm font-semibold'
            onClick={() => onConfirm(order)}>
            <CheckCircle2 className='h-3.5 w-3.5 sm:mr-1.5' />
            <span className='hidden xs:inline sm:hidden'>OK</span>
            <span className='hidden sm:inline'>Confirm</span>
          </Button>
        </div>
      </div>

      {/* Edit Order Sheet - Dialog wrapper */}
      <AnimatePresence>
        {showEditSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4'
            onClick={() => setShowEditSheet(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className='bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200'>
              <div className='bg-black p-6 text-white'>
                <div className='flex items-start justify-between'>
                  <div>
                    <h2 className='text-2xl font-bold'>
                      Edit Order Information
                    </h2>
                    <p className='text-gray-300 mt-1'>
                      Order #{order.orderNumber}
                    </p>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setShowEditSheet(false)}
                    className='h-9 w-9 p-0 hover:bg-white/20 text-white'>
                    <XCircle className='h-5 w-5' />
                  </Button>
                </div>
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

      {/* Modify Order Modal */}
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

          // Show detailed success message with summary
          if (summary) {
            toast.success(
              `Order #${localOrder.orderNumber} modified!\n` +
                `Products: ${summary.oldProductCount} → ${summary.newProductCount}\n` +
                `Price: ৳${summary.oldTotalPrice.toLocaleString()} → ৳${summary.newTotalPrice.toLocaleString()}\n` +
                `Difference: ${summary.priceDifference >= 0 ? "+" : ""}৳${summary.priceDifference.toLocaleString()}`,
            );
          }

          if (onOrderUpdated) {
            onOrderUpdated();
          }
        }}
      />
    </Card>
  );
};
