/**
 * ReturnOrderSheet Component
 * Modern sheet component for processing order returns
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
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
  CheckCircle,
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Textarea } from "../../../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { useToast } from "../../../components/ui/use-toast";
import axiosInstance from "../../../api/axios";
import config from "../../../utils/config";
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

const validReturnReasons = [
  {
    value: "defective",
    label: "Defective Product",
    description: "Product is not working properly",
    icon: XOctagon,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    hoverBg: "hover:bg-red-100",
    selectedBg: "bg-red-100",
    selectedBorder: "border-red-500",
  },
  {
    value: "wrong_item",
    label: "Wrong Item Sent",
    description: "Received different product than ordered",
    icon: ShoppingBag,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    hoverBg: "hover:bg-orange-100",
    selectedBg: "bg-orange-100",
    selectedBorder: "border-orange-500",
  },
  {
    value: "not_as_described",
    label: "Not as Described",
    description: "Product differs from description",
    icon: FileText,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    hoverBg: "hover:bg-yellow-100",
    selectedBg: "bg-yellow-100",
    selectedBorder: "border-yellow-500",
  },
  {
    value: "customer_request",
    label: "Customer Request",
    description: "Customer changed their mind",
    icon: User,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    hoverBg: "hover:bg-blue-100",
    selectedBg: "bg-blue-100",
    selectedBorder: "border-blue-500",
  },
  {
    value: "damaged",
    label: "Damaged in Transit",
    description: "Product arrived damaged",
    icon: Wrench,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    hoverBg: "hover:bg-purple-100",
    selectedBg: "bg-purple-100",
    selectedBorder: "border-purple-500",
  },
  {
    value: "other",
    label: "Other",
    description: "Other reason not listed",
    icon: HelpCircle,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    hoverBg: "hover:bg-gray-100",
    selectedBg: "bg-gray-100",
    selectedBorder: "border-gray-500",
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
            p.variation?.id === selectedProduct.variation?.id)
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
    newQuantity: number
  ) => {
    if (!order) return;

    const product = order.products.find(
      (p) =>
        p.productId === productId &&
        (!variationId || p.variation?.id === variationId)
    );

    if (!product) return;

    if (newQuantity < 0) {
      toast({
        variant: "destructive",
        title: "Invalid Quantity",
        description: "Quantity cannot be negative",
      });
      return;
    }

    if (newQuantity > product.quantity) {
      toast({
        variant: "destructive",
        title: "Exceeds Available Quantity",
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
            )
        )
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
        title: "No Products Selected",
        description: "Please select at least one product to return",
      });
      return;
    }

    if (!returnReason) {
      toast({
        variant: "destructive",
        title: "Return Reason Required",
        description: "Please select a reason for the return",
      });
      return;
    }

    if (!returnReasonDetails.trim()) {
      toast({
        variant: "destructive",
        title: "Return Details Required",
        description: "Please provide details about the return",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post(config.order.returnProducts(), {
        orderId: order.id,
        products: selectedProducts,
        returnReason: returnReason,
        returnReasonDetails: returnReasonDetails.trim(),
      });

      toast({
        title: "Return Processed Successfully",
        description: `Refund Amount: ${formatCurrency(
          response.data.refundAmount
        )}`,
      });

      setSelectedProducts([]);
      setReturnReason("");
      setReturnReasonDetails("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error processing return:", error);
      toast({
        variant: "destructive",
        title: "Return Failed",
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-2xl overflow-hidden flex flex-col'>
        <SheetHeader>
          <SheetTitle className='flex items-center gap-2 text-orange-600'>
            <div className='w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center'>
              <RotateCcw className='w-5 h-5' />
            </div>
            Return Products
          </SheetTitle>
          <SheetDescription>
            Order #{order.orderNumber} • Select products to return
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className='w-full px-1 py-4 max-h-[calc(100vh-200px)]'>
          <div className='flex-1 overflow-hidden flex flex-col w-full px-2'>
            {order?.products?.length < 1 ? (
              <Alert className='border-orange-200 bg-orange-50 mt-4'>
                <AlertTriangle className='h-4 w-4 text-orange-600' />
                <AlertDescription className='text-orange-800'>
                  No products found in this order to return.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Return Reason Selection */}
                <div className='space-y-3 mt-4'>
                  <div className='flex items-center justify-between'>
                    <Label className='text-base font-semibold text-gray-900'>
                      Select Return Reason{" "}
                      <span className='text-red-500'>*</span>
                    </Label>
                    {returnReason && (
                      <Badge variant='outline' className='text-xs'>
                        Selected:{" "}
                        {
                          validReturnReasons.find(
                            (r) => r.value === returnReason
                          )?.label
                        }
                      </Badge>
                    )}
                  </div>

                  <RadioGroup
                    value={returnReason}
                    onValueChange={setReturnReason}
                    className='grid grid-cols-2 gap-3'>
                    {validReturnReasons.map((reason) => {
                      const Icon = reason.icon;
                      const isSelected = returnReason === reason.value;
                      return (
                        <motion.div
                          key={reason.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className='relative'>
                          <RadioGroupItem
                            value={reason.value}
                            id={reason.value}
                            className='sr-only'
                          />
                          <label
                            htmlFor={reason.value}
                            className={`
                            flex flex-col px-3 py-1 rounded-lg border-2 cursor-pointer transition-all duration-200
                            ${
                              isSelected
                                ? `${reason.selectedBg} ${reason.selectedBorder} shadow-md`
                                : `${reason.bgColor} ${reason.borderColor} ${reason.hoverBg} hover:shadow-sm`
                            }
                          `}>
                            <div className='flex items-start gap-2 mb-2'>
                              <div className={`${reason.color} mt-0.5`}>
                                <Icon className='h-5 w-5' />
                              </div>
                              <div className='flex-1'>
                                <div
                                  className={`text-sm font-semibold ${reason.color}`}>
                                  {reason.label}
                                </div>
                                <div className='text-xs text-gray-600 mt-0.5'>
                                  {reason.description}
                                </div>
                              </div>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className={`${reason.color}`}>
                                  <CheckCircle className='h-5 w-5 absolute bg-white -right-1 -top-1 rounded-full' />
                                </motion.div>
                              )}
                            </div>
                          </label>
                        </motion.div>
                      );
                    })}
                  </RadioGroup>
                </div>

                {/* Return Details */}
                <div className='space-y-2 mt-4'>
                  <Label
                    htmlFor='returnReasonDetails'
                    className='text-sm font-medium text-gray-700'>
                    Additional Details <span className='text-red-500'>*</span>
                  </Label>
                  <Textarea
                    id='returnReasonDetails'
                    placeholder='Please provide specific details about the return (e.g., what is damaged, specific issue, etc.)'
                    value={returnReasonDetails}
                    onChange={(e) => setReturnReasonDetails(e.target.value)}
                    className='min-h-[80px] resize-none'
                    disabled={isSubmitting}
                  />
                  <p className='text-xs text-gray-500'>
                    This information will help us process the return
                    efficiently.
                  </p>
                </div>

                <Separator className='my-4' />

                {/* Products Selection Header */}
                <div className='flex items-center gap-2 mb-2'>
                  <Package className='h-5 w-5 text-gray-600' />
                  <h3 className='text-sm font-semibold text-gray-900'>
                    Select Products to Return
                  </h3>
                </div>

                {/* Products List - Compact Table View */}
                <div className='flex-1 overflow-hidden'>
                  <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                    {/* Table Header */}
                    <div className='grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700'>
                      <div className='col-span-5'>Product</div>
                      <div className='col-span-2 text-center'>Available</div>
                      <div className='col-span-3 text-center'>Return Qty</div>
                      <div className='col-span-2 text-right'>Refund</div>
                    </div>

                    {/* Table Body - Scrollable */}
                    <div className='divide-y divide-gray-100'>
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

                        return (
                          <motion.div
                            key={`${product.productId}-${
                              product.variation?.id || "no-variant"
                            }`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.03 }}
                            className={`grid grid-cols-12 gap-2 px-3 py-2.5 text-xs hover:bg-gray-50 transition-colors ${
                              returnQuantity > 0
                                ? "bg-orange-50 hover:bg-orange-100"
                                : ""
                            }`}>
                            {/* Product Name & Variation */}
                            <div className='col-span-5 flex items-center gap-2'>
                              <div className='w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0'>
                                <Package className='w-4 h-4 text-gray-600' />
                              </div>
                              <div className='flex-1 min-w-0'>
                                <div className='font-medium text-gray-900 truncate'>
                                  {product.name}
                                </div>
                                {product.hasVariation && product.variation && (
                                  <div className='text-[10px] text-gray-500 flex items-center gap-1 mt-0.5'>
                                    {product.variation.color && (
                                      <span className='px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded'>
                                        {product.variation.color}
                                      </span>
                                    )}
                                    {product.variation.size && (
                                      <span className='px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded'>
                                        {product.variation.size}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Available Quantity */}
                            <div className='col-span-2 flex items-center justify-center'>
                              <Badge
                                variant='outline'
                                className='text-[10px] font-semibold'>
                                {product.quantity} pcs
                              </Badge>
                            </div>

                            {/* Return Quantity Controls */}
                            <div className='col-span-3 flex items-center justify-center gap-1'>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() =>
                                  handleQuantityChange(
                                    product.productId,
                                    product.hasVariation
                                      ? product.variation?.id || null
                                      : null,
                                    Math.max(0, returnQuantity - 1)
                                  )
                                }
                                disabled={returnQuantity <= 0}
                                className='h-7 w-7 p-0'>
                                <Minus className='w-3 h-3' />
                              </Button>

                              <Input
                                type='number'
                                value={returnQuantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  handleQuantityChange(
                                    product.productId,
                                    product.hasVariation
                                      ? product.variation?.id || null
                                      : null,
                                    val
                                  );
                                }}
                                min='0'
                                max={product.quantity}
                                className='text-center h-7 w-12 text-xs font-semibold p-0'
                              />

                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() =>
                                  handleQuantityChange(
                                    product.productId,
                                    product.hasVariation
                                      ? product.variation?.id || null
                                      : null,
                                    Math.min(
                                      product.quantity,
                                      returnQuantity + 1
                                    )
                                  )
                                }
                                disabled={returnQuantity >= product.quantity}
                                className='h-7 w-7 p-0'>
                                <Plus className='w-3 h-3' />
                              </Button>
                            </div>

                            {/* Refund Amount */}
                            <div className='col-span-2 flex items-center justify-end'>
                              {returnQuantity > 0 ? (
                                <span className='font-bold text-green-600'>
                                  {formatCurrency(refundAmount)}
                                </span>
                              ) : (
                                <span className='text-gray-400 text-[10px]'>
                                  -
                                </span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Quick Actions Footer */}
                    <div className='px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between'>
                      <span className='text-xs text-gray-600'>
                        {order.products.length} product
                        {order.products.length !== 1 ? "s" : ""} available
                      </span>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          order.products.forEach((product) => {
                            handleQuantityChange(
                              product.productId,
                              product.hasVariation
                                ? product.variation?.id || null
                                : null,
                              product.quantity
                            );
                          });
                        }}
                        className='text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-7 text-xs'>
                        Select All Products
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                {selectedProducts.length > 0 && (
                  <div className='mt-4'>
                    <Separator className='mb-4' />
                    <Card className='bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'>
                      <CardHeader className='pb-3'>
                        <CardTitle className='flex items-center gap-2 text-green-800 text-base'>
                          <Calculator className='w-5 h-5' />
                          Return Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='space-y-2'>
                          <div className='flex justify-between items-center'>
                            <span className='text-sm text-gray-700'>
                              Total Items:{" "}
                              {selectedProducts.reduce(
                                (sum, p) => sum + p.quantity,
                                0
                              )}
                            </span>
                            <span className='text-lg font-bold text-green-700'>
                              {formatCurrency(getTotalRefundAmount())}
                            </span>
                          </div>
                          <div className='text-xs text-gray-600'>
                            Expected refund amount
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className='mt-4'>
          <Button
            variant='outline'
            onClick={handleClose}
            disabled={isSubmitting}>
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
            className='bg-orange-600 hover:bg-orange-700'>
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className='mr-2 h-4 w-4' />
                Process Return
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
