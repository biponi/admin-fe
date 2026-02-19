import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Alert, AlertDescription } from "../ui/alert";
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
  Info,
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
  deliveryCharge,
  paid,
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize with order products
  useEffect(() => {
    if (open && initialProducts.length > 0) {
      setSelectedProducts(
        initialProducts.map((p) => ({
          id: p.productId || p.id,
          name: p.name,
          sku: "", // Would come from product API
          unitPrice: p.unitPrice,
          updatePrice: p.unitPrice,
          discount: p.discount || 0,
          quantity: p.quantity,
          maxQuantity: p.quantity + 10, // Would come from stock API
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

  // Search products
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
      // API returns array directly
      let results: any[] = [];
      if (Array.isArray(response.data)) {
        results = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        results = response.data.data;
      } else if (
        response.data?.data?.products &&
        Array.isArray(response.data.data.products)
      ) {
        results = response.data.data.products;
      }

      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search products");
      setShowSearchResults(false);
    } finally {
      setSearching(false);
    }
  };

  const debounce = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debounce) {
      searchProducts(debounce);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
    //eslint-disable-next-line
  }, [debounce]);

  // Add product from search
  const handleAddProduct = (product: ProductSearchResponse) => {
    if (product.quantity <= 0) {
      toast.error("Product out of stock");
      return;
    }

    const existingProduct = selectedProducts.find((p) =>
      product.variant?.id
        ? p.id === product.id && p.variant?.id === product.variant.id
        : p.id === product.id,
    );

    if (existingProduct) {
      if (
        existingProduct.quantity >= (product.maxQuantity || product.quantity)
      ) {
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
        {
          ...product,
          quantity: 1,
          maxQuantity: product.quantity,
        },
      ]);
    }
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    searchInputRef.current?.focus();
  };

  // Update quantity
  const handleUpdateQuantity = (index: number, delta: number) => {
    setSelectedProducts((prev) =>
      prev.map((p, i) => {
        if (i === index) {
          const newQty = Math.max(0, p.quantity + delta);
          const maxQty = p.maxQuantity || p.quantity;
          if (newQty > maxQty) {
            toast.error("Maximum quantity reached");
            return p;
          }
          return { ...p, quantity: newQty };
        }
        return p;
      }),
    );
  };

  // Remove product
  const handleRemoveProduct = (index: number) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculate totals
  const totals = selectedProducts.reduce(
    (acc, product) => ({
      totalPrice:
        acc.totalPrice +
        Number(product.updatedPrice || product.unitPrice) * product.quantity,
      totalItems: acc.totalItems + product.quantity,
    }),
    { totalPrice: 0, totalItems: 0 },
  );

  // Preview changes - Step 1: Validate
  const handlePreviewChanges = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Order must have at least one product");
      return;
    }

    setValidating(true);
    try {
      const productsPayload = selectedProducts.map((p) => ({
        productId: p.id,
        quantity: p.quantity,
        ...(p.variant?.id && { variationId: p.variant.id }),
      }));

      const response = await validateModification(
        typeof orderId === "string" ? orderId : String(orderId),
        { products: productsPayload },
      );

      if (response.success && response.data) {
        setValidationData(response.data);
        setShowValidationDialog(true);
      } else {
        toast.error(response.error || "Failed to validate changes");
      }
    } catch (error: any) {
      console.error("Validation error:", error);
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to validate changes",
      );
    } finally {
      setValidating(false);
    }
  };

  // Confirm and apply changes - Step 2: Save
  const handleConfirmSave = async () => {
    setLoading(true);
    setShowValidationDialog(false);

    try {
      const productsPayload = selectedProducts.map((p) => ({
        productId: p.id,
        quantity: p.quantity,
        ...(p.variant?.id && { variationId: p.variant.id }),
      }));

      const response = await modifyOrder(
        typeof orderId === "string" ? orderId : String(orderId),
        { products: productsPayload },
      );

      if (response.success && response.data) {
        const summary = response.data.summary;
        // Use selected products as updated products since API doesn't return them
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

        toast.success(
          `Order modified!\nProducts: ${summary?.oldProductCount} → ${summary?.newProductCount}\nPrice: ৳${summary?.oldTotalPrice} → ৳${summary?.newTotalPrice}`,
        );

        onSuccess(
          updatedProducts as IOrderProduct[],
          summary?.newTotalPrice || totals.totalPrice,
          summary,
        );
        onOpenChange(false);
      } else {
        toast.error(response.error || "Failed to modify order");
        setShowValidationDialog(true); // Show validation dialog again on error
      }
    } catch (error: any) {
      console.error("Modify error:", error);
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to modify order",
      );
      setShowValidationDialog(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle>Modify Order Products</DialogTitle>
          <p className='text-sm text-gray-500'>Order #{orderNumber}</p>
        </DialogHeader>

        <div className='flex-1 overflow-hidden flex flex-col gap-4'>
          {/* Search with Command-Style Popover */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10' />
            <Input
              ref={searchInputRef}
              placeholder='Search products to add... (min. 2 characters)'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() =>
                searchResults.length > 0 && setShowSearchResults(true)
              }
              className='pl-10'
            />
            {searching && (
              <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400 z-10' />
            )}

            {/* Command-Style Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div
                ref={searchResultsRef}
                className='absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-hidden'>
                <ScrollArea className='h-64'>
                  <div className='p-1 '>
                    {searchResults.map((product, index) => (
                      <button
                        key={`${product.id}-${product.variant?.id || "default"}-${index}`}
                        onClick={() => handleAddProduct(product)}
                        className='w-full flex items-center gap-3 p-3 mb-2 rounded-md hover:bg-gray-50 transition-colors text-left group bg-gray-100'>
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className='w-10 h-14 rounded object-cover border border-gray-200 flex-shrink-0'
                          />
                        ) : (
                          <div className='w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0'>
                            <Package className='h-5 w-5 text-gray-400' />
                          </div>
                        )}
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors'>
                            {product.name.toUpperCase()}
                          </p>
                          {product.variant &&
                            (product.variant.color || product.variant.size) && (
                              <p className='text-xs text-gray-500'>
                                {product.variant.color && (
                                  <span className='capitalize'>
                                    {product.variant.color}
                                  </span>
                                )}
                                {product.variant.color &&
                                  product.variant.size && <span> • </span>}
                                {product.variant.size && (
                                  <span>{product.variant.size}</span>
                                )}
                              </p>
                            )}
                          <div className='flex items-center gap-2 mt-1'>
                            <Badge
                              variant='outline'
                              className='text-xs bg-white'>
                              {product?.unitPrice &&
                              product?.updatedPrice &&
                              product?.updatedPrice !== product?.unitPrice ? (
                                <div className='flex items-center gap-2'>
                                  <span className='text-sm font-bold text-gray-900 ml-2'>
                                    ৳{product?.updatedPrice}
                                  </span>
                                  <span className='text-sm font-medium text-red-600 line-through'>
                                    ৳{product?.unitPrice}
                                  </span>
                                </div>
                              ) : (
                                <span className='text-sm font-bold text-gray-900 ml-2'>
                                  ৳{product?.unitPrice}
                                </span>
                              )}
                            </Badge>
                            {typeof product?.discount === "number" &&
                              product?.discount > 0 && (
                                <Badge
                                  variant='default'
                                  className='text-xs bg-green-100 text-green-500'>
                                  {product.discount} TK Off
                                </Badge>
                              )}
                            <Badge
                              variant={
                                product.quantity > 0 ? "default" : "destructive"
                              }
                              className='text-xs '>
                              Stock: {product.quantity}
                            </Badge>
                          </div>
                        </div>
                        <Plus className='h-5 w-5 text-green-600 flex-shrink-0' />
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          <Separator />

          {/* Selected Products */}
          <div className='flex-1 overflow-hidden'>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='font-semibold'>Selected Products</h3>
              <Badge variant='secondary'>
                {selectedProducts.length} items • ৳
                {totals.totalPrice.toLocaleString()}
              </Badge>
            </div>

            <ScrollArea className='h-[300px]'>
              {selectedProducts.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-12 text-gray-500'>
                  <Package className='h-12 w-12 mb-2' />
                  <p>No products in order</p>
                </div>
              ) : (
                <div className='space-y-2 pr-4'>
                  {selectedProducts.map((product, index) => (
                    <Card key={index}>
                      <CardContent className='p-3'>
                        <div className='flex items-center gap-3'>
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className='w-12 h-12 rounded object-cover'
                            />
                          )}
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium truncate'>
                              {product.name}
                            </p>
                            {product.variant && (
                              <p className='text-xs text-gray-500'>
                                {product.variant.color} {product.variant.size}
                              </p>
                            )}
                            <p className='text-sm font-semibold text-blue-600'>
                              ৳{product.updatedPrice || product.unitPrice} ×{" "}
                              {product.quantity} = ৳
                              {(
                                Number(
                                  product.updatedPrice || product.unitPrice,
                                ) * product.quantity
                              ).toLocaleString()}
                            </p>
                          </div>

                          <div className='flex items-center gap-1'>
                            <Button
                              variant='outline'
                              size='icon'
                              className='h-7 w-7'
                              onClick={() => handleUpdateQuantity(index, -1)}>
                              <Minus className='h-3 w-3' />
                            </Button>
                            <span className='w-8 text-center text-sm font-medium'>
                              {product.quantity}
                            </span>
                            <Button
                              variant='outline'
                              size='icon'
                              className='h-7 w-7'
                              onClick={() => handleUpdateQuantity(index, 1)}>
                              <Plus className='h-3 w-3' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-7 w-7 text-red-600'
                              onClick={() => handleRemoveProduct(index)}>
                              <Trash2 className='h-3 w-3' />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <div className='border-t pt-4'>
          <div className='flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-lg'>
            <div>
              <p className='text-sm text-gray-600'>
                Total ({totals.totalItems} items)
              </p>
            </div>
            <p className='text-lg font-bold text-blue-600'>
              ৳{totals.totalPrice.toLocaleString()}
            </p>
          </div>
          <div className='flex items-center justify-between mb-3 p-3 bg-orange-50 rounded-lg'>
            <div>
              <p className='text-sm font-bold text-orange-600'>
                Total Amount: ৳ {totals?.totalPrice + (deliveryCharge ?? 0)}{" "}
                (delivery charge = ৳ {deliveryCharge ?? 0})
              </p>
            </div>
            <p className='text-sm font-bold text-orange-600'>
              Due: ৳ {totals?.totalPrice + (deliveryCharge ?? 0) - (paid ?? 0)}
            </p>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading || validating}
              className='flex-1'>
              Cancel
            </Button>
            <Button
              onClick={handlePreviewChanges}
              disabled={loading || validating || selectedProducts.length === 0}
              className='flex-1'>
              {validating ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle2 className='h-4 w-4 mr-2' />
                  Preview Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Validation Dialog */}
        {showValidationDialog && validationData && (
          <Dialog
            open={showValidationDialog}
            onOpenChange={setShowValidationDialog}>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Confirm Order Modifications</DialogTitle>
                <p className='text-sm text-gray-500'>
                  Review the estimated changes before applying
                </p>
              </DialogHeader>

              <div className='space-y-4 py-4'>
                {/* Estimated Changes */}
                {validationData.estimatedChanges && (
                  <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                    <h4 className='font-semibold text-sm text-blue-900 mb-3 flex items-center gap-2'>
                      <Info className='h-4 w-4' />
                      Estimated Changes
                    </h4>
                    <div className='grid grid-cols-2 gap-3 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-blue-700'>Products:</span>
                        <span className='font-semibold text-blue-900'>
                          {validationData.estimatedChanges.oldProductCount} →{" "}
                          {validationData.estimatedChanges.newProductCount}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-blue-700'>Total Price:</span>
                        <span className='font-semibold text-blue-900'>
                          ৳
                          {validationData.estimatedChanges.oldTotalPrice.toLocaleString()}{" "}
                          → ৳
                          {validationData.estimatedChanges.newTotalPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className='col-span-2 flex justify-between pt-2 border-t border-blue-200'>
                        <span className='text-blue-700 font-medium'>
                          Difference:
                        </span>
                        <span
                          className={`font-bold ${validationData.estimatedChanges.priceDifference >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {validationData.estimatedChanges.priceDifference >= 0
                            ? "+"
                            : ""}
                          ৳
                          {validationData.estimatedChanges.priceDifference.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Validation Results */}
                {validationData.validationResults &&
                  validationData.validationResults.length > 0 && (
                    <div className='space-y-2'>
                      <h4 className='font-semibold text-sm flex items-center gap-2'>
                        <Package className='h-4 w-4' />
                        Product Validation Results
                      </h4>
                      <ScrollArea className='h-48'>
                        <div className='space-y-2 pr-4'>
                          {validationData.validationResults.map(
                            (result, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg border ${
                                  result.valid
                                    ? "bg-green-50 border-green-200"
                                    : "bg-red-50 border-red-200"
                                }`}>
                                <div className='flex items-start gap-2'>
                                  {result.valid ? (
                                    <CheckCircle2 className='h-4 w-4 text-green-600 mt-0.5 flex-shrink-0' />
                                  ) : (
                                    <AlertTriangle className='h-4 w-4 text-red-600 mt-0.5 flex-shrink-0' />
                                  )}
                                  <div className='flex-1 min-w-0'>
                                    <p className='text-sm font-medium text-gray-900'>
                                      {result.productName}
                                    </p>
                                    <p className='text-xs text-gray-500'>
                                      Requested: {result.requestedQuantity} |
                                      Available: {result.availableStock}
                                    </p>
                                    {result.variationDetails && (
                                      <p className='text-xs text-gray-500'>
                                        Variant: {result.variationDetails}
                                      </p>
                                    )}
                                    {!result.valid && result.error && (
                                      <p className='text-xs text-red-600 mt-1'>
                                        {result.error}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                {/* Overall Validation Status */}
                <Alert
                  className={
                    validationData.valid
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }>
                  {validationData.valid ? (
                    <>
                      <CheckCircle2 className='h-4 w-4 text-green-600' />
                      <AlertDescription className='text-green-800'>
                        All changes are valid. Click "Confirm" to apply these
                        modifications.
                      </AlertDescription>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className='h-4 w-4 text-red-600' />
                      <AlertDescription className='text-red-800'>
                        Some changes have validation issues. Please review
                        before continuing.
                      </AlertDescription>
                    </>
                  )}
                </Alert>
              </div>

              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setShowValidationDialog(false)}
                  disabled={loading}
                  className='flex-1'>
                  <XCircle className='h-4 w-4 mr-2' />
                  Back to Edit
                </Button>
                <Button
                  onClick={handleConfirmSave}
                  disabled={loading || !validationData.valid}
                  className='flex-1 bg-green-600 hover:bg-green-700'>
                  {loading ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className='h-4 w-4 mr-2' />
                      Confirm Changes
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
