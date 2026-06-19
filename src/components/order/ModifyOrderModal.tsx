import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import {
  Package,
  Plus,
  Minus,
  Trash2,
  Search,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import axios from "../../api/axios";
import config from "../../utils/config";
import useDebounce from "../../customHook/useDebounce";
import type {
  IOrderProduct,
  ProductSearchResponse,
} from "../../pages/order/interface.d";
import { validateModification, modifyOrder } from "../../api/order";
import type { ValidationResponse } from "../../api/order";
import { cn } from "../../lib/utils";

interface ModifyOrderModalProps {
  orderId: string | number;
  orderNumber: number;
  deliveryCharge?: number;
  paid?: number;
  initialProducts: IOrderProduct[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (
    updatedProducts: IOrderProduct[],
    newTotal: number,
    summary?: {
      oldProductCount: number;
      newProductCount: number;
      oldTotalPrice: number;
      newTotalPrice: number;
      priceDifference: number;
    },
  ) => void;
}

export function ModifyOrderModal({
  orderId,
  orderNumber,
  initialProducts,
  open,
  deliveryCharge = 0,
  paid = 0,
  onOpenChange,
  onSuccess,
}: ModifyOrderModalProps) {
  const [selectedProducts, setSelectedProducts] = useState<
    ProductSearchResponse[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProductSearchResponse[]>(
    [],
  );
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationData, setValidationData] =
    useState<ValidationResponse | null>(null);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(e.target as Node) &&
        !searchInputRef.current?.contains(e.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && initialProducts.length > 0) {
      setSelectedProducts(
        initialProducts.map((p) => ({
          id: p.productId || p.id,
          name: p.name,
          sku: "",
          unitPrice: p.unitPrice,
          updatePrice: p.unitPrice,
          discount: p.discount || 0,
          quantity: p.quantity,
          maxQuantity: p.quantity + 10,
          updatedPrice: p.unitPrice,
          image: p.thumbnail,
          thumbnail: p.thumbnail,
          variant: p.variant
            ? {
                id: p.variant.id || "",
                size: p.variant.size || "",
                color: p.variant.color || "",
              }
            : null,
        })),
      );
    }
  }, [open, initialProducts]);

  const searchProducts = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    setSearching(true);
    setShowSearchResults(true);
    try {
      const response = await axios.get(
        `${config.product.searchProductV2()}?query=${query}&limit=10`,
      );
      let results: any[] = [];
      if (Array.isArray(response.data)) results = response.data;
      else if (Array.isArray(response.data?.data)) results = response.data.data;
      else if (Array.isArray(response.data?.data?.products))
        results = response.data.data.products;
      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } catch {
      toast.error("Failed to search products");
      setShowSearchResults(false);
    } finally {
      setSearching(false);
    }
  };

  const debounce = useDebounce(searchQuery, 500);
  useEffect(() => {
    if (debounce) searchProducts(debounce);
    else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
    // eslint-disable-next-line
  }, [debounce]);

  const handleAddProduct = (product: ProductSearchResponse) => {
    if (product.quantity <= 0) {
      toast.error("Product out of stock");
      return;
    }
    const existing = selectedProducts.find((p) =>
      product.variant?.id
        ? p.id === product.id && p.variant?.id === product.variant.id
        : p.id === product.id,
    );
    if (existing) {
      if (existing.quantity >= (product.maxQuantity || product.quantity)) {
        toast.error("Maximum quantity reached");
        return;
      }
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p.id === product.id && p.variant?.id === product.variant?.id
            ? { ...p, quantity: p.quantity + 1 }
            : p,
        ),
      );
    } else {
      setSelectedProducts((prev) => [
        ...prev,
        { ...product, quantity: 1, maxQuantity: product.quantity },
      ]);
    }
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    searchInputRef.current?.focus();
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setSelectedProducts((prev) =>
      prev.map((p, i) => {
        if (i !== index) return p;
        const newQty = Math.max(0, p.quantity + delta);
        if (newQty > (p.maxQuantity || p.quantity)) {
          toast.error("Maximum quantity reached");
          return p;
        }
        return { ...p, quantity: newQty };
      }),
    );
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const totals = selectedProducts.reduce(
    (acc, p) => ({
      totalPrice:
        acc.totalPrice + Number(p.updatedPrice || p.unitPrice) * p.quantity,
      totalItems: acc.totalItems + p.quantity,
    }),
    { totalPrice: 0, totalItems: 0 },
  );

  const grandTotal = totals.totalPrice + deliveryCharge;
  const due = grandTotal - paid;

  const handlePreviewChanges = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Order must have at least one product");
      return;
    }
    setValidating(true);
    try {
      const payload = selectedProducts.map((p) => ({
        productId: p.id,
        quantity: p.quantity,
        ...(p.variant?.id && { variationId: p.variant.id }),
      }));
      const response = await validateModification(String(orderId), {
        products: payload,
      });
      if (response.success && response.data) {
        setValidationData(response.data);
        setShowValidationDialog(true);
      } else {
        toast.error(response.error || "Failed to validate changes");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Validation failed",
      );
    } finally {
      setValidating(false);
    }
  };

  const handleConfirmSave = async () => {
    setLoading(true);
    setShowValidationDialog(false);
    try {
      const payload = selectedProducts.map((p) => ({
        productId: p.id,
        quantity: p.quantity,
        ...(p.variant?.id && { variationId: p.variant.id }),
      }));
      const response = await modifyOrder(String(orderId), {
        products: payload,
      });
      if (response.success && response.data) {
        const { summary } = response.data;
        const updatedProducts = selectedProducts.map((p) => ({
          id: p.id,
          productId: p.id,
          name: p.name,
          thumbnail: p.image,
          quantity: p.quantity,
          unitPrice: Number(p.unitPrice),
          totalPrice: Number(p.updatedPrice || p.unitPrice) * p.quantity,
          discount: Number(p.discount),
          variant: p.variant,
        }));
        toast.success(`Order #${orderNumber} updated`);
        onSuccess(
          updatedProducts as IOrderProduct[],
          summary?.newTotalPrice || totals.totalPrice,
          summary,
        );
        onOpenChange(false);
      } else {
        toast.error(response.error || "Failed to modify order");
        setShowValidationDialog(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to modify order");
      setShowValidationDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (n: number) => `৳${n.toLocaleString("en-BD")}`;

  return (
    <>
      {/* ─── Main modal ─── */}
      <Dialog open={open && !showValidationDialog} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-2xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl border-gray-100'>
          {/* Header */}
          <div className='px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0'>
            <div>
              <h2 className='text-base font-bold text-gray-900'>
                Modify order
              </h2>
              <p className='text-xs text-gray-400 mt-0.5'>#{orderNumber}</p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className='w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-colors'>
              <XCircle className='w-4 h-4 text-gray-400' />
            </button>
          </div>

          <div className='flex-1 overflow-hidden flex flex-col'>
            {/* Search */}
            <div className='px-5 pt-4 pb-3 shrink-0'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 z-10' />
                <input
                  ref={searchInputRef}
                  placeholder='Search products to add…'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() =>
                    searchResults.length > 0 && setShowSearchResults(true)
                  }
                  className='w-full pl-9 pr-9 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50
                             focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50
                             placeholder:text-gray-400 outline-none transition-all'
                />
                {searching && (
                  <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-gray-400' />
                )}

                {/* Search dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div
                    ref={searchResultsRef}
                    className='absolute z-50 top-full left-0 right-0 mt-1.5 bg-white border border-gray-100
                               rounded-xl shadow-xl overflow-hidden'>
                    <ScrollArea className='max-h-64'>
                      <div className='p-1.5 space-y-0.5'>
                        {searchResults.map((product, i) => {
                          const price =
                            product.updatedPrice || product.unitPrice;
                          const hasDiscount =
                            product.updatedPrice &&
                            product.updatedPrice !== product.unitPrice;
                          const outOfStock = product.quantity <= 0;
                          return (
                            <button
                              key={`${product.id}-${product.variant?.id || "default"}-${i}`}
                              onClick={() => handleAddProduct(product)}
                              disabled={outOfStock}
                              className={cn(
                                "w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors",
                                outOfStock
                                  ? "opacity-50 cursor-not-allowed bg-gray-50"
                                  : "hover:bg-indigo-50 group",
                              )}>
                              <div className='w-10 h-10 rounded-lg overflow-hidden border border-gray-100 shrink-0 bg-gray-50'>
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className='w-full h-full object-cover'
                                  />
                                ) : (
                                  <div className='w-full h-full flex items-center justify-center'>
                                    <Package className='w-4 h-4 text-gray-300' />
                                  </div>
                                )}
                              </div>
                              <div className='flex-1 min-w-0'>
                                <p className='text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors'>
                                  {product.name}
                                </p>
                                <div className='flex items-center gap-2 mt-0.5 flex-wrap'>
                                  {product.variant?.color && (
                                    <span className='text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded capitalize'>
                                      {product.variant.color}
                                    </span>
                                  )}
                                  {product.variant?.size && (
                                    <span className='text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded'>
                                      {product.variant.size}
                                    </span>
                                  )}
                                  <span className='text-[10px] font-bold text-gray-800 tabular-nums'>
                                    {formatCurrency(Number(price))}
                                  </span>
                                  {hasDiscount && (
                                    <span className='text-[10px] text-gray-400 line-through tabular-nums'>
                                      {formatCurrency(
                                        Number(product.unitPrice),
                                      )}
                                    </span>
                                  )}
                                  <span
                                    className={cn(
                                      "text-[10px] font-medium px-1.5 py-0.5 rounded",
                                      outOfStock
                                        ? "text-red-600 bg-red-50"
                                        : "text-emerald-600 bg-emerald-50",
                                    )}>
                                    {outOfStock
                                      ? "Out of stock"
                                      : `${product.quantity} left`}
                                  </span>
                                </div>
                              </div>
                              {!outOfStock && (
                                <div className='w-6 h-6 rounded-full bg-indigo-100 group-hover:bg-indigo-600 flex items-center justify-center transition-colors shrink-0'>
                                  <Plus className='w-3 h-3 text-indigo-600 group-hover:text-white transition-colors' />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </div>

            {/* Product list header */}
            <div className='px-5 pb-2 flex items-center justify-between shrink-0'>
              <p className='text-[11px] font-semibold text-gray-400 uppercase tracking-wide'>
                Order products
              </p>
              <span className='text-[11px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full tabular-nums'>
                {selectedProducts.length} item
                {selectedProducts.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Product list */}
            <ScrollArea className='flex-1 px-5'>
              {selectedProducts.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-14 gap-2'>
                  <div className='w-12 h-12 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center'>
                    <Package className='w-5 h-5 text-gray-300' />
                  </div>
                  <p className='text-sm font-medium text-gray-400'>
                    No products added
                  </p>
                  <p className='text-xs text-gray-300'>
                    Search above to add products
                  </p>
                </div>
              ) : (
                <div className='space-y-2 pb-4'>
                  {selectedProducts.map((product, index) => {
                    const price = Number(
                      product.updatedPrice || product.unitPrice,
                    );
                    const lineTotal = price * product.quantity;
                    return (
                      <div
                        key={index}
                        className='flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-white hover:border-gray-200 transition-colors group'>
                        {/* Thumbnail */}
                        <div className='w-10 h-10 rounded-lg overflow-hidden border border-gray-100 shrink-0 bg-gray-50'>
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <div className='w-full h-full flex items-center justify-center'>
                              <Package className='w-4 h-4 text-gray-300' />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-semibold text-gray-900 truncate leading-snug'>
                            {product.name}
                          </p>
                          <div className='flex items-center gap-1.5 mt-0.5 flex-wrap'>
                            {product.variant?.color && (
                              <span className='text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded capitalize'>
                                {product.variant.color}
                              </span>
                            )}
                            {product.variant?.size && (
                              <span className='text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded'>
                                {product.variant.size}
                              </span>
                            )}
                            <span className='text-[10px] font-bold text-indigo-600 tabular-nums'>
                              {formatCurrency(lineTotal)}
                            </span>
                          </div>
                        </div>

                        {/* Qty controls */}
                        <div className='flex items-center gap-1 shrink-0'>
                          <button
                            onClick={() => handleUpdateQuantity(index, -1)}
                            className='w-6 h-6 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors'>
                            <Minus className='w-3 h-3 text-gray-500' />
                          </button>
                          <span className='w-7 text-center text-sm font-bold text-gray-900 tabular-nums'>
                            {product.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(index, 1)}
                            className='w-6 h-6 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors'>
                            <Plus className='w-3 h-3 text-gray-500' />
                          </button>
                          <button
                            onClick={() => handleRemoveProduct(index)}
                            className='w-6 h-6 rounded-md hover:bg-red-50 flex items-center justify-center transition-colors ml-0.5 opacity-0 group-hover:opacity-100'>
                            <Trash2 className='w-3 h-3 text-red-400' />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Footer */}
          <div className='px-5 py-4 border-t border-gray-100 space-y-3 shrink-0 bg-gray-50/50'>
            {/* Price breakdown */}
            <div className='space-y-1.5'>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-gray-500'>
                  Subtotal ({totals.totalItems} item
                  {totals.totalItems !== 1 ? "s" : ""})
                </span>
                <span className='font-semibold text-gray-700 tabular-nums'>
                  {formatCurrency(totals.totalPrice)}
                </span>
              </div>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-gray-500'>Delivery</span>
                <span className='font-semibold text-gray-700 tabular-nums'>
                  {formatCurrency(deliveryCharge)}
                </span>
              </div>
              <div className='h-px bg-gray-200 my-1' />
              <div className='flex items-center justify-between'>
                <span className='text-sm font-semibold text-gray-900'>
                  Total
                </span>
                <span className='text-sm font-bold text-gray-900 tabular-nums'>
                  {formatCurrency(grandTotal)}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-xs text-gray-500'>Paid</span>
                <span className='text-xs font-semibold text-emerald-600 tabular-nums'>
                  {formatCurrency(paid)}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-xs font-medium text-gray-700'>
                  Due after change
                </span>
                <span
                  className={cn(
                    "text-sm font-bold tabular-nums",
                    due > 0 ? "text-red-600" : "text-emerald-600",
                  )}>
                  {formatCurrency(Math.abs(due))}
                  {due < 0 && (
                    <span className='text-[10px] ml-1 font-normal'>
                      (overpaid)
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className='flex gap-2'>
              <button
                onClick={() => onOpenChange(false)}
                disabled={loading || validating}
                className='flex-1 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50
                           text-sm font-medium text-gray-600 transition-colors disabled:opacity-50'>
                Cancel
              </button>
              <button
                onClick={handlePreviewChanges}
                disabled={
                  loading || validating || selectedProducts.length === 0
                }
                className='flex-[2] h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700
                           text-sm font-bold text-white flex items-center justify-center gap-2
                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                           shadow-sm shadow-indigo-100'>
                {validating ? (
                  <>
                    <Loader2 className='w-3.5 h-3.5 animate-spin' />
                    Validating…
                  </>
                ) : (
                  <>
                    Preview changes
                    <ArrowRight className='w-3.5 h-3.5' />
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Validation / confirm dialog ─── */}
      <Dialog
        open={showValidationDialog}
        onOpenChange={setShowValidationDialog}>
        <DialogContent className='max-w-lg p-0 gap-0 rounded-2xl border-gray-100 overflow-hidden'>
          {/* Header */}
          <div className='px-5 py-4 border-b border-gray-100'>
            <h2 className='text-base font-bold text-gray-900'>
              Confirm changes
            </h2>
            <p className='text-xs text-gray-400 mt-0.5'>
              Review before applying to order #{orderNumber}
            </p>
          </div>

          <div className='px-5 py-4 space-y-4'>
            {/* Estimated changes summary */}
            {validationData?.estimatedChanges && (
              <div className='rounded-xl border border-indigo-100 bg-indigo-50 p-4 space-y-3'>
                <p className='text-xs font-semibold text-indigo-700 uppercase tracking-wide'>
                  Price change
                </p>
                <div className='flex items-center justify-between gap-4'>
                  <div className='text-center'>
                    <p className='text-[11px] text-indigo-500 mb-0.5'>Before</p>
                    <p className='text-lg font-bold text-indigo-900 tabular-nums'>
                      {formatCurrency(
                        validationData.estimatedChanges.oldTotalPrice,
                      )}
                    </p>
                    <p className='text-[10px] text-indigo-400'>
                      {validationData.estimatedChanges.oldProductCount} product
                      {validationData.estimatedChanges.oldProductCount !== 1
                        ? "s"
                        : ""}
                    </p>
                  </div>
                  <ArrowRight className='w-5 h-5 text-indigo-400 shrink-0' />
                  <div className='text-center'>
                    <p className='text-[11px] text-indigo-500 mb-0.5'>After</p>
                    <p className='text-lg font-bold text-indigo-900 tabular-nums'>
                      {formatCurrency(
                        validationData.estimatedChanges.newTotalPrice,
                      )}
                    </p>
                    <p className='text-[10px] text-indigo-400'>
                      {validationData.estimatedChanges.newProductCount} product
                      {validationData.estimatedChanges.newProductCount !== 1
                        ? "s"
                        : ""}
                    </p>
                  </div>
                  <div className={cn("ml-auto text-right shrink-0")}>
                    <p className='text-[11px] text-gray-400 mb-0.5'>
                      Difference
                    </p>
                    <p
                      className={cn(
                        "text-base font-bold tabular-nums",
                        validationData.estimatedChanges.priceDifference >= 0
                          ? "text-emerald-600"
                          : "text-red-600",
                      )}>
                      {validationData.estimatedChanges.priceDifference >= 0
                        ? "+"
                        : ""}
                      {formatCurrency(
                        validationData.estimatedChanges.priceDifference,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Validation results */}
            {validationData?.validationResults &&
              validationData.validationResults.length > 0 && (
                <div className='space-y-1.5'>
                  <p className='text-[11px] font-semibold text-gray-400 uppercase tracking-wide'>
                    Stock validation
                  </p>
                  <ScrollArea className='max-h-44'>
                    <div className='space-y-1.5 pr-2'>
                      {validationData.validationResults.map((result, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-start gap-2.5 p-2.5 rounded-xl border text-sm",
                            result.valid
                              ? "bg-emerald-50 border-emerald-100"
                              : "bg-red-50 border-red-100",
                          )}>
                          {result.valid ? (
                            <CheckCircle2 className='w-4 h-4 text-emerald-600 shrink-0 mt-0.5' />
                          ) : (
                            <AlertTriangle className='w-4 h-4 text-red-500 shrink-0 mt-0.5' />
                          )}
                          <div className='flex-1 min-w-0'>
                            <p className='text-xs font-semibold text-gray-900 truncate'>
                              {result.productName}
                            </p>
                            <p className='text-[11px] text-gray-500 mt-0.5'>
                              Requested {result.requestedQuantity} · Available{" "}
                              {result.availableStock}
                              {result.variationDetails &&
                                ` · ${result.variationDetails}`}
                            </p>
                            {!result.valid && result.error && (
                              <p className='text-[11px] text-red-600 font-medium mt-1'>
                                {result.error}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

            {/* Overall status */}
            <div
              className={cn(
                "flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-sm font-medium",
                validationData?.valid
                  ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                  : "bg-red-50 border-red-100 text-red-700",
              )}>
              {validationData?.valid ? (
                <CheckCircle2 className='w-4 h-4 text-emerald-600 shrink-0' />
              ) : (
                <AlertTriangle className='w-4 h-4 text-red-500 shrink-0' />
              )}
              <span>
                {validationData?.valid
                  ? "All products validated — ready to apply changes."
                  : "Some products have stock issues. Review before continuing."}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className='px-5 py-4 border-t border-gray-100 flex gap-2 bg-gray-50/50'>
            <button
              onClick={() => setShowValidationDialog(false)}
              disabled={loading}
              className='flex-1 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50
                         text-sm font-medium text-gray-600 transition-colors flex items-center justify-center gap-1.5'>
              <XCircle className='w-3.5 h-3.5' />
              Back
            </button>
            <button
              onClick={handleConfirmSave}
              disabled={loading || !validationData?.valid}
              className={cn(
                "flex-[2] h-9 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-colors shadow-sm",
                validationData?.valid
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
                  : "bg-gray-300 cursor-not-allowed",
              )}>
              {loading ? (
                <>
                  <Loader2 className='w-3.5 h-3.5 animate-spin' />
                  Saving…
                </>
              ) : (
                <>
                  <CheckCircle2 className='w-3.5 h-3.5' />
                  Apply changes
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
