import { useState, useEffect } from "react";
import { OperationRequest } from "../hooks/useOperationRequests";
import { useProductData, ProductData } from "../hooks/useProductData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Clock,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Ban,
  Hourglass,
  Package,
  DollarSign,
  Box,
  Image as ImageIcon,
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

const getStatusBadge = (status: OperationRequest["status"]) => {
  switch (status) {
    case "pending":
      return (
        <Badge
          variant='outline'
          className='bg-yellow-50 text-yellow-700 border-yellow-200'>
          <Clock className='w-3 h-3 mr-1' />
          Pending
        </Badge>
      );
    case "approved":
      return (
        <Badge
          variant='outline'
          className='bg-green-50 text-green-700 border-green-200'>
          <CheckCircle className='w-3 h-3 mr-1' />
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge
          variant='outline'
          className='bg-red-50 text-red-700 border-red-200'>
          <XCircle className='w-3 h-3 mr-1' />
          Rejected
        </Badge>
      );
    case "cancelled":
      return (
        <Badge
          variant='outline'
          className='bg-gray-50 text-gray-700 border-gray-200'>
          <Ban className='w-3 h-3 mr-1' />
          Cancelled
        </Badge>
      );
    case "timeout_expired":
      return (
        <Badge
          variant='outline'
          className='bg-orange-50 text-orange-700 border-orange-200'>
          <Hourglass className='w-3 h-3 mr-1' />
          Timeout Expired
        </Badge>
      );
    default:
      return <Badge variant='outline'>{status}</Badge>;
  }
};

const getOperationTypeLabel = (operationType: string) => {
  switch (operationType) {
    case "product_delete":
      return "Product Deletion";
    case "category_delete":
      return "Category Deletion";
    case "manufacturer_delete":
      return "Manufacturer Deletion";
    default:
      return operationType
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
  }
};

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
  // ALL hooks must be declared before any conditional logic
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [product, setProduct] = useState<ProductData | null>(null);
  const { fetchProduct, getProduct } = useProductData();

  // Fetch product data when modal opens
  useEffect(() => {
    if (!request || !open) return;
    if (request.operationType === "product_delete" && request.targetId) {
      const cachedProduct = getProduct(request.targetId);
      if (cachedProduct) {
        setProduct(cachedProduct);
      } else {
        fetchProduct(request.targetId).then((fetchedProduct) => {
          if (fetchedProduct) {
            setProduct(fetchedProduct);
          }
        });
      }
    }
  }, [open, request, fetchProduct, getProduct]);

  // Early return AFTER all hooks
  if (!request) return null;

  const isPending = request.status === "pending";
  const isExpiringSoon =
    isPending &&
    request.expiresAt &&
    new Date(request.expiresAt) < new Date(Date.now() + 24 * 60 * 60 * 1000);

  const canApproveReject = canApprove && canReject && isPending;
  const canCancel = isCurrentUserRequest && isPending;

  const handleApprove = async () => {
    if (!onApprove) return;
    setIsProcessing(true);
    const success = await onApprove(request.id);
    setIsProcessing(false);
    if (success) {
      onOpenChange(false);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    setIsProcessing(true);
    const success = await onReject(request.id, adminNotes);
    setIsProcessing(false);
    if (success) {
      onOpenChange(false);
      setAdminNotes("");
    }
  };

  const handleCancel = async () => {
    if (!onCancel) return;
    setIsProcessing(true);
    const success = await onCancel(request.id);
    setIsProcessing(false);
    if (success) {
      onOpenChange(false);
    }
  };

  const renderVariationChip = (variation: any) => {
    const src = variation.images?.[0];
    const label =
      variation.name ||
      [variation.color, variation.size].filter(Boolean).join(" · ");
    const qty = variation.quantity ?? 0;
    const qtyColor =
      qty <= 0 ? "text-red-600" : qty <= 5 ? "text-amber-700" : "text-zinc-500";
    const qtyLabel =
      qty <= 0 ? "out of stock" : qty <= 5 ? `${qty} left` : `${qty} in stock`;

    return (
      <div className='flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs'>
        {src ? (
          <img
            src={src}
            alt={label}
            className='h-6 w-6 flex-shrink-0 rounded-md object-cover border border-zinc-100'
            onError={(e) => {
              (e.target as HTMLImageElement).src = PlaceHolderImage;
            }}
          />
        ) : (
          <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border border-zinc-100 bg-zinc-50 text-[10px] font-semibold text-zinc-600'>
            {variation.size || variation.color?.slice(0, 1) || "?"}
          </div>
        )}
        <div className='flex flex-col'>
          <span className='font-semibold leading-tight text-zinc-900 whitespace-nowrap'>
            {label}
          </span>
          <span
            className={`font-medium leading-tight whitespace-nowrap ${qtyColor}`}>
            {qtyLabel}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-xl'>
              {getOperationTypeLabel(request.operationType)}
            </DialogTitle>
            {getStatusBadge(request.status)}
          </div>
          <DialogDescription>
            Request ID: <span className='font-mono text-xs'>{request.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Product Information */}
          {product && request.operationType === "product_delete" && (
            <div className='bg-muted/30 rounded-lg p-4 border border-muted'>
              <h3 className='font-semibold mb-3 flex items-center gap-2'>
                <Package className='w-4 h-4' />
                Product Details
              </h3>

              <div className='space-y-3'>
                {/* Product Header with Image */}
                <div className='flex gap-4'>
                  <div className='flex-shrink-0'>
                    <img
                      src={
                        product.thumbnail ||
                        product.images?.[0] ||
                        PlaceHolderImage
                      }
                      alt={product.title || product.name}
                      className='w-24 h-24 rounded-lg object-cover border border-zinc-200'
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PlaceHolderImage;
                      }}
                    />
                  </div>

                  <div className='flex-1 space-y-2'>
                    <div>
                      <Label className='text-xs text-muted-foreground'>
                        Product Name
                      </Label>
                      <div className='font-medium'>
                        {product.title || product.name}
                      </div>
                    </div>

                    <div className='grid grid-cols-3 gap-3 text-sm'>
                      <div>
                        <Label className='text-xs text-muted-foreground'>
                          SKU
                        </Label>
                        <div className='font-mono text-xs'>{product.sku}</div>
                      </div>
                      <div>
                        <Label className='text-xs text-muted-foreground'>
                          Price
                        </Label>
                        <div className='flex items-center gap-1'>
                          <DollarSign className='w-3 h-3' />
                          <span>{product.price}</span>
                        </div>
                      </div>
                      <div>
                        <Label className='text-xs text-muted-foreground'>
                          Stock
                        </Label>
                        <div className='flex items-center gap-1'>
                          <Box className='w-3 h-3' />
                          <span>{product.quantity}</span>
                        </div>
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-3 text-sm'>
                      {product.categoryName && (
                        <div>
                          <Label className='text-xs text-muted-foreground'>
                            Category
                          </Label>
                          <div>{product.categoryName}</div>
                        </div>
                      )}
                      {product.manufacturerName && (
                        <div>
                          <Label className='text-xs text-muted-foreground'>
                            Manufacturer
                          </Label>
                          <div>{product.manufacturerName}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Product Description */}
                {/* {product.description && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <div className="text-sm mt-1 line-clamp-3">{product.description}</div>
                  </div>
                )} */}

                {/* Product Variations */}
                {product.variations && product.variations.length > 0 && (
                  <div>
                    <Label className='text-xs text-muted-foreground mb-2 block'>
                      Variations ({product.variations.length})
                    </Label>
                    <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                      {product.variations.map((variation) => (
                        <div key={variation.id}>
                          {renderVariationChip(variation)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Images Gallery */}
                {product.images && product.images.length > 1 && (
                  <div>
                    <Label className='text-xs text-muted-foreground mb-2 flex items-center gap-1'>
                      <ImageIcon className='w-3 h-3' />
                      Product Images ({product.images.length})
                    </Label>
                    <div className='flex gap-2 overflow-x-auto pb-2'>
                      {product.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`${product.title || product.name} ${idx + 1}`}
                          className='w-16 h-16 rounded-md object-cover border border-zinc-200 flex-shrink-0'
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              PlaceHolderImage;
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Target Information */}
          <div className='bg-muted/50 rounded-lg p-4'>
            <h3 className='font-semibold mb-2'>Target Information</h3>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div>
                <span className='text-muted-foreground'>Type:</span>
                <span className='ml-2 font-medium'>{request.targetType}</span>
              </div>
              <div>
                <span className='text-muted-foreground'>ID:</span>
                <span className='ml-2 font-mono'>{request.targetId}</span>
              </div>
              <div className='col-span-2'>
                <span className='text-muted-foreground'>Name:</span>
                <span className='ml-2 font-medium'>{request.targetName}</span>
              </div>
            </div>
          </div>

          {/* Requester Information */}
          <div className='bg-muted/50 rounded-lg p-4'>
            <h3 className='font-semibold mb-2'>Requester Information</h3>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div className='flex items-center gap-2'>
                <User className='w-4 h-4 text-muted-foreground' />
                <span className='font-medium'>{request.requester}</span>
              </div>
              <div className='flex items-center gap-2'>
                <Calendar className='w-4 h-4 text-muted-foreground' />
                <span>
                  {formatDistanceToNow(new Date(request.requestedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className='col-span-2 text-xs text-muted-foreground'>
                Full date: {new Date(request.requestedAt).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Reason */}
          {request.reason && (
            <div>
              <Label className='text-sm font-medium'>Reason for Request</Label>
              <div className='mt-1 p-3 bg-muted/50 rounded-lg text-sm'>
                {request.reason}
              </div>
            </div>
          )}

          {/* Expiration */}
          {isPending && request.expiresAt && (
            <div className='flex items-center gap-2 text-sm'>
              <Clock
                className={`w-4 h-4 ${isExpiringSoon ? "text-orange-500" : "text-muted-foreground"}`}
              />
              <span
                className={
                  isExpiringSoon
                    ? "text-orange-600 font-medium"
                    : "text-muted-foreground"
                }>
                Expires:{" "}
                {formatDistanceToNow(new Date(request.expiresAt), {
                  addSuffix: true,
                })}
              </span>
              {isExpiringSoon && (
                <AlertCircle className='w-4 h-4 text-orange-500' />
              )}
            </div>
          )}

          {/* Admin Notes for Rejected */}
          {request.adminNotes && request.status === "rejected" && (
            <div>
              <Label className='text-sm font-medium text-red-700'>
                Admin Notes (Rejection Reason)
              </Label>
              <div className='mt-1 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700'>
                {request.adminNotes}
              </div>
            </div>
          )}

          {/* Processed By */}
          {request.approver &&
            (request.status === "approved" ||
              request.status === "rejected") && (
              <div className='text-sm'>
                <span className='text-muted-foreground'>Processed by: </span>
                <span className='font-medium'>{request.approver}</span>
                {request.actionAt && (
                  <span className='text-muted-foreground ml-2'>
                    (
                    {formatDistanceToNow(new Date(request.actionAt), {
                      addSuffix: true,
                    })}
                    )
                  </span>
                )}
              </div>
            )}

          {/* Admin Notes Input */}
          {isPending && canApproveReject && onReject && (
            <div>
              <Label htmlFor='adminNotes' className='text-sm font-medium'>
                Admin Notes (optional for rejection)
              </Label>
              <Textarea
                id='adminNotes'
                placeholder='Add notes explaining why this request is being rejected...'
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className='mt-1'
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter className='flex gap-2'>
          {isPending && (
            <>
              {canApproveReject && onApprove && onReject && (
                <>
                  <Button
                    variant='default'
                    className='bg-green-600 hover:bg-green-700'
                    onClick={handleApprove}
                    disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "Approve"}
                  </Button>
                  <Button
                    variant='destructive'
                    onClick={handleReject}
                    disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "Reject"}
                  </Button>
                </>
              )}

              {canCancel && onCancel && (
                <Button
                  variant='outline'
                  onClick={handleCancel}
                  disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Cancel Request"}
                </Button>
              )}
            </>
          )}

          <Button
            variant='ghost'
            onClick={() => {
              onOpenChange(false);
              setAdminNotes("");
            }}
            disabled={isProcessing}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
