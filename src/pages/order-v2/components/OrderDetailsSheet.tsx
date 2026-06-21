/**
 * OrderDetailsSheet Component — Redesigned
 * Clean, flat, professional, fully responsive
 */

import React, { useState } from "react";
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
  ChevronRight,
  Hash,
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
import { BRAND_CONFIG } from "../../../config/brand";

interface OrderDetailsSheetProps {
  order: IOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (order: IOrder) => void;
}

/** Thin row used for key→value pairs inside info sections */
const InfoRow = ({
  icon: Icon,
  label,
  value,
  valueClassName,
}: {
  icon?: React.ElementType;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) => (
  <div className='flex items-center justify-between gap-4 py-2.5 border-b border-gray-100 last:border-0'>
    <span className='flex items-center gap-2 text-xs text-gray-500 shrink-0'>
      {Icon && <Icon className='h-3.5 w-3.5 text-gray-400' />}
      {label}
    </span>
    <span
      className={cn(
        "text-xs font-medium text-gray-900 text-right truncate max-w-[55%]",
        valueClassName,
      )}>
      {value}
    </span>
  </div>
);

/** Section wrapper — card with label */
const Section = ({
  title,
  icon: Icon,
  iconColor = "text-gray-500",
  iconBg = "bg-gray-100",
  children,
  className,
}: {
  title: string;
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "rounded-xl border border-gray-100 bg-white overflow-hidden",
      className,
    )}>
    <div className='flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 bg-gray-50/60'>
      <span className={cn("p-1.5 rounded-lg", iconBg)}>
        <Icon className={cn("h-3.5 w-3.5", iconColor)} />
      </span>
      <span className='text-xs font-semibold text-gray-700 tracking-wide uppercase'>
        {title}
      </span>
    </div>
    <div className='px-4 py-1'>{children}</div>
  </div>
);

/** Icon action button in header toolbar */
const ToolbarButton = ({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  active?: boolean;
}) => (
  <button
    type='button'
    title={label}
    onClick={onClick}
    className={cn(
      "h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors text-gray-600 hover:text-gray-900",
      active && "border-green-300 bg-green-50 text-green-700",
    )}>
    <Icon className='h-3.5 w-3.5' />
  </button>
);

const RISK_CONFIG = {
  green: {
    icon: ShieldCheck,
    label: "Low risk",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    iconClass: "text-emerald-500",
  },
  yellow: {
    icon: Shield,
    label: "Medium risk",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
    iconClass: "text-amber-500",
  },
  red: {
    icon: ShieldAlert,
    label: "High risk",
    className: "bg-red-50 text-red-700 border border-red-200",
    iconClass: "text-red-500",
  },
};

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

  const isCancelledOrFailed = [
    "cancel",
    "cancelled",
    "fail",
    "failed",
    "delete",
  ].includes(order.status);

  const subtotal = order.products.reduce((sum, p) => sum + p.totalPrice, 0);
  const total = order.totalPrice + order.deliveryCharge - (order.discount || 0);

  const riskConfig =
    order.fraudDetection &&
    RISK_CONFIG[order.fraudDetection.riskLevel as keyof typeof RISK_CONFIG];

  /* ---------- Handlers ---------- */

  const handleCopyOrderNumber = async () => {
    await navigator.clipboard.writeText(
      `${BRAND_CONFIG.website}/order/${order.orderNumber}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = async () => {
    const blob = await pdf(<InvoiceDocument order={order} />).toBlob();
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
  };

  const handleDownloadInvoice = () => {
    generateReactPdfInvoice(order);
  };

  const handleDownloadPackingSlip = () => {
    generateReactPdfPackingSlip(order);
    toast.success("Packing slip downloaded.");
  };

  const handleShare = async () => {
    const url = `${BRAND_CONFIG.website}/order/${order.orderNumber}`;
    if (navigator.share) {
      await navigator.share({
        title: `Order ${formatOrderNumber(order.orderNumber)}`,
        text: `Order details for ${order.customer.name}`,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard.");
    }
  };

  const handleEmailCustomer = () => {
    const subject = `Order Update — ${formatOrderNumber(order.orderNumber)}`;
    window.location.href = `mailto:${order.customer.email || ""}?subject=${encodeURIComponent(subject)}`;
  };

  /* ---------- Render ---------- */

  return (
    <Sheet
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          // Force remove any stuck overlay after close animation
          setTimeout(() => {
            document.body.style.pointerEvents = "";
            document.body.style.overflow = "";
            // Remove any lingering radix overlay portals
            document
              .querySelectorAll("[data-radix-popper-content-wrapper]")
              .forEach((el) => el.remove());
          }, 300);
        }
        onOpenChange(val);
      }}>
      <SheetContent
        className={cn(
          "flex flex-col gap-0 p-0",
          "w-full sm:max-w-lg md:max-w-xl",
          "bg-gray-50 border-l border-gray-200",
        )}>
        {/* ── Header ── */}
        <SheetHeader className='px-5 pt-5 pb-4 bg-white border-b border-gray-100 space-y-0'>
          {/* Top row: title + toolbar */}
          <div className='flex items-start justify-between gap-3'>
            <div className='min-w-0'>
              <SheetTitle className='flex items-center gap-2 text-base font-semibold text-gray-900 leading-tight'>
                <Package className='h-4 w-4 text-blue-500 shrink-0' />
                Order Details
              </SheetTitle>
              <p className='mt-0.5 flex items-center gap-1.5 text-xs text-gray-500'>
                <Hash className='h-3 w-3' />
                <span className='font-mono font-semibold text-blue-600'>
                  {formatOrderNumber(order.orderNumber)}
                </span>
                <span className='text-gray-300'>·</span>
                <span>{formatDate(order.timestamps.createdAt)}</span>
              </p>
            </div>

            {/* Toolbar */}
            <div className='flex items-center gap-1.5 shrink-0'>
              <ToolbarButton
                icon={copied ? CheckCircle2 : Copy}
                label='Copy order link'
                onClick={handleCopyOrderNumber}
                active={copied}
              />
              <ToolbarButton
                icon={Share2}
                label='Share order'
                onClick={handleShare}
              />
              {!isCancelledOrFailed && (
                <>
                  <ToolbarButton
                    icon={Printer}
                    label='Print invoice'
                    onClick={handlePrint}
                  />
                  <ToolbarButton
                    icon={Download}
                    label='Download invoice'
                    onClick={handleDownloadInvoice}
                  />
                  <ToolbarButton
                    icon={Box}
                    label='Download packing slip'
                    onClick={handleDownloadPackingSlip}
                  />
                </>
              )}
            </div>
          </div>

          {/* Status badges row */}
          <div className='mt-3 flex items-center gap-2 flex-wrap'>
            {order.status === "shipped" && !!order?.deliveryTimeline?.length ? (
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
                animated
              />
            )}
            <PaymentStatusBadge status={paymentStatus} size='sm' animated />
            {riskConfig && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium",
                  riskConfig.className,
                )}>
                <riskConfig.icon
                  className={cn("h-3 w-3", riskConfig.iconClass)}
                />
                {riskConfig.label}
              </span>
            )}
          </div>
        </SheetHeader>

        {/* ── High-risk alert ── */}
        {hasHighRisk && (
          <div className='mx-4 mt-3 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3'>
            <AlertTriangle className='h-4 w-4 text-red-500 shrink-0 mt-0.5' />
            <div>
              <p className='text-xs font-semibold text-red-800'>
                Manual review required
              </p>
              <p className='text-[11px] text-red-600 mt-0.5'>
                Verify customer information before processing this order.
              </p>
            </div>
          </div>
        )}

        {/* ── Scrollable body ── */}
        <ScrollArea className='flex-1 min-h-0'>
          <div className='px-4 py-4 space-y-3'>
            {/* Products */}
            <Section
              title='Products'
              icon={Package}
              iconBg='bg-blue-50'
              iconColor='text-blue-600'>
              <div className='py-1 space-y-0'>
                {order.products.map((product, index) => {
                  const variationData = product.variation || product.variant;
                  const hasVariationData =
                    (product.hasVariation || product.variant) &&
                    variationData &&
                    (variationData.size || variationData.color);

                  return (
                    <div
                      key={index}
                      className='flex items-start gap-3 py-3 border-b border-gray-100 last:border-0'>
                      {/* Thumbnail */}
                      {product.thumbnail ? (
                        <div className='relative shrink-0'>
                          <img
                            src={product.thumbnail}
                            alt={product.name}
                            className='w-11 h-11 object-cover rounded-lg border border-gray-200'
                          />
                          <span className='absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold px-1 shadow-sm'>
                            {product.quantity}
                          </span>
                        </div>
                      ) : (
                        <div className='w-11 h-11 rounded-lg border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center shrink-0'>
                          <Package className='h-4 w-4 text-gray-300' />
                        </div>
                      )}

                      {/* Details */}
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-semibold text-gray-900 leading-snug line-clamp-2 mb-1'>
                          {product.name}
                        </p>
                        <div className='flex items-center gap-1.5 flex-wrap'>
                          <span className='text-[11px] text-gray-500'>
                            {product.quantity} ×{" "}
                            {formatCurrency(product.unitPrice)}
                          </span>
                          {hasVariationData && variationData.size && (
                            <span className='text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100'>
                              {variationData.size}
                            </span>
                          )}
                          {hasVariationData && variationData.color && (
                            <span className='text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100'>
                              {variationData.color}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <p className='text-sm font-semibold text-gray-900 shrink-0 tabular-nums'>
                        {formatCurrency(product.totalPrice)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* Payment Summary */}
            <Section
              title='Payment Summary'
              icon={DollarSign}
              iconBg='bg-emerald-50'
              iconColor='text-emerald-600'>
              <InfoRow label='Subtotal' value={formatCurrency(subtotal)} />
              <InfoRow
                icon={Truck}
                label='Delivery'
                value={formatCurrency(order.deliveryCharge || 0)}
              />
              {order.discount > 0 && (
                <InfoRow
                  label='Discount'
                  value={`− ${formatCurrency(order.discount)}`}
                  valueClassName='text-emerald-700'
                />
              )}

              {/* Total bar */}
              <div className='flex items-center justify-between px-3 py-2.5 mt-1 mb-1 rounded-lg bg-gray-900 text-white'>
                <span className='text-xs font-semibold'>Total</span>
                <span className='text-sm font-bold tabular-nums'>
                  {formatCurrency(total)}
                </span>
              </div>

              <InfoRow
                icon={CheckCircle2}
                label='Paid'
                value={formatCurrency(order.paid)}
                valueClassName='text-emerald-700'
              />
              {order.remaining > 0 && (
                <InfoRow
                  icon={AlertTriangle}
                  label='Due'
                  value={formatCurrency(order.remaining)}
                  valueClassName='text-red-600 font-bold'
                />
              )}
            </Section>

            {/* Two-column grid: Customer + Shipping side by side on ≥sm */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              {/* Customer */}
              <Section
                title='Customer'
                icon={User}
                iconBg='bg-indigo-50'
                iconColor='text-indigo-600'>
                <InfoRow label='Name' value={order.customer.name} />
                <InfoRow
                  icon={Phone}
                  label='Phone'
                  value={order.customer.phoneNumber}
                />
                {order.customer.email && (
                  <InfoRow
                    icon={Mail}
                    label='Email'
                    value={order.customer.email}
                    valueClassName='text-blue-600 truncate'
                  />
                )}
              </Section>

              {/* Shipping */}
              <Section
                title='Shipping'
                icon={MapPin}
                iconBg='bg-green-50'
                iconColor='text-green-600'>
                <div className='py-3'>
                  <p className='text-xs text-gray-700 leading-relaxed'>
                    {order.shipping.address}
                  </p>
                  <div className='mt-2 flex items-center gap-1.5 flex-wrap'>
                    <span className='text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100'>
                      {order.shipping.district}
                    </span>
                    <span className='text-[11px] font-medium px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100'>
                      {order.shipping.division}
                    </span>
                  </div>
                </div>
              </Section>
            </div>

            {/* Additional Info */}
            <Section
              title='Additional Info'
              icon={Calendar}
              iconBg='bg-amber-50'
              iconColor='text-amber-600'>
              <InfoRow
                icon={Calendar}
                label='Created'
                value={formatDate(order.timestamps.createdAt)}
              />
              {order.payment?.length > 0 && (
                <InfoRow
                  icon={CreditCard}
                  label='Payment method'
                  value={
                    <Badge
                      variant='outline'
                      className='text-[11px] px-1.5 py-0 font-medium'>
                      {order.payment[0].paymentType}
                    </Badge>
                  }
                />
              )}
              {order.courier?.trackingCode && (
                <InfoRow
                  icon={Truck}
                  label='Tracking code'
                  value={
                    <span className='font-mono text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-semibold'>
                      {order.courier.trackingCode}
                    </span>
                  }
                />
              )}
            </Section>

            {/* Return Info (conditional) */}
            {order.status === "return" && (
              <div className='rounded-xl border-2 border-orange-200 bg-orange-50/40 overflow-hidden'>
                <div className='flex items-center justify-between gap-2 px-4 py-3 border-b border-orange-200/60 bg-orange-50'>
                  <div className='flex items-center gap-2.5'>
                    <span className='p-1.5 rounded-lg bg-orange-100'>
                      <RotateCcw className='h-3.5 w-3.5 text-orange-700' />
                    </span>
                    <span className='text-xs font-semibold text-orange-800 tracking-wide uppercase'>
                      Return Information
                    </span>
                  </div>
                  <span className='text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-200 text-orange-800'>
                    Returned
                  </span>
                </div>
                <div className='px-4 py-1'>
                  <InfoRow
                    icon={FileText}
                    label='Reason'
                    value={
                      order.returnReason
                        ? order.returnReason
                            .split("_")
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ")
                        : "Not specified"
                    }
                    valueClassName='text-orange-800'
                  />
                  {order.returnReasonDetails && (
                    <div className='py-3 border-b border-orange-100 last:border-0'>
                      <p className='text-[11px] font-medium text-gray-500 mb-1'>
                        Details
                      </p>
                      <p className='text-xs text-gray-700 leading-relaxed bg-white rounded-lg border border-orange-100 px-3 py-2'>
                        {order.returnReasonDetails}
                      </p>
                    </div>
                  )}
                  {order.returnedAt && (
                    <InfoRow
                      icon={Clock}
                      label='Returned on'
                      value={formatDate(order.returnedAt)}
                      valueClassName='text-orange-800'
                    />
                  )}
                </div>
              </div>
            )}

            {/* Notes (conditional) */}
            {order.notes && (
              <div className='rounded-xl border border-amber-200 bg-amber-50 px-4 py-3'>
                <p className='text-[11px] font-semibold text-amber-700 uppercase tracking-wide mb-1.5'>
                  Notes
                </p>
                <p className='text-xs text-gray-700 leading-relaxed italic'>
                  "{order.notes}"
                </p>
              </div>
            )}

            {/* Spacer so last card isn't flush with footer */}
            <div className='h-1' />
          </div>
        </ScrollArea>

        {/* ── Footer ── */}
        <div className='shrink-0 px-4 py-3 bg-white border-t border-gray-100'>
          <div className='flex items-center gap-2 flex-wrap'>
            <Button
              variant='outline'
              size='sm'
              className='flex-1 min-w-[80px] text-xs border-gray-200 text-gray-600 hover:text-gray-900'
              onClick={() => onOpenChange(false)}>
              Close
            </Button>

            {!isCancelledOrFailed && (
              <>
                <Button
                  variant='outline'
                  size='sm'
                  className='text-xs gap-1.5 border-gray-200 text-gray-700 hover:text-gray-900'
                  onClick={handlePrint}>
                  <Printer className='h-3.5 w-3.5' />
                  <span className='hidden sm:inline'>Print</span>
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  className='text-xs gap-1.5 border-gray-200 text-gray-700 hover:text-gray-900'
                  onClick={handleDownloadInvoice}>
                  <Download className='h-3.5 w-3.5' />
                  <span className='hidden sm:inline'>Invoice</span>
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  className='text-xs gap-1.5 border-gray-200 text-gray-700 hover:text-gray-900'
                  onClick={handleDownloadPackingSlip}>
                  <Box className='h-3.5 w-3.5' />
                  <span className='hidden sm:inline'>Packing slip</span>
                </Button>
              </>
            )}

            {onEdit && (
              <Button
                size='sm'
                className='hidden flex-1 min-w-[100px] text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5'
                onClick={() => {
                  onEdit(order);
                  onOpenChange(false);
                }}>
                Edit Order
                <ChevronRight className='h-3.5 w-3.5' />
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
