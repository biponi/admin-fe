import { useEffect, useState } from "react";
import useOrder from "./hooks/useOrder";
import useDebounce from "../../customHook/useDebounce";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "../../components/ui/card";
import { IOrderProduct, IProduct } from "../product/interface";
import PlaceHolderImage from "../../assets/placeholder.svg";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import {
  Search,
  Trash2,
  Plus,
  Minus,
  Package,
  DollarSign,
  Calculator,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Truck,
  Receipt,
  CreditCard,
  RotateCcw,
  Loader2,
  ShoppingBag,
  Tag,
  Filter,
  Clock,
  Coins,
} from "lucide-react";
import { ITransection } from "./interface";
import SelectDemo from "./components/SelectDemo";
import { Variation } from "./data/types";
import { toast } from "react-hot-toast";
// import { Alert, AlertDescription } from "../../components/ui/alert";

const defaultTransaction = {
  totalPrice: 0.0,
  paid: 0.0,
  remaining: 0.0,
  discount: 0.0,
  deliveryCharge: 100.0,
};

interface Props {
  handleProductDataSubmit: (
    productData: IOrderProduct[],
    transectionData: ITransection
  ) => void;
  initialProducts?: IOrderProduct[];
  initialTransection?: ITransection | null;
}

const OrderProductList: React.FC<Props> = ({
  handleProductDataSubmit,
  initialProducts = [],
  initialTransection = null,
}) => {
  const { getProductByQuery } = useOrder();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<IProduct[] | []>([]);
  const [selectedProducts, setSelectedProducts] = useState<
    IOrderProduct[] | []
  >(initialProducts || []);
  const [isSearching, setIsSearching] = useState(false);
  const [transection, setTransection] = useState(
    initialTransection || defaultTransaction
  );

  useEffect(() => {
    if (!!selectedProducts) {
      let totalPrice = 0;
      let discount = 0;
      selectedProducts.forEach((product) => {
        totalPrice = Number(totalPrice) + Number(product.totalPrice);
        discount = Number(discount) + Number(product.discount);
      });
      const deliveryCharge = transection?.deliveryCharge;
      setTransection({
        ...transection,
        totalPrice,
        discount,
        deliveryCharge,
        remaining:
          totalPrice +
          Number(deliveryCharge) -
          (Number(transection.paid) || 0 + Number(discount) || 0),
      });
    }
    //eslint-disable-next-line
  }, [selectedProducts]);

  const debounce = useDebounce(query, 500);

  const fetchProduct = async () => {
    if (!query.trim()) {
      setProducts([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const products = await getProductByQuery(query);
      setProducts(products || []);
    } catch (error) {
      toast.error("Failed to fetch products");
      setProducts([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    //eslint-disable-next-line
  }, [debounce]);

  const handleSelect = (product: IProduct) => {
    // For products without variation, prevent duplicate selection
    if (!product.hasVariation) {
      const isAlreadySelected = selectedProducts.some((p) => p.id === product.id);
      if (isAlreadySelected) {
        toast.error("Product already selected!");
        return;
      }
    }
    // For products with variation, allow multiple selections with different variants

    if (!!product.hasVariation) {
      const availableVariants = product.variation.filter(
        (variant) => variant?.quantity > 0
      );
      
      if (availableVariants.length > 0) {
        // Find the first variant that hasn't been selected yet
        const selectedVariants = selectedProducts
          .filter(p => p.id === product.id)
          .map(p => p.selectedVariant);
        
        const availableVariant = availableVariants.find(variant => 
          !selectedVariants.some(selected => 
            selected?.color === variant?.color && selected?.size === variant?.size
          )
        );

        if (availableVariant) {
          const existingCount = selectedProducts.filter(p => p.id === product.id).length;
          setSelectedProducts([
            ...selectedProducts,
            {
              ...product,
              selectedQuantity: 1,
              selectedVariant: availableVariant,
              totalPrice: availableVariant.unitPrice * 1,
            },
          ]);
          toast.success(
            existingCount > 0 
              ? `${product.name} variation added to order! 🎨` 
              : `${product.name} added to order! 🛍️`
          );
        } else {
          toast.error("All available variations of this product are already selected!");
        }
      } else {
        toast.error("No Available variant found");
      }
    } else {
      setSelectedProducts([
        ...selectedProducts,
        { ...product, selectedQuantity: 1, totalPrice: product.unitPrice * 1 },
      ]);
      toast.success(`${product.name} added to order! 🛍️`);
    }
  };

  const EmptyProductCard = ({
    text = "No products found",
  }: {
    text?: string;
  }) => {
    return (
      <div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
        <div className='w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4'>
          <Package className='w-10 h-10 text-gray-400' />
        </div>
        <h3 className='text-lg font-semibold text-gray-700 mb-2'>{text}</h3>
        <p className='text-gray-500 max-w-sm'>
          {text === "No products found"
            ? "Try searching with different keywords or check your inventory."
            : text}
        </p>
      </div>
    );
  };

  const renderProductCards = () => {
    if (isSearching) {
      return (
        <div className='flex items-center justify-center py-12'>
          <div className='flex items-center gap-3'>
            <Loader2 className='w-6 h-6 animate-spin text-blue-600' />
            <span className='text-lg font-medium text-gray-600'>
              Searching products...
            </span>
          </div>
        </div>
      );
    }

    if (!products || products.length === 0) {
      return (
        <EmptyProductCard
          text={
            query
              ? "No products found for your search"
              : "Start typing to search products"
          }
        />
      );
    }

    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2'>
        {products.map((product: IProduct, index: number) => {
          // For products with variations, check if all available variants are selected
          // For products without variations, show as selected if already in cart
          let isSelected = false;
          let allVariantsSelected = false;
          
          if (product.hasVariation) {
            const availableVariants = product.variation.filter(v => v?.quantity > 0);
            const selectedVariants = selectedProducts
              .filter(p => p.id === product.id)
              .map(p => p.selectedVariant);
            
            allVariantsSelected = availableVariants.every(variant =>
              selectedVariants.some(selected =>
                selected?.color === variant?.color && selected?.size === variant?.size
              )
            );
            isSelected = allVariantsSelected;
          } else {
            isSelected = selectedProducts.some((p) => p.id === product.id);
          }
          
          const isAvailable = product?.quantity > 0 && product?.active;

          return (
            <Card
              key={product?.id}
              className={`group transition-all duration-300 hover:shadow-lg border-2 ${
                isSelected
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}>
              <CardContent className='p-4'>
                <div className='relative mb-3'>
                  <div className='aspect-square rounded-lg overflow-hidden bg-gray-100 relative'>
                    <img
                      alt={product?.name}
                      className='w-full h-full object-cover transition-transform group-hover:scale-105'
                      src={product?.thumbnail || PlaceHolderImage}
                    />
                    {isSelected && (
                      <div className='absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center'>
                        <CheckCircle2 className='w-4 h-4 text-white' />
                      </div>
                    )}
                    {/* Show count of selected variations */}
                    {product.hasVariation && selectedProducts.filter(p => p.id === product.id).length > 0 && (
                      <div className='absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-semibold'>
                        {selectedProducts.filter(p => p.id === product.id).length}
                      </div>
                    )}
                    {!isAvailable && (
                      <div className='absolute inset-0 bg-gray-900/60 flex items-center justify-center'>
                        <Badge variant='destructive' className='text-xs'>
                          {!product?.active ? "Inactive" : "Out Of Stock"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-start justify-between'>
                    <h4 className='font-semibold text-gray-900 leading-tight line-clamp-2'>
                      {product?.name}
                    </h4>
                  </div>

                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <div className='flex items-center gap-1 text-sm'>
                      <Package className='w-3 h-3 text-gray-500' />
                      <span
                        className={`font-medium ${
                          product?.quantity > 10
                            ? "text-green-600"
                            : product?.quantity > 0
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}>
                        {product?.quantity} in stock
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-1'>
                      <Coins className='w-3 h-3 text-gray-500' />
                      <span className='font-bold text-blue-600'>
                        ৳{product?.unitPrice}
                      </span>
                    </div>
                  </div>

                  <div className='pt-2'>
                    <Button
                      onClick={() => handleSelect(product)}
                      disabled={!isAvailable || isSelected}
                      className={`w-full transition-all ${
                        isSelected
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : isAvailable
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      size='sm'>
                      {isSelected ? (
                        <>
                          <CheckCircle2 className='w-4 h-4 mr-2' />
                          {product.hasVariation ? "All Variants Added" : "Selected"}
                        </>
                      ) : isAvailable ? (
                        <>
                          <Plus className='w-4 h-4 mr-2' />
                          {product.hasVariation ? "Add Variation" : "Add to Order"}
                        </>
                      ) : (
                        <>
                          <AlertCircle className='w-4 h-4 mr-2' />
                          Unavailable
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderVariantMenu = (
    type: "color" | "size",
    index: number,
    list: string[]
  ) => {
    const handleVariantChange = (variant: Variation) => {
      if (!!variant) {
        const selectedVariant = variant;
        selectedProduct.selectedVariant = selectedVariant;
        selectedProduct.selectedQuantity = Math.min(
          selectedProduct.selectedQuantity,
          selectedVariant.quantity
        );
        selectedProduct.totalPrice =
          selectedProduct.selectedQuantity * selectedVariant.unitPrice;
        setSelectedProducts([...selectedProducts]);
      } else {
        toast.error("This variant is out of stock");
      }
    };
    const selectedProduct = selectedProducts[index];
    const selectedVariant = selectedProducts[index]?.selectedVariant ?? null;
    return (
      <SelectDemo
        type={type}
        list={list}
        selectedProduct={selectedProduct}
        selectedVariant={selectedVariant}
        selected={!!selectedVariant ? selectedVariant[`${type}`] ?? "" : ""}
        onVariantChange={(variant: Variation) => {
          handleVariantChange(variant);
        }}
      />
    );
  };

  const renderSelectedProductCard = (product: IOrderProduct, index: number) => {
    // Count how many times this product appears in selected products
    const productCount = selectedProducts.filter(p => p.id === product.id).length;
    const productInstanceNumber = selectedProducts.slice(0, index + 1).filter(p => p.id === product.id).length;
    const distinctColors = new Set<string>();
    const distinctSizes = new Set<string>();

    if (!!product?.variation) {
      for (const item of product.variation) {
        if (!!item.color) distinctColors.add(item.color);
        if (!!item.size) distinctSizes.add(item.size);
      }
    }

    const uniqueColors: string[] = Array.from(distinctColors) ?? [];
    const uniqueSizes: string[] = Array.from(distinctSizes) ?? [];

    const maxQuantity = product?.hasVariation
      ? product?.selectedVariant?.quantity ?? 0
      : product?.quantity;

    const handleQuantityChange = (newQuantity: number) => {
      if (newQuantity > 0 && newQuantity <= maxQuantity) {
        const updatedProducts = [...selectedProducts];
        updatedProducts[index].selectedQuantity = newQuantity;
        updatedProducts[index].totalPrice =
          newQuantity *
          (product?.hasVariation
            ? product?.selectedVariant?.unitPrice ?? 0
            : product?.unitPrice);
        setSelectedProducts(updatedProducts);
      }
    };

    const handleRemoveProduct = () => {
      setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
      toast.success(`${product.name} removed from order`);
    };

    return (
      <Card
        key={`${product?.id}-${index}`}
        className='border-l-4 border-l-sidebar hover:shadow-md transition-shadow rounded-md'>
        <CardContent className='p-4'>
          <div className='flex gap-4'>
            {/* Product Image */}
            <div className='w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0'>
              <img
                alt={product?.name}
                className='w-full h-full object-cover'
                src={product?.thumbnail || PlaceHolderImage}
              />
            </div>

            {/* Product Details */}
            <div className='flex-1 min-w-0'>
              <div className='flex items-start justify-between mb-2'>
                <h4 className='font-semibold text-gray-900 truncate pr-2'>
                  {product?.name}
                  {productCount > 1 && product.hasVariation && (
                    <span className='ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
                      #{productInstanceNumber}
                    </span>
                  )}
                </h4>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleRemoveProduct}
                  className='text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8'>
                  <Trash2 className='w-4 h-4' />
                </Button>
              </div>

              {/* Variants */}
              {product?.hasVariation && (
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3'>
                  {uniqueColors.length > 0 && (
                    <div className='space-y-1'>
                      <Label className='text-xs text-gray-600'>Color</Label>
                      {renderVariantMenu("color", index, uniqueColors)}
                    </div>
                  )}
                  {uniqueSizes.length > 0 && (
                    <div className='space-y-1'>
                      <Label className='text-xs text-gray-600'>Size</Label>
                      {renderVariantMenu("size", index, uniqueSizes)}
                    </div>
                  )}
                </div>
              )}

              {/* Quantity and Price */}
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Label className='text-sm font-medium'>Qty:</Label>
                  <div className='flex items-center gap-1'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        handleQuantityChange(product.selectedQuantity - 1)
                      }
                      disabled={product.selectedQuantity <= 1}
                      className='h-8 w-8 p-0'>
                      <Minus className='w-3 h-3' />
                    </Button>
                    <Input
                      type='number'
                      min='1'
                      max={maxQuantity}
                      value={product?.selectedQuantity}
                      onChange={(e) =>
                        handleQuantityChange(Number(e.target.value))
                      }
                      className='h-8 w-16 text-center'
                    />
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        handleQuantityChange(product.selectedQuantity + 1)
                      }
                      disabled={product.selectedQuantity >= maxQuantity}
                      className='h-8 w-8 p-0'>
                      <Plus className='w-3 h-3' />
                    </Button>
                  </div>
                </div>

                <div className='text-right'>
                  <div className='text-sm text-gray-600'>Total</div>
                  <div className='font-bold text-blue-600'>
                    ৳{product?.totalPrice}
                  </div>
                </div>
              </div>

              {/* Stock Info */}
              <div className='mt-2 text-xs text-gray-500'>
                {maxQuantity} available
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSelectedProductList = () => {
    if (!selectedProducts || selectedProducts.length === 0) {
      return (
        <div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
          <div className='w-20 h-20 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center mb-4'>
            <ShoppingBag className='w-10 h-10 text-gray-400' />
          </div>
          <h3 className='text-lg font-semibold text-gray-700 mb-2'>
            No products selected
          </h3>
          <p className='text-gray-500 max-w-sm'>
            Search and select products from the left panel to add them to your
            order.
          </p>
        </div>
      );
    }

    return (
      <div className='space-y-3 max-h-[50vh] overflow-y-auto pr-2'>
        {selectedProducts.map((product: IOrderProduct, index) =>
          renderSelectedProductCard(product, index)
        )}
      </div>
    );
  };

  const renderTransectionData = () => {
    const isDisabled = transection.totalPrice < 1;
    const grandTotal =
      transection.totalPrice +
      transection.deliveryCharge -
      transection.discount;

    return (
      <div className='space-y-5'>
        {/* Summary Header */}
        <div className='flex items-center gap-3 pb-3 border-b border-slate-200'>
          <div className='w-8 h-8 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center'>
            <Calculator className='w-4 h-4 text-slate-600' />
          </div>
          <h3 className='font-semibold text-slate-800'>Order Summary</h3>
        </div>

        {/* Subtotal */}
        <div className='flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200'>
          <span className='font-medium text-slate-700'>Subtotal</span>
          <span className='text-lg font-bold text-slate-800'>
            ৳{transection.totalPrice.toFixed(2)}
          </span>
        </div>

        {/* Discount */}
        <div className='space-y-3'>
          <Label className='flex items-center gap-2 text-sm font-medium text-slate-700'>
            <div className='w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center'>
              <Tag className='w-3 h-3 text-amber-600' />
            </div>
            Discount Amount
          </Label>
          <div className='relative'>
            <DollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' />
            <Input
              type='number'
              min='0'
              max={transection.totalPrice}
              disabled={isDisabled}
              value={transection.discount}
              onChange={(e) => {
                const discount = Math.max(
                  0,
                  Math.min(Number(e.target.value), transection.totalPrice)
                );
                setTransection({
                  ...transection,
                  discount,
                  remaining: Math.max(
                    transection.totalPrice +
                      transection?.deliveryCharge -
                      (transection.paid + discount),
                    0
                  ),
                });
              }}
              className='pl-10 bg-white border-slate-200 focus:border-amber-400 focus:ring-amber-100'
              placeholder='0.00'
            />
          </div>
        </div>

        {/* Delivery Charge */}
        <div className='space-y-3'>
          <Label className='flex items-center gap-2 text-sm font-medium text-slate-700'>
            <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center'>
              <Truck className='w-3 h-3 text-blue-600' />
            </div>
            Delivery Charge
          </Label>
          <div className='relative'>
            <DollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' />
            <Input
              type='number'
              min='0'
              disabled={isDisabled}
              value={transection.deliveryCharge}
              onChange={(e) => {
                const deliveryCharge = Math.max(0, Number(e.target.value));
                setTransection({
                  ...transection,
                  deliveryCharge,
                  remaining: Math.max(
                    transection.totalPrice +
                      deliveryCharge -
                      (transection.paid + transection.discount),
                    0
                  ),
                });
              }}
              className='pl-10 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-100'
              placeholder='0.00'
            />
          </div>
        </div>

        {/* Paid Amount */}
        <div className='space-y-3'>
          <Label className='flex items-center gap-2 text-sm font-medium text-slate-700'>
            <div className='w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center'>
              <CreditCard className='w-3 h-3 text-emerald-600' />
            </div>
            Paid Amount
          </Label>
          <div className='relative'>
            <DollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' />
            <Input
              type='number'
              min='0'
              max={transection.totalPrice + transection.deliveryCharge}
              value={transection.paid}
              disabled={isDisabled}
              onChange={(e) => {
                const paid = Math.max(0, Number(e.target.value));
                const maxPayable =
                  transection.totalPrice + transection.deliveryCharge;
                const finalPaid = Math.min(paid, maxPayable);

                setTransection({
                  ...transection,
                  paid: finalPaid,
                  remaining: Math.max(
                    transection.totalPrice +
                      transection?.deliveryCharge -
                      (finalPaid + transection.discount),
                    0
                  ),
                });
              }}
              className='pl-10 bg-white border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
              placeholder='0.00'
            />
          </div>
        </div>

        <Separator className='my-5 border-slate-200' />

        {/* Summary Cards */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 rounded-xl border border-slate-200 shadow-sm'>
            <div className='flex items-center gap-2'>
              <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center'>
                <Receipt className='w-3 h-3 text-blue-600' />
              </div>
              <span className='font-semibold text-slate-700'>Grand Total</span>
            </div>
            <span className='text-xl font-bold text-slate-800'>
              ৳{grandTotal.toFixed(2)}
            </span>
          </div>

          <div
            className={`flex items-center justify-between p-4 rounded-xl border shadow-sm ${
              transection.remaining > 0
                ? "bg-gradient-to-r from-rose-50 via-orange-50 to-rose-50 border-rose-200"
                : "bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border-emerald-200"
            }`}>
            <div className='flex items-center gap-2'>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  transection.remaining > 0 ? "bg-orange-100" : "bg-emerald-100"
                }`}>
                {transection.remaining > 0 ? (
                  <AlertCircle className='w-3 h-3 text-orange-600' />
                ) : (
                  <CheckCircle2 className='w-3 h-3 text-emerald-600' />
                )}
              </div>
              <span className='font-semibold text-slate-700'>
                {transection.remaining > 0 ? "Due Amount" : "Fully Paid"}
              </span>
            </div>
            <span
              className={`text-xl font-bold ${
                transection.remaining > 0
                  ? "text-orange-700"
                  : "text-emerald-700"
              }`}>
              ৳{transection.remaining.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Status Indicator */}
        {transection.totalPrice > 0 && (
          <div
            className={`p-3 rounded-lg border-l-4 ${
              transection.remaining === 0
                ? "bg-emerald-50 border-l-emerald-500 border border-emerald-200"
                : transection.paid > 0
                ? "bg-amber-50 border-l-amber-500 border border-amber-200"
                : "bg-slate-50 border-l-slate-400 border border-slate-200"
            }`}>
            <div className='flex items-center gap-2'>
              {transection.remaining === 0 ? (
                <>
                  <CheckCircle2 className='w-4 h-4 text-emerald-600' />
                  <span className='text-sm font-medium text-emerald-800'>
                    Payment Complete
                  </span>
                </>
              ) : transection.paid > 0 ? (
                <>
                  <AlertCircle className='w-4 h-4 text-amber-600' />
                  <span className='text-sm font-medium text-amber-800'>
                    Partial Payment
                  </span>
                </>
              ) : (
                <>
                  <Clock className='w-4 h-4 text-slate-500' />
                  <span className='text-sm font-medium text-slate-600'>
                    Pending Payment
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Product Search Section */}
        <Card className='border-2 border-blue-200 shadow-lg rounded-lg'>
          <CardHeader className='bg-gradient-to-r from-blue-50 to-purple-50 border-b rounded-lg'>
            <CardTitle className='flex items-center gap-2 text-xl text-gray-800'>
              <Search className='w-6 h-6 text-blue-600' />
              Product Catalog
            </CardTitle>
            <CardDescription className='text-gray-600'>
              Search and select products for your order
            </CardDescription>
          </CardHeader>
          <CardContent className='p-6'>
            {/* Search Input */}
            <div className='relative mb-6'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
              <Input
                type='text'
                placeholder='Search products by name, SKU, or category...'
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className='pl-12 pr-4 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 bg-white'
              />
              {isSearching && (
                <Loader2 className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin text-blue-600' />
              )}
            </div>

            {/* Results Summary */}
            {query && !isSearching && (
              <div className='mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200'>
                <div className='flex items-center gap-2 text-sm text-blue-700'>
                  <Filter className='w-4 h-4' />
                  <span>
                    {products.length > 0
                      ? `Found ${products.length} product${
                          products.length !== 1 ? "s" : ""
                        }`
                      : "No products found"}{" "}
                    for "{query}"
                  </span>
                </div>
              </div>
            )}

            {/* Product Cards */}
            {renderProductCards()}
          </CardContent>
        </Card>

        {/* Selected Products Section */}
        <Card className='border-2 border-green-200 shadow-lg'>
          <CardHeader className='bg-gradient-to-r from-green-50 to-blue-50 border-b rounded-lg'>
            <CardTitle className='flex items-center justify-between text-xl text-gray-800'>
              <div className='flex items-center gap-2'>
                <ShoppingBag className='w-6 h-6 text-green-600' />
                Selected Products
              </div>
              {selectedProducts.length > 0 && (
                <Badge className='bg-green-600 text-white'>
                  {selectedProducts.length} item
                  {selectedProducts.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className='text-gray-600'>
              Review and manage your selected products
            </CardDescription>
          </CardHeader>
          <CardContent className='p-6'>
            {renderSelectedProductList()}
          </CardContent>
        </Card>
      </div>

      {/* Order Summary Section */}
      <Card className='border-2 border-slate-200 shadow-lg bg-white'>
        <CardHeader className='bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 border-b border-slate-200 rounded-lg'>
          <CardTitle className='flex items-center gap-3 text-xl text-slate-800'>
            <div className='w-8 h-8 bg-gradient-to-r from-slate-100 to-blue-100 rounded-full flex items-center justify-center'>
              <Receipt className='w-5 h-5 text-slate-600' />
            </div>
            Order Summary & Calculations
          </CardTitle>
          <CardDescription className='text-slate-600 ml-11'>
            Review pricing details and proceed to next step
          </CardDescription>
        </CardHeader>
        <CardContent className='p-6 bg-gradient-to-b from-white to-slate-50'>
          {renderTransectionData()}
        </CardContent>
        <CardFooter className='bg-gray-50 border-t p-6'>
          <div className='flex flex-col sm:flex-row gap-3 w-full'>
            <Button
              variant='outline'
              onClick={() => {
                setSelectedProducts([]);
                setTransection(defaultTransaction);
                setQuery("");
                setProducts([]);
                toast.success("Order cleared successfully");
              }}
              className='flex items-center gap-2 border-gray-300 hover:bg-gray-50'
              disabled={selectedProducts.length === 0}>
              <RotateCcw className='w-4 h-4' />
              Clear Order
            </Button>

            <Button
              disabled={!selectedProducts || selectedProducts.length < 1}
              onClick={() => {
                handleProductDataSubmit(selectedProducts, transection);
                toast.success(
                  `Proceeding with ${selectedProducts.length} products! 🚀`
                );
              }}
              className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none sm:ml-auto'
              size='lg'>
              <ArrowRight className='w-5 h-5' />
              Continue to Customer Details
              {selectedProducts.length > 0 && (
                <Badge className='bg-white/20 text-white ml-2'>
                  {selectedProducts.length}
                </Badge>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderProductList;
