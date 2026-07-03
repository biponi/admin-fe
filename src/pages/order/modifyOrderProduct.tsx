/**
 * ModifyOrder Component
 *
 * This component uses the NEW production-ready modify order API.
 *
 * API Migration:
 * - Endpoint: POST /api/v1/order/prior/modify/:orderId (new)
 * - Old endpoint: PUT /api/v1/order/prior/:orderId/products (deprecated)
 *
 * Key differences:
 * 1. Products only need: productId, quantity, variationId (optional)
 * 2. No need to send: sku, unitPrice, selectedQuantity
 * 3. Prices are auto-calculated on the backend
 * 4. Returns detailed summary with stock operations
 * 5. Better error messages with available stock info
 */
import { useEffect, useState } from "react";
import { searchProducts, modifyOrderProducts } from "./services/orderApi";
import { ProductSearchResponse } from "./interface";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import useDebounce from "../../customHook/useDebounce";
import { Badge } from "../../components/ui/badge";
import {
  Bird,
  CircleX,
  Trash,
  Search,
  Package,
  Plus,
  Minus,
  ShoppingCart,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Clock,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../../api/axios";
import { isAxiosError } from "axios";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Separator } from "../../components/ui/separator";
import config from "../../utils/config";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../../components/ui/drawer";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Skeleton } from "../../components/ui/skeleton";

const ModifyOrder = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [products, setProducts] = useState<ProductSearchResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<
    ProductSearchResponse[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [openSheet, setOpenSheet] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [searching, setSearching] = useState(false);
  const [orderData, setorderData] = useState({
    deliveryCarge: 0,
    paid: 0,
  });
  const [validationDialog, setValidationDialog] = useState(false);
  const [validationData, setValidationData] = useState<any>(null);
  const [validating, setValidating] = useState(false);

  // Fetch the existing order's products
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const { data } = await axios.get(
          config.order.getOrderProducts(orderId),
        );
        setSelectedProducts(data?.data?.products);
        setorderData({
          deliveryCarge: data?.data?.deliveryCharge,
          paid: data?.data?.paid,
        });
      } catch (error) {
        if (isAxiosError(error) && error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Something went wrong. Please try again later.");
        }
      }
    };
    if (!!orderId) fetchOrder();
  }, [orderId]);

  // Search for products
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
        if (isAxiosError(error) && error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Something went wrong. Please try again later.");
        }
        setSearching(false);
      });
  };

  const debounce = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (!!searchQuery) handleSearch();
    else setProducts([]);
    //eslint-disable-next-line
  }, [debounce]);

  // Add a product to the order
  const handleAddProduct = (product: ProductSearchResponse) => {
    if (product?.quantity <= 0) return toast.error("Product out of stock");
    const existingProduct = selectedProducts.find((p) =>
      product.variant?.id
        ? p.id === product.id && p.variant?.id === product.variant.id
        : p.id === product.id,
    );

    if (existingProduct) {
      if (
        existingProduct.maxQuantity &&
        existingProduct.quantity >= existingProduct.maxQuantity
      )
        return toast.error("Product out of stock");
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p.id === product.id && p.variant?.id === product.variant?.id
            ? { ...p, quantity: p.quantity + 1 }
            : !p.variant && p.id === product.id
              ? { ...p, quantity: p.quantity + 1 }
              : p,
        ),
      );
    } else {
      setSelectedProducts((prev) => [
        ...prev,
        { ...product, quantity: 1, maxQuantity: product?.quantity },
      ]);
    }
  };

  // Validate modification before applying
  const handleValidateModification = async () => {
    if (!orderId) return;
    setValidating(true);

    try {
      // Import validation function
      const { validateModification } = await import("../../api/order");

      // Transform products to API format
      const transformedProducts = selectedProducts.map((p) => ({
        productId: p.id,
        quantity: parseInt(`${p.quantity}`),
        ...(p.variant?.id && { variationId: p.variant.id }),
      }));

      console.log("Validation payload:", { products: transformedProducts });
      const payload = { products: transformedProducts };
      const response = await validateModification(orderId, payload);

      if (response.success && response.data) {
        setValidationData(response.data);
        setValidationDialog(true);
      } else {
        console.error("Validation failed:", response.error);
        toast.error(response.error || "Validation failed");
      }
    } catch (error) {
      console.error("Validation error:", error);
      if (error instanceof Error) {
        toast.error(`Validation error: ${error.message}`);
      } else {
        toast.error("Failed to validate modification");
      }
    } finally {
      setValidating(false);
    }
  };

  // Update the order after validation
  const handleUpdateOrder = () => {
    setLoading(true);
    setValidationDialog(false);
    if (!orderId) return;
    modifyOrderProducts(orderId, selectedProducts)
      .then((response) => {
        setLoading(false);
        setSelectedProducts([]);

        // Show detailed summary from new API
        if (response?.summary) {
          const { summary } = response;
          toast.success(
            `Order modified successfully!\n` +
              `Products: ${summary.oldProductCount} → ${summary.newProductCount}\n` +
              `Price: ৳${summary.oldTotalPrice} → ৳${summary.newTotalPrice}\n` +
              `${summary.priceDifference > 0 ? "+" : ""}৳${
                summary.priceDifference
              } difference`,
            { duration: 5000 },
          );
        } else {
          toast.success("Order modified successfully!");
        }

        navigate("/order");
      })
      .catch((error) => {
        if (isAxiosError(error) && error.response) {
          console.error("API error:", error.response.data.message);
          // New API provides more detailed error messages with stock info
          toast.error(error.response.data.message || error.response.data.error);
        } else if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Something went wrong. Please try again later.");
        }
        setLoading(false);
      });
  };

  // Handle quantity input change
  const handleInputChange = (value: any, index: number) => {
    const indexProduct = selectedProducts[index];

    if (value === "" || /^\d+$/.test(value)) {
      const pp = value === "" ? 0 : parseInt(value);
      if (pp > indexProduct?.maxQuantity)
        return toast.error("Enter valid quantity");
      setSelectedProducts((prev) =>
        prev.map((p, i) =>
          i === index ? { ...indexProduct, quantity: value } : p,
        ),
      );
    }
  };

  // Increase quantity
  const handleIncrease = (index: number) => {
    const indexProduct = selectedProducts[index];
    if (indexProduct?.quantity >= indexProduct?.maxQuantity)
      return toast.error("Maximum quantity added");
    const newQuantity = (indexProduct?.quantity || 0) + 1;
    setSelectedProducts((prev) =>
      prev.map((p, i) =>
        i === index ? { ...indexProduct, quantity: newQuantity } : p,
      ),
    );
  };

  // Decrease quantity
  const handleDecrease = (index: number) => {
    const indexProduct = selectedProducts[index];
    const quantity = indexProduct?.quantity || 0;

    if (quantity > 0) {
      const newQuantity = quantity - 1;
      setSelectedProducts((prev) =>
        prev.map((p, i) =>
          i === index ? { ...indexProduct, quantity: newQuantity } : p,
        ),
      );
    }
  };

  const renderProductButton = (
    product: ProductSearchResponse,
    index: number,
  ) => {
    if (!selectedProducts || !Array.isArray(selectedProducts)) return;

    const existingProduct = selectedProducts.find((p) =>
      product.variant?.id
        ? p.id === product.id && p.variant?.id === product.variant.id
        : p.id === product.id,
    );

    const isOutOfStock = product?.quantity <= 0;
    const isAlreadyAdded = !!existingProduct;

    return (
      <div
        key={index}
        className={`group cursor-pointer rounded-xl border transition-all ${
          isOutOfStock
            ? "border-red-100 bg-red-50/50 opacity-60"
            : isAlreadyAdded
              ? "border-emerald-200 bg-emerald-50/40 hover:border-emerald-300"
              : "border-slate-200 hover:border-indigo-300 hover:shadow-sm"
        }`}
        onClick={() => {
          if (isOutOfStock) {
            toast.error("Product out of stock");
            return;
          }
          handleAddProduct(product);
        }}>
        <div className='p-3.5'>
          <div className='flex items-start gap-3.5'>
            <div className='relative flex-shrink-0'>
              <div className='w-14 h-14 rounded-lg overflow-hidden border border-slate-100'>
                {product.image ? (
                  <img
                    alt={product?.name}
                    src={product?.image}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full bg-slate-100 flex items-center justify-center'>
                    <Package className='w-6 h-6 text-slate-400' />
                  </div>
                )}
              </div>
              {isAlreadyAdded && (
                <div className='absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white'>
                  <CheckCircle2 className='w-3 h-3 text-white' />
                </div>
              )}
              {isOutOfStock && (
                <div className='absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center ring-2 ring-white'>
                  <AlertTriangle className='w-3 h-3 text-white' />
                </div>
              )}
            </div>

            <div className='flex-1 min-w-0'>
              <div className='flex items-start justify-between gap-2'>
                <div className='flex flex-col justify-start items-start gap-0.5 min-w-0'>
                  <h3 className='font-semibold text-slate-900 text-left text-sm leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors'>
                    {product?.name.toUpperCase()}
                  </h3>
                  {(typeof product?.discount === "number" &&
                    product?.discount > 0) ||
                  (typeof product?.discount === "string" &&
                    product?.discount !== "0") ? (
                    <span className='text-[11px] font-medium text-emerald-600'>
                      Discount: {product?.discount} TK Off
                    </span>
                  ) : null}
                </div>
                {product?.unitPrice &&
                product?.updatedPrice &&
                product?.updatedPrice !== product?.unitPrice ? (
                  <div className='flex items-center gap-1.5 shrink-0'>
                    <span className='text-sm font-bold text-slate-900'>
                      ৳{product?.updatedPrice}
                    </span>
                    <span className='text-xs font-medium text-red-500 line-through'>
                      ৳{product?.unitPrice}
                    </span>
                  </div>
                ) : (
                  <span className='text-sm font-bold text-slate-900 shrink-0'>
                    ৳{product?.unitPrice}
                  </span>
                )}
              </div>

              <div className='flex items-center gap-1.5 flex-wrap mt-2'>
                <span
                  className={`inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold ${
                    isOutOfStock
                      ? "bg-red-100 text-red-700"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                  {isOutOfStock
                    ? "Out of Stock"
                    : `Stock: ${product?.quantity}`}
                </span>

                {isAlreadyAdded && (
                  <span className='inline-flex h-5 items-center rounded-full bg-emerald-50 border border-emerald-200 px-2 text-[10px] font-semibold text-emerald-700'>
                    Added to Order
                  </span>
                )}

                {!!product.variant && (
                  <span className='inline-flex h-5 items-center rounded-full bg-indigo-50 border border-indigo-100 px-2 text-[10px] font-semibold text-indigo-700'>
                    {`${product?.variant.color || ""}${
                      product?.variant?.color && product?.variant?.size
                        ? " • "
                        : ""
                    }${product?.variant?.size || ""}`}
                  </span>
                )}
              </div>

              <div className='text-[11px] text-slate-400 mt-1.5'>
                Click to {isAlreadyAdded ? "add more" : "add to order"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProductSearch = () => {
    return (
      <div className='space-y-4'>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none'>
            <Search className='h-4 w-4 text-slate-400' />
          </div>
          <Input
            placeholder='Search by product name, SKU, or ID...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10 pr-10 h-10 text-sm border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-lg'
          />
          {!!searchQuery && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                setSearchQuery("");
                setProducts([]);
              }}
              className='absolute inset-y-0 right-0 px-3 hover:bg-transparent'>
              <CircleX className='w-4 h-4 text-slate-400 hover:text-slate-600' />
            </Button>
          )}
        </div>

        {searchQuery && (
          <div className='flex items-center gap-2 rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2'>
            <Search className='h-3.5 w-3.5 text-indigo-500 shrink-0' />
            <span className='text-xs text-indigo-700'>
              Searching for products matching "{searchQuery}"
            </span>
          </div>
        )}
      </div>
    );
  };

  // Render the product search sheet
  const renderProductSheet = () => {
    return (
      <Sheet open={openSheet} onOpenChange={(sta) => setOpenSheet(sta)}>
        <SheetContent className='w-[50vw] max-w-2xl'>
          <SheetHeader className='pb-5'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center'>
                <ShoppingCart className='w-4 h-4 text-white' />
              </div>
              <div>
                <SheetTitle className='text-lg'>Add Products</SheetTitle>
                <p className='text-xs text-slate-500 mt-0.5'>
                  Find and add products to your order
                </p>
              </div>
            </div>
            <Separator className='my-3' />
          </SheetHeader>

          <div className='space-y-5'>
            <SheetDescription asChild>
              <div>{renderProductSearch()}</div>
            </SheetDescription>

            <ScrollArea className='h-[calc(100vh-300px)]'>
              {searching ? (
                <div className='flex flex-col justify-center items-center py-12 space-y-3'>
                  <Loader2 className='w-6 h-6 animate-spin text-indigo-600' />
                  <div className='text-center space-y-1'>
                    <p className='text-sm font-medium text-slate-900'>
                      Searching Products
                    </p>
                    <p className='text-xs text-slate-500'>
                      Please wait while we find matching products...
                    </p>
                  </div>
                </div>
              ) : (
                <div className='space-y-3'>
                  {!!products && products.length > 0 ? (
                    <div className='space-y-2.5'>
                      {products.map((result, index) =>
                        renderProductButton(result, index),
                      )}
                    </div>
                  ) : searchQuery ? (
                    <div className='text-center py-12 space-y-3'>
                      <div className='w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto'>
                        <Bird className='w-6 h-6 text-slate-400' />
                      </div>
                      <div className='space-y-1'>
                        <p className='text-sm font-medium text-slate-900'>
                          No Products Found
                        </p>
                        <p className='text-xs text-slate-500'>
                          Try adjusting your search terms or check the spelling
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className='text-center py-8 space-y-3'>
                      <div className='w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto'>
                        <Search className='w-6 h-6 text-indigo-500' />
                      </div>
                      <div className='space-y-1'>
                        <p className='text-sm font-medium text-slate-700'>
                          Start searching
                        </p>
                        <p className='text-xs text-slate-500'>
                          Enter a product name, SKU, or ID to begin
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    );
  };

  const renderProductDrawer = () => {
    return (
      <Drawer open={openDrawer} onOpenChange={(sta) => setOpenDrawer(sta)}>
        <DrawerContent className='max-h-[90vh]'>
          <DrawerHeader className='pb-3'>
            <div className='flex items-center gap-3 text-center justify-center'>
              <div className='w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center'>
                <ShoppingCart className='w-4 h-4 text-white' />
              </div>
              <div>
                <DrawerTitle className='text-lg'>Add Products</DrawerTitle>
                <p className='text-xs text-slate-500 mt-0.5'>
                  Find and add products to your order
                </p>
              </div>
            </div>
          </DrawerHeader>

          <div className='px-4 pb-6 space-y-3'>
            <DrawerDescription asChild>
              <div>{renderProductSearch()}</div>
            </DrawerDescription>

            <ScrollArea className='h-[50vh]'>
              {searching ? (
                <div className='flex flex-col justify-center items-center py-8 space-y-2.5'>
                  <Loader2 className='w-5 h-5 animate-spin text-indigo-600' />
                  <div className='text-center space-y-0.5'>
                    <p className='text-sm font-medium text-slate-900'>
                      Searching...
                    </p>
                    <p className='text-xs text-slate-500'>
                      Finding products for you
                    </p>
                  </div>
                </div>
              ) : (
                <div className='space-y-2.5'>
                  {!!products && products.length > 0 ? (
                    <div className='space-y-2.5'>
                      {products.map((result, index) =>
                        renderProductButton(result, index),
                      )}
                    </div>
                  ) : searchQuery ? (
                    <div className='text-center py-8 space-y-2.5'>
                      <Bird className='w-10 h-10 text-slate-400 mx-auto' />
                      <div className='space-y-0.5'>
                        <p className='text-sm font-medium text-slate-900'>
                          No Products Found
                        </p>
                        <p className='text-xs text-slate-500'>
                          Try different search terms
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className='text-center py-6 space-y-2.5'>
                      <div className='w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mx-auto'>
                        <Search className='h-5 w-5 text-indigo-600' />
                      </div>
                      <div className='space-y-0.5'>
                        <p className='text-sm font-medium text-slate-700'>
                          Start searching
                        </p>
                        <p className='text-xs text-slate-500'>
                          Enter product details to begin
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </DrawerContent>
      </Drawer>
    );
  };

  const renderMobileProductView = () => {
    if (!selectedProducts || selectedProducts.length === 0) {
      return (
        <div className='rounded-xl border-2 border-dashed border-slate-200'>
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <div className='w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3'>
              <ShoppingCart className='w-6 h-6 text-slate-400' />
            </div>
            <h3 className='text-base font-semibold text-slate-900 mb-1'>
              No Products Added
            </h3>
            <p className='text-sm text-slate-500 mb-4'>
              Add products to modify this order
            </p>
            <Button
              onClick={() => setOpenDrawer(true)}
              size='sm'
              className='bg-indigo-600 hover:bg-indigo-700 rounded-lg'>
              <Plus className='w-4 h-4 mr-1.5' />
              Add Products
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className='space-y-3'>
        {selectedProducts.map((product, index) => (
          <div
            key={product.variant?.id || product.id}
            className='rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors'>
            <div className='p-3.5'>
              <div className='flex items-start justify-between mb-3.5'>
                <div className='flex items-start space-x-3'>
                  <div className='w-14 h-14 rounded-lg overflow-hidden border border-slate-100'>
                    {product?.image ? (
                      <img
                        src={product?.image}
                        className='w-full h-full object-cover'
                        alt={product.name}
                      />
                    ) : (
                      <div className='w-full h-full bg-slate-100 flex items-center justify-center'>
                        <Package className='w-5 h-5 text-slate-400' />
                      </div>
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='font-semibold text-slate-900 text-sm leading-tight'>
                      {product.name}
                    </p>
                    <div className='flex flex-wrap gap-1.5 mt-1.5'>
                      {!!product.variant ? (
                        <span className='inline-flex h-5 items-center rounded-full bg-indigo-50 border border-indigo-100 px-2 text-[10px] font-semibold text-indigo-700'>
                          {`${product?.variant.color || ""}${
                            product?.variant?.color && product?.variant?.size
                              ? " • "
                              : ""
                          }${product?.variant?.size || ""}`}
                        </span>
                      ) : (
                        <span className='inline-flex h-5 items-center rounded-full bg-slate-100 px-2 text-[10px] font-semibold text-slate-500'>
                          No Variant
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() =>
                    setSelectedProducts(
                      selectedProducts.filter((_, i) => i !== index),
                    )
                  }
                  className='text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg'>
                  <Trash className='w-4 h-4' />
                </Button>
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center border border-slate-200 rounded-lg overflow-hidden'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleDecrease(index)}
                    disabled={product?.quantity <= 1}
                    className='h-9 w-9 p-0 rounded-none disabled:opacity-40 hover:bg-slate-50'>
                    <Minus className='w-3.5 h-3.5' />
                  </Button>
                  <Input
                    type='text'
                    value={product?.quantity}
                    onChange={(e) => handleInputChange(e?.target?.value, index)}
                    className='text-center w-14 h-9 border-0 rounded-none bg-slate-50 font-medium text-sm'
                  />
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleIncrease(index)}
                    className='h-9 w-9 p-0 rounded-none hover:bg-slate-50'>
                    <Plus className='w-3.5 h-3.5' />
                  </Button>
                </div>
                <div className='text-right'>
                  <p className='text-[11px] text-slate-400'>Price</p>
                  <p className='font-bold text-base text-slate-900'>
                    ৳{product?.unitPrice}
                  </p>
                  <p className='text-[11px] text-slate-400'>
                    Total: ৳
                    {(product?.quantity * Number(product?.unitPrice)).toFixed(
                      2,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTableView = () => {
    if (!selectedProducts || selectedProducts.length === 0) {
      return (
        <div className='rounded-xl border-2 border-dashed border-slate-200'>
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <div className='w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-5'>
              <ShoppingCart className='w-8 h-8 text-slate-400' />
            </div>
            <h3 className='text-lg font-semibold text-slate-900 mb-1.5'>
              No Products Added
            </h3>
            <p className='text-sm text-slate-500 mb-5 max-w-sm'>
              Start by adding products to modify this order. Click the button
              below to browse available products.
            </p>
            <Button
              onClick={() => setOpenSheet(true)}
              className='bg-indigo-600 hover:bg-indigo-700 rounded-lg'>
              <Plus className='w-4 h-4 mr-1.5' />
              Add Products
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className='border border-slate-200 rounded-xl overflow-hidden bg-white'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-slate-50'>
              <tr className='border-b border-slate-200'>
                <th className='px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider'>
                  Product
                </th>
                <th className='px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider'>
                  Variant
                </th>
                <th className='px-5 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider'>
                  Quantity
                </th>
                <th className='px-5 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider'>
                  Unit Price
                </th>
                <th className='px-5 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider'>
                  Total
                </th>
                <th className='px-5 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider'>
                  Action
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {selectedProducts.map((product, index) => (
                <tr
                  key={product.variant?.id || product.id}
                  className='hover:bg-slate-50/70 transition-colors'>
                  <td className='px-5 py-3.5'>
                    <div className='flex items-center space-x-3.5'>
                      <div className='w-11 h-11 rounded-lg overflow-hidden border border-slate-100 shrink-0'>
                        {product?.image ? (
                          <img
                            src={product?.image}
                            className='w-full h-full object-cover'
                            alt={product.name}
                          />
                        ) : (
                          <div className='w-full h-full bg-slate-100 flex items-center justify-center'>
                            <Package className='w-4 h-4 text-slate-400' />
                          </div>
                        )}
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='text-sm font-semibold text-slate-900 truncate'>
                          {product.name}
                        </p>
                        <p className='text-[11px] text-slate-400'>
                          SKU: {product.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className='px-5 py-3.5'>
                    {!!product.variant ? (
                      <span className='inline-flex h-5 items-center rounded-full bg-indigo-50 border border-indigo-100 px-2 text-[10px] font-semibold text-indigo-700'>
                        {`${product?.variant.color || ""}${
                          product?.variant?.color && product?.variant?.size
                            ? " • "
                            : ""
                        }${product?.variant?.size || ""}`}
                      </span>
                    ) : (
                      <span className='inline-flex h-5 items-center rounded-full bg-slate-100 px-2 text-[10px] font-semibold text-slate-500'>
                        No Variant
                      </span>
                    )}
                  </td>
                  <td className='px-5 py-3.5'>
                    <div className='flex items-center justify-center'>
                      <div className='flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDecrease(index)}
                          disabled={product?.quantity <= 1}
                          className='h-7 w-7 p-0 rounded-none disabled:opacity-40 hover:bg-slate-50'>
                          <Minus className='w-3 h-3' />
                        </Button>
                        <Input
                          type='text'
                          value={product?.quantity}
                          onChange={(e) =>
                            handleInputChange(e?.target?.value, index)
                          }
                          className='text-center w-11 h-7 border-0 rounded-none bg-transparent font-medium text-xs'
                        />
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleIncrease(index)}
                          className='h-7 w-7 p-0 rounded-none hover:bg-slate-50'>
                          <Plus className='w-3 h-3' />
                        </Button>
                      </div>
                    </div>
                  </td>
                  <td className='px-5 py-3.5 text-right text-sm font-medium text-slate-900'>
                    {product?.unitPrice &&
                    product?.updatedPrice &&
                    product?.updatedPrice !== product?.unitPrice ? (
                      <div className='flex items-center justify-end gap-1.5'>
                        <span className='text-sm font-bold text-slate-900'>
                          ৳{product?.updatedPrice}
                        </span>
                        <span className='text-xs font-medium text-red-500 line-through'>
                          ৳{product?.unitPrice}
                        </span>
                      </div>
                    ) : (
                      <span className='text-sm font-bold text-slate-900'>
                        ৳{product?.unitPrice}
                      </span>
                    )}
                  </td>
                  <td className='px-5 py-3.5 text-right text-sm font-bold text-slate-900'>
                    ৳
                    {(
                      product?.quantity *
                      Number(product?.updatedPrice || product?.unitPrice)
                    ).toFixed(2)}
                  </td>
                  <td className='px-5 py-3.5 text-center'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() =>
                        setSelectedProducts(
                          selectedProducts.filter((_, i) => i !== index),
                        )
                      }
                      className='text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg'>
                      <Trash className='w-4 h-4' />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  // Render the main view
  const renderMainView = () => {
    const subtotal = selectedProducts.reduce(
      (sum, item) =>
        sum +
        item?.quantity * Number(item?.updatedPrice || item?.unitPrice || 0),
      0,
    );
    const total = subtotal + orderData.deliveryCarge;
    const remaining = total - orderData.paid;

    return (
      <div className='min-h-screen bg-slate-50'>
        {/* Top bar */}
        <div className='sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4'>
            <div className='flex items-center gap-4 min-w-0'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => navigate("/order")}
                className='h-9 px-3 text-sm font-medium border-slate-200 rounded-lg shrink-0'>
                <ArrowLeft className='w-4 h-4 mr-1.5' />
                Orders
              </Button>
              <div className='h-6 w-px bg-slate-200 shrink-0' />
              <div className='flex items-center gap-2.5 min-w-0'>
                <div className='w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0'>
                  <Edit3 className='w-4 h-4 text-white' />
                </div>
                <div className='min-w-0'>
                  <h1 className='text-sm font-semibold text-slate-900 truncate'>
                    Modify Order
                  </h1>
                  <p className='text-[11px] text-slate-500 truncate'>
                    Order #{orderId}
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => navigate(`/order/${orderId}/history`)}
              className='h-9 px-3 text-sm font-medium border-slate-200 text-slate-600 rounded-lg shrink-0'>
              <Clock className='w-4 h-4 mr-1.5' />
              View History
            </Button>
          </div>
        </div>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Search Products - Hidden components for mobile/desktop */}
          <div className='hidden md:block'>{renderProductSheet()}</div>
          <div className='md:hidden'>{renderProductDrawer()}</div>

          {/* Main Content Grid */}
          <div className='grid grid-cols-1 xl:grid-cols-4 gap-6'>
            {/* Products Section */}
            <div className='xl:col-span-3'>
              <div className='bg-white rounded-2xl border border-slate-200 overflow-hidden'>
                {/* Products Header */}
                <div className='p-5 border-b border-slate-100'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                    <div>
                      <h2 className='text-base font-semibold text-slate-900'>
                        Order Products
                      </h2>
                      <p className='text-xs text-slate-500 mt-0.5'>
                        {selectedProducts.length} product
                        {selectedProducts.length !== 1 ? "s" : ""} in this order
                      </p>
                    </div>
                    <div className='flex gap-2.5'>
                      <Button
                        variant='outline'
                        onClick={() => setOpenSheet(true)}
                        className='hidden md:flex items-center gap-1.5 h-9 px-3 text-sm border-slate-200 text-slate-700 rounded-lg'>
                        <Plus className='w-4 h-4' />
                        Add Products
                      </Button>
                      <Button
                        variant='outline'
                        onClick={() => setOpenDrawer(true)}
                        className='md:hidden flex items-center gap-1.5 h-9 px-3 text-sm border-slate-200 text-slate-700 rounded-lg'>
                        <Plus className='w-4 h-4' />
                        Add Products
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Products Content */}
                <div className='p-5'>
                  <div className='hidden md:block'>{renderTableView()}</div>
                  <div className='md:hidden'>{renderMobileProductView()}</div>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className='xl:col-span-1'>
              <div className='sticky top-24'>
                <div className='rounded-2xl border border-slate-200 bg-white overflow-hidden'>
                  <div className='px-5 py-4 border-b border-slate-100'>
                    <div className='flex items-center gap-2 text-sm font-semibold text-slate-900'>
                      <ShoppingCart className='w-4 h-4 text-indigo-600' />
                      Order Summary
                    </div>
                  </div>
                  <div className='p-5 space-y-4'>
                    <div className='space-y-2.5'>
                      <div className='flex justify-between items-center text-sm'>
                        <span className='text-slate-500'>Subtotal</span>
                        <span className='font-semibold text-slate-900'>
                          ৳{subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className='flex justify-between items-center text-sm'>
                        <span className='text-slate-500'>Delivery Charge</span>
                        <span className='font-semibold text-slate-900'>
                          ৳{orderData.deliveryCarge}
                        </span>
                      </div>
                      <div className='h-px bg-slate-100' />
                      <div className='flex justify-between items-center text-sm'>
                        <span className='text-slate-500'>Total</span>
                        <span className='font-semibold text-slate-900'>
                          ৳{total.toFixed(2)}
                        </span>
                      </div>
                      <div className='flex justify-between items-center text-sm'>
                        <span className='text-slate-500'>Paid Amount</span>
                        <span className='font-semibold text-emerald-600'>
                          ৳{orderData.paid}
                        </span>
                      </div>
                      <div className='h-px bg-slate-100' />
                      <div className='flex justify-between items-center text-sm'>
                        <span className='text-slate-500'>Remaining amount</span>
                        <span className='font-semibold text-emerald-600'>
                          ৳{remaining.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className='flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5'>
                      <AlertTriangle className='h-4 w-4 text-amber-600 shrink-0 mt-0.5' />
                      <p className='text-xs text-amber-800'>
                        Final pricing will be calculated after order
                        modification.
                      </p>
                    </div>

                    <Button
                      onClick={handleValidateModification}
                      disabled={
                        selectedProducts.length < 1 || loading || validating
                      }
                      className='w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
                      {validating ? (
                        <>
                          <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                          Validating...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className='w-4 h-4 mr-2' />
                          Preview Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLoading = () => {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
        <div className='w-full max-w-md mx-4 rounded-2xl border border-slate-200 bg-white'>
          <div className='flex flex-col items-center justify-center py-12 text-center px-6'>
            <div className='w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-5'>
              <Loader2 className='w-6 h-6 text-indigo-600 animate-spin' />
            </div>
            <h3 className='text-base font-semibold text-slate-900 mb-1.5'>
              Updating Order
            </h3>
            <p className='text-sm text-slate-500'>
              Please wait while we process your changes...
            </p>
            <div className='mt-6 space-y-2 w-full'>
              <Skeleton className='h-2 w-3/4 mx-auto' />
              <Skeleton className='h-2 w-1/2 mx-auto' />
              <Skeleton className='h-2 w-2/3 mx-auto' />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render validation dialog
  const renderValidationDialog = () => {
    if (!validationData) return null;

    const hasErrors = !validationData.valid;
    const estimatedChanges = validationData.estimatedChanges;

    return (
      <Dialog
        open={validationDialog}
        onOpenChange={(val) => {
          console.log("Dialog changed:", val);
          setValidationDialog(val);
        }}>
        <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-base'>
              {hasErrors ? (
                <>
                  <AlertTriangle className='w-5 h-5 text-amber-600' />
                  Validation Issues Found
                </>
              ) : (
                <>
                  <CheckCircle2 className='w-5 h-5 text-emerald-600' />
                  Ready to Apply Changes
                </>
              )}
            </DialogTitle>
            <DialogDescription className='text-sm'>
              {hasErrors
                ? "Some products have validation issues. Please review before proceeding."
                : "All products are valid. Review the changes below."}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-5 my-2'>
            {/* Show message if available */}
            {validationData.message && (
              <div
                className={`rounded-xl border px-3.5 py-2.5 text-sm ${
                  hasErrors
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-indigo-50 border-indigo-100 text-indigo-800"
                }`}>
                {validationData.message}
              </div>
            )}

            {/* Estimated Changes - only show if data is available */}
            {estimatedChanges && (
              <div className='bg-slate-50 border border-slate-200 rounded-xl p-4'>
                <h3 className='font-semibold text-slate-900 mb-3 flex items-center gap-2 text-sm'>
                  <Package className='w-4 h-4 text-indigo-600' />
                  Estimated Changes
                </h3>
                <div className='grid grid-cols-2 gap-3 text-sm'>
                  <div>
                    <span className='text-slate-500'>Products:</span>
                    <span className='font-medium text-slate-900 ml-2'>
                      {estimatedChanges.oldProductCount} →{" "}
                      {estimatedChanges.newProductCount}
                    </span>
                  </div>
                  <div>
                    <span className='text-slate-500'>Price:</span>
                    <span className='font-medium text-slate-900 ml-2'>
                      ৳{estimatedChanges.oldTotalPrice} → ৳
                      {estimatedChanges.newTotalPrice}
                    </span>
                  </div>
                  <div className='col-span-2'>
                    <span className='text-slate-500'>Difference:</span>
                    <span
                      className={`font-bold ml-2 ${
                        estimatedChanges.priceDifference > 0
                          ? "text-emerald-600"
                          : estimatedChanges.priceDifference < 0
                            ? "text-red-600"
                            : "text-slate-900"
                      }`}>
                      {estimatedChanges.priceDifference > 0 ? "+" : ""}৳
                      {estimatedChanges.priceDifference}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Validation Results */}
            <div>
              <h3 className='font-semibold text-slate-900 mb-2.5 text-sm'>
                Product Validation
              </h3>
              <div className='space-y-2'>
                {validationData.validationResults &&
                  validationData.validationResults.map(
                    (result: any, index: number) => (
                      <div
                        key={index}
                        className={`p-3 rounded-xl border ${
                          result.valid
                            ? "bg-emerald-50/60 border-emerald-200"
                            : "bg-red-50/60 border-red-200"
                        }`}>
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <div className='font-medium text-slate-900 flex items-center gap-2 text-sm'>
                              {result.valid ? (
                                <CheckCircle2 className='w-4 h-4 text-emerald-600' />
                              ) : (
                                <AlertTriangle className='w-4 h-4 text-red-600' />
                              )}
                              {result.productName}
                            </div>
                            {result.variationDetails && (
                              <div className='text-xs text-slate-500 ml-6 mt-1'>
                                {result.variationDetails}
                              </div>
                            )}
                            <div className='text-xs ml-6 mt-1'>
                              <span
                                className={
                                  result.valid
                                    ? "text-emerald-700"
                                    : "text-red-700"
                                }>
                                Requested: {result.requestedQuantity}
                              </span>
                              <span className='text-slate-300 mx-2'>•</span>
                              <span className='text-slate-600'>
                                Available: {result.availableStock}
                              </span>
                            </div>
                            {result.error && (
                              <div className='text-xs text-red-700 ml-6 mt-1 font-medium'>
                                {result.error}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ),
                  )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setValidationDialog(false)}
              disabled={loading}
              className='rounded-lg'>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateOrder}
              disabled={hasErrors || loading}
              className='bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg'>
              {loading ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className='w-4 h-4 mr-2' />
                  Confirm & Update
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      {loading ? renderLoading() : renderMainView()}
      {renderValidationDialog()}
    </>
  );
};

export default ModifyOrder;
