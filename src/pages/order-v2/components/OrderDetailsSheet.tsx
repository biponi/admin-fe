/**
 * OrderDetailsSheet Component
 * Sheet view for displaying full order details
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";
import {
  Package,
  User,
  MapPin,
  Phone,
  DollarSign,
  Calendar,
  CreditCard,
  Truck,
  AlertTriangle,
  Printer,
  Download,
  Share2,
  Copy,
  CheckCircle2,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Shield,
  RotateCcw,
  FileText,
  Clock,
  Box,
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Button } from "../../../components/ui/button";
import {
  formatCurrency,
  formatDate,
  formatOrderNumber,
  getPaymentStatus,
} from "../lib/utils";
import { StatusBadge, PaymentStatusBadge } from "./StatusBadge";
import DeliveryTimelineBadge from "./DeliveryTimelineBadge";
import { cn } from "../lib/utils";
import type { IOrder } from "../types";
import InvoiceDocument, {
  generateReactPdfInvoice,
} from "../../../utils/reactPdfInvoice";
import { generateReactPdfPackingSlip } from "../../../utils/reactPdfPackingSlip";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";

interface OrderDetailsSheetProps {
  order: IOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (order: IOrder) => void;
}

export const OrderDetailsSheet: React.FC<OrderDetailsSheetProps> = ({
  order,
  open,
  onOpenChange,
  onEdit,
}) => {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const paymentStatus = getPaymentStatus(order);
  const hasHighRisk =
    order.customerRiskLevel === "red" || order.requiresManualReview;

  const handleCopyOrderNumber = async () => {
    await navigator.clipboard.writeText(
      `https://priorbd.com/order/${order?.orderNumber}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = async () => {
    // Generate invoice HTML
    // Generate the PDF blob
    const blob = await pdf(<InvoiceDocument order={order} />).toBlob();

    // Create a URL for the blob
    const url = URL.createObjectURL(blob);

    // Open in new tab - user can print from there
    const printWindow = window.open(url, "_blank");

    // Clean up the URL after a delay
    setTimeout(() => URL.revokeObjectURL(url), 10000);

    if (printWindow) {
      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
  };

  const handleDownloadInvoice = () => {
    // Generate invoice HTML
    generateReactPdfInvoice(order);

    // Note: For PDF generation, you would need a library like jsPDF or html2pdf
    // For now, downloading as HTML which can be opened and saved as PDF by the browser
  };

  const handleDownloadPackingSlip = () => {
    // Generate packing slip
    generateReactPdfPackingSlip(order);

    toast.success("Packing slip downloaded successfully!");
  };

  const handleShare = async () => {
    const shareData = {
      title: `Order ${formatOrderNumber(order.orderNumber)}`,
      text: `Order details for ${order.customer.name}`,
      url: `https://priorbd.com/order/${order?.orderNumber}`,
    };

    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // Fallback: copy link to clipboard
      await navigator.clipboard.writeText(
        `https://priorbd.com/order/${order?.orderNumber}`,
      );
      toast.success("Link copied to clipboard!");
    }
  };

  const handleEmailCustomer = () => {
    const subject = `Order Update - ${formatOrderNumber(order.orderNumber)}`;
    const mailto = `mailto:${
      order.customer.email || ""
    }?subject=${encodeURIComponent(subject)}`;
    window.location.href = mailto;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full sm:max-w-2xl overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100'>
        <SheetHeader className='space-y-3'>
          <div className='flex items-center justify-between'>
            <SheetTitle className='flex items-center gap-2 text-xl'>
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5 }}>
                <Package className='h-5 w-5 text-blue-600' />
              </motion.div>
              Order Details
            </SheetTitle>

            {/* Action Buttons */}
            <div className='flex items-center gap-2 border rounded-md border-gray-900 bg-gray-100 shadow mr-8'>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleCopyOrderNumber}
                  className='h-8 w-8 p-0'
                  title='Copy Order Number'>
                  {copied ? (
                    <CheckCircle2 className='h-4 w-4 text-green-600' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleShare}
                  className='h-8 w-8 p-0'
                  title='Share'>
                  <Share2 className='h-4 w-4' />
                </Button>
              </motion.div>
              {!["cancel", "cancelled", "fail", "failed", "delete"].includes(
                order.status,
              ) && (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handlePrint}
                      className='h-8 w-8 p-0'
                      title='Print'>
                      <Printer className='h-4 w-4' />
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleDownloadInvoice}
                      className='h-8 w-8 p-0'
                      title='Download Invoice'>
                      <Download className='h-4 w-4' />
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleDownloadPackingSlip}
                      className='h-8 w-8 p-0'
                      title='Download Packing Slip'>
                      <Box className='h-4 w-4' />
                    </Button>
                  </motion.div>
                </>
              )}
              {order.customer.email && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleEmailCustomer}
                    className='h-8 w-8 p-0 hidden'
                    title='Email Customer'>
                    <Mail className='h-4 w-4' />
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          <div className='flex items-center gap-2 flex-wrap'>
            <span className='font-mono font-semibold text-sm text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full'>
              {formatOrderNumber(order.orderNumber)}
            </span>
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
                animated={true}
              />
            )}
            <PaymentStatusBadge
              status={paymentStatus}
              size='sm'
              animated={true}
            />
            {order.fraudDetection && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full cursor-pointer transition-all text-xs",
                  order.fraudDetection.riskLevel === "green" &&
                    "bg-green-50 hover:bg-green-100 border border-green-200",
                  order.fraudDetection.riskLevel === "yellow" &&
                    "bg-yellow-50 hover:bg-yellow-100 border border-yellow-200",
                  order.fraudDetection.riskLevel === "red" &&
                    "bg-red-50 hover:bg-red-100 border border-red-200",
                )}>
                {order.fraudDetection.riskLevel === "green" && (
                  <ShieldCheck className='h-3 w-3 text-green-600' />
                )}
                {order.fraudDetection.riskLevel === "yellow" && (
                  <Shield className='h-3 w-3 text-yellow-600' />
                )}
                {order.fraudDetection.riskLevel === "red" && (
                  <ShieldAlert className='h-3 w-3 text-red-600 animate-pulse' />
                )}
                <span
                  className={cn(
                    "font-semibold",
                    order.fraudDetection.riskLevel === "green" &&
                      "text-green-700",
                    order.fraudDetection.riskLevel === "yellow" &&
                      "text-yellow-700",
                    order.fraudDetection.riskLevel === "red" && "text-red-700",
                  )}>
                  {order.fraudDetection.riskLevel === "green" && "Low"}
                  {order.fraudDetection.riskLevel === "yellow" && "Medium"}
                  {order.fraudDetection.riskLevel === "red" && "High"}
                </span>
              </motion.div>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className='h-[calc(100vh-180px)] pr-4'>
          <div className='space-y-3 mt-4'>
            {/* Alert for high risk */}
            {hasHighRisk && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className='flex items-center gap-2.5 p-3 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg shadow-sm'>
                <AlertTriangle className='h-4 w-4 text-red-600 animate-pulse flex-shrink-0' />
                <div>
                  <p className='text-xs font-semibold text-red-900'>
                    High Risk - Manual Review Required
                  </p>
                  <p className='text-[11px] text-red-700 mt-0.5'>
                    Verify customer info before processing
                  </p>
                </div>
              </motion.div>
            )}

            <Separator className='bg-gradient-to-r from-transparent via-gray-300 to-transparent' />

            {/* Products */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className='bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white/60'>
              <h3 className='font-semibold text-sm text-gray-900 flex items-center gap-2 mb-2.5'>
                <div className='p-1.5 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg'>
                  <Package className='h-3.5 w-3.5 text-purple-700' />
                </div>
                Products
                <Badge
                  variant='secondary'
                  className='ml-1 text-[11px] px-1.5 py-0'>
                  {order.products.length}
                </Badge>
              </h3>
              <div className='space-y-2'>
                {order.products.map((product, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className='flex items-start gap-2.5 p-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all'>
                    {product.thumbnail && (
                      <div className='relative flex-shrink-0'>
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className='w-12 h-12 object-cover rounded-lg ring-2 ring-white shadow-sm'
                        />
                        <div className='absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm'>
                          {product.quantity}
                        </div>
                      </div>
                    )}
                    <div className='flex-1 min-w-0'>
                      <p className='font-semibold text-xs text-gray-900 mb-0.5 line-clamp-2'>
                        {product.name}
                      </p>
                      <div className='flex items-center gap-1.5 flex-wrap'>
                        <span className='text-[11px] text-gray-600 bg-white px-1.5 py-0.5 rounded'>
                          {product.quantity} ×{" "}
                          {formatCurrency(product.unitPrice)}
                        </span>
                        {/* Variant badges */}
                        {product.hasVariation && product.variation && (
                          <>
                            {product.variation.size && (
                              <Badge
                                variant='outline'
                                className='text-[10px] h-5 px-1.5 bg-blue-50 border-blue-200 text-blue-700 font-medium'>
                                Size: {product.variation.size}
                              </Badge>
                            )}
                            {product.variation.color && (
                              <Badge
                                variant='outline'
                                className='text-[10px] h-5 px-1.5 bg-purple-50 border-purple-200 text-purple-700 font-medium'>
                                Color: {product.variation.color}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className='text-right flex-shrink-0'>
                      <p className='font-bold text-sm text-gray-900'>
                        {formatCurrency(product.totalPrice)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Customer Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className='bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white/60'>
              <h3 className='font-semibold text-sm text-gray-900 flex items-center gap-2 mb-2.5'>
                <div className='p-1.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg'>
                  <User className='h-3.5 w-3.5 text-blue-700' />
                </div>
                Customer Information
              </h3>
              <div className='space-y-2 text-xs'>
                <div className='flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-lg transition-colors'>
                  <span className='text-gray-500 flex items-center gap-1.5'>
                    <span className='w-1 h-1 bg-gray-400 rounded-full'></span>
                    Name
                  </span>
                  <span className='font-semibold text-gray-900'>
                    {order.customer.name}
                  </span>
                </div>
                <div className='flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-lg transition-colors'>
                  <span className='text-gray-500 flex items-center gap-1.5'>
                    <Phone className='h-3 w-3' />
                    Phone
                  </span>
                  <span className='font-medium text-gray-900'>
                    {order.customer.phoneNumber}
                  </span>
                </div>
                {order.customer.email && (
                  <div className='flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-lg transition-colors'>
                    <span className='text-gray-500 flex items-center gap-1.5'>
                      <Mail className='h-3 w-3' />
                      Email
                    </span>
                    <span className='font-medium text-gray-900'>
                      {order.customer.email}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Payment Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className='bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 shadow-sm border border-emerald-200'>
              <h3 className='font-semibold text-sm text-gray-900 flex items-center gap-2 mb-2.5'>
                <div className='p-1.5 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg'>
                  <DollarSign className='h-3.5 w-3.5 text-emerald-700' />
                </div>
                Payment Summary
              </h3>
              <div className='space-y-1.5 text-xs'>
                <div className='flex items-center justify-between p-2 bg-white/70 rounded-lg'>
                  <span className='text-gray-600'>Subtotal</span>
                  <span className='font-semibold text-gray-900'>
                    {formatCurrency(order.totalPrice)}
                  </span>
                </div>
                <div className='flex items-center justify-between p-2 bg-white/70 rounded-lg'>
                  <span className='text-gray-600 flex items-center gap-1'>
                    <Truck className='h-3 w-3' />
                    Delivery
                  </span>
                  <span className='font-semibold text-gray-900'>
                    {formatCurrency(order.deliveryCharge || 0)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className='flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg'>
                    <span className='text-green-700 font-medium'>Discount</span>
                    <span className='font-semibold text-green-700'>
                      - {formatCurrency(order.discount)}
                    </span>
                  </div>
                )}
                <Separator className='bg-emerald-300' />
                <div className='flex items-center justify-between p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white shadow-md'>
                  <span className='font-bold text-sm'>Total</span>
                  <span className='font-bold text-base'>
                    {formatCurrency(
                      order.totalPrice +
                        order.deliveryCharge -
                        (order.discount || 0),
                    )}
                  </span>
                </div>
                <div className='flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg'>
                  <span className='text-green-700 font-medium flex items-center gap-1'>
                    <CheckCircle2 className='h-3 w-3' />
                    Paid
                  </span>
                  <span className='font-bold text-green-700'>
                    {formatCurrency(order.paid)}
                  </span>
                </div>
                {order.remaining > 0 && (
                  <div className='flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded-lg'>
                    <span className='text-red-700 font-medium flex items-center gap-1'>
                      <AlertTriangle className='h-3 w-3' />
                      Due
                    </span>
                    <span className='font-bold text-red-700'>
                      {formatCurrency(order.remaining)}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className='bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white/60'>
              <h3 className='font-semibold text-sm text-gray-900 flex items-center gap-2 mb-2.5'>
                <div className='p-1.5 bg-gradient-to-br from-green-100 to-green-200 rounded-lg'>
                  <MapPin className='h-3.5 w-3.5 text-green-700' />
                </div>
                Shipping Address
              </h3>
              <div className='text-xs space-y-1.5'>
                <p className='text-gray-700 font-medium bg-gray-50 p-2 rounded-lg leading-relaxed'>
                  {order.shipping.address}
                </p>
                <div className='flex items-center gap-1.5 text-gray-600'>
                  <span className='px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-medium'>
                    {order.shipping.district}
                  </span>
                  <span className='text-gray-400'>•</span>
                  <span className='px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-[11px] font-medium'>
                    {order.shipping.division}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Return Information - Only show if order is a return */}
            {order.status === "return" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className='bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-sm rounded-xl p-3 shadow-sm border-2 border-orange-200'>
                <h3 className='font-semibold text-sm text-orange-900 flex items-center gap-2 mb-2.5'>
                  <div className='p-1.5 bg-gradient-to-br from-orange-200 to-orange-300 rounded-lg'>
                    <RotateCcw className='h-3.5 w-3.5 text-orange-800' />
                  </div>
                  Return Information
                  <Badge
                    variant='outline'
                    className='ml-auto bg-orange-100 text-orange-700 border-orange-300 text-[10px]'>
                    Returned
                  </Badge>
                </h3>
                <div className='space-y-2.5'>
                  {/* Return Reason */}
                  <div className='bg-white/70 rounded-lg p-2.5 border border-orange-200/50'>
                    <div className='flex items-start gap-2 mb-1.5'>
                      <FileText className='h-3.5 w-3.5 text-orange-600 mt-0.5 flex-shrink-0' />
                      <span className='text-xs font-semibold text-orange-900'>
                        Reason
                      </span>
                    </div>
                    <p className='text-xs text-orange-800 font-medium ml-5 bg-orange-50 px-2 py-1.5 rounded border border-orange-100'>
                      {order.returnReason
                        ? order.returnReason
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1),
                            )
                            .join(" ")
                        : "Not specified"}
                    </p>
                  </div>

                  {/* Return Details */}
                  {order.returnReasonDetails && (
                    <div className='bg-white/70 rounded-lg p-2.5 border border-orange-200/50'>
                      <div className='flex items-start gap-2 mb-1.5'>
                        <FileText className='h-3.5 w-3.5 text-orange-600 mt-0.5 flex-shrink-0' />
                        <span className='text-xs font-semibold text-orange-900'>
                          Details
                        </span>
                      </div>
                      <p className='text-xs text-gray-700 leading-relaxed ml-5 bg-white px-2 py-1.5 rounded border border-orange-100'>
                        {order.returnReasonDetails}
                      </p>
                    </div>
                  )}

                  {/* Return Date */}
                  {order.returnedAt && (
                    <div className='flex items-center justify-between p-2 bg-white/70 rounded-lg border border-orange-200/50'>
                      <span className='text-xs text-orange-700 flex items-center gap-1.5 font-medium'>
                        <Clock className='h-3 w-3' />
                        Returned On
                      </span>
                      <span className='text-xs font-semibold text-orange-900'>
                        {formatDate(order.returnedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Additional Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: order.status === "return" ? 0.4 : 0.3 }}
              className='bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white/60'>
              <h3 className='font-semibold text-sm text-gray-900 flex items-center gap-2 mb-2.5'>
                <div className='p-1.5 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg'>
                  <Calendar className='h-3.5 w-3.5 text-amber-700' />
                </div>
                Additional Info
              </h3>
              <div className='space-y-2 text-xs'>
                <div className='flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-lg transition-colors'>
                  <span className='text-gray-500 flex items-center gap-1.5'>
                    <Calendar className='h-3 w-3' />
                    Created
                  </span>
                  <span className='font-medium text-gray-900'>
                    {formatDate(order.timestamps.createdAt)}
                  </span>
                </div>
                {order.payment && order.payment.length > 0 && (
                  <div className='flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-lg transition-colors'>
                    <span className='text-gray-500 flex items-center gap-1.5'>
                      <CreditCard className='h-3 w-3' />
                      Payment
                    </span>
                    <Badge
                      variant='outline'
                      className='font-medium text-[11px] px-1.5 py-0'>
                      {order.payment[0].paymentType}
                    </Badge>
                  </div>
                )}
                {order.courier?.trackingCode && (
                  <div className='flex items-center justify-between p-1.5 hover:bg-gray-50 rounded-lg transition-colors'>
                    <span className='text-gray-500 flex items-center gap-1.5'>
                      <Truck className='h-3 w-3' />
                      Tracking
                    </span>
                    <span className='font-mono text-[11px] bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-2 py-1 rounded font-semibold'>
                      {order.courier.trackingCode}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Notes */}
            {order.notes && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className='bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 shadow-sm border border-yellow-200'>
                <h3 className='font-semibold text-sm text-gray-900 flex items-center gap-2 mb-2'>
                  <div className='p-1 bg-yellow-200 rounded-lg'>
                    <span className='text-sm'>📝</span>
                  </div>
                  Notes
                </h3>
                <p className='text-xs text-gray-700 bg-white/70 p-2.5 rounded-lg leading-relaxed italic'>
                  "{order.notes}"
                </p>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className='mt-4 pt-3 border-t bg-gradient-to-r from-gray-50 to-gray-100 -mx-6 px-6 -mb-6 pb-4 rounded-b-xl'>
          <div className='flex gap-1.5 flex-wrap'>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className='flex-1'>
              <Button
                variant='outline'
                className='w-full border-gray-300 hover:bg-white'
                onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </motion.div>
            {!["cancel", "cancelled", "fail", "failed", "delete"].includes(
              order?.status,
            ) && (
              <>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}>
                  <Button
                    variant='outline'
                    className='gap-2 border-blue-300 hover:bg-blue-50 text-blue-700'
                    onClick={handlePrint}>
                    <Printer className='h-4 w-4' />
                    Print
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}>
                  <Button
                    variant='outline'
                    className='gap-2 border-green-300 hover:bg-green-50 text-green-700'
                    onClick={handleDownloadInvoice}>
                    <Download className='h-4 w-4' />
                    Invoice
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}>
                  <Button
                    variant='outline'
                    className='gap-2 border-orange-300 hover:bg-orange-50 text-orange-700'
                    onClick={handleDownloadPackingSlip}>
                    <Box className='h-4 w-4' />
                    Packing Slip
                  </Button>
                </motion.div>
              </>
            )}
            {onEdit && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className='flex-1'>
                <Button
                  className='w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                  onClick={() => {
                    onEdit(order);
                    onOpenChange(false);
                  }}>
                  Edit Order
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
