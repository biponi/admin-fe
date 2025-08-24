import React, { useEffect, useState } from "react";
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

  // Fetch the existing order's products
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const { data } = await axios.get(
          config.order.getOrderProducts(orderId)
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
        : p.id === product.id
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
            : p
        )
      );
    } else {
      setSelectedProducts((prev) => [
        ...prev,
        { ...product, quantity: 1, maxQuantity: product?.quantity },
      ]);
    }
  };

  // Update the order
  const handleUpdateOrder = () => {
    setLoading(true);
    if (!orderId) return;
    modifyOrderProducts(orderId, selectedProducts)
      .then(() => {
        setLoading(false);
        setSelectedProducts([]);
        toast.success("Order Modified successfully!");
        navigate("/order");
      })
      .catch((error) => {
        if (isAxiosError(error) && error.response) {
          console.error("API error:", error.response.data.message); // Logs "Product with ID 123 not found."
          toast.error(error.response.data.message);
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
          i === index ? { ...indexProduct, quantity: value } : p
        )
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
        i === index ? { ...indexProduct, quantity: newQuantity } : p
      )
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
          i === index ? { ...indexProduct, quantity: newQuantity } : p
        )
      );
    }
  };

  const renderProductButton = (
    product: ProductSearchResponse,
    index: number
  ) => {
    if (!selectedProducts || !Array.isArray(selectedProducts)) return;

    const existingProduct = selectedProducts.find((p) =>
      product.variant?.id
        ? p.id === product.id && p.variant?.id === product.variant.id
        : p.id === product.id
    );

    const isOutOfStock = product?.quantity <= 0;
    const isAlreadyAdded = !!existingProduct;

    return (
      <Card
        key={index}
        className={`group cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
          isOutOfStock
            ? "border-red-200 bg-red-50/50 opacity-60"
            : isAlreadyAdded
            ? "border-green-200 bg-green-50/50 hover:border-green-300"
            : "border-gray-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1"
        }`}
        onClick={() => {
          if (isOutOfStock) {
            toast.error("Product out of stock");
            return;
          }
          handleAddProduct(product);
        }}>
        <CardContent className='p-4'>
          <div className='flex items-start gap-4'>
            <div className='relative flex-shrink-0'>
              <div className='w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100 group-hover:border-blue-200 transition-colors'>
                {product.image ? (
                  <img
                    alt={product?.name}
                    src={product?.image}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center'>
                    <Package className='w-8 h-8 text-gray-400' />
                  </div>
                )}
              </div>
              {isAlreadyAdded && (
                <div className='absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center'>
                  <CheckCircle2 className='w-4 h-4 text-white' />
                </div>
              )}
              {isOutOfStock && (
                <div className='absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center'>
                  <AlertTriangle className='w-4 h-4 text-white' />
                </div>
              )}
            </div>

            <div className='flex-1 min-w-0'>
              <div className='space-y-2'>
                <div className='flex items-start justify-between'>
                  <h3 className='font-semibold text-gray-900 text-base leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors'>
                    {product?.name}
                  </h3>
                  {product?.unitPrice && (
                    <span className='text-lg font-bold text-gray-900 ml-2'>
                      ৳{product?.unitPrice}
                    </span>
                  )}
                </div>

                <div className='flex items-center gap-2 flex-wrap'>
                  <Badge
                    variant={isOutOfStock ? "destructive" : "default"}
                    className='text-xs font-medium'>
                    {isOutOfStock
                      ? "Out of Stock"
                      : `Stock: ${product?.quantity}`}
                  </Badge>

                  {isAlreadyAdded && (
                    <Badge
                      variant='outline'
                      className='text-xs bg-green-50 text-green-700 border-green-200'>
                      Added to Order
                    </Badge>
                  )}

                  {!!product.variant && (
                    <Badge
                      variant='outline'
                      className='text-xs bg-blue-50 text-blue-700 border-blue-200'>
                      {`${product?.variant.color || ""}${
                        product?.variant?.color && product?.variant?.size
                          ? " • "
                          : ""
                      }${product?.variant?.size || ""}`}
                    </Badge>
                  )}
                </div>

                <div className='text-sm text-gray-500'>
                  Click to {isAlreadyAdded ? "add more" : "add to order"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderProductSearch = () => {
    return (
      <div className='space-y-6'>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
            <Search className='h-5 w-5 text-gray-400' />
          </div>
          <Input
            placeholder='Search by product name, SKU, or ID...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-12 pr-12 h-12 text-base border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all'
          />
          {!!searchQuery && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                setSearchQuery("");
                setProducts([]);
              }}
              className='absolute inset-y-0 right-0 px-4 hover:bg-gray-100 rounded-r-xl'>
              <CircleX className='w-5 h-5 text-gray-400 hover:text-gray-600' />
            </Button>
          )}
        </div>

        {searchQuery && (
          <Alert className='border-blue-200 bg-blue-50'>
            <Search className='h-4 w-4 text-blue-600' />
            <AlertDescription className='text-blue-800'>
              Searching for products matching "{searchQuery}"...
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  // Render the product search sheet
  const renderProductSheet = () => {
    return (
      <Sheet open={openSheet} onOpenChange={(sta) => setOpenSheet(sta)}>
        <SheetContent className='w-[50vw] max-w-2xl'>
          <SheetHeader className='pb-6'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
                <ShoppingCart className='w-4 h-4 text-white' />
              </div>
              <div>
                <SheetTitle className='text-xl'>Add Products</SheetTitle>
                <p className='text-sm text-gray-600 mt-1'>
                  Find and add products to your order
                </p>
              </div>
            </div>
            <Separator className='my-4' />
          </SheetHeader>

          <div className='space-y-6'>
            <SheetDescription asChild>
              <div>{renderProductSearch()}</div>
            </SheetDescription>

            <ScrollArea className='h-[calc(100vh-300px)]'>
              {searching ? (
                <div className='flex flex-col justify-center items-center py-12 space-y-4'>
                  <Loader2 className='w-8 h-8 animate-spin text-blue-500' />
                  <div className='text-center space-y-2'>
                    <p className='text-lg font-medium text-gray-900'>
                      Searching Products
                    </p>
                    <p className='text-sm text-gray-600'>
                      Please wait while we find matching products...
                    </p>
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  {!!products && products.length > 0 ? (
                    <div className='space-y-3'>
                      {products.map((result, index) =>
                        renderProductButton(result, index)
                      )}
                    </div>
                  ) : searchQuery ? (
                    <div className='text-center py-12 space-y-4'>
                      <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto'>
                        <Bird className='w-8 h-8 text-gray-400' />
                      </div>
                      <div className='space-y-2'>
                        <p className='text-lg font-medium text-gray-900'>
                          No Products Found
                        </p>
                        <p className='text-sm text-gray-600'>
                          Try adjusting your search terms or check the spelling
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className='text-center py-8 space-y-4'>
                      <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto'>
                        <Search className='w-8 h-8 text-blue-500' />
                      </div>
                      <div className='space-y-2'>
                        <p className='text-base font-medium text-gray-700'>
                          Start searching
                        </p>
                        <p className='text-sm text-gray-500'>
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
          <DrawerHeader className='pb-4'>
            <div className='flex items-center gap-3 text-center justify-center'>
              <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
                <ShoppingCart className='w-4 h-4 text-white' />
              </div>
              <div>
                <DrawerTitle className='text-xl'>Add Products</DrawerTitle>
                <p className='text-sm text-gray-600 mt-1'>
                  Find and add products to your order
                </p>
              </div>
            </div>
          </DrawerHeader>

          <div className='px-4 pb-6 space-y-4'>
            <DrawerDescription asChild>
              <div>{renderProductSearch()}</div>
            </DrawerDescription>

            <ScrollArea className='h-[50vh]'>
              {searching ? (
                <div className='flex flex-col justify-center items-center py-8 space-y-3'>
                  <Loader2 className='w-6 h-6 animate-spin text-blue-500' />
                  <div className='text-center space-y-1'>
                    <p className='font-medium text-gray-900'>Searching...</p>
                    <p className='text-sm text-gray-600'>
                      Finding products for you
                    </p>
                  </div>
                </div>
              ) : (
                <div className='space-y-3'>
                  {!!products && products.length > 0 ? (
                    <div className='space-y-3'>
                      {products.map((result, index) =>
                        renderProductButton(result, index)
                      )}
                    </div>
                  ) : searchQuery ? (
                    <div className='text-center py-8 space-y-3'>
                      <Bird className='w-12 h-12 text-gray-400 mx-auto' />
                      <div className='space-y-1'>
                        <p className='font-medium text-gray-900'>
                          No Products Found
                        </p>
                        <p className='text-sm text-gray-600'>
                          Try different search terms
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className='text-center py-6 space-y-3'>
                      <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto'>
                        <Search className='h-6 w-6 text-blue-600' />
                      </div>
                      <div className='space-y-1'>
                        <p className='font-medium text-gray-700'>
                          Start searching
                        </p>
                        <p className='text-sm text-gray-500'>
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
        <Card className='border-dashed border-2 border-gray-200'>
          <CardContent className='flex flex-col items-center justify-center py-12 text-center'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
              <ShoppingCart className='w-8 h-8 text-gray-400' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              No Products Added
            </h3>
            <p className='text-sm text-gray-600 mb-4'>
              Add products to modify this order
            </p>
            <Button
              onClick={() => setOpenDrawer(true)}
              size='sm'
              className='bg-blue-600 hover:bg-blue-700'>
              <Plus className='w-4 h-4 mr-2' />
              Add Products
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className='space-y-4'>
        {selectedProducts.map((product, index) => (
          <Card
            key={product.variant?.id || product.id}
            className='border-2 hover:border-blue-200 transition-all duration-200'>
            <CardContent className='p-4'>
              <div className='flex items-start justify-between mb-4'>
                <div className='flex items-start space-x-3'>
                  <div className='w-16 h-16 rounded-xl overflow-hidden border border-gray-200'>
                    {product?.image ? (
                      <img
                        src={product?.image}
                        className='w-full h-full object-cover'
                        alt={product.name}
                      />
                    ) : (
                      <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
                        <Package className='w-6 h-6 text-gray-400' />
                      </div>
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='font-semibold text-gray-900 text-base leading-tight'>
                      {product.name}
                    </p>
                    <div className='flex flex-wrap gap-2 mt-2'>
                      {!!product.variant ? (
                        <Badge
                          variant='outline'
                          className='text-xs bg-blue-50 text-blue-700 border-blue-200'>
                          {`${product?.variant.color || ""}${
                            product?.variant?.color && product?.variant?.size
                              ? " • "
                              : ""
                          }${product?.variant?.size || ""}`}
                        </Badge>
                      ) : (
                        <Badge variant='secondary' className='text-xs'>
                          No Variant
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() =>
                    setSelectedProducts(
                      selectedProducts.filter((_, i) => i !== index)
                    )
                  }
                  className='text-red-500 hover:text-red-700 hover:bg-red-50 p-2'>
                  <Trash className='w-4 h-4' />
                </Button>
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center border border-gray-200 rounded-lg overflow-hidden'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleDecrease(index)}
                    disabled={product?.quantity <= 1}
                    className='h-10 w-10 p-0 disabled:opacity-50 hover:bg-gray-50'>
                    <Minus className='w-4 h-4' />
                  </Button>
                  <Input
                    type='text'
                    value={product?.quantity}
                    onChange={(e) => handleInputChange(e?.target?.value, index)}
                    className='text-center w-16 h-10 border-0 bg-gray-50 font-medium'
                  />
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleIncrease(index)}
                    className='h-10 w-10 p-0 hover:bg-gray-50'>
                    <Plus className='w-4 h-4' />
                  </Button>
                </div>
                <div className='text-right'>
                  <p className='text-sm text-gray-600'>Price</p>
                  <p className='font-bold text-lg text-gray-900'>
                    ৳{product?.unitPrice}
                  </p>
                  <p className='text-xs text-gray-500'>
                    Total: ৳
                    {(product?.quantity * Number(product?.unitPrice)).toFixed(
                      2
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderTableView = () => {
    if (!selectedProducts || selectedProducts.length === 0) {
      return (
        <Card className='border-dashed border-2 border-gray-200'>
          <CardContent className='flex flex-col items-center justify-center py-16 text-center'>
            <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6'>
              <ShoppingCart className='w-10 h-10 text-gray-400' />
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              No Products Added
            </h3>
            <p className='text-gray-600 mb-6 max-w-sm'>
              Start by adding products to modify this order. Click the button
              below to browse available products.
            </p>
            <Button
              onClick={() => setOpenSheet(true)}
              size='lg'
              className='bg-blue-600 hover:bg-blue-700'>
              <Plus className='w-5 h-5 mr-2' />
              Add Products
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className='border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gradient-to-r from-gray-50 to-gray-100'>
              <tr className='border-b border-gray-200'>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                  Product
                </th>
                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                  Variant
                </th>
                <th className='px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                  Quantity
                </th>
                <th className='px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                  Unit Price
                </th>
                <th className='px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                  Total
                </th>
                <th className='px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                  Action
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {selectedProducts.map((product, index) => (
                <tr
                  key={product.variant?.id || product.id}
                  className='hover:bg-gray-50 transition-colors'>
                  <td className='px-6 py-4'>
                    <div className='flex items-center space-x-4'>
                      <div className='w-12 h-12 rounded-lg overflow-hidden border border-gray-200'>
                        {product?.image ? (
                          <img
                            src={product?.image}
                            className='w-full h-full object-cover'
                            alt={product.name}
                          />
                        ) : (
                          <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
                            <Package className='w-5 h-5 text-gray-400' />
                          </div>
                        )}
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='text-sm font-semibold text-gray-900 truncate'>
                          {product.name}
                        </p>
                        <p className='text-xs text-gray-500'>
                          SKU: {product.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    {!!product.variant ? (
                      <Badge
                        variant='outline'
                        className='bg-blue-50 text-blue-700 border-blue-200'>
                        {`${product?.variant.color || ""}${
                          product?.variant?.color && product?.variant?.size
                            ? " • "
                            : ""
                        }${product?.variant?.size || ""}`}
                      </Badge>
                    ) : (
                      <Badge variant='secondary' className='text-xs'>
                        No Variant
                      </Badge>
                    )}
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center justify-center'>
                      <div className='flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDecrease(index)}
                          disabled={product?.quantity <= 1}
                          className='h-8 w-8 p-0 disabled:opacity-50 hover:bg-gray-50'>
                          <Minus className='w-3 h-3' />
                        </Button>
                        <Input
                          type='text'
                          value={product?.quantity}
                          onChange={(e) =>
                            handleInputChange(e?.target?.value, index)
                          }
                          className='text-center w-12 h-8 border-0 bg-transparent font-medium text-sm'
                        />
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleIncrease(index)}
                          className='h-8 w-8 p-0 hover:bg-gray-50'>
                          <Plus className='w-3 h-3' />
                        </Button>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 text-right text-sm font-medium text-gray-900'>
                    ৳{product?.unitPrice}
                  </td>
                  <td className='px-6 py-4 text-right text-sm font-bold text-gray-900'>
                    ৳
                    {(product?.quantity * Number(product?.unitPrice)).toFixed(
                      2
                    )}
                  </td>
                  <td className='px-6 py-4 text-center'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() =>
                        setSelectedProducts(
                          selectedProducts.filter((_, i) => i !== index)
                        )
                      }
                      className='text-red-500 hover:text-red-700 hover:bg-red-50 p-2'>
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
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Header */}
          <div className='mb-8'>
            <div className='flex items-center gap-4 mb-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => navigate("/order")}
                className='text-gray-600 hover:text-gray-900'>
                <ArrowLeft className='w-4 h-4 mr-2' />
                Back to Orders
              </Button>
            </div>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center'>
                <Edit3 className='w-6 h-6 text-white' />
              </div>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>
                  Modify Order
                </h1>
                <p className='text-gray-600 mt-1'>Order ID: #{orderId}</p>
              </div>
            </div>
          </div>

          {/* Search Products - Hidden components for mobile/desktop */}
          <div className='hidden md:block'>{renderProductSheet()}</div>
          <div className='md:hidden'>{renderProductDrawer()}</div>

          {/* Main Content Grid */}
          <div className='grid grid-cols-1 xl:grid-cols-4 gap-8'>
            {/* Products Section */}
            <div className='xl:col-span-3'>
              <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
                {/* Products Header */}
                <div className='p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                    <div>
                      <h2 className='text-xl font-bold text-gray-900'>
                        Order Products
                      </h2>
                      <p className='text-sm text-gray-600 mt-1'>
                        {selectedProducts.length} product
                        {selectedProducts.length !== 1 ? "s" : ""} in this order
                      </p>
                    </div>
                    <div className='flex gap-3'>
                      <Button
                        variant='outline'
                        onClick={() => setOpenSheet(true)}
                        className='hidden md:flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50'>
                        <Plus className='w-4 h-4' />
                        Add Products
                      </Button>
                      <Button
                        variant='outline'
                        onClick={() => setOpenDrawer(true)}
                        className='md:hidden flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50'>
                        <Plus className='w-4 h-4' />
                        Add Products
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Products Content */}
                <div className='p-6'>
                  <div className='hidden md:block'>{renderTableView()}</div>
                  <div className='md:hidden'>{renderMobileProductView()}</div>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className='xl:col-span-1'>
              <div className='sticky top-8'>
                <Card className='border-2 border-gray-200 shadow-lg'>
                  <CardHeader className='bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg'>
                    <CardTitle className='flex items-center gap-2 text-white'>
                      <ShoppingCart className='w-5 h-5' />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='p-6 space-y-4'>
                    <div className='space-y-3'>
                      <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                        <span className='text-gray-600'>Subtotal</span>
                        <span className='font-semibold text-gray-900'>
                          ৳
                          {selectedProducts
                            .reduce(
                              (sum, item) =>
                                sum +
                                item?.quantity * Number(item?.unitPrice || 0),
                              0
                            )
                            .toFixed(2)}
                        </span>
                      </div>
                      <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                        <span className='text-gray-600'>Delivery Charge</span>
                        <span className='font-semibold text-gray-900'>
                          ৳{orderData.deliveryCarge}
                        </span>
                      </div>
                      <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                        <span className='text-gray-600'>Paid Amount</span>
                        <span className='font-semibold text-green-600'>
                          ৳{orderData.paid}
                        </span>
                      </div>
                    </div>

                    <Alert className='bg-amber-50 border-amber-200'>
                      <AlertTriangle className='h-4 w-4 text-amber-600' />
                      <AlertDescription className='text-amber-800 text-sm'>
                        Final pricing will be calculated after order
                        modification.
                      </AlertDescription>
                    </Alert>

                    <Button
                      onClick={handleUpdateOrder}
                      disabled={selectedProducts.length < 1 || loading}
                      className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                      size='lg'>
                      {loading ? (
                        <>
                          <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className='w-4 h-4 mr-2' />
                          Update Order
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLoading = () => {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center'>
        <Card className='w-full max-w-md mx-4'>
          <CardContent className='flex flex-col items-center justify-center py-12 text-center'>
            <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6'>
              <Loader2 className='w-8 h-8 text-blue-600 animate-spin' />
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              Updating Order
            </h3>
            <p className='text-gray-600'>
              Please wait while we process your changes...
            </p>
            <div className='mt-6 space-y-2 w-full'>
              <Skeleton className='h-2 w-3/4 mx-auto' />
              <Skeleton className='h-2 w-1/2 mx-auto' />
              <Skeleton className='h-2 w-2/3 mx-auto' />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return <>{loading ? renderLoading() : renderMainView()}</>;
};

export default ModifyOrder;
