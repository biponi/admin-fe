import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "../../../components/ui/badge";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { cn } from "../../../lib/utils";
import {
  adjustProductStock,
  AdjustmentType,
} from "../../../api/productAdjustment";
import { useToast } from "../../../components/ui/use-toast";
import {
  PackagePlus,
  PackageMinus,
  Package,
  Loader2,
  AlertTriangle,
  ImageOff,
  FileText,
  Hash,
} from "lucide-react";
import { IVariation } from "../interface";
import useRoleCheck from "../../auth/hooks/useRoleCheck";

interface ProductAdjustmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  productSku?: string;
  productThumbnail?: string;
  currentStock: number;
  hasVariation?: boolean;
  variations?: IVariation[];
  onSuccess?: () => void;
}

const ADJUSTMENT_OPTIONS: {
  value: AdjustmentType;
  label: string;
  description: string;
  icon: React.ElementType;
  activeClass: string;
  iconClass: string;
}[] = [
  {
    value: "add",
    label: "Add",
    description: "Increase stock",
    icon: PackagePlus,
    activeClass:
      "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 ring-1 ring-emerald-500",
    iconClass: "text-emerald-600 dark:text-emerald-500",
  },
  {
    value: "remove",
    label: "Remove",
    description: "Decrease stock",
    icon: PackageMinus,
    activeClass:
      "border-red-500 bg-red-50 dark:bg-red-950/30 ring-1 ring-red-500",
    iconClass: "text-red-600 dark:text-red-500",
  },
  {
    value: "set",
    label: "Set",
    description: "Exact amount",
    icon: Package,
    activeClass:
      "border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-500",
    iconClass: "text-blue-600 dark:text-blue-500",
  },
];

export const ProductAdjustmentDialog: React.FC<ProductAdjustmentSheetProps> = ({
  open,
  onOpenChange,
  productId,
  productName,
  productSku,
  productThumbnail,
  currentStock,
  hasVariation,
  variations,
  onSuccess,
}) => {
  const { toast } = useToast();
  const { hasRequiredPermission } = useRoleCheck();

  const canIncreaseStock = hasRequiredPermission("product", "store_increase");
  const canDecreaseStock = hasRequiredPermission("product", "store_decrease");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<IVariation | null>(
    null,
  );

  const [formData, setFormData] = useState({
    adjustmentType: "add" as AdjustmentType,
    quantity: "",
    reason: "",
    notes: "",
    referenceNumber: "",
  });

  // Get current stock based on whether a variation is selected
  const displayStock = selectedVariation
    ? selectedVariation.quantity
    : currentStock;

  const displayImage = selectedVariation
    ? typeof selectedVariation.images?.[0] === "string"
      ? selectedVariation.images[0]
      : productThumbnail
    : productThumbnail;

  const displayName = selectedVariation?.name || productName;
  const displaySku = selectedVariation?.sku || productSku;

  const isLowStock = displayStock > 0 && displayStock <= 5;
  const isOutOfStock = displayStock <= 0;

  // Reset form when sheet opens or closes
  useEffect(() => {
    if (!open) {
      // Reset form when sheet closes
      setFormData({
        adjustmentType: "add",
        quantity: "",
        reason: "",
        notes: "",
        referenceNumber: "",
      });
      setSelectedVariation(null);
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate variation selection for products with variations
    if (variations && variations.length > 0 && !selectedVariation) {
      toast({
        variant: "destructive",
        title: "Variation Required",
        description: "Please select a variation before adjusting stock",
      });
      return;
    }

    // Validate reason field
    if (formData.reason.length < 5) {
      toast({
        variant: "destructive",
        title: "Invalid Reason",
        description: "Reason must be at least 5 characters long",
      });
      return;
    }

    // Validate permission for adjustment type
    if (formData.adjustmentType === "add" && !canIncreaseStock) {
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "You don't have permission to increase stock",
      });
      return;
    }
    if (formData.adjustmentType === "remove" && !canDecreaseStock) {
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "You don't have permission to decrease stock",
      });
      return;
    }

    // Validate quantity
    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Quantity",
        description: "Quantity must be greater than 0",
      });
      return;
    }

    // Validate that stock won't go negative
    const currentQty = displayStock;
    if (formData.adjustmentType === "remove" && quantity > currentQty) {
      toast({
        variant: "destructive",
        title: "Invalid Quantity",
        description: `Cannot remove ${quantity} units. Only ${currentQty} units available in stock.`,
      });
      return;
    }

    if (formData.adjustmentType === "set" && quantity < 0) {
      toast({
        variant: "destructive",
        title: "Invalid Quantity",
        description: "Stock quantity cannot be negative",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await adjustProductStock({
        productId,
        variationId: selectedVariation?.id,
        adjustmentType: formData.adjustmentType,
        quantity: quantity,
        reason: formData.reason,
        notes: formData.notes || undefined,
        referenceNumber: formData.referenceNumber || undefined,
      });

      if (!response.success || !response.data) {
        const errorMsg = response.error || "Failed to adjust product stock";
        setError(errorMsg);
        toast({
          variant: "destructive",
          title: "Adjustment Failed",
          description: errorMsg,
        });
        return;
      }

      const result = response.data;

      toast({
        title: "Stock Adjusted Successfully",
        description: `${productName} stock updated from ${result.product.oldQuantity} to ${result.product.newQuantity}`,
      });

      // Reset form
      setFormData({
        adjustmentType: "add",
        quantity: "",
        reason: "",
        notes: "",
        referenceNumber: "",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      const errorMsg = err.message || "An unexpected error occurred";
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      adjustmentType: "add",
      quantity: "",
      reason: "",
      notes: "",
      referenceNumber: "",
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='w-full sm:max-w-lg overflow-y-auto p-0'>
        {/* Header */}
        <SheetHeader className='px-6 py-4 border-b bg-muted/30'>
          <SheetTitle className='text-lg font-semibold tracking-tight'>
            Adjust Stock
          </SheetTitle>
          <SheetDescription className='text-sm'>
            Make stock adjustments with a mandatory audit trail
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className='px-4 py-5 space-y-2'>
          {/* Product Info Card */}
          <div className='rounded-xl border bg-card shadow-sm px-3.5 relative h-[75px]'>
            <div className='flex items-center gap-3.5 pl-[72px]'>
              {/* Product Image — larger, clearer preview */}
              <div
                className={cn(
                  "shrink-0",
                  "absolute top-0 left-0 h-full w-[72px]",
                )}>
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={displayName}
                    className='w-[72px] h-[75px] rounded-xl object-cover border shadow-sm ring-1 ring-black/5'
                  />
                ) : (
                  <div className='w-[72px] h-[75px] rounded-xl bg-muted border flex items-center justify-center'>
                    <ImageOff className='w-6 h-6 text-muted-foreground' />
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className='flex-1 min-w-0 space-y-0.5 py-1'>
                <p className='font-semibold leading-tight truncate text-sm'>
                  {displayName}
                </p>
                {displaySku && (
                  <p className='text-xs text-muted-foreground font-mono'>
                    SKU: {displaySku}
                  </p>
                )}
                <div className='pt-0.5'>
                  <Badge
                    variant='outline'
                    className={cn(
                      "font-medium",
                      isOutOfStock &&
                        "border-red-300 text-red-700 bg-red-50 dark:bg-red-950/30 dark:text-red-400",
                      isLowStock &&
                        "border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400",
                    )}>
                    {isOutOfStock
                      ? "Out of stock"
                      : `In stock: ${displayStock}`}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Variation Selector - Only show if product has variations */}
          {variations && variations.length > 0 && (
            <div className='space-y-1.5'>
              <Label htmlFor='variation-select'>Select Variation *</Label>
              <Select
                value={selectedVariation?.id || ""}
                onValueChange={(value) => {
                  const variation = variations.find((v) => v.id === value);
                  setSelectedVariation(variation || null);
                }}
                disabled={isLoading}>
                <SelectTrigger id='variation-select' className='h-12'>
                  <SelectValue placeholder='Select a variation' />
                </SelectTrigger>
                <SelectContent>
                  {variations.map((variation) => {
                    // Get variant image
                    const variantImage =
                      variation.images && variation.images.length > 0
                        ? typeof variation.images[0] === "string"
                          ? variation.images[0]
                          : productThumbnail
                        : productThumbnail;

                    return (
                      <SelectItem
                        key={variation.id}
                        value={variation.id}
                        className='py-2'>
                        <div className='flex items-center gap-3'>
                          {/* Variant Image */}
                          {variantImage ? (
                            <img
                              src={variantImage}
                              alt={
                                variation.name ||
                                `${variation.color || ""} ${variation.size || ""}`.trim()
                              }
                              className='w-10 h-10 rounded-lg object-cover border shrink-0'
                            />
                          ) : (
                            <div className='w-10 h-10 rounded-lg bg-muted border flex items-center justify-center shrink-0'>
                              <Package className='w-4 h-4 text-muted-foreground' />
                            </div>
                          )}
                          <span className='truncate'>
                            {variation.name ||
                              `${variation.color || ""} ${
                                variation.size || ""
                              }`.trim()}
                          </span>
                          <Badge
                            variant='secondary'
                            className='text-xs shrink-0 ml-auto'>
                            Stock: {variation.quantity}
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {!selectedVariation && (
                <Alert className='py-2' variant={"destructive"}>
                  <AlertTriangle className='h-4 w-4' />
                  <AlertDescription className='text-sm'>
                    This product has variations. You must select a specific
                    variation to adjust its stock.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Adjustment Type — segmented cards instead of a plain dropdown */}
          <div className='space-y-1.5'>
            <Label>Adjustment Type *</Label>
            <div className='grid grid-cols-3 gap-2'>
              {ADJUSTMENT_OPTIONS.map((option) => {
                const Icon = option.icon;
                const disabled =
                  option.value === "add"
                    ? !canIncreaseStock
                    : option.value === "remove"
                      ? !canDecreaseStock
                      : !canIncreaseStock || !canDecreaseStock;
                const isActive = formData.adjustmentType === option.value;

                return (
                  <button
                    key={option.value}
                    type='button'
                    disabled={disabled || isLoading}
                    onClick={() =>
                      setFormData({ ...formData, adjustmentType: option.value })
                    }
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2.5 text-sm transition-all",
                      "disabled:opacity-40 disabled:cursor-not-allowed",
                      isActive
                        ? option.activeClass
                        : "border-border hover:bg-muted/60",
                    )}>
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        isActive ? option.iconClass : "text-muted-foreground",
                      )}
                    />
                    <span
                      className={cn(
                        "font-medium leading-none",
                        isActive && option.iconClass,
                      )}>
                      {option.label}
                    </span>
                    <span className='text-[11px] text-muted-foreground leading-none'>
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div className='space-y-1.5'>
            <Label htmlFor='quantity'>Quantity *</Label>
            <Input
              id='quantity'
              type='number'
              min='1'
              className='h-10'
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              placeholder='Enter quantity'
              required
              disabled={isLoading}
            />
          </div>

          {/* Reason */}
          <div className='space-y-1.5'>
            <Label htmlFor='reason'>Reason * (min 5 characters)</Label>
            <Input
              id='reason'
              type='text'
              className='h-10'
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              placeholder='e.g., Received new stock from supplier XYZ'
              minLength={5}
              required
              disabled={isLoading}
            />
            <p className='text-xs text-muted-foreground'>
              Provide a clear reason for this adjustment
            </p>
          </div>

          {/* Additional Details — grouped, optional info */}
          <div className='rounded-xl border bg-muted/20 overflow-hidden'>
            <div className='px-3.5 py-2 border-b bg-muted/40'>
              <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                Additional Details
                <span className='ml-1.5 normal-case font-normal text-muted-foreground/70'>
                  (optional)
                </span>
              </p>
            </div>

            <div className='p-3.5 space-y-3.5'>
              <div className='space-y-1.5'>
                <Label
                  htmlFor='reference'
                  className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
                  <Hash className='h-3.5 w-3.5' />
                  Reference Number
                </Label>
                <Input
                  id='reference'
                  type='text'
                  className='h-10 bg-background'
                  value={formData.referenceNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      referenceNumber: e.target.value,
                    })
                  }
                  placeholder='e.g., PO-2024-001, INV-12345'
                  disabled={isLoading}
                />
              </div>

              <div className='space-y-1.5'>
                <Label
                  htmlFor='notes'
                  className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground'>
                  <FileText className='h-3.5 w-3.5' />
                  Notes
                </Label>
                <Textarea
                  id='notes'
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder='Add any additional context for this adjustment'
                  rows={2}
                  disabled={isLoading}
                  className='resize-none bg-background'
                />
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <SheetFooter className='gap-2 pt-3 absolute bg-background/95 backdrop-blur -mx-6 px-6 pb-5 border-t mt-auto bottom-0 w-full'>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isLoading ? "Adjusting..." : "Adjust Stock"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
