import React, { useState } from "react";
import { IOrder } from "./interface";
import { returnProducts } from "../../api/order";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Separator } from "../../components/ui/separator";
import {
  RadioGroup,
  RadioGroupItem,
} from "../../components/ui/radio-group";
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  Minus,
  Plus,
  Calculator,
  XOctagon,
  ShoppingBag,
  FileText,
  User,
  Wrench,
  HelpCircle,
  Check,
  Receipt,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { ButtonLoadingText } from "@/components/loaders";
import PlaceHolderImage from "../../assets/placeholder.svg";
import { formatCurrency } from "../order-v2/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Define types
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

interface AdjustReturnProductProps {
  order: IOrder;
  handleClose: () => void;
}

// Restrained, single-hue-per-reason accent system — legible at a glance,
// without turning the grid into a box of crayons. (matches order-v2's ReturnOrderSheet)
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

const AdjustReturnProduct: React.FC<AdjustReturnProductProps> = ({
  order,
  handleClose,
}) => {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );
  const [returnReason, setReturnReason] = useState("");
  const [returnReasonDetails, setReturnReasonDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProductSelection = (
    productId: string,
    variationId: string | null,
    quantity: number
  ) => {
    setSelectedProducts((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === productId &&
          (!item.variation || item.variation.id === variationId)
      );

      if (existingIndex !== -1) {
        // Update quantity for existing product/variation
        const updated = [...prev];
        updated[existingIndex].quantity = quantity;
        return updated;
      }

      // Add new product/variation
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
    return selectedProducts.reduce((total, selectedProduct) => {
      const product = order.products.find(p =>
        p.productId === selectedProduct.productId &&
        (!selectedProduct.variation || p.variation?.id === selectedProduct.variation?.id)
      );
      if (product) {
        const unitPrice = product.totalPrice / product.quantity;
        return total + (unitPrice * selectedProduct.quantity);
      }
      return total;
    }, 0);
  };

  const handleQuantityChange = (productId: string, variationId: string | null, newQuantity: number) => {
    const product = order.products.find(p =>
      p.productId === productId &&
      (!variationId || p.variation?.id === variationId)
    );

    if (!product) return;

    if (newQuantity < 0) {
      toast.error('Quantity cannot be negative');
      return;
    }

    if (newQuantity > product.quantity) {
      toast.error(`Maximum quantity available is ${product.quantity}`);
      return;
    }

    if (newQuantity === 0) {
      setSelectedProducts(prev =>
        prev.filter(item =>
          !(item.productId === productId &&
            (!item.variation || item.variation.id === variationId))
        )
      );
    } else {
      handleProductSelection(productId, variationId, newQuantity);
    }
  };

  const handleSelectAll = () => {
    order.products.forEach((product) => {
      const variationId = product.hasVariation
        ? product.variation?.id || null
        : null;
      handleQuantityChange(product.productId, variationId, product.quantity);
    });
  };

  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product to return');
      return;
    }

    if (!returnReason) {
      toast.error('Please select a reason for the return');
      return;
    }

    if (!returnReasonDetails.trim()) {
      toast.error('Please provide details about the return');
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

      toast.success(`Return processed successfully! Refund: ৳${result.data?.refundAmount ?? 0}`);
      handleClose();
    } catch (error: any) {
      console.error("Error adjusting return:", error);
      toast.error(error.message || "Failed to process return. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalItemsSelected = selectedProducts.reduce(
    (sum, p) => sum + p.quantity,
    0
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Scrollable content */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
        {order?.products?.length < 1 ? (
          <Alert className="border-amber-200 bg-amber-50/60">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              No products found in this order to return.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Return Reason Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[13px] font-semibold uppercase tracking-wide text-gray-900">
                  Return reason
                </Label>
                <span className="text-xs text-gray-400">Required</span>
              </div>

              <RadioGroup
                value={returnReason}
                onValueChange={setReturnReason}
                className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
              >
                {validReturnReasons.map((reason) => {
                  const Icon = reason.icon;
                  const isSelected = returnReason === reason.value;
                  return (
                    <motion.div
                      key={reason.value}
                      whileTap={{ scale: 0.98 }}
                      className="relative"
                    >
                      <RadioGroupItem
                        value={reason.value}
                        id={`return-reason-${reason.value}`}
                        className="sr-only"
                      />
                      <label
                        htmlFor={`return-reason-${reason.value}`}
                        style={
                          isSelected
                            ? {
                                borderColor: reason.accent,
                                backgroundColor: reason.accentSoft,
                              }
                            : undefined
                        }
                        className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 transition-colors duration-150 hover:border-gray-300"
                      >
                        <div
                          style={{
                            backgroundColor: isSelected
                              ? reason.accent
                              : "#F1F5F9",
                          }}
                          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md transition-colors duration-150"
                        >
                          <Icon
                            className="h-3.5 w-3.5"
                            style={{
                              color: isSelected ? "#fff" : "#64748B",
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="text-[13px] font-medium leading-tight text-gray-900">
                            {reason.label}
                          </div>
                          <div className="mt-0.5 text-[11px] leading-snug text-gray-500">
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
                              className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
                            >
                              <Check
                                className="h-2.5 w-2.5 text-white"
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
            <div className="mt-5 space-y-2">
              <Label
                htmlFor="returnReasonDetails"
                className="text-[13px] font-semibold uppercase tracking-wide text-gray-900"
              >
                Additional details <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="returnReasonDetails"
                placeholder="Describe the issue — what’s damaged, what was expected, etc."
                value={returnReasonDetails}
                onChange={(e) => setReturnReasonDetails(e.target.value)}
                className="min-h-[76px] resize-none border-gray-200 text-sm focus-visible:ring-gray-900/10"
                disabled={isSubmitting}
              />
            </div>

            <Separator className="my-5 bg-gray-100" />

            {/* Products Selection Header */}
            <div className="mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <h3 className="text-[13px] font-semibold uppercase tracking-wide text-gray-900">
                  Products
                </h3>
              </div>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-medium text-gray-500 transition-colors hover:text-gray-900"
              >
                Select all
              </button>
            </div>

            {/* Products List */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              {/* Table Header (desktop) */}
              <div className="hidden grid-cols-12 gap-2 border-b border-gray-100 bg-gray-50/80 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-gray-500 sm:grid">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-center">Available</div>
                <div className="col-span-3 text-center">Return qty</div>
                <div className="col-span-2 text-right">Refund</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-100">
                {order.products.map((product, index) => {
                  const selectedProduct = selectedProducts.find(
                    (sp) =>
                      sp.productId === product.productId &&
                      (!sp.variation ||
                        sp.variation.id === product.variation?.id)
                  );
                  const returnQuantity = selectedProduct?.quantity || 0;
                  const unitPrice = product.totalPrice / product.quantity;
                  const refundAmount = unitPrice * returnQuantity;
                  const isActive = returnQuantity > 0;
                  const variationId = product.hasVariation
                    ? product.variation?.id || null
                    : null;

                  return (
                    <motion.div
                      key={`${product.productId}-${
                        product.variation?.id || "no-variant"
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className={`flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5 transition-colors duration-150 sm:grid sm:grid-cols-12 sm:gap-2 sm:gap-y-0 ${
                        isActive ? "bg-emerald-50/40" : "hover:bg-gray-50"
                      }`}
                    >
                      {/* Product Name & Variation */}
                      <div className="flex w-full min-w-0 items-center gap-2.5 sm:col-span-5 sm:w-auto">
                        {product.thumbnail ? (
                          <img
                            src={product.thumbnail}
                            alt={product.name}
                            onError={(e) => {
                              // Fall back to the placeholder if the URL is broken
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = PlaceHolderImage;
                            }}
                            className="h-8 w-8 flex-shrink-0 rounded-md border border-gray-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-gray-100">
                            <Package className="h-3.5 w-3.5 text-gray-500" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-medium text-gray-900">
                            {product.name}
                          </div>
                          {product.hasVariation && product.variation && (
                            <div className="mt-0.5 flex items-center gap-1">
                              {product.variation.color && (
                                <span className="rounded bg-blue-50 px-1.5 py-[1px] text-[10px] text-blue-600">
                                  {product.variation.color}
                                </span>
                              )}
                              {product.variation.size && (
                                <span className="rounded bg-purple-50 px-1.5 py-[1px] text-[10px] text-purple-600">
                                  {product.variation.size}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Available Quantity */}
                      <div className="flex items-center sm:col-span-2 sm:justify-center">
                        <span className="text-xs font-medium tabular-nums text-gray-500">
                          {product.quantity} pcs
                        </span>
                      </div>

                      {/* Return Quantity Controls */}
                      <div className="mx-auto flex items-center gap-1 sm:col-span-3 sm:mx-0 sm:justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(
                              product.productId,
                              variationId,
                              Math.max(0, returnQuantity - 1)
                            )
                          }
                          disabled={returnQuantity <= 0}
                          className="h-7 w-7 border-gray-200 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>

                        <Input
                          type="number"
                          value={returnQuantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            handleQuantityChange(
                              product.productId,
                              variationId,
                              val
                            );
                          }}
                          min="0"
                          max={product.quantity}
                          className="h-7 w-11 border-gray-200 p-0 text-center text-xs font-semibold tabular-nums"
                        />

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(
                              product.productId,
                              variationId,
                              Math.min(product.quantity, returnQuantity + 1)
                            )
                          }
                          disabled={returnQuantity >= product.quantity}
                          className="h-7 w-7 border-gray-200 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Refund Amount */}
                      <div className="flex items-center sm:col-span-2 sm:justify-end">
                        {isActive ? (
                          <span className="text-xs font-semibold tabular-nums text-emerald-600">
                            {formatCurrency(refundAmount)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Table Footer */}
              <div className="border-t border-gray-100 bg-gray-50/80 px-3 py-2">
                <span className="text-[11px] text-gray-500">
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
                  className="mt-4 overflow-hidden"
                >
                  <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-emerald-600">
                        <Calculator className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold leading-tight text-emerald-900">
                          Expected refund
                        </div>
                        <div className="mt-0.5 text-[11px] text-emerald-700/80">
                          {totalItemsSelected} item
                          {totalItemsSelected !== 1 ? "s" : ""} selected
                        </div>
                      </div>
                    </div>
                    <span className="text-lg font-bold tabular-nums text-emerald-700">
                      {formatCurrency(getTotalRefundAmount())}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-400 sm:mr-auto">
            <Receipt className="h-3.5 w-3.5" />
            <span>
              {selectedProducts.length > 0
                ? `${totalItemsSelected} item${
                    totalItemsSelected !== 1 ? "s" : ""
                  } · ${formatCurrency(getTotalRefundAmount())}`
                : "No items selected"}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full border-gray-200 sm:w-auto"
          >
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
            className="w-full bg-gray-900 text-white shadow-sm hover:bg-gray-800 sm:w-auto"
          >
            {isSubmitting ? (
              <ButtonLoadingText text="Processing…" />
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Process return
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdjustReturnProduct;
