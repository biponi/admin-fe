import { useState, useEffect } from "react";
import { OperationRequest } from "../hooks/useOperationRequests";
import { useProductData, ProductData } from "../hooks/useProductData";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, User, AlertCircle, CheckCircle, XCircle, Ban, Hourglass, Package, DollarSign, Box } from "lucide-react";
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

const getStatusBadge = (status: OperationRequest["status"]) => {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    case "approved":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          <Ban className="w-3 h-3 mr-1" />
          Cancelled
        </Badge>
      );
    case "timeout_expired":
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          <Hourglass className="w-3 h-3 mr-1" />
          Timeout Expired
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
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
      return operationType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }
};

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
  const { fetchProduct, getProduct, isLoading } = useProductData();
  const [product, setProduct] = useState<ProductData | null>(null);

  const isPending = request.status === "pending";
  const isExpiringSoon =
    isPending &&
    request.expiresAt &&
    new Date(request.expiresAt) < new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const canApproveReject = (canApprove && canReject) && isPending;
  const canCancel = isCurrentUserRequest && isPending;

  // Fetch product data for product_delete requests
  useEffect(() => {
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
  }, [request.operationType, request.targetId, fetchProduct, getProduct]);

  // Debug logging
  console.log("=== RequestCard Debug ===", {
    requestId: request.id,
    status: request.status,
    isPending,
    canApprove,
    canReject,
    isCurrentUserRequest,
    showActions,
    canApproveReject,
    canCancel,
    hasOnApprove: !!onApprove,
    hasOnReject: !!onReject,
    hasOnCancel: !!onCancel,
    productLoaded: !!product,
  });

  // Render product variation chip
  const renderVariationChip = (variation: any) => {
    const src = variation.images?.[0];
    const label = variation.name || [variation.color, variation.size].filter(Boolean).join(" · ");
    const qty = variation.quantity ?? 0;
    const qtyColor = qty <= 0 ? "text-red-600" : qty <= 5 ? "text-amber-700" : "text-zinc-500";
    const qtyLabel = qty <= 0 ? "out of stock" : qty <= 5 ? `${qty} left` : `${qty} in stock`;

    return (
      <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs">
        {src ? (
          <img
            src={src}
            alt={label}
            className="h-6 w-6 flex-shrink-0 rounded-md object-cover border border-zinc-100"
            onError={(e) => {
              (e.target as HTMLImageElement).src = PlaceHolderImage;
            }}
          />
        ) : (
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border border-zinc-100 bg-zinc-50 text-[10px] font-semibold text-zinc-600">
            {variation.size || variation.color?.slice(0, 1) || "?"}
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-semibold leading-tight text-zinc-900 whitespace-nowrap">{label}</span>
          <span className={`font-medium leading-tight whitespace-nowrap ${qtyColor}`}>{qtyLabel}</span>
        </div>
      </div>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {getOperationTypeLabel(request.operationType)}
              {isExpiringSoon && (
                <AlertCircle className="w-4 h-4 text-orange-500" title="Expiring soon" />
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Target: <span className="font-medium">{request.targetName}</span>
            </p>
          </div>
          {getStatusBadge(request.status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        {/* Product Information */}
        {product && request.operationType === "product_delete" && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-3">
              {/* Product Image */}
              <div className="flex-shrink-0">
                <img
                  src={product.thumbnail || product.images?.[0] || PlaceHolderImage}
                  alt={product.title || product.name}
                  className="w-16 h-16 rounded-lg object-cover border border-zinc-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PlaceHolderImage;
                  }}
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="font-medium text-sm truncate">{product.title || product.name}</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    <span className="font-mono">{product.sku}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span>৳{product.price}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Box className="w-3 h-3" />
                    <span>Stock: {product.quantity}</span>
                  </div>
                  {product.categoryName && (
                    <div className="truncate">{product.categoryName}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Variations */}
            {product.variations && product.variations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.variations.slice(0, 3).map((variation) => (
                  <div key={variation.id}>{renderVariationChip(variation)}</div>
                ))}
                {product.variations.length > 3 && (
                  <div className="text-xs text-muted-foreground self-center">
                    +{product.variations.length - 3} more
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Request Info */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-4 h-4" />
            <span className="truncate">{request.requester}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })}</span>
          </div>
        </div>

        {request.reason && (
          <div className="text-sm">
            <span className="text-muted-foreground">Reason: </span>
            <span className="line-clamp-2">{request.reason}</span>
          </div>
        )}

        {isPending && request.expiresAt && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className={isExpiringSoon ? "text-orange-600 font-medium" : "text-muted-foreground"}>
              Expires {formatDistanceToNow(new Date(request.expiresAt), { addSuffix: true })}
            </span>
          </div>
        )}

        {request.adminNotes && request.status === "rejected" && (
          <div className="text-sm bg-red-50 border border-red-200 rounded-md p-2 mt-2">
            <span className="font-medium text-red-700">Admin Notes: </span>
            <span className="text-red-600">{request.adminNotes}</span>
          </div>
        )}

        {request.approver && (request.status === "approved" || request.status === "rejected") && (
          <div className="text-sm text-muted-foreground">
            Processed by <span className="font-medium">{request.approver}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onViewDetails(request)}
        >
          View Details
        </Button>

        {showActions && isPending && (
          <>
            {canApproveReject && onApprove && onReject && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => onApprove(request.id)}
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => onReject(request.id)}
                >
                  Reject
                </Button>
              </>
            )}

            {canCancel && onCancel && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onCancel(request.id)}
              >
                Cancel
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};
