/**
 * ReturnOrderSheet Component
 * Modern sheet component for processing order returns
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Package,
  AlertTriangle,
  CheckCircle2,
  Minus,
  Plus,
  Calculator,
  Loader2,
  XOctagon,
  ShoppingBag,
  FileText,
  User,
  Wrench,
  HelpCircle,
  Check,
  Receipt,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Separator } from "../../../components/ui/separator";
import { Textarea } from "../../../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { useToast } from "../../../components/ui/use-toast";
import { returnProducts } from "../../../api/order";
import type { IOrder } from "../types";
import { formatCurrency } from "../lib/utils";

interface ReturnOrderSheetProps {
  order: IOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Variation {
  id: string;
  color?: string;
  size?: string;
}

interface SelectedProduct {
  productId: string;
  hasVariation: boolean;
  variation?: Variation | null;
  quantity: number;
}

// Restrained, single-hue-per-reason accent system — legible at a glance,
// without turning the grid into a box of crayons.
const validReturnReasons = [
  {
    value: "defective",
    label: "Defective product",
    description: "Not working as intended",
    icon: XOctagon,
    accent: "#DC2626",
    accentSoft: "#FEF2F2",
  },
  {
    value: "wrong_item",
    label: "Wrong item sent",
    description: "Different from what was ordered",
    icon: ShoppingBag,
    accent: "#EA580C",
    accentSoft: "#FFF7ED",
  },
  {
    value: "not_as_described",
    label: "Not as described",
    description: "Differs from the listing",
    icon: FileText,
    accent: "#CA8A04",
    accentSoft: "#FEFCE8",
  },
  {
    value: "customer_request",
    label: "Customer request",
    description: "Changed their mind",
    icon: User,
    accent: "#2563EB",
    accentSoft: "#EFF6FF",
  },
  {
    value: "damaged",
    label: "Damaged in transit",
    description: "Arrived damaged",
    icon: Wrench,
    accent: "#7C3AED",
    accentSoft: "#F5F3FF",
  },
  {
    value: "other",
    label: "Other",
    description: "Not listed above",
    icon: HelpCircle,
    accent: "#475569",
    accentSoft: "#F8FAFC",
  },
];

export const ReturnOrderSheet: React.FC<ReturnOrderSheetProps> = ({
  order,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    [],
  );
  const [returnReason, setReturnReason] = useState("");
  const [returnReasonDetails, setReturnReasonDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Workaround: Radix UI Sheet/Dialog leaves orphaned portal overlays in the DOM
  // after close. Clean them up after the close animation completes (400ms).
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        document.querySelectorAll('[data-radix-portal]').forEach((portal) => {
          if (!portal.querySelector('[data-state="open"]')) {
            portal.remove();
          }
        });
        document.body.style.pointerEvents = "";
        document.querySelectorAll("[aria-hidden='true']").forEach((el) => {
          el.removeAttribute("aria-hidden");
        });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const getVariationData = (product: any) => {
    const v = product.variation || product.variant;
    if (v && (v.size || v.color)) return v;
    return null;
  };

  const handleProductSelection = (
    productId: string,
    variationId: string | null,
    quantity: number,
  ) => {
    setSelectedProducts((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === productId &&
          (!item.variation || item.variation.id === variationId),
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex].quantity = quantity;
        return updated;
      }

      return [
        ...prev,
        {
          productId,
          hasVariation: !!variationId,
          variation: variationId ? { id: variationId } : null,
          quantity,
        },
      ];
    });
  };

  const getTotalRefundAmount = () => {
    if (!order) return 0;
    return selectedProducts.reduce((total, selectedProduct) => {
      const product = order.products.find(
        (p) =>
          p.productId === selectedProduct.productId &&
          (!selectedProduct.variation ||
            p.variation?.id === selectedProduct.variation?.id),
      );
      if (product) {
        const unitPrice = product.totalPrice / product.quantity;
        return total + unitPrice * selectedProduct.quantity;
      }
      return total;
    }, 0);
  };

  const handleQuantityChange = (
    productId: string,
    variationId: string | null,
    newQuantity: number,
  ) => {
    if (!order) return;

    const product = order.products.find(
      (p) =>
        p.productId === productId &&
        (!variationId || p.variation?.id === variationId),
    );

    if (!product) return;

    if (newQuantity < 0) {
      toast({
        variant: "destructive",
        title: "Invalid quantity",
        description: "Quantity cannot be negative",
      });
      return;
    }

    if (newQuantity > product.quantity) {
      toast({
        variant: "destructive",
        title: "Exceeds available quantity",
        description: `Maximum quantity available is ${product.quantity}`,
      });
      return;
    }

    if (newQuantity === 0) {
      setSelectedProducts((prev) =>
        prev.filter(
          (item) =>
            !(
              item.productId === productId &&
              (!item.variation || item.variation.id === variationId)
            ),
        ),
      );
    } else {
      handleProductSelection(productId, variationId, newQuantity);
    }
  };

  const handleSubmit = async () => {
    if (!order) return;

    if (selectedProducts.length === 0) {
      toast({
        variant: "destructive",
        title: "No products selected",
        description: "Please select at least one product to return",
      });
      return;
    }

    if (!returnReason) {
      toast({
        variant: "destructive",
        title: "Return reason required",
        description: "Please select a reason for the return",
      });
      return;
    }

    if (!returnReasonDetails.trim()) {
      toast({
        variant: "destructive",
        title: "Return details required",
        description: "Please provide details about the return",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await returnProducts({
        orderId: order.id,
        products: selectedProducts,
        returnReason,
        returnReasonDetails: returnReasonDetails.trim(),
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to process return");
      }

      toast({
        title: "Return processed successfully",
        description: `Refund amount: ${formatCurrency(
          result.data?.refundAmount ?? 0,
        )}`,
      });

      setSelectedProducts([]);
      setReturnReason("");
      setReturnReasonDetails("");
      onOpenChange(false);
      setTimeout(() => onSuccess?.(), 350);
    } catch (error: any) {
      console.error("Error processing return:", error);
      toast({
        variant: "destructive",
        title: "Return failed",
        description:
          error.response?.data?.message ||
          "Failed to process return. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedProducts([]);
    setReturnReason("");
    setReturnReasonDetails("");
    onOpenChange(false);
  };

  if (!order) return null;

  const totalItemsSelected = selectedProducts.reduce(
    (sum, p) => sum + p.quantity,
    0,
  );

  return (
    <Sheet open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setSelectedProducts([]);
        setReturnReason("");
        setReturnReasonDetails("");
      }
      onOpenChange(isOpen);
    }}>
      <SheetContent className='sm:max-w-2xl overflow-hidden flex flex-col p-0 gap-0'>
        {/* Header */}
        <SheetHeader className='px-6 pt-6 pb-5 border-b border-gray-100 space-y-0'>
          <SheetTitle className='flex items-center gap-3 text-gray-900'>
            <div className='w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shadow-sm'>
              <RotateCcw className='w-[18px] h-[18px] text-white' />
            </div>
            <div className='flex flex-col'>
              <span className='text-base font-semibold leading-tight'>
                Process return
              </span>
              <SheetDescription className='text-xs text-gray-500 mt-0.5'>
                Order #{order.orderNumber}
              </SheetDescription>
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className='flex-1 w-full'>
          <div className='px-6 py-5'>
            {order?.products?.length < 1 ? (
              <Alert className='border-amber-200 bg-amber-50/60'>
                <AlertTriangle className='h-4 w-4 text-amber-600' />
                <AlertDescription className='text-amber-800'>
                  No products found in this order to return.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Return Reason Selection */}
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <Label className='text-[13px] font-semibold text-gray-900 tracking-wide uppercase'>
                      Return reason
                    </Label>
                    <span className='text-xs text-gray-400'>Required</span>
                  </div>

                  <RadioGroup
                    value={returnReason}
                    onValueChange={setReturnReason}
                    className='grid grid-cols-2 gap-2.5'>
                    {validReturnReasons.map((reason) => {
                      const Icon = reason.icon;
                      const isSelected = returnReason === reason.value;
                      return (
                        <motion.div
                          key={reason.value}
                          whileTap={{ scale: 0.98 }}
                          className='relative'>
                          <RadioGroupItem
                            value={reason.value}
                            id={reason.value}
                            className='sr-only'
                          />
                          <label
                            htmlFor={reason.value}
                            style={
                              isSelected
                                ? {
                                    borderColor: reason.accent,
                                    backgroundColor: reason.accentSoft,
                                  }
                                : undefined
                            }
                            className='flex items-start gap-2.5 px-3 py-2.5 rounded-lg border bg-white border-gray-200 cursor-pointer transition-colors duration-150 hover:border-gray-300'>
                            <div
                              style={{
                                backgroundColor: isSelected
                                  ? reason.accent
                                  : "#F1F5F9",
                              }}
                              className='w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-colors duration-150'>
                              <Icon
                                className='h-3.5 w-3.5'
                                style={{
                                  color: isSelected ? "#fff" : "#64748B",
                                }}
                              />
                            </div>
                            <div className='flex-1 min-w-0 pt-0.5'>
                              <div className='text-[13px] font-medium text-gray-900 leading-tight'>
                                {reason.label}
                              </div>
                              <div className='text-[11px] text-gray-500 mt-0.5 leading-snug'>
                                {reason.description}
                              </div>
                            </div>
                            <AnimatePresence>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  style={{ backgroundColor: reason.accent }}
                                  className='w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                                  <Check
                                    className='h-2.5 w-2.5 text-white'
                                    strokeWidth={3}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </label>
                        </motion.div>
                      );
                    })}
                  </RadioGroup>
                </div>

                {/* Return Details */}
                <div className='space-y-2 mt-5'>
                  <Label
                    htmlFor='returnReasonDetails'
                    className='text-[13px] font-semibold text-gray-900 tracking-wide uppercase'>
                    Additional details <span className='text-red-500'>*</span>
                  </Label>
                  <Textarea
                    id='returnReasonDetails'
                    placeholder='Describe the issue — what’s damaged, what was expected, etc.'
                    value={returnReasonDetails}
                    onChange={(e) => setReturnReasonDetails(e.target.value)}
                    className='min-h-[76px] resize-none text-sm border-gray-200 focus-visible:ring-gray-900/10'
                    disabled={isSubmitting}
                  />
                </div>

                <Separator className='my-5 bg-gray-100' />

                {/* Products Selection Header */}
                <div className='flex items-center justify-between mb-2.5'>
                  <div className='flex items-center gap-2'>
                    <Package className='h-4 w-4 text-gray-500' />
                    <h3 className='text-[13px] font-semibold text-gray-900 tracking-wide uppercase'>
                      Products
                    </h3>
                  </div>
                  <button
                    type='button'
                    onClick={() => {
                      order.products.forEach((product) => {
                        const v = getVariationData(product);
                        handleQuantityChange(
                          product.productId,
                          v ? v.id : null,
                          product.quantity,
                        );
                      });
                    }}
                    className='text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors'>
                    Select all
                  </button>
                </div>

                {/* Products List */}
                <div className='rounded-lg border border-gray-200 overflow-hidden bg-white'>
                  {/* Table Header */}
                  <div className='grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50/80 border-b border-gray-100 text-[11px] font-medium text-gray-500 uppercase tracking-wide'>
                    <div className='col-span-5'>Product</div>
                    <div className='col-span-2 text-center'>Available</div>
                    <div className='col-span-3 text-center'>Return qty</div>
                    <div className='col-span-2 text-right'>Refund</div>
                  </div>

                  {/* Table Body */}
                  <div className='divide-y divide-gray-100'>
                    {order.products.map((product, index) => {
                      const variationData = getVariationData(product);
                      const hasVariationData = variationData !== null;

                      const selectedProduct = selectedProducts.find(
                        (sp) =>
                          sp.productId === product.productId &&
                          (!sp.variation ||
                            sp.variation.id === variationData?.id),
                      );
                      const returnQuantity = selectedProduct?.quantity || 0;
                      const unitPrice = product.totalPrice / product.quantity;
                      const refundAmount = unitPrice * returnQuantity;
                      const isActive = returnQuantity > 0;

                      return (
                        <motion.div
                          key={`${product.productId}-${
                            variationData?.id || "no-variant"
                          }`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.02 }}
                          className={`grid grid-cols-12 gap-2 px-3 py-2.5 items-center transition-colors duration-150 ${
                            isActive ? "bg-emerald-50/40" : "hover:bg-gray-50"
                          }`}>
                          {/* Product Name & Variation */}
                          <div className='col-span-5 flex items-center gap-2.5 min-w-0'>
                            <div className='w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0'>
                              <Package className='w-3.5 h-3.5 text-gray-500' />
                            </div>
                            <div className='flex-1 min-w-0'>
                              <div className='text-[13px] font-medium text-gray-900 truncate'>
                                {product.name}
                              </div>
                              {hasVariationData && (
                                <div className='flex items-center gap-1 mt-0.5'>
                                  {variationData.color && (
                                    <span className='text-[10px] px-1.5 py-[1px] bg-blue-50 text-blue-600 rounded'>
                                      {variationData.color}
                                    </span>
                                  )}
                                  {variationData.size && (
                                    <span className='text-[10px] px-1.5 py-[1px] bg-purple-50 text-purple-600 rounded'>
                                      {variationData.size}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Available Quantity */}
                          <div className='col-span-2 flex items-center justify-center'>
                            <span className='text-xs font-medium text-gray-500 tabular-nums'>
                              {product.quantity} pcs
                            </span>
                          </div>

                          {/* Return Quantity Controls */}
                          <div className='col-span-3 flex items-center justify-center gap-1'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                handleQuantityChange(
                                  product.productId,
                                  hasVariationData
                                    ? variationData?.id || null
                                    : null,
                                  Math.max(0, returnQuantity - 1),
                                )
                              }
                              disabled={returnQuantity <= 0}
                              className='h-7 w-7 p-0 border-gray-200'>
                              <Minus className='w-3 h-3' />
                            </Button>

                            <Input
                              type='number'
                              value={returnQuantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                handleQuantityChange(
                                  product.productId,
                                  hasVariationData
                                    ? variationData?.id || null
                                    : null,
                                  val,
                                );
                              }}
                              min='0'
                              max={product.quantity}
                              className='text-center h-7 w-11 text-xs font-semibold p-0 tabular-nums border-gray-200'
                            />

                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                handleQuantityChange(
                                  product.productId,
                                  hasVariationData
                                    ? variationData?.id || null
                                    : null,
                                  Math.min(
                                    product.quantity,
                                    returnQuantity + 1,
                                  ),
                                )
                              }
                              disabled={returnQuantity >= product.quantity}
                              className='h-7 w-7 p-0 border-gray-200'>
                              <Plus className='w-3 h-3' />
                            </Button>
                          </div>

                          {/* Refund Amount */}
                          <div className='col-span-2 flex items-center justify-end'>
                            {isActive ? (
                              <span className='text-xs font-semibold text-emerald-600 tabular-nums'>
                                {formatCurrency(refundAmount)}
                              </span>
                            ) : (
                              <span className='text-gray-300 text-xs'>—</span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className='px-3 py-2 bg-gray-50/80 border-t border-gray-100'>
                    <span className='text-[11px] text-gray-500'>
                      {order.products.length} product
                      {order.products.length !== 1 ? "s" : ""} in this order
                    </span>
                  </div>
                </div>

                {/* Summary */}
                <AnimatePresence>
                  {selectedProducts.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className='mt-4 overflow-hidden'>
                      <div className='rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3.5 flex items-center justify-between'>
                        <div className='flex items-center gap-2.5'>
                          <div className='w-8 h-8 rounded-md bg-emerald-600 flex items-center justify-center flex-shrink-0'>
                            <Calculator className='w-4 h-4 text-white' />
                          </div>
                          <div>
                            <div className='text-[13px] font-semibold text-emerald-900 leading-tight'>
                              Expected refund
                            </div>
                            <div className='text-[11px] text-emerald-700/80 mt-0.5'>
                              {totalItemsSelected} item
                              {totalItemsSelected !== 1 ? "s" : ""} selected
                            </div>
                          </div>
                        </div>
                        <span className='text-lg font-bold text-emerald-700 tabular-nums'>
                          {formatCurrency(getTotalRefundAmount())}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <SheetFooter className='px-6 py-4 border-t border-gray-100 bg-white gap-2 sm:gap-2'>
          <div className='flex items-center gap-2 mr-auto text-xs text-gray-400'>
            <Receipt className='w-3.5 h-3.5' />
            <span>
              {selectedProducts.length > 0
                ? `${totalItemsSelected} item${
                    totalItemsSelected !== 1 ? "s" : ""
                  } · ${formatCurrency(getTotalRefundAmount())}`
                : "No items selected"}
            </span>
          </div>
          <Button
            variant='outline'
            onClick={handleClose}
            disabled={isSubmitting}
            className='border-gray-200'>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              selectedProducts.length === 0 ||
              !returnReason ||
              !returnReasonDetails.trim() ||
              isSubmitting
            }
            className='bg-gray-900 hover:bg-gray-800 text-white shadow-sm'>
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Processing…
              </>
            ) : (
              <>
                <CheckCircle2 className='mr-2 h-4 w-4' />
                Process return
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
