import { useState, useEffect } from "react";
import { OperationRequest } from "../hooks/useOperationRequests";
import { useProductData, ProductData } from "../hooks/useProductData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
  Image as ImageIcon,
  Check,
  X,
  Hash,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import PlaceHolderImage from "@/assets/placeholder.svg";

interface RequestDetailsModalProps {
  request: OperationRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: (requestId: string) => Promise<boolean>;
  onReject?: (requestId: string, adminNotes?: string) => Promise<boolean>;
  onCancel?: (requestId: string) => Promise<boolean>;
  canApprove?: boolean;
  canReject?: boolean;
  isCurrentUserRequest?: boolean;
}

// ─── Shared with RequestCard ──────────────────────────────────────────────────
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
  if (!cfg) return <span className='text-xs text-slate-400'>{status}</span>;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${cfg.className}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

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

// ─── Info section wrapper ─────────────────────────────────────────────────────
const Section: React.FC<{
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className='rounded-xl border border-slate-100 bg-slate-50/60 overflow-hidden'>
    <div className='px-4 py-2.5 border-b border-slate-100 flex items-center gap-2'>
      {icon && <span className='text-slate-400'>{icon}</span>}
      <p className='text-xs font-semibold text-slate-700 uppercase tracking-wide'>
        {title}
      </p>
    </div>
    <div className='px-4 py-3'>{children}</div>
  </div>
);

// ─── Meta row ─────────────────────────────────────────────────────────────────
const MetaRow: React.FC<{
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  span?: boolean;
}> = ({ label, value, mono, span }) => (
  <div className={span ? "col-span-2" : ""}>
    <p className='text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-0.5'>
      {label}
    </p>
    <p
      className={`text-xs font-medium text-slate-800 ${mono ? "font-mono" : ""}`}>
      {value}
    </p>
  </div>
);

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
    <div className='inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-slate-100 text-xs'>
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
export const RequestDetailsModal = ({
  request,
  open,
  onOpenChange,
  onApprove,
  onReject,
  onCancel,
  canApprove = false,
  canReject = false,
  isCurrentUserRequest = false,
}: RequestDetailsModalProps) => {
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [product, setProduct] = useState<ProductData | null>(null);
  const { fetchProduct, getProduct } = useProductData();

  useEffect(() => {
    if (
      !request ||
      !open ||
      request.operationType !== "product_delete" ||
      !request.targetId
    )
      return;
    const cached = getProduct(request.targetId);
    if (cached) {
      setProduct(cached);
      return;
    }
    fetchProduct(request.targetId).then((p) => {
      if (p) setProduct(p);
    });
  }, [open, request, fetchProduct, getProduct]);

  if (!request) return null;

  const isPending = request.status === "pending";
  const isExpiringSoon =
    isPending &&
    request.expiresAt &&
    new Date(request.expiresAt) < new Date(Date.now() + 24 * 60 * 60 * 1000);

  const canApproveReject = canApprove && canReject && isPending;
  const canCancel = isCurrentUserRequest && isPending;

  const withProcessing = async (
    fn: () => Promise<boolean>,
    onSuccess?: () => void,
  ) => {
    setIsProcessing(true);
    const ok = await fn();
    setIsProcessing(false);
    if (ok) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const handleApprove = () => withProcessing(() => onApprove!(request.id));
  const handleReject = () =>
    withProcessing(
      () => onReject!(request.id, adminNotes),
      () => setAdminNotes(""),
    );
  const handleCancel = () => withProcessing(() => onCancel!(request.id));

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!isProcessing) {
          onOpenChange(v);
          if (!v) setAdminNotes("");
        }
      }}>
      <DialogContent className='max-w-2xl max-h-[92vh] overflow-y-auto p-0 gap-0 rounded-2xl border border-slate-100 shadow-xl'>
        {/* Dialog header */}
        <DialogHeader className='px-6 pt-6 pb-4 border-b border-slate-100'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <DialogTitle className='text-base font-bold text-slate-900 leading-tight'>
                {getOperationTypeLabel(request.operationType)}
              </DialogTitle>
              <DialogDescription className='mt-1 flex items-center gap-1 text-[11px] text-slate-400'>
                <Hash className='w-3 h-3' />
                <span className='font-mono'>{request.id}</span>
              </DialogDescription>
            </div>
            <StatusBadge status={request.status} />
          </div>
        </DialogHeader>

        <div className='px-6 py-5 space-y-4'>
          {/* Product details */}
          {product && request.operationType === "product_delete" && (
            <Section
              title='Product Details'
              icon={<Package className='w-3.5 h-3.5' />}>
              <div className='flex gap-4'>
                <img
                  src={
                    product.thumbnail || product.images?.[0] || PlaceHolderImage
                  }
                  alt={product.title || product.name}
                  className='w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0'
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PlaceHolderImage;
                  }}
                />
                <div className='flex-1 min-w-0 space-y-2'>
                  <p className='text-sm font-semibold text-slate-900 truncate'>
                    {product.title || product.name}
                  </p>
                  <div className='grid grid-cols-3 gap-x-4 gap-y-2'>
                    <MetaRow label='SKU' value={product.sku} mono />
                    <MetaRow label='Price' value={`৳${product.price}`} />
                    <MetaRow label='Stock' value={product.quantity} />
                    {product.categoryName && (
                      <MetaRow label='Category' value={product.categoryName} />
                    )}
                    {product.manufacturerName && (
                      <MetaRow
                        label='Manufacturer'
                        value={product.manufacturerName}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Variations */}
              {product.variations && product.variations.length > 0 && (
                <div className='mt-3 pt-3 border-t border-slate-100'>
                  <p className='text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2'>
                    Variations ({product.variations.length})
                  </p>
                  <div className='flex flex-wrap gap-1.5'>
                    {product.variations.map((v) => (
                      <VariationChip key={v.id} variation={v} />
                    ))}
                  </div>
                </div>
              )}

              {/* Image gallery */}
              {product.images && product.images.length > 1 && (
                <div className='mt-3 pt-3 border-t border-slate-100'>
                  <p className='text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1'>
                    <ImageIcon className='w-3 h-3' />
                    Images ({product.images.length})
                  </p>
                  <div className='flex gap-2 overflow-x-auto pb-1'>
                    {product.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`${product.title || product.name} ${i + 1}`}
                        className='w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0'
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PlaceHolderImage;
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* Target info */}
          <Section title='Target'>
            <div className='grid grid-cols-2 gap-x-4 gap-y-3'>
              <MetaRow label='Type' value={request.targetType} />
              <MetaRow label='ID' value={request.targetId} mono />
              <MetaRow label='Name' value={request.targetName} span />
            </div>
          </Section>

          {/* Requester info */}
          <Section title='Requester' icon={<User className='w-3.5 h-3.5' />}>
            <div className='grid grid-cols-2 gap-x-4 gap-y-3'>
              <MetaRow
                label='Requested by'
                value={
                  <span className='flex items-center gap-1.5'>
                    <span className='w-5 h-5 rounded-full bg-indigo-100 inline-flex items-center justify-center shrink-0'>
                      <span className='text-[10px] font-bold text-indigo-600'>
                        {request.requester?.[0]?.toUpperCase() ?? "?"}
                      </span>
                    </span>
                    {request.requester}
                  </span>
                }
              />
              <MetaRow
                label='Requested'
                value={formatDistanceToNow(new Date(request.requestedAt), {
                  addSuffix: true,
                })}
              />
              <MetaRow
                label='Exact date'
                value={new Date(request.requestedAt).toLocaleString()}
                span
              />
            </div>
          </Section>

          {/* Reason */}
          {request.reason && (
            <Section title='Reason'>
              <p className='text-xs text-slate-700 leading-relaxed'>
                {request.reason}
              </p>
            </Section>
          )}

          {/* Expiry */}
          {isPending && request.expiresAt && (
            <div
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium ${
                isExpiringSoon
                  ? "bg-orange-50 border-orange-100 text-orange-700"
                  : "bg-slate-50 border-slate-100 text-slate-500"
              }`}>
              {isExpiringSoon ? (
                <AlertCircle className='w-3.5 h-3.5 shrink-0' />
              ) : (
                <Clock className='w-3.5 h-3.5 shrink-0' />
              )}
              Expires{" "}
              {formatDistanceToNow(new Date(request.expiresAt), {
                addSuffix: true,
              })}
              {isExpiringSoon && (
                <span className='ml-1 font-semibold'>— Act soon</span>
              )}
            </div>
          )}

          {/* Admin notes (rejected) */}
          {request.adminNotes && request.status === "rejected" && (
            <div className='rounded-xl bg-rose-50 border border-rose-100 px-4 py-3'>
              <p className='text-[10px] font-semibold text-rose-600 uppercase tracking-wide mb-1'>
                Admin Notes
              </p>
              <p className='text-xs text-rose-700 leading-relaxed'>
                {request.adminNotes}
              </p>
            </div>
          )}

          {/* Processed by */}
          {request.approver &&
            (request.status === "approved" ||
              request.status === "rejected") && (
              <p className='text-[11px] text-slate-400'>
                Processed by{" "}
                <span className='font-semibold text-slate-600'>
                  {request.approver}
                </span>
                {request.actionAt && (
                  <span className='ml-1'>
                    ·{" "}
                    {formatDistanceToNow(new Date(request.actionAt), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </p>
            )}

          {/* Admin notes input (for rejection) */}
          {isPending && canApproveReject && onReject && (
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-slate-600 uppercase tracking-wide'>
                Rejection Notes{" "}
                <span className='text-slate-400 font-normal normal-case tracking-normal'>
                  (optional)
                </span>
              </label>
              <Textarea
                placeholder='Explain why this request is being rejected…'
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className='text-xs rounded-xl border-slate-200 resize-none focus:border-indigo-300 focus:ring-indigo-100'
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2'>
          <button
            onClick={() => {
              onOpenChange(false);
              setAdminNotes("");
            }}
            disabled={isProcessing}
            className='h-8 px-4 text-xs font-medium text-slate-600 rounded-xl border border-slate-200 hover:bg-white transition-all duration-150 disabled:opacity-50'>
            Close
          </button>

          {isPending && (
            <>
              {canCancel && onCancel && (
                <button
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className='h-8 px-4 text-xs font-medium text-slate-600 rounded-xl border border-slate-200 hover:bg-white transition-all duration-150 disabled:opacity-50 flex items-center gap-1.5'>
                  <Ban className='w-3.5 h-3.5' />
                  {isProcessing ? "Processing…" : "Cancel Request"}
                </button>
              )}

              {canApproveReject && onApprove && onReject && (
                <>
                  <button
                    onClick={handleReject}
                    disabled={isProcessing}
                    className='h-8 px-4 text-xs font-medium text-white rounded-xl bg-rose-600 hover:bg-rose-700 transition-all duration-150 disabled:opacity-50 flex items-center gap-1.5 shadow-sm'>
                    <X className='w-3.5 h-3.5' />
                    {isProcessing ? "Processing…" : "Reject"}
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className='h-8 px-4 text-xs font-medium text-white rounded-xl bg-emerald-600 hover:bg-emerald-700 transition-all duration-150 disabled:opacity-50 flex items-center gap-1.5 shadow-sm'>
                    <Check className='w-3.5 h-3.5' />
                    {isProcessing ? "Processing…" : "Approve"}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
