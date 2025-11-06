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
} from "lucide-react";
import { IVariation } from "../interface";

interface ProductAdjustmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  productSku?: string;
  currentStock: number;
  hasVariation?: boolean;
  variations?: IVariation[];
  onSuccess?: () => void;
}

export const ProductAdjustmentDialog: React.FC<ProductAdjustmentSheetProps> = ({
  open,
  onOpenChange,
  productId,
  productName,
  productSku,
  currentStock,
  hasVariation,
  variations,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<IVariation | null>(
    null
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
      <SheetContent side='right' className='w-full sm:max-w-lg overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>Adjust Stock</SheetTitle>
          <SheetDescription>
            Make stock adjustments with mandatory audit trail
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className='space-y-4 mt-6'>
          {/* Product Info */}
          <div className='rounded-lg border p-4 bg-muted/50'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>{productName}</p>
                {productSku && !selectedVariation && (
                  <p className='text-sm text-muted-foreground'>
                    SKU: {productSku}
                  </p>
                )}
                {selectedVariation && (
                  <p className='text-sm text-muted-foreground'>
                    SKU: {selectedVariation.sku}
                  </p>
                )}
              </div>
              <Badge variant='outline' className='ml-2'>
                Current: {displayStock}
              </Badge>
            </div>
          </div>

          {/* Variation Selector - Only show if product has variations */}
          {variations && variations.length > 0 && (
            <div className='space-y-2'>
              <Label htmlFor='variation-select'>Select Variation *</Label>
              <Select
                value={selectedVariation?.id || ""}
                onValueChange={(value) => {
                  const variation = variations.find((v) => v.id === value);
                  setSelectedVariation(variation || null);
                }}
                disabled={isLoading}>
                <SelectTrigger id='variation-select'>
                  <SelectValue placeholder='Select a variation' />
                </SelectTrigger>
                <SelectContent>
                  {variations.map((variation) => (
                    <SelectItem key={variation.id} value={variation.id}>
                      <div className='flex items-center gap-2'>
                        <span>
                          {variation.name ||
                            `${variation.color || ""} ${
                              variation.size || ""
                            }`.trim()}
                        </span>
                        <Badge variant='secondary' className='text-xs'>
                          Stock: {variation.quantity}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedVariation && (
                <Alert className='py-2' variant={"destructive"}>
                  <AlertTriangle className='h-4 w-4' />
                  <AlertDescription className='text-sm '>
                    This product has variations. You must select a specific
                    variation to adjust its stock.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Adjustment Type */}
          <div className='space-y-2'>
            <Label htmlFor='adjustment-type'>Adjustment Type *</Label>
            <Select
              value={formData.adjustmentType}
              onValueChange={(value: AdjustmentType) =>
                setFormData({ ...formData, adjustmentType: value })
              }
              disabled={isLoading}>
              <SelectTrigger id='adjustment-type'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='add'>
                  <div className='flex items-center gap-2'>
                    <PackagePlus className='h-4 w-4 text-green-600' />
                    Add Stock
                  </div>
                </SelectItem>
                <SelectItem value='remove'>
                  <div className='flex items-center gap-2'>
                    <PackageMinus className='h-4 w-4 text-red-600' />
                    Remove Stock
                  </div>
                </SelectItem>
                <SelectItem value='set'>
                  <div className='flex items-center gap-2'>
                    <Package className='h-4 w-4 text-blue-600' />
                    Set Exact Stock
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className='space-y-2'>
            <Label htmlFor='quantity'>Quantity *</Label>
            <Input
              id='quantity'
              type='number'
              min='1'
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
          <div className='space-y-2'>
            <Label htmlFor='reason'>Reason * (min 5 characters)</Label>
            <Input
              id='reason'
              type='text'
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

          {/* Notes */}
          <div className='space-y-2'>
            <Label htmlFor='notes'>Additional Notes</Label>
            <Textarea
              id='notes'
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder='Optional: Add any additional information'
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Reference Number */}
          <div className='space-y-2'>
            <Label htmlFor='reference'>Reference Number</Label>
            <Input
              id='reference'
              type='text'
              value={formData.referenceNumber}
              onChange={(e) =>
                setFormData({ ...formData, referenceNumber: e.target.value })
              }
              placeholder='e.g., PO-2024-001, INV-12345'
              disabled={isLoading}
            />
            <p className='text-xs text-muted-foreground'>
              Optional: PO number, invoice number, etc.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <SheetFooter className='gap-2'>
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
