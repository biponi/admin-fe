import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  Package,
  ShoppingCart,
  Calculator,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { IProduct, IOrderProduct } from "../../product/interface";
import { ITransection } from "../interface";
import MobileOrderProductCard from "./MobileOrderProductCard";
import useOrder from "../hooks/useOrder";
import useDebounce from "../../../customHook/useDebounce";

interface MobileOrderProductSearchProps {
  onProductsSubmit: (
    products: IOrderProduct[],
    transaction: ITransection
  ) => void;
  initialProducts?: IOrderProduct[];
  initialTransaction?: ITransection | null;
}

const defaultTransaction = {
  totalPrice: 0.0,
  paid: 0.0,
  remaining: 0.0,
  discount: 0.0,
  deliveryCharge: 100.0,
};

const MobileOrderProductSearch: React.FC<MobileOrderProductSearchProps> = ({
  onProductsSubmit,
  initialProducts = [],
  initialTransaction = null,
}) => {
  const { getProductByQuery } = useOrder();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<IProduct[]>([]);
  const [selectedProducts, setSelectedProducts] =
    useState<IOrderProduct[]>(initialProducts);
  const [isSearching, setIsSearching] = useState(false);
  const [transaction, setTransaction] = useState(
    initialTransaction || defaultTransaction
  );

  const debouncedQuery = useDebounce(query, 500);

  // Calculate delivery charge based on location
  // This function is now handled in the parent CreateOrder component
  // const calculateDeliveryCharge = (district: string, division: string): number => {
  //   let deliveryChargeX = 150; // Default charge
  //
  //   if (
  //     district.toLowerCase().includes("dhaka") &&
  //     division.toLowerCase().includes("dhaka")
  //   ) {
  //     deliveryChargeX = 80;
  //   } else if (
  //     division.toLowerCase().includes("dhaka") &&
  //     ["gazipur", "tongi", "narayanganj", "savar"].includes(
  //       district.replace(/\s*\(.*?\)\s*/g, "").toLowerCase()
  //     )
  //   ) {
  //     deliveryChargeX = 130;
  //   } else {
  //     deliveryChargeX = 150;
  //   }
  //
  //   return deliveryChargeX;
  // };

  // Function to update delivery charge based on location
  // This function can be called from parent components when customer info changes
  // const updateDeliveryChargeFromLocation = (customerInfo: any) => {
  //   if (customerInfo?.shipping?.district && customerInfo?.shipping?.division) {
  //     const calculatedCharge = calculateDeliveryCharge(
  //       customerInfo.shipping.district.name || customerInfo.shipping.district,
  //       customerInfo.shipping.division.name || customerInfo.shipping.division
  //     );
  //
  //     setTransaction(prev => ({
  //       ...prev,
  //       deliveryCharge: calculatedCharge
  //     }));
  //     setTempDeliveryCharge(calculatedCharge.toString());
  //   }
  // };

  useEffect(() => {
    if (debouncedQuery.trim()) {
      handleProductSearch();
    } else {
      setProducts([]);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  useEffect(() => {
    calculateTransaction();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProducts]);

  const handleProductSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await getProductByQuery(query);
      if (!!response) {
        setProducts(response);
      }
    } catch (error) {
      console.error("Product search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const calculateTransaction = () => {
    let totalPrice = 0;
    let discount = 0;

    selectedProducts.forEach((product) => {
      totalPrice += Number(product.totalPrice || 0);
      discount += Number(product.discount || 0);
    });

    const deliveryCharge = transaction.deliveryCharge;
    const remaining =
      totalPrice +
      Number(deliveryCharge) -
      (Number(transaction.paid) + Number(discount));

    setTransaction((prev) => ({
      ...prev,
      totalPrice,
      discount,
      remaining,
    }));
  };

  const handleAddProduct = (orderProduct: IOrderProduct) => {
    const existingIndex = selectedProducts.findIndex(
      (p) =>
        p.id === orderProduct.id &&
        p.selectedVariant === orderProduct.selectedVariant
    );

    if (existingIndex >= 0) {
      const updatedProducts = [...selectedProducts];
      updatedProducts[existingIndex] = {
        ...updatedProducts[existingIndex],
        selectedQuantity: orderProduct.selectedQuantity,
        totalPrice: orderProduct.totalPrice,
      };
      setSelectedProducts(updatedProducts);
    } else {
      setSelectedProducts((prev) => [...prev, orderProduct]);
    }
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProceed = () => {
    if (selectedProducts.length > 0) {
      onProductsSubmit(selectedProducts, transaction);
    }
  };

  const isProductSelected = (product: IProduct) => {
    return selectedProducts.some((p) => p.id === product.id);
  };

  return (
    <div className='space-y-4'>
      {/* Search Section */}
      <Card className='border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-purple/5'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-lg flex items-center gap-2'>
            <Search className='h-5 w-5 text-primary' />
            Search Products
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-0'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              type='text'
              placeholder='Search by name, SKU...'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className='pl-10 pr-12 h-10 bg-white border-2 border-gray-200 rounded-xl focus:border-primary'
            />
            {query && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setQuery("")}
                className='absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 rounded-full'>
                <X className='h-3 w-3' />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Products Summary */}
      {selectedProducts.length > 0 && (
        <Card className='border-green-200 bg-green-50'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <ShoppingCart className='h-5 w-5 text-green-600' />
                Selected Products ({selectedProducts.length})
              </div>
              <Badge
                variant='secondary'
                className='bg-green-100 text-green-800'>
                ৳{transaction.totalPrice.toFixed(2)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-0'>
            <div className='space-y-2 mb-4'>
              {selectedProducts.map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  className='flex items-center justify-between p-2 bg-white rounded-lg border'>
                  <div className='flex-1'>
                    <span className='text-sm font-medium'>{product.name}</span>
                    {product.selectedVariant && (
                      <Badge variant='outline' className='ml-2 text-xs'>
                        {product.selectedVariant.color}
                        {product.selectedVariant.color &&
                          product.selectedVariant.size &&
                          " • "}
                        {product.selectedVariant.size}
                      </Badge>
                    )}
                    <div className='text-xs text-gray-500'>
                      Qty: {product.selectedQuantity} × ৳{product.unitPrice}
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-bold text-green-600'>
                      ৳{product.totalPrice?.toFixed(2)}
                    </span>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleRemoveProduct(index)}
                      className='h-6 w-6 p-0 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50'>
                      <X className='h-3 w-3' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleProceed}
              className='w-full h-10 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl'>
              <Calculator className='h-4 w-4 mr-2' />
              Proceed to Customer Details
              <ArrowRight className='h-4 w-4 ml-2' />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {query && (
        <div>
          <div className='flex items-center justify-between mb-3'>
            <h3 className='font-semibold text-gray-900'>
              Search Results {isSearching && "(Searching...)"}
            </h3>
            {products.length > 0 && (
              <Badge variant='outline'>{products.length} found</Badge>
            )}
          </div>

          {isSearching ? (
            <div className='grid grid-cols-1 gap-3'>
              {[...Array(3)].map((_, i) => (
                <Card key={i} className='animate-pulse'>
                  <CardContent className='p-3'>
                    <div className='flex gap-3'>
                      <div className='w-12 h-12 bg-gray-200 rounded-lg' />
                      <div className='flex-1'>
                        <div className='h-4 bg-gray-200 rounded w-3/4 mb-2' />
                        <div className='h-3 bg-gray-200 rounded w-1/2 mb-2' />
                        <div className='h-3 bg-gray-200 rounded w-1/4' />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className='grid grid-cols-1 gap-3'>
              {products.map((product) => (
                <MobileOrderProductCard
                  key={product.id}
                  product={product}
                  onAddProduct={handleAddProduct}
                  isSelected={isProductSelected(product)}
                />
              ))}
            </div>
          ) : query && !isSearching ? (
            <Card className='border-dashed border-2 border-gray-200'>
              <CardContent className='p-6 text-center'>
                <AlertCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <h3 className='font-semibold text-gray-900 mb-2'>
                  No products found
                </h3>
                <p className='text-gray-600 text-sm'>
                  Try searching with different keywords
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      {/* Empty State */}
      {!query && selectedProducts.length === 0 && (
        <Card className='border-dashed border-2 border-gray-200'>
          <CardContent className='p-8 text-center'>
            <div className='relative mb-6'>
              <Package className='h-16 w-16 text-gray-300 mx-auto mb-4' />
              <Sparkles className='absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-pulse' />
            </div>
            <h3 className='font-semibold text-gray-900 mb-2'>
              Start Building Your Order
            </h3>
            <p className='text-gray-600 text-sm mb-4'>
              Search for products to add them to your order
            </p>
            <div className='flex items-center justify-center gap-2 text-xs text-gray-500'>
              <Search className='h-3 w-3' />
              Use the search box above to find products
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MobileOrderProductSearch;
