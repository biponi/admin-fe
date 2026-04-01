import React, { useEffect, useState } from "react";
import {
  searchProducts,
  createPurchaseOrder,
} from "./services/purchaseOrderApi";
import { ProductSearchResponse } from "./types";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertDescription } from "../../components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Dialog, DialogContent, DialogTitle } from "../../components/ui/dialog";
import { ScrollArea } from "../../components/ui/scroll-area";
import useDebounce from "../../customHook/useDebounce";
import { useIsMobile } from "../../hooks/use-mobile";
import { cn } from "../../utils/functions";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Package,
  ShoppingCart,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
  Box,
  TrendingUp,
  Sparkles,
  FileText,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import MainView from "../../coreComponents/mainView";
import axios from "axios";

const CreatePurchaseOrder: React.FC = () => {
  const isMobile = useIsMobile();
  const [products, setProducts] = useState<ProductSearchResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<
    ProductSearchResponse[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  const handleSearch = () => {
    if (!searchQuery || searchQuery === "") {
      setProducts([]);
      return;
    }
    setSearching(true);
    searchProducts(searchQuery)
      .then((res) => {
        setProducts([...res]);
        setSearching(false);
      })
      .catch((error) => {
        if (axios.isAxiosError(error) && error.response) {
          console.error("API error:", error?.response?.data?.message);
          toast.error(error?.response?.data?.message);
        } else {
          toast.error("Something went wrong. Please try again later.");
        }
        setSearching(false);
      });
  };

  const debounce = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (searchQuery && searchQuery.trim() !== "") {
      handleSearch();
    } else {
      setProducts([]);
    }
    //eslint-disable-next-line
  }, [debounce]);

  const handleAddProduct = React.useCallback(
    (product: ProductSearchResponse) => {
      const existingProduct = selectedProducts.find((p) =>
        product.variant?.id
          ? p.id === product.id && p.variant?.id === product.variant.id
          : p.id === product.id,
      );

      if (existingProduct) {
        setSelectedProducts((prev) =>
          prev.map((p) =>
            p.id === product.id && p.variant?.id === product.variant?.id
              ? { ...p, quantity: p.quantity + 1 }
              : !p.variant && p.id === product.id
                ? { ...p, quantity: p.quantity + 1 }
                : p,
          ),
        );
        toast.success(`Increased quantity for ${product.name}`, {
          icon: "➕",
        });
      } else {
        setSelectedProducts((prev) => [
          ...prev,
          { ...product, quantity: 1, unitPrice: product?.unitPrice },
        ]);
        toast.success(`Added ${product.name} to order`, {
          icon: "✨",
        });
      }
    },
    [selectedProducts],
  );

  const handleCreateOrder = () => {
    if (selectedProducts.length === 0) {
      toast.error("Please add at least one product to create a purchase order");
      return;
    }

    const hasInvalidQuantities = selectedProducts.some(
      (p) => !p.quantity || p.quantity <= 0,
    );
    if (hasInvalidQuantities) {
      toast.error("Please ensure all products have valid quantities");
      return;
    }

    setLoading(true);
    createPurchaseOrder(selectedProducts)
      .then(() => {
        setLoading(false);
        setSelectedProducts([]);
        toast.success("Purchase order created successfully! 🎉");
      })
      .catch((error) => {
        if (axios.isAxiosError(error) && error.response) {
          console.error("API error:", error.response.data.message);
          toast.error(error.response.data.message);
        } else {
          toast.error("Something went wrong. Please try again later.");
        }
        setLoading(false);
      });
  };

  const handleQuantityChange = React.useCallback(
    (index: number, value: string) => {
      if (value === "" || /^\d+$/.test(value)) {
        setSelectedProducts((prev) =>
          prev.map((p, i) =>
            i === index
              ? { ...p, quantity: value === "" ? 0 : parseInt(value) }
              : p,
          ),
        );
      }
    },
    [],
  );

  const handleUnitPriceChange = React.useCallback(
    (index: number, value: string) => {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setSelectedProducts((prev) =>
          prev.map((p, i) =>
            i === index
              ? { ...p, unitPrice: value === "" ? 0 : parseFloat(value) || 0 }
              : p,
          ),
        );
      }
    },
    [],
  );

  const handleQuantityIncrement = React.useCallback((index: number) => {
    setSelectedProducts((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, quantity: (p.quantity || 0) + 1 } : p,
      ),
    );
  }, []);

  const handleQuantityDecrement = React.useCallback((index: number) => {
    setSelectedProducts((prev) =>
      prev.map((p, i) =>
        i === index
          ? { ...p, quantity: Math.max(0, (p.quantity || 0) - 1) }
          : p,
      ),
    );
  }, []);

  const removeProduct = React.useCallback(
    (index: number) => {
      const productName = selectedProducts[index].name;
      setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
      toast.success(`Removed ${productName}`, {
        icon: "🗑️",
      });
    },
    [selectedProducts],
  );

  const calculateTotal = React.useCallback(() => {
    return selectedProducts
      .reduce((total, product) => {
        const quantity =
          typeof product.quantity === "number"
            ? product.quantity
            : parseInt(String(product.quantity)) || 0;
        const unitPrice =
          typeof product.unitPrice === "number"
            ? product.unitPrice
            : parseFloat(String(product.unitPrice)) || 0;
        return total + quantity * unitPrice;
      }, 0)
      .toFixed(2);
  }, [selectedProducts]);

  const totalItems = React.useMemo(() => {
    return selectedProducts.reduce((sum, p) => sum + (p.quantity || 0), 0);
  }, [selectedProducts]);

  const ProductSearchDialog = () => (
    <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
      <DialogContent
        className={cn(
          "gap-0 p-0 overflow-hidden",
          isMobile
            ? "max-w-[95vw] max-h-[90vh] h-[90vh]"
            : "max-w-4xl max-h-[90vh]",
        )}>
        {/* Enhanced Header with Gradient */}
        <div className='relative overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90' />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

          <div className='relative flex items-center justify-between p-6'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg'>
                <Search className='h-6 w-6 text-white' />
              </div>
              <div>
                <DialogTitle className='text-xl font-bold text-white mb-1'>
                  Find Products
                </DialogTitle>
                <p className='text-sm text-blue-100'>
                  Search and add items to your purchase order
                </p>
              </div>
            </div>
            <Button
              variant='ghost'
              size='sm'
              className='h-9 w-9 p-0 text-white hover:bg-white/20 rounded-full transition-all'
              onClick={() => setSearchDialogOpen(false)}>
              <X className='h-5 w-5' />
            </Button>
          </div>
        </div>

        {/* Enhanced Search Input Section */}
        <div className='p-6 bg-gradient-to-b from-gray-50 to-white border-b'>
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300' />
            <div className='relative'>
              <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10' />
              <Input
                placeholder='Search by name, SKU, or product ID...'
                value={searchQuery}
                onChange={(e) => {
                  e.preventDefault();
                  setSearchQuery(e.target.value);
                }}
                className={cn(
                  "pl-12 pr-12 h-14 text-base rounded-xl",
                  "border-2 border-gray-200 focus-visible:border-blue-500",
                  "shadow-sm hover:shadow-md focus-visible:shadow-lg",
                  "transition-all duration-200 bg-white",
                )}
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-all z-10'
                  onClick={() => {
                    setSearchQuery("");
                    setProducts([]);
                  }}>
                  <X className='h-4 w-4' />
                </Button>
              )}
            </div>
          </div>

          {searchQuery && (
            <div className='mt-3 flex items-center gap-2 px-1'>
              <div className='h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse' />
              <p className='text-sm text-gray-600'>
                Searching for{" "}
                <span className='font-semibold text-gray-900'>
                  "{searchQuery}"
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Results Area */}
        <ScrollArea
          className={cn(
            "bg-gradient-to-b from-gray-50/50 to-white",
            isMobile ? "h-[calc(90vh-230px)]" : "h-[calc(90vh-230px)]",
          )}>
          <div className='p-6'>
            {searching ? (
              <div className='flex flex-col items-center justify-center py-20'>
                <div className='relative mb-6'>
                  <div className='absolute inset-0 animate-ping'>
                    <div className='h-16 w-16 rounded-full bg-blue-400/30' />
                  </div>
                  <div className='relative'>
                    <Loader2 className='h-16 w-16 animate-spin text-blue-600' />
                  </div>
                </div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  Searching products...
                </h3>
                <p className='text-sm text-gray-500'>
                  Please wait while we find matching items
                </p>
              </div>
            ) : products.length > 0 ? (
              <div className='space-y-4'>
                {/* Results Header */}
                <div className='flex items-center justify-between px-1 pb-2'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle2 className='h-4 w-4 text-green-600' />
                    <p className='text-sm font-semibold text-gray-700'>
                      Found {products.length} product
                      {products.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Badge variant='secondary' className='text-xs'>
                    {selectedProducts.length} selected
                  </Badge>
                </div>

                {/* Product Cards - Using improved component */}
                {products.map((product, index) => {
                  const isSelected = selectedProducts.some((p) =>
                    product.variant?.id
                      ? p.id === product.id &&
                        p.variant?.id === product.variant.id
                      : p.id === product.id,
                  );

                  return (
                    <Card
                      key={`${product.id}-${product.variant?.id || "no-variant"}-${index}`}
                      className={cn(
                        "group relative overflow-hidden transition-all duration-300 cursor-pointer",
                        "hover:shadow-2xl hover:-translate-y-1",
                        isSelected
                          ? "bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-400 shadow-xl ring-4 ring-emerald-100"
                          : "bg-white hover:border-blue-400 border-2 border-gray-200 hover:shadow-xl",
                      )}
                      onClick={() => handleAddProduct(product)}>
                      {/* Animated Background Gradient */}
                      {isSelected && (
                        <div className='absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-green-400/10 to-teal-400/10 animate-pulse' />
                      )}

                      {/* Selected Badge */}
                      {isSelected && (
                        <div className='absolute top-3 right-3 z-10'>
                          <div className='bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300'>
                            <Sparkles className='h-3.5 w-3.5' />
                            Added
                          </div>
                        </div>
                      )}

                      <CardContent className='p-5 relative'>
                        <div className='flex items-start gap-4'>
                          {/* Enhanced Product Image */}
                          <div className='relative flex-shrink-0'>
                            <div
                              className={cn(
                                "relative rounded-2xl overflow-hidden transition-all duration-300",
                                "shadow-lg group-hover:shadow-2xl",
                                isSelected
                                  ? "ring-4 ring-emerald-300 border-2 border-emerald-400"
                                  : "border-2 border-gray-200 group-hover:border-blue-400 group-hover:ring-4 group-hover:ring-blue-100",
                              )}>
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className='w-24 h-24 object-cover bg-gray-50 transition-transform duration-500 group-hover:scale-110'
                                />
                              ) : (
                                <div className='w-24 h-24 bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 flex items-center justify-center'>
                                  <Package className='h-12 w-12 text-gray-400 group-hover:text-gray-500 transition-colors' />
                                </div>
                              )}

                              {/* Image Overlay on Selected */}
                              {isSelected && (
                                <div className='absolute inset-0 bg-emerald-500/30 backdrop-blur-[2px] flex items-center justify-center transition-all duration-300'>
                                  <div className='bg-white rounded-full p-2 shadow-xl animate-in zoom-in duration-300'>
                                    <CheckCircle2 className='h-7 w-7 text-emerald-600' />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Product Details */}
                          <div className='flex-1 min-w-0 space-y-3'>
                            {/* Product Name */}
                            <h4
                              className={cn(
                                "font-bold text-lg leading-tight line-clamp-2 transition-colors duration-200",
                                isSelected
                                  ? "text-emerald-900"
                                  : "text-gray-900 group-hover:text-blue-700",
                              )}>
                              {product.name}
                            </h4>

                            {/* SKU and Variant Badges */}
                            <div className='flex flex-wrap items-center gap-2'>
                              <Badge
                                variant='outline'
                                className={cn(
                                  "text-xs font-mono px-2.5 py-1 transition-all",
                                  isSelected
                                    ? "bg-emerald-100 border-emerald-400 text-emerald-800 shadow-sm"
                                    : "bg-gray-50 border-gray-300 text-gray-700 group-hover:border-blue-300 group-hover:bg-blue-50",
                                )}>
                                {product.sku}
                              </Badge>

                              {product.variant && (
                                <Badge
                                  variant='secondary'
                                  className={cn(
                                    "text-xs px-2.5 py-1 font-medium transition-all",
                                    isSelected
                                      ? "bg-teal-100 text-teal-800 border border-teal-200"
                                      : "bg-blue-50 text-blue-700 border border-blue-200",
                                  )}>
                                  {`${product.variant.color || ""}${
                                    product.variant.color &&
                                    product.variant.size
                                      ? " · "
                                      : ""
                                  }${product.variant.size || ""}`}
                                </Badge>
                              )}
                            </div>

                            {/* Price and Action Row */}
                            <div className='flex justify-between items-end pt-2 gap-3'>
                              {/* Price Display */}
                              {product.unitPrice && (
                                <div className='flex flex-col'>
                                  <span className='text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1'>
                                    Unit Price
                                  </span>
                                  <p
                                    className={cn(
                                      "text-2xl font-bold tracking-tight transition-colors",
                                      isSelected
                                        ? "text-emerald-700"
                                        : "text-blue-600 group-hover:text-blue-700",
                                    )}>
                                    ৳
                                    {typeof product.unitPrice === "number"
                                      ? product.unitPrice.toLocaleString(
                                          "en-BD",
                                          {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          },
                                        )
                                      : parseFloat(
                                          product.unitPrice || "0",
                                        ).toLocaleString("en-BD", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                  </p>
                                </div>
                              )}

                              {/* Action Button */}
                              <Button
                                size={isMobile ? "default" : "lg"}
                                className={cn(
                                  "flex-shrink-0 gap-2 transition-all duration-300 font-bold shadow-lg",
                                  "hover:shadow-xl hover:scale-105 active:scale-95",
                                  isSelected
                                    ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6"
                                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6",
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddProduct(product);
                                }}>
                                {isSelected ? (
                                  <>
                                    <CheckCircle2 className='h-4 w-4' />
                                    Added
                                  </>
                                ) : (
                                  <>
                                    <Plus className='h-4 w-4' />
                                    {isMobile ? "Add" : "Add to Order"}
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>

                      {/* Bottom Accent Bar */}
                      <div
                        className={cn(
                          "absolute bottom-0 left-0 right-0 h-1.5 transition-all duration-300",
                          isSelected
                            ? "bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 opacity-100"
                            : "bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100",
                        )}
                      />
                    </Card>
                  );
                })}
              </div>
            ) : searchQuery ? (
              <div className='flex flex-col items-center justify-center py-20 text-center'>
                <div className='relative mb-6'>
                  <div className='p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl'>
                    <Package className='h-16 w-16 text-gray-400' />
                  </div>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-2'>
                  No products found
                </h3>
                <p className='text-sm text-gray-500 max-w-md mb-6'>
                  We couldn't find any products matching{" "}
                  <span className='font-semibold'>"{searchQuery}"</span>. Try
                  different keywords or check the spelling.
                </p>
                <Button
                  variant='outline'
                  onClick={() => {
                    setSearchQuery("");
                    setProducts([]);
                  }}
                  className='gap-2'>
                  <X className='h-4 w-4' />
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-20 text-center'>
                <div className='relative mb-6'>
                  <div className='absolute inset-0 bg-blue-500/20 rounded-full blur-2xl' />
                  <div className='relative p-6 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-3xl'>
                    <Search className='h-16 w-16 text-blue-600' />
                  </div>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-2'>
                  Start Searching
                </h3>
                <p className='text-sm text-gray-500 max-w-md'>
                  Enter a product name, SKU, or ID in the search box above to
                  find products for your purchase order.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );

  return (
    <MainView title='Create Purchase Order'>
      <div
        className={cn(
          "space-y-6",
          !isMobile && "container mx-auto p-6 max-w-7xl",
        )}>
        {/* Enhanced Hero Header */}
        <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 shadow-2xl'>
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

          <div
            className={cn(
              "relative",
              isMobile ? "space-y-4" : "flex items-center justify-between",
            )}>
            {/* Left Side - Title & Description */}
            <div className={cn(isMobile ? "" : "flex-1")}>
              <div className='flex items-center gap-3 mb-3'>
                <div className='p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg'>
                  <ShoppingCart className='h-7 w-7 text-white' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold text-white mb-1'>
                    Create Purchase Order
                  </h1>
                  <p className='text-blue-100 text-sm font-medium'>
                    Build your order with ease and precision
                  </p>
                </div>
              </div>
              <p className='text-blue-50 text-sm max-w-2xl leading-relaxed'>
                Search for products, adjust quantities and prices, and create
                your purchase order in minutes. All your order data is
                automatically saved.
              </p>
            </div>

            {/* Right Side - Stats Cards (Desktop Only) */}
            {!isMobile && (
              <div className='flex gap-4'>
                <Card className='bg-white/10 backdrop-blur-md border-white/20 shadow-xl'>
                  <CardContent className='p-5'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2.5 bg-emerald-500 rounded-xl shadow-lg'>
                        <Box className='h-6 w-6 text-white' />
                      </div>
                      <div>
                        <p className='text-xs text-blue-100 font-semibold uppercase tracking-wide'>
                          Total Items
                        </p>
                        <p className='text-3xl font-bold text-white'>
                          {totalItems}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className='bg-white/10 backdrop-blur-md border-white/20 shadow-xl'>
                  <CardContent className='p-5'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2.5 bg-amber-500 rounded-xl shadow-lg'>
                        <TrendingUp className='h-6 w-6 text-white' />
                      </div>
                      <div>
                        <p className='text-xs text-blue-100 font-semibold uppercase tracking-wide'>
                          Total Value
                        </p>
                        <p className='text-3xl font-bold text-white'>
                          ৳{calculateTotal()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Stats Cards */}
        {isMobile && selectedProducts.length > 0 && (
          <div className='grid grid-cols-2 gap-3'>
            <Card className='bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200'>
              <CardContent className='p-4'>
                <div className='flex items-center gap-2 mb-1'>
                  <Box className='h-4 w-4 text-emerald-600' />
                  <p className='text-xs text-emerald-700 font-bold uppercase'>
                    Items
                  </p>
                </div>
                <p className='text-2xl font-bold text-emerald-900'>
                  {totalItems}
                </p>
              </CardContent>
            </Card>

            <Card className='bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200'>
              <CardContent className='p-4'>
                <div className='flex items-center gap-2 mb-1'>
                  <TrendingUp className='h-4 w-4 text-amber-600' />
                  <p className='text-xs text-amber-700 font-bold uppercase'>
                    Value
                  </p>
                </div>
                <p className='text-2xl font-bold text-amber-900'>
                  ৳{calculateTotal()}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Action Bar */}
        <Card className='shadow-lg border-2 border-gray-200 overflow-hidden'>
          <div className='bg-gradient-to-r from-gray-50 to-gray-100/50 border-b px-6 py-4'>
            <div className='flex items-center gap-2'>
              <FileText className='h-5 w-5 text-gray-600' />
              <h3 className='font-bold text-gray-900'>Order Actions</h3>
            </div>
          </div>
          <CardContent className='p-6'>
            <div
              className={cn(
                "flex items-center gap-4",
                isMobile ? "flex-col" : "justify-between",
              )}>
              <div
                className={cn(
                  "flex items-center gap-3",
                  isMobile ? "w-full" : "",
                )}>
                <Button
                  size={isMobile ? "lg" : "default"}
                  className={cn(
                    "gap-2 shadow-md hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-semibold",
                    isMobile ? "flex-1 h-12 text-base" : "px-6",
                  )}
                  onClick={() => setSearchDialogOpen(true)}>
                  <Plus className='h-5 w-5' />
                  Add Products
                </Button>
                {selectedProducts.length > 0 && (
                  <Badge
                    variant='secondary'
                    className={cn(
                      "text-sm font-bold px-4 py-2 shadow-sm",
                      isMobile ? "" : "ml-2",
                    )}>
                    {selectedProducts.length}{" "}
                    {selectedProducts.length === 1 ? "item" : "items"}
                  </Badge>
                )}
              </div>

              <div
                className={cn(
                  "flex items-center gap-4",
                  isMobile ? "w-full" : "",
                )}>
                {selectedProducts.length > 0 && !isMobile && (
                  <div className='text-right px-4 py-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200'>
                    <p className='text-xs text-green-700 font-bold uppercase tracking-wide'>
                      Order Total
                    </p>
                    <p className='text-2xl font-bold text-green-700'>
                      ৳{calculateTotal()}
                    </p>
                  </div>
                )}
                <Button
                  size={isMobile ? "lg" : "default"}
                  onClick={handleCreateOrder}
                  disabled={loading || selectedProducts.length === 0}
                  className={cn(
                    "gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-md hover:shadow-xl transition-all duration-200 font-bold disabled:opacity-50",
                    isMobile ? "flex-1 h-12 text-base" : "px-6",
                  )}>
                  {loading ? (
                    <>
                      <Loader2 className='h-5 w-5 animate-spin' />
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className='h-5 w-5' />
                      Create Order
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Products Section */}
        <Card className='shadow-lg border-2 border-gray-200 overflow-hidden'>
          <CardHeader className='bg-gradient-to-r from-gray-50 via-blue-50/30 to-indigo-50/30 border-b-2'>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-3 text-xl'>
                  <div className='p-2 bg-blue-600 rounded-lg'>
                    <ShoppingBag className='h-5 w-5 text-white' />
                  </div>
                  Order Items
                </CardTitle>
                <CardDescription className='mt-2 text-base'>
                  {selectedProducts.length === 0
                    ? "Your order is empty. Add products to get started."
                    : `Managing ${selectedProducts.length} product${selectedProducts.length > 1 ? "s" : ""} • ${totalItems} total items`}
                </CardDescription>
              </div>
              {!isMobile && selectedProducts.length > 0 && (
                <Badge
                  variant='secondary'
                  className='text-base px-4 py-2 font-bold'>
                  {selectedProducts.length}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className={cn(isMobile ? "p-4" : "p-6")}>
            {selectedProducts.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-20 text-center'>
                <div className='relative mb-8'>
                  <div className='absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse' />
                  <div className='relative p-8 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-3xl shadow-xl'>
                    <ShoppingBag className='h-20 w-20 text-blue-600' />
                  </div>
                </div>
                <h3 className='text-2xl font-bold text-gray-900 mb-3'>
                  No Products Added Yet
                </h3>
                <p className='text-gray-500 mb-8 max-w-md text-base leading-relaxed'>
                  Start building your purchase order by searching and adding
                  products. You can search by product name, SKU, or ID.
                </p>
                <Button
                  size='lg'
                  className='gap-2 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 font-bold'
                  onClick={() => setSearchDialogOpen(true)}>
                  <Plus className='h-5 w-5' />
                  Add Your First Product
                </Button>
              </div>
            ) : (
              <div className='space-y-6'>
                {isMobile ? (
                  /* Enhanced Mobile Card View (continues in next message due to length) */
                  <div className='space-y-4'>
                    {selectedProducts.map((product, index) => {
                      const quantity =
                        typeof product.quantity === "number"
                          ? product.quantity
                          : parseInt(String(product.quantity)) || 0;
                      const unitPrice =
                        typeof product.unitPrice === "number"
                          ? product.unitPrice
                          : parseFloat(String(product.unitPrice)) || 0;
                      const total = (quantity * unitPrice).toFixed(2);

                      return (
                        <Card
                          key={product.variant?.id || product.id}
                          className='group overflow-hidden border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300'>
                          {/* Product Header */}
                          <div className='bg-gradient-to-r from-gray-50 via-blue-50/30 to-indigo-50/30 p-4 border-b-2'>
                            <div className='flex items-start gap-3'>
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className='w-20 h-20 rounded-xl object-cover border-2 border-white shadow-lg'
                                />
                              ) : (
                                <div className='w-20 h-20 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-2 border-white shadow-lg'>
                                  <Package className='h-10 w-10 text-gray-500' />
                                </div>
                              )}
                              <div className='flex-1 min-w-0'>
                                <h4 className='font-bold text-lg mb-1 line-clamp-2 text-gray-900'>
                                  {product.name}
                                </h4>
                                <p className='text-xs text-gray-500 font-mono mb-2'>
                                  SKU: {product.sku}
                                </p>
                                {product.variant ? (
                                  <Badge
                                    variant='outline'
                                    className='text-xs font-medium'>
                                    {`${product.variant.color || ""}${
                                      product.variant.color &&
                                      product.variant.size
                                        ? " · "
                                        : ""
                                    }${product.variant.size || ""}`}
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant='secondary'
                                    className='text-xs'>
                                    Standard
                                  </Badge>
                                )}
                              </div>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => removeProduct(index)}
                                className='h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg flex-shrink-0 transition-all'>
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          </div>

                          {/* Controls */}
                          <div className='p-4 space-y-4 bg-white'>
                            {/* Quantity Control */}
                            <div className='space-y-2'>
                              <label className='text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1'>
                                <Box className='h-3 w-3' />
                                Quantity
                              </label>
                              <div className='flex items-center gap-2'>
                                <Button
                                  variant='outline'
                                  size='lg'
                                  onClick={() => handleQuantityDecrement(index)}
                                  disabled={quantity <= 0}
                                  className='h-12 w-12 rounded-xl border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400 transition-all disabled:opacity-30'>
                                  <Minus className='h-5 w-5' />
                                </Button>
                                <Input
                                  type='text'
                                  value={product.quantity || ""}
                                  onChange={(e) =>
                                    handleQuantityChange(index, e.target.value)
                                  }
                                  className='flex-1 text-center h-12 text-xl font-bold border-2 border-blue-200 focus-visible:ring-blue-500 rounded-xl'
                                  placeholder='0'
                                />
                                <Button
                                  variant='outline'
                                  size='lg'
                                  onClick={() => handleQuantityIncrement(index)}
                                  className='h-12 w-12 rounded-xl border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400 transition-all'>
                                  <Plus className='h-5 w-5' />
                                </Button>
                              </div>
                            </div>

                            {/* Unit Price Control */}
                            <div className='space-y-2'>
                              <label className='text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1'>
                                <DollarSign className='h-3 w-3' />
                                Unit Price (৳)
                              </label>
                              <div className='relative'>
                                <span className='absolute left-4 top-1/2 -translate-y-1/2 text-purple-600 font-bold text-lg'>
                                  ৳
                                </span>
                                <Input
                                  type='text'
                                  value={product.unitPrice || ""}
                                  onChange={(e) =>
                                    handleUnitPriceChange(index, e.target.value)
                                  }
                                  className='pl-10 h-12 text-lg font-bold border-2 border-purple-200 focus-visible:ring-purple-500 rounded-xl'
                                  placeholder='0.00'
                                />
                              </div>
                            </div>

                            {/* Total */}
                            <div className='bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 rounded-2xl p-5 border-2 border-emerald-300 shadow-md'>
                              <div className='flex items-center justify-between'>
                                <span className='text-sm font-bold text-emerald-700 uppercase tracking-wide'>
                                  Line Total
                                </span>
                                <div className='flex items-baseline gap-1'>
                                  <span className='text-emerald-600 font-bold text-base'>
                                    ৳
                                  </span>
                                  <span className='text-3xl font-bold text-emerald-900'>
                                    {total}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  /* Desktop Table View - Continuing... */
                  <div className='overflow-hidden rounded-2xl border-2 border-gray-200 shadow-lg'>
                    <Table>
                      <TableHeader className='bg-gradient-to-r from-gray-100 via-blue-50 to-indigo-50'>
                        <TableRow className='border-b-2'>
                          <TableHead className='font-bold text-gray-800 text-sm'>
                            Product
                          </TableHead>
                          <TableHead className='font-bold text-gray-800 text-sm'>
                            SKU
                          </TableHead>
                          <TableHead className='font-bold text-gray-800 text-sm'>
                            Variant
                          </TableHead>
                          <TableHead className='text-center font-bold text-gray-800 text-sm'>
                            Quantity
                          </TableHead>
                          <TableHead className='text-center font-bold text-gray-800 text-sm'>
                            Unit Price
                          </TableHead>
                          <TableHead className='text-right font-bold text-gray-800 text-sm'>
                            Total
                          </TableHead>
                          <TableHead className='w-16'></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProducts.map((product, index) => {
                          const quantity =
                            typeof product.quantity === "number"
                              ? product.quantity
                              : parseInt(String(product.quantity)) || 0;
                          const unitPrice =
                            typeof product.unitPrice === "number"
                              ? product.unitPrice
                              : parseFloat(String(product.unitPrice)) || 0;
                          const lineTotal = (quantity * unitPrice).toFixed(2);

                          return (
                            <TableRow
                              key={product.variant?.id || product.id}
                              className='group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 border-b'>
                              <TableCell>
                                <div className='flex items-center gap-3'>
                                  {product.image ? (
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className='w-12 h-12 rounded-lg object-cover border-2 border-gray-200 shadow-sm group-hover:border-blue-300 transition-all'
                                    />
                                  ) : (
                                    <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-2 border-gray-200 shadow-sm group-hover:border-blue-300 transition-all'>
                                      <Package className='h-6 w-6 text-gray-500' />
                                    </div>
                                  )}
                                  <span className='font-semibold text-gray-900 group-hover:text-blue-700 transition-colors'>
                                    {product.name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant='outline'
                                  className='font-mono text-xs font-medium'>
                                  {product.sku}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {product.variant ? (
                                  <Badge
                                    variant='secondary'
                                    className='text-xs font-medium'>
                                    {`${product.variant.color || ""}${
                                      product.variant.color &&
                                      product.variant.size
                                        ? " · "
                                        : ""
                                    }${product.variant.size || ""}`}
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant='outline'
                                    className='text-xs text-gray-500'>
                                    Standard
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className='flex items-center justify-center gap-2'>
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() =>
                                      handleQuantityDecrement(index)
                                    }
                                    disabled={quantity <= 0}
                                    className='h-9 w-9 p-0 border-2 border-gray-300 hover:bg-blue-50 hover:border-blue-400 transition-all disabled:opacity-30 rounded-lg'>
                                    <Minus className='h-4 w-4' />
                                  </Button>
                                  <Input
                                    type='text'
                                    value={product.quantity || ""}
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        index,
                                        e.target.value,
                                      )
                                    }
                                    className='w-20 text-center h-9 font-bold border-2 border-gray-300 focus-visible:ring-blue-500 rounded-lg'
                                    placeholder='0'
                                  />
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() =>
                                      handleQuantityIncrement(index)
                                    }
                                    className='h-9 w-9 p-0 border-2 border-gray-300 hover:bg-blue-50 hover:border-blue-400 transition-all rounded-lg'>
                                    <Plus className='h-4 w-4' />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className='flex items-center justify-center gap-2'>
                                  <span className='text-gray-500 text-sm font-medium'>
                                    ৳
                                  </span>
                                  <Input
                                    type='text'
                                    value={product.unitPrice || ""}
                                    onChange={(e) =>
                                      handleUnitPriceChange(
                                        index,
                                        e.target.value,
                                      )
                                    }
                                    className='w-28 text-center h-9 font-bold border-2 border-gray-300 focus-visible:ring-purple-500 rounded-lg'
                                    placeholder='0.00'
                                  />
                                </div>
                              </TableCell>
                              <TableCell className='text-right'>
                                <span className='font-bold text-gray-900 text-base'>
                                  ৳{lineTotal}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => removeProduct(index)}
                                  className='h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all'>
                                  <Trash2 className='h-4 w-4' />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Enhanced Summary Section */}
                <div className='rounded-2xl bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 border-2 border-gray-300 p-6 shadow-lg'>
                  <div
                    className={cn(
                      "space-y-4",
                      isMobile ? "" : "flex justify-end",
                    )}>
                    <div
                      className={cn("space-y-3", isMobile ? "w-full" : "w-96")}>
                      <div className='flex items-center justify-between text-sm pb-2 border-b border-gray-300'>
                        <span className='text-gray-600 font-semibold'>
                          Total Products
                        </span>
                        <span className='font-bold text-gray-900'>
                          {selectedProducts.length}
                        </span>
                      </div>
                      <div className='flex items-center justify-between text-sm pb-3 border-b border-gray-300'>
                        <span className='text-gray-600 font-semibold'>
                          Total Items
                        </span>
                        <span className='font-bold text-gray-900'>
                          {totalItems}
                        </span>
                      </div>
                      <div className='flex items-center justify-between pt-2'>
                        <span className='text-lg font-bold text-gray-800'>
                          Grand Total
                        </span>
                        <div className='flex items-baseline gap-1'>
                          <span className='text-green-600 font-bold text-xl'>
                            ৳
                          </span>
                          <span className='text-3xl font-bold text-green-700'>
                            {calculateTotal()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Validation Alerts */}
        {selectedProducts.length > 0 && (
          <div className='space-y-3'>
            {selectedProducts.some((p) => !p.quantity || p.quantity <= 0) && (
              <Alert className='border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 shadow-md'>
                <AlertTriangle className='h-5 w-5 text-amber-600' />
                <AlertDescription className='text-amber-900 font-medium'>
                  <span className='font-bold'>Quantity Required:</span> Some
                  products have invalid quantities. Please ensure all quantities
                  are greater than 0.
                </AlertDescription>
              </Alert>
            )}
            {selectedProducts.some((p) => {
              const unitPrice =
                typeof p.unitPrice === "number"
                  ? p.unitPrice
                  : parseFloat(String(p.unitPrice)) || 0;
              return !p.unitPrice || unitPrice <= 0;
            }) && (
              <Alert className='border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-md'>
                <AlertTriangle className='h-5 w-5 text-blue-600' />
                <AlertDescription className='text-blue-900 font-medium'>
                  <span className='font-bold'>Price Suggestion:</span> Some
                  products are missing unit prices. Consider adding unit prices
                  for accurate totals.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {ProductSearchDialog()}
      </div>
    </MainView>
  );
};

export default CreatePurchaseOrder;
