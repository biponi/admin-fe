import { useEffect, useState, useRef } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { Dialog, DialogContent } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import {
  Package,
  Plus,
  Minus,
  Trash2,
  Search,
  SearchX,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  X,
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
  packageData?: {
    packageCode: string;
    status: string;
  } | null;
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
  packageData = null,
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
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationData, setValidationData] =
    useState<ValidationResponse | null>(null);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const modifiablePackageStatuses = ["requested", "packing"];
  const isModificationBlocked =
    packageData !== null &&
    packageData !== undefined &&
    !modifiablePackageStatuses.includes(packageData.status);

  const formatPackageStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      requested: "Requested",
      packing: "Packing",
      packed: "Packed",
      shipping_requested: "Shipping Requested",
      shipped: "Shipped",
      completed: "Completed",
      partial_delivered: "Partial Delivered",
      cancelled: "Cancelled",
      returned: "Returned",
    };
    return statusMap[status] || status;
  };

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
    if (!open) {
      setSearchQuery("");
      setSearchResults([]);
      setActiveIndex(-1);
    }
  }, [open, initialProducts]);

  const searchProducts = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
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
      setActiveIndex(results.length > 0 ? 0 : -1);
    } catch {
      toast.error("Failed to search products");
    } finally {
      setSearching(false);
    }
  };

  const debounce = useDebounce(searchQuery, 500);
  useEffect(() => {
    if (debounce) searchProducts(debounce);
    else {
      setSearchResults([]);
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
    toast.success(`${product.name} added to order`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchResults.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % searchResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(
        (i) => (i - 1 + searchResults.length) % searchResults.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const product = searchResults[activeIndex];
      if (product && product.quantity > 0) handleAddProduct(product);
    }
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setSelectedProducts((prev) => {
      const target = prev[index];
      if (!target) return prev;
      const newQty = target.quantity + delta;
      if (newQty > (target.maxQuantity || target.quantity)) {
        toast.error("Maximum quantity reached");
        return prev;
      }
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      return prev.map((p, i) => (i === index ? { ...p, quantity: newQty } : p));
    });
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

  const renderSearchItem = (
    product: ProductSearchResponse,
    idx: number,
    highlighted: boolean,
  ) => {
    const price = product.updatedPrice || product.unitPrice;
    const hasDiscount =
      product.updatedPrice && product.updatedPrice !== product.unitPrice;
    const outOfStock = product.quantity <= 0;

    return (
      <button
        key={`${product.id}-${product.variant?.id || "base"}-${idx}`}
        type='button'
        role='option'
        aria-selected={highlighted}
        onMouseEnter={() => setActiveIndex(idx)}
        onClick={() => handleAddProduct(product)}
        disabled={outOfStock}
        className={cn(
          "w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors",
          outOfStock
            ? "opacity-50 cursor-not-allowed bg-gray-50"
            : highlighted
              ? "bg-indigo-50"
              : "hover:bg-indigo-50",
        )}>
        <div className='w-11 h-11 rounded-xl overflow-hidden border border-gray-100 shrink-0 bg-gray-50'>
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
          <p className='text-sm font-semibold text-gray-900 truncate leading-snug'>
            {product.name}
          </p>
          <div className='flex items-center gap-1.5 mt-1 flex-wrap'>
            {product.variant?.color && (
              <span className='text-[10px] font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-md capitalize'>
                {product.variant.color}
              </span>
            )}
            {product.variant?.size && (
              <span className='text-[10px] font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-md'>
                {product.variant.size}
              </span>
            )}
            <span className='text-[11px] font-bold text-gray-900 tabular-nums'>
              {formatCurrency(Number(price))}
            </span>
            {hasDiscount && (
              <span className='text-[10px] text-gray-400 line-through tabular-nums'>
                {formatCurrency(Number(product.unitPrice))}
              </span>
            )}
          </div>
        </div>

        <span
          className={cn(
            "text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 whitespace-nowrap",
            outOfStock
              ? "text-red-600 bg-red-50"
              : "text-emerald-700 bg-emerald-50",
          )}>
          {outOfStock ? "Out of stock" : `${product.quantity} left`}
        </span>

        {!outOfStock && (
          <div
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors",
              highlighted ? "bg-indigo-600" : "bg-indigo-50",
            )}>
            <Plus
              className={cn(
                "w-3.5 h-3.5 transition-colors",
                highlighted ? "text-white" : "text-indigo-600",
              )}
            />
          </div>
        )}
      </button>
    );
  };

  const searchResultsVisible = searchQuery.length > 0;

  return (
    <>
      {/* ─── Main modify-order drawer ─── */}
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className='h-[95vh] flex flex-col'>
          {/* Header */}
          <DrawerHeader className='text-left pb-0 shrink-0'>
            <div className='flex items-center justify-between'>
              <div>
                <DrawerTitle className='text-base font-bold'>
                  Modify order
                </DrawerTitle>
                <p className='text-xs text-gray-400 mt-0.5'>#{orderNumber}</p>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                aria-label='Close'
                className='w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors'>
                <X className='w-4 h-4 text-gray-500' />
              </button>
            </div>
          </DrawerHeader>

          {/* Package Status Banner */}
          {packageData && (
            <div
              className={cn(
                "mx-4 mt-3 rounded-xl border px-3.5 py-2.5 flex items-center gap-2.5 text-sm shrink-0",
                isModificationBlocked
                  ? "bg-red-50 border-red-200"
                  : "bg-amber-50 border-amber-200",
              )}>
              <Package
                className={cn(
                  "w-4 h-4 shrink-0",
                  isModificationBlocked ? "text-red-600" : "text-amber-600",
                )}
              />
              <div className='flex-1 min-w-0'>
                <p
                  className={cn(
                    "font-semibold text-xs",
                    isModificationBlocked ? "text-red-800" : "text-amber-800",
                  )}>
                  Package: {packageData.packageCode} —{" "}
                  {formatPackageStatus(packageData.status)}
                </p>
                {isModificationBlocked && (
                  <p className='text-[11px] text-red-600 mt-0.5'>
                    Order has been packed. Cancel the package to modify.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Search input — inline inside the drawer */}
          <div className='px-4 pt-3 pb-2 shrink-0'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 z-10 pointer-events-none' />
              <input
                ref={searchInputRef}
                autoFocus
                placeholder='Search products to add…'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                disabled={isModificationBlocked}
                className='w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50
                           focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50
                           placeholder:text-gray-400 outline-none transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100'
              />
              {searching && (
                <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-gray-400' />
              )}
              {!searching && searchQuery && (
                <button
                  type='button'
                  aria-label='Clear search'
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className='absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors'>
                  <X className='w-3 h-3 text-gray-500' />
                </button>
              )}
            </div>
          </div>

          {/* Search results — collapsible with max-h-[50vh], plain overflow (no ScrollArea / Popover) */}
          {searchResultsVisible && (
            <div className='px-4 pb-2 shrink-0'>
              <div className='max-h-[30vh] overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50'>
                {searching && (
                  <div className='py-8 flex flex-col items-center justify-center gap-2 text-gray-400'>
                    <Loader2 className='w-5 h-5 animate-spin' />
                    <p className='text-xs font-medium'>Searching…</p>
                  </div>
                )}

                {!searching && searchResults.length === 0 && (
                  <div className='py-10 flex flex-col items-center justify-center gap-2 text-center px-4'>
                    <div className='w-11 h-11 rounded-2xl bg-white border border-gray-100 flex items-center justify-center'>
                      <SearchX className='w-5 h-5 text-gray-300' />
                    </div>
                    <p className='text-sm font-semibold text-gray-500'>
                      No products found
                    </p>
                    <p className='text-xs text-gray-400'>
                      Try a different name or SKU for "{searchQuery}"
                    </p>
                  </div>
                )}

                {!searching && searchResults.length > 0 && (
                  <div className='w-full grid grid-cols-1 md:grid-cols-4 gap-3'>
                    {searchResults.map((product, i) =>
                      renderSearchItem(product, i, i === activeIndex),
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Product list header */}
          <div className='px-4 pb-2 flex items-center justify-between shrink-0'>
            <p className='text-[11px] font-semibold text-gray-400 uppercase tracking-wide'>
              Order products
            </p>
            <span className='text-[11px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full tabular-nums'>
              {selectedProducts.length} item
              {selectedProducts.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Product list */}
          <div className='flex-1 min-h-0 overflow-y-auto px-4 pb-4'>
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
              <div className='space-y-2 grid  grid-cols-1 md:grid-cols-3 gap-2'>
                {selectedProducts.map((product, index) => {
                  const price = Number(
                    product.updatedPrice || product.unitPrice,
                  );
                  const lineTotal = price * product.quantity;
                  return (
                    <div
                      key={index}
                      className='flex items-center gap-3 p-2.5 relative rounded-xl border border-gray-100 bg-white hover:border-gray-200 shadow hover:shadow-md transition-all group'>
                      {/* Thumbnail */}
                      <div className='w-16 h-full absolute left-0 top-0 rounded-lg overflow-hidden border border-gray-100 shrink-0 bg-gray-50'>
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
                      <div className='flex-1 min-w-0 ml-16'>
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
                      <div className='flex items-center gap-1 shrink-0 rounded-lg border border-gray-200 p-0.5'>
                        <button
                          onClick={() => handleUpdateQuantity(index, -1)}
                          aria-label={
                            product.quantity === 1
                              ? "Remove product"
                              : "Decrease quantity"
                          }
                          className='w-7 h-7 sm:w-6 sm:h-6 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors'>
                          {product.quantity === 1 ? (
                            <Trash2 className='w-3 h-3 text-red-400' />
                          ) : (
                            <Minus className='w-3 h-3 text-gray-500' />
                          )}
                        </button>
                        <span className='w-7 text-center text-sm font-bold text-gray-900 tabular-nums'>
                          {product.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(index, 1)}
                          aria-label='Increase quantity'
                          className='w-7 h-7 sm:w-6 sm:h-6 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors'>
                          <Plus className='w-3 h-3 text-gray-500' />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveProduct(index)}
                        aria-label='Remove product'
                        className='w-7 h-7 rounded-md hover:bg-red-50 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100'>
                        <Trash2 className='w-3 h-3 text-red-400' />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='flex flex-col px-4 py-4 border-t border-gray-100 space-y-3 shrink-0 bg-white pb-[max(1rem,env(safe-area-inset-bottom))]'>
            {/* Price breakdown */}
            <div className='space-y-1.5 w-[20%] ml-auto float-right p-5 rounded-lg bg-gray-50 shrink-0 border shadow border-gray-100'>
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
            <div className='flex gap-2 w-[20%] float-right ml-auto'>
              <button
                onClick={() => onOpenChange(false)}
                disabled={loading || validating}
                className='flex-1 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50
                           text-sm font-medium text-gray-600 transition-colors disabled:opacity-50
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1'>
                Cancel
              </button>
              <button
                onClick={handlePreviewChanges}
                disabled={
                  loading ||
                  validating ||
                  selectedProducts.length === 0 ||
                  isModificationBlocked
                }
                className='flex-[2] h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                           text-sm font-bold text-white flex items-center justify-center gap-2
                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                           shadow-sm shadow-indigo-100
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1'>
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
        </DrawerContent>
      </Drawer>

      {/* ─── Validation / confirm dialog ─── */}
      <Dialog
        open={showValidationDialog}
        onOpenChange={setShowValidationDialog}>
        <DialogContent className='w-[calc(100%-2rem)] sm:w-full max-w-lg p-0 gap-0 rounded-2xl border-gray-100 overflow-hidden'>
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
                <div className='flex items-center justify-between gap-3 sm:gap-4'>
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
                  <div className='ml-auto text-right shrink-0'>
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
                  <ScrollArea className='max-h-[30vh]'>
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
              className='flex-1 h-10 sm:h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50
                         text-sm font-medium text-gray-600 transition-colors flex items-center justify-center gap-1.5
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1'>
              <XCircle className='w-3.5 h-3.5' />
              Back
            </button>
            <button
              onClick={handleConfirmSave}
              disabled={loading || !validationData?.valid}
              className={cn(
                "flex-[2] h-10 sm:h-9 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-colors shadow-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1",
                validationData?.valid
                  ? "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-100"
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
