import { IReturnOrder } from "../interface";
import dayjs from "dayjs";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { ScrollArea } from "../../../components/ui/scroll-area";
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
  Mail,
  DollarSign,
  Clock,
  RotateCcw,
  AlertCircle,
  ExternalLink,
  CheckCircle,
  Truck,
} from "lucide-react";
import PlaceHolderImage from "../../../assets/placeholder.svg";
import { cn } from "@/lib/utils";

interface ReturnOrderDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  returnOrder: IReturnOrder | null;
  onViewOriginalOrder?: (orderId: string) => void;
}

export function ReturnOrderDetailPanel({
  isOpen,
  onClose,
  returnOrder,
  onViewOriginalOrder,
}: ReturnOrderDetailPanelProps) {
  if (!returnOrder) return null;

  const getStatusConfig = (status: string) => {
    const statusMap: Record<
      string,
      { pill: string; icon: React.ElementType; label: string }
    > = {
      return: {
        pill: "bg-orange-50 text-orange-800 border-orange-200",
        icon: RotateCcw,
        label: "Returned",
      },
      pending_refund: {
        pill: "bg-yellow-50 text-yellow-800 border-yellow-200",
        icon: Clock,
        label: "Pending Refund",
      },
      refunded: {
        pill: "bg-green-50 text-green-800 border-green-200",
        icon: CheckCircle,
        label: "Refunded",
      },
      rejected: {
        pill: "bg-red-50 text-red-800 border-red-200",
        icon: AlertCircle,
        label: "Rejected",
      },
      processing: {
        pill: "bg-blue-50 text-blue-800 border-blue-200",
        icon: Truck,
        label: "Processing",
      },
    };

    return (
      statusMap[status] || {
        pill: "bg-gray-50 text-gray-700 border-gray-200",
        icon: Package,
        label: status,
      }
    );
  };

  const getReturnReasonLabel = (reason: string) => {
    const reasonMap: Record<string, string> = {
      defective: "Defective Product",
      wrong_item: "Wrong Item Received",
      not_as_described: "Not As Described",
      customer_request: "Customer Request",
      damaged: "Damaged In Transit",
      other: "Other Reason",
    };
    return reasonMap[reason] || reason;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statusConfig = getStatusConfig(returnOrder.status);
  const StatusIcon = statusConfig.icon;

  const Section = ({
    title,
    icon: Icon,
    iconBg,
    iconColor,
    children,
  }: {
    title: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    children: React.ReactNode;
  }) => (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-50/70 border-b border-gray-100">
        <span className={cn("p-1.5 rounded-lg", iconBg)}>
          <Icon className={cn("h-3.5 w-3.5", iconColor)} />
        </span>
        <span className="text-[12px] font-bold uppercase tracking-widest text-gray-500">
          {title}
        </span>
      </div>
      <div className="px-4 py-1">{children}</div>
    </div>
  );

  const InfoRow = ({
    icon: Icon,
    label,
    value,
    valueClass,
  }: {
    icon?: React.ElementType;
    label: string;
    value: React.ReactNode;
    valueClass?: string;
  }) => (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400 shrink-0">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-semibold text-gray-900 text-right truncate",
          valueClass
        )}
      >
        {value}
      </span>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        className={cn(
          "flex flex-col gap-0 p-0",
          "w-full sm:max-w-md",
          "bg-gray-50 border-l border-gray-100"
        )}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 bg-white border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-orange-50">
                <StatusIcon className="h-4.5 w-4.5 text-orange-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-gray-900 leading-tight">
                  Return #{returnOrder.orderNumber}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-sm font-semibold border",
                      statusConfig.pill
                    )}
                  >
                    <StatusIcon className="h-2.5 w-2.5" />
                    {statusConfig.label}
                  </span>
                  <span className="text-xs font-medium text-gray-400">
                    {dayjs(returnOrder.timestamps?.createdAt).format(
                      "MMM D, YYYY"
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* View Original Order Button */}
            {returnOrder.originalOrderId && onViewOriginalOrder && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewOriginalOrder(returnOrder.originalOrderId)}
                className="h-8 gap-1.5 text-xs border-orange-200 text-orange-700 hover:bg-orange-50 px-2.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Original Order</span>
              </Button>
            )}
          </div>

          {/* Return info bar */}
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-100 rounded-lg">
            <RotateCcw className="h-4 w-4 text-orange-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-orange-800">
                Return Reason: {getReturnReasonLabel(returnOrder.returnReason)}
              </span>
              {returnOrder.returnReasonDetails && (
                <p className="text-xs text-orange-600 mt-0.5 truncate">
                  {returnOrder.returnReasonDetails}
                </p>
              )}
            </div>
          </div>

          {/* Original Order Number */}
          {returnOrder.originalOrderNumber && (
            <div className="mt-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg">
              <span className="text-xs font-medium text-gray-500">
                Original Order:{" "}
              </span>
              <span className="text-xs font-bold text-gray-900">
                #{returnOrder.originalOrderNumber}
              </span>
            </div>
          )}
        </div>

        {/* Scrollable body */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-4 py-4 space-y-3">
            {/* Returned Products */}
            <Section
              title="Returned Products"
              icon={Package}
              iconBg="bg-orange-50"
              iconColor="text-orange-600"
            >
              <div className="py-1">
                {returnOrder.products?.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2.5 py-3 border-b border-gray-50 last:border-0"
                  >
                    {product?.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product?.name ?? "Product"}
                        className="w-11 h-11 rounded-lg object-cover border border-gray-100 flex-shrink-0 bg-white"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PlaceHolderImage;
                        }}
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-lg border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <Package className="h-4 w-4 text-gray-300" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 uppercase leading-snug mb-1 line-clamp-2">
                        {product?.name}
                      </p>
                      <p className="text-[12px] text-gray-400 mb-1.5">
                        Qty: {product?.quantity}
                      </p>
                      {!!product?.variation && (
                        <span className="inline-flex items-center gap-1 text-[12px] font-semibold px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-100">
                          {[
                            product?.variation?.color,
                            product?.variation?.size,
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </span>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-orange-600 tabular-nums">
                        {formatCurrency(product?.totalPrice)}
                      </p>
                      <p className="text-[12px] text-gray-400 mt-1 tabular-nums">
                        {formatCurrency(product?.unitPrice)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Refund Summary */}
            <Section
              title="Refund Summary"
              icon={DollarSign}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
            >
              <InfoRow
                label="Total Price"
                value={formatCurrency(returnOrder.totalPrice)}
              />
              <InfoRow
                label="Refund Amount"
                value={formatCurrency(returnOrder.refundAmount)}
                valueClass="text-orange-600 font-bold"
              />
              {returnOrder.paid !== undefined && returnOrder.paid > 0 && (
                <InfoRow
                  label="Paid Amount"
                  value={formatCurrency(returnOrder.paid)}
                />
              )}
              {returnOrder.discount !== undefined &&
                returnOrder.discount > 0 && (
                  <InfoRow
                    label="Discount"
                    value={formatCurrency(returnOrder.discount)}
                    valueClass="text-emerald-700"
                  />
                )}
              {returnOrder.deliveryCharge !== undefined &&
                returnOrder.deliveryCharge > 0 && (
                  <InfoRow
                    label="Delivery Charge"
                    value={formatCurrency(returnOrder.deliveryCharge)}
                  />
                )}

              {/* Total bar */}
              <div className="flex items-center justify-between px-3 py-2.5 my-1 rounded-lg bg-orange-600 text-white">
                <span className="text-sm font-semibold">Refund Total</span>
                <span className="text-sm font-bold tabular-nums">
                  {formatCurrency(returnOrder.refundAmount)}
                </span>
              </div>
            </Section>

            {/* Customer + Shipping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Customer */}
              <Section
                title="Customer"
                icon={User}
                iconBg="bg-indigo-50"
                iconColor="text-indigo-600"
              >
                <div className="py-3 space-y-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {returnOrder.customer?.name}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <Phone className="h-3 w-3 text-gray-300" />
                    {returnOrder.customer?.phoneNumber}
                  </p>
                  {returnOrder.customer?.email && (
                    <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500 truncate">
                      <Mail className="h-3 w-3 text-gray-300" />
                      {returnOrder.customer.email}
                    </p>
                  )}
                </div>
              </Section>

              {/* Shipping */}
              <Section
                title="Shipping Address"
                icon={MapPin}
                iconBg="bg-green-50"
                iconColor="text-green-600"
              >
                <div className="py-3 space-y-2">
                  <p className="text-sm font-semibold text-gray-800">
                    {returnOrder.shipping?.division}
                  </p>
                  <p className="text-xs font-medium text-gray-700">
                    {returnOrder.shipping?.district}
                  </p>
                  <p className="text-xs font-medium text-gray-500 leading-relaxed">
                    {returnOrder.shipping?.address}
                  </p>
                </div>
              </Section>
            </div>

            {/* Notes */}
            {returnOrder.notes && (
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-[12px] font-bold uppercase tracking-widest text-amber-700">
                    Return Notes
                  </span>
                </div>
                <p className="text-xs font-medium text-gray-700 leading-relaxed italic">
                  "{returnOrder.notes}"
                </p>
              </div>
            )}

            {/* Payment History */}
            {returnOrder.payment && returnOrder.payment.length > 0 && (
              <Section
                title="Payment History"
                icon={DollarSign}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
              >
                <div className="py-1">
                  {returnOrder.payment.map((payment, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 capitalize">
                          {payment.paymentType}
                        </span>
                        <span className="text-xs text-gray-400">
                          {dayjs(payment.date).format("MMM D, YYYY")}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-green-600">
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <div className="h-1" />
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="shrink-0 px-4 py-3 bg-white border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 min-w-0">
            <Clock className="h-3 w-3 shrink-0" />
            <span className="truncate">
              Processed{" "}
              {returnOrder.timestamps?.processedAt
                ? dayjs(returnOrder.timestamps.processedAt).format(
                    "MMM D, YYYY [at] h:mm A"
                  )
                : dayjs(returnOrder.timestamps?.createdAt).format(
                    "MMM D, YYYY [at] h:mm A"
                  )}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-gray-200 text-gray-600 hover:text-gray-900"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
