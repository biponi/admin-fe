import { useState, useEffect } from "react";
import { OperationRequest } from "../hooks/useOperationRequests";
import { useProductData, ProductData } from "../hooks/useProductData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Ban,
  Hourglass,
  Package,
  DollarSign,
  Box,
  Eye,
  Check,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import PlaceHolderImage from "@/assets/placeholder.svg";

interface RequestCardProps {
  request: OperationRequest;
  onViewDetails: (request: OperationRequest) => void;
  showActions?: boolean;
  onApprove?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
  onCancel?: (requestId: string) => void;
  canApprove?: boolean;
  canReject?: boolean;
  isCurrentUserRequest?: boolean;
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { icon: React.ReactNode; label: string; className: string }
> = {
  pending: {
    icon: <Clock className='w-3 h-3' />,
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  approved: {
    icon: <CheckCircle2 className='w-3 h-3' />,
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  rejected: {
    icon: <XCircle className='w-3 h-3' />,
    label: "Rejected",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
  cancelled: {
    icon: <Ban className='w-3 h-3' />,
    label: "Cancelled",
    className: "bg-slate-50 text-slate-600 border-slate-200",
  },
  timeout_expired: {
    icon: <Hourglass className='w-3 h-3' />,
    label: "Timeout Expired",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
};

const StatusBadge = ({ status }: { status: OperationRequest["status"] }) => {
  const cfg = STATUS_CONFIG[status];
  if (!cfg)
    return (
      <Badge variant='outline' className='text-xs'>
        {status}
      </Badge>
    );
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${cfg.className}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

// ─── Operation type label ─────────────────────────────────────────────────────
const getOperationTypeLabel = (t: string) => {
  const map: Record<string, string> = {
    product_delete: "Product Deletion",
    category_delete: "Category Deletion",
    manufacturer_delete: "Manufacturer Deletion",
  };
  return (
    map[t] ?? t.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );
};

// ─── Variation chip ───────────────────────────────────────────────────────────
const VariationChip = ({ variation }: { variation: any }) => {
  const src = variation.images?.[0];
  const label =
    variation.name ||
    [variation.color, variation.size].filter(Boolean).join(" · ");
  const qty = variation.quantity ?? 0;
  const qtyClass =
    qty <= 0 ? "text-rose-500" : qty <= 5 ? "text-amber-600" : "text-slate-400";
  const qtyLabel =
    qty <= 0 ? "Out of stock" : qty <= 5 ? `${qty} left` : `${qty} in stock`;

  return (
    <div className='inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 text-xs'>
      {src ? (
        <img
          src={src}
          alt={label}
          className='w-6 h-6 rounded-md object-cover border border-slate-200 shrink-0'
          onError={(e) => {
            (e.target as HTMLImageElement).src = PlaceHolderImage;
          }}
        />
      ) : (
        <div className='w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0'>
          <span className='text-[10px] font-bold text-indigo-500'>
            {variation.size || variation.color?.slice(0, 1) || "?"}
          </span>
        </div>
      )}
      <div className='flex flex-col leading-tight'>
        <span className='font-medium text-slate-800 whitespace-nowrap'>
          {label}
        </span>
        <span className={`text-[10px] whitespace-nowrap ${qtyClass}`}>
          {qtyLabel}
        </span>
      </div>
    </div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────
export const RequestCard = ({
  request,
  onViewDetails,
  showActions = false,
  onApprove,
  onReject,
  onCancel,
  canApprove = false,
  canReject = false,
  isCurrentUserRequest = false,
}: RequestCardProps) => {
  const { fetchProduct, getProduct } = useProductData();
  const [product, setProduct] = useState<ProductData | null>(null);

  const isPending = request.status === "pending";
  const isExpiringSoon =
    isPending &&
    request.expiresAt &&
    new Date(request.expiresAt) < new Date(Date.now() + 24 * 60 * 60 * 1000);

  const canApproveReject = canApprove && canReject && isPending;
  const canCancel = isCurrentUserRequest && isPending;

  useEffect(() => {
    if (request.operationType !== "product_delete" || !request.targetId) return;
    const cached = getProduct(request.targetId);
    if (cached) {
      setProduct(cached);
      return;
    }
    fetchProduct(request.targetId).then((p) => {
      if (p) setProduct(p);
    });
  }, [request.operationType, request.targetId, fetchProduct, getProduct]);

  return (
    <div className='bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-150 flex flex-col overflow-hidden'>
      {/* Card header */}
      <div className='px-4 pt-4 pb-3 flex items-start justify-between gap-2 border-b border-slate-50'>
        <div className='min-w-0'>
          <div className='flex items-center gap-1.5'>
            <span className='text-sm font-semibold text-slate-900 leading-tight truncate'>
              {getOperationTypeLabel(request.operationType)}
            </span>
            {isExpiringSoon && (
              <AlertCircle
                className='w-3.5 h-3.5 text-orange-500 shrink-0'
                title='Expiring soon'
              />
            )}
          </div>
          <p className='text-xs text-slate-400 mt-0.5 truncate'>
            {request.targetName}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Card body */}
      <div className='px-4 py-3 flex-1 space-y-3'>
        {/* Product preview */}
        {product && request.operationType === "product_delete" && (
          <div className='rounded-xl border border-slate-100 bg-slate-50/60 p-3 space-y-2.5'>
            <div className='flex items-start gap-3'>
              <img
                src={
                  product.thumbnail || product.images?.[0] || PlaceHolderImage
                }
                alt={product.title || product.name}
                className='w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0'
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PlaceHolderImage;
                }}
              />
              <div className='flex-1 min-w-0 space-y-1.5'>
                <p className='text-xs font-semibold text-slate-800 truncate'>
                  {product.title || product.name}
                </p>
                <div className='grid grid-cols-2 gap-x-3 gap-y-1'>
                  {[
                    {
                      icon: <Package className='w-3 h-3' />,
                      text: product.sku,
                    },
                    {
                      icon: <DollarSign className='w-3 h-3' />,
                      text: `৳${product.price}`,
                    },
                    {
                      icon: <Box className='w-3 h-3' />,
                      text: `Stock: ${product.quantity}`,
                    },
                    product.categoryName
                      ? { icon: null, text: product.categoryName }
                      : null,
                  ]
                    .filter(Boolean)
                    .map((item, i) => (
                      <div
                        key={i}
                        className='flex items-center gap-1 text-[11px] text-slate-400'>
                        {item!.icon}
                        <span className='truncate'>{item!.text}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {product.variations && product.variations.length > 0 && (
              <div className='flex flex-wrap gap-1.5 pt-1 border-t border-slate-100'>
                {product.variations.slice(0, 3).map((v) => (
                  <VariationChip key={v.id} variation={v} />
                ))}
                {product.variations.length > 3 && (
                  <span className='self-center text-[11px] text-slate-400'>
                    +{product.variations.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Meta row */}
        <div className='grid grid-cols-2 gap-2'>
          <div className='flex items-center gap-1.5 text-[11px] text-slate-400'>
            <User className='w-3.5 h-3.5 shrink-0' />
            <span className='truncate'>{request.requester}</span>
          </div>
          <div className='flex items-center gap-1.5 text-[11px] text-slate-400'>
            <Calendar className='w-3.5 h-3.5 shrink-0' />
            <span className='truncate'>
              {formatDistanceToNow(new Date(request.requestedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        {/* Reason */}
        {request.reason && (
          <p className='text-xs text-slate-500 line-clamp-2 leading-relaxed'>
            <span className='font-medium text-slate-700'>Reason: </span>
            {request.reason}
          </p>
        )}

        {/* Expiry */}
        {isPending && request.expiresAt && (
          <div className='flex items-center gap-1.5 text-[11px]'>
            <Clock
              className={`w-3.5 h-3.5 shrink-0 ${isExpiringSoon ? "text-orange-500" : "text-slate-300"}`}
            />
            <span
              className={
                isExpiringSoon ? "text-orange-600 font-medium" : "text-slate-400"
              }>
              Expires{" "}
              {formatDistanceToNow(new Date(request.expiresAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        )}

        {/* Admin notes */}
        {request.adminNotes && request.status === "rejected" && (
          <div className='rounded-xl bg-rose-50 border border-rose-100 px-3 py-2 text-xs'>
            <p className='font-semibold text-rose-700 mb-0.5'>Admin Notes</p>
            <p className='text-rose-600 leading-relaxed'>
              {request.adminNotes}
            </p>
          </div>
        )}

        {/* Processed by */}
        {request.approver &&
          (request.status === "approved" || request.status === "rejected") && (
            <p className='text-[11px] text-slate-400'>
              Processed by{" "}
              <span className='font-medium text-slate-600'>
                {request.approver}
              </span>
            </p>
          )}
      </div>

      {/* Card footer */}
      <div className='px-4 pb-4 pt-3 border-t border-slate-50 flex items-center gap-2'>
        <button
          onClick={() => onViewDetails(request)}
          className='flex-1 h-8 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all duration-150'>
          <Eye className='w-3.5 h-3.5' />
          View
        </button>

        {showActions && isPending && (
          <>
            {canApproveReject && onApprove && onReject && (
              <>
                <button
                  onClick={() => onApprove(request.id)}
                  className='flex-1 h-8 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-all duration-150'>
                  <Check className='w-3.5 h-3.5' />
                  Approve
                </button>
                <button
                  onClick={() => onReject(request.id)}
                  className='flex-1 h-8 inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-all duration-150'>
                  <X className='w-3.5 h-3.5' />
                  Reject
                </button>
              </>
            )}

            {canCancel && onCancel && (
              <button
                onClick={() => onCancel(request.id)}
                className='flex-1 h-8 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all duration-150'>
                <Ban className='w-3.5 h-3.5' />
                Cancel
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
