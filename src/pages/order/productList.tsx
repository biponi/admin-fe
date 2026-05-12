import { useEffect, useState } from "react";
import useOrder from "./hooks/useOrder";
import useDebounce from "../../customHook/useDebounce";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { IOrderProduct, IProduct } from "../product/interface";
import PlaceHolderImage from "../../assets/placeholder.svg";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Search,
  Trash2,
  Plus,
  Minus,
  Package,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Loader2,
  ShoppingBag,
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
          ((Number(transection.paid) || 0) + (Number(discount) || 0)),
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
      const isAlreadySelected = selectedProducts.some(
        (p) => p.id === product.id
      );
      if (isAlreadySelected) {
        toast.error("Product already selected!");
        return;
      }
    }
    // For products with variation, allow multiple selections with different variants
    console.log("ppp:", product);
    if (!!product.hasVariation && !!product.variation) {
      const availableVariants = product.variation.filter(
        (variant) => variant?.quantity > 0
      );

      if (availableVariants.length > 0) {
        // Find the first variant that hasn't been selected yet
        const selectedVariants = selectedProducts
          .filter((p) => p.id === product.id)
          .map((p) => p.selectedVariant);

        const availableVariant = availableVariants.find(
          (variant) =>
            !selectedVariants.some(
              (selected) =>
                selected?.color === variant?.color &&
                selected?.size === variant?.size
            )
        );

        if (availableVariant) {
          const existingCount = selectedProducts.filter(
            (p) => p.id === product.id
          ).length;
          const priceToUse = availableVariant.unitPrice;
          setSelectedProducts([
            ...selectedProducts,
            {
              ...product,
              selectedQuantity: 1,
              selectedVariant: availableVariant,
              totalPrice: priceToUse * 1,
            },
          ]);
          toast.success(
            existingCount > 0
              ? `${product.name} variation added to order! 🎨`
              : `${product.name} added to order! 🛍️`
          );
        } else {
          toast.error(
            "All available variations of this product are already selected!"
          );
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
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2'>
        {products.map((product: IProduct) => {
          // For products with variations, check if all available variants are selected
          // For products without variations, show as selected if already in cart
          let isSelected = false;
          let allVariantsSelected = false;

          if (product.hasVariation) {
            const availableVariants = product.variation.filter(
              (v) => v?.quantity > 0
            );
            const selectedVariants = selectedProducts
              .filter((p) => p.id === product.id)
              .map((p) => p.selectedVariant);

            allVariantsSelected = availableVariants.every((variant) =>
              selectedVariants.some(
                (selected) =>
                  selected?.color === variant?.color &&
                  selected?.size === variant?.size
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
              className={`group transition-all duration-200 hover:shadow-sm border ${
                isSelected
                  ? "border-violet-200 bg-violet-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}>
              <CardContent className='p-3'>
                <div className='relative mb-3'>
                  <div className='aspect-square rounded-md overflow-hidden bg-gray-50 relative border border-gray-100'>
                    <img
                      alt={product?.name}
                      className='w-full h-full object-cover'
                      src={product?.thumbnail || PlaceHolderImage}
                    />
                    {isSelected && (
                      <div className='absolute top-2 right-2 w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center'>
                        <CheckCircle2 className='w-3 h-3 text-white' />
                      </div>
                    )}
                    {product.hasVariation &&
                      selectedProducts.filter((p) => p.id === product.id)
                        .length > 0 && (
                        <div className='absolute top-2 left-2 px-2 py-0.5 bg-gray-900 text-white text-xs rounded font-medium'>
                          {
                            selectedProducts.filter((p) => p.id === product.id)
                              .length
                          }
                        </div>
                      )}
                    {!isAvailable && (
                      <div className='absolute inset-0 bg-gray-900/70 flex items-center justify-center'>
                        <span className='text-xs text-white font-medium'>
                          {!product?.active ? "Inactive" : "Out of stock"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <h4 className='font-medium text-sm text-gray-900 leading-tight line-clamp-2 min-h-[2.5rem]'>
                    {product?.name}
                  </h4>

                  <div className='flex items-center justify-between text-xs text-gray-500'>
                    <span>{product?.quantity} in stock</span>
                    <span className='font-semibold text-gray-900'>
                      ৳{product?.unitPrice}
                    </span>
                  </div>

                  <Button
                    onClick={() => handleSelect(product)}
                    disabled={!isAvailable || isSelected}
                    className={`w-full h-9 text-sm font-medium transition-colors ${
                      isSelected
                        ? "bg-violet-600 hover:bg-violet-700 text-white"
                        : isAvailable
                        ? "bg-gray-900 hover:bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}>
                    {isSelected ? (
                      <>
                        <CheckCircle2 className='w-4 h-4 mr-2' />
                        {product.hasVariation ? "Added" : "Selected"}
                      </>
                    ) : isAvailable ? (
                      <>
                        <Plus className='w-4 h-4 mr-2' />
                        Add
                      </>
                    ) : (
                      "Unavailable"
                    )}
                  </Button>
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
        const priceToUse = selectedVariant.unitPrice;
        selectedProduct.totalPrice =
          selectedProduct.selectedQuantity * priceToUse;
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
    const productCount = selectedProducts.filter(
      (p) => p.id === product.id
    ).length;
    const productInstanceNumber = selectedProducts
      .slice(0, index + 1)
      .filter((p) => p.id === product.id).length;
    const distinctColors = new Set<string>();
    const distinctSizes = new Set<string>();

    if (product.hasVariation && product?.variation.length > 0) {
      const variations = product.variation.filter((v) => v?.quantity > 0);
      if (variations.length === 0) {
        toast.error(
          `No available variants for ${product.name}. Please remove this product.`
        );
        return null;
      }
      for (const item of variations) {
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
        // Use variant price if product has variation, otherwise use product price
        const priceToUse = product?.hasVariation && product?.selectedVariant
          ? product.selectedVariant.unitPrice
          : product?.unitPrice;
        updatedProducts[index].totalPrice = newQuantity * priceToUse;
        setSelectedProducts(updatedProducts);
      }
    };

    const handleRemoveProduct = () => {
      setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
      toast.success(`${product.name} removed from order`);
    };

    return (
      <div
        key={`${product?.id}-${index}`}
        className='flex items-start gap-4 py-3 border-b border-gray-200 last:border-0'>
        {/* Product Image */}
        <div className='w-16 h-16 rounded-md overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-200'>
          <img
            alt={product?.name}
            className='w-full h-full object-cover'
            src={product?.thumbnail || PlaceHolderImage}
          />
        </div>

        {/* Product Details */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between mb-2'>
            <h4 className='font-medium text-sm text-gray-900 truncate pr-2'>
              {product?.name}
              {productCount > 1 && product.hasVariation && (
                <span className='ml-2 text-xs text-gray-500'>
                  (#{productInstanceNumber})
                </span>
              )}
            </h4>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleRemoveProduct}
              className='text-gray-400 hover:text-red-600 h-8 w-8 p-0 -mt-1'>
              <Trash2 className='w-4 h-4' />
            </Button>
          </div>

          {/* Variants */}
          {product?.hasVariation && (
            <div className='flex gap-2 mb-2'>
              {uniqueColors.length > 0 && (
                <div className='flex-1'>
                  <Label className='text-xs text-gray-500 mb-1'>Color</Label>
                  {renderVariantMenu("color", index, uniqueColors)}
                </div>
              )}
              {uniqueSizes.length > 0 && (
                <div className='flex-1'>
                  <Label className='text-xs text-gray-500 mb-1'>Size</Label>
                  {renderVariantMenu("size", index, uniqueSizes)}
                </div>
              )}
            </div>
          )}

          {/* Quantity and Price */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='flex items-center border border-gray-300 rounded-md'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() =>
                    handleQuantityChange(product.selectedQuantity - 1)
                  }
                  disabled={product.selectedQuantity <= 1}
                  className='h-8 w-8 p-0 hover:bg-gray-100'>
                  <Minus className='w-3 h-3' />
                </Button>
                <span className='w-10 text-center text-sm font-medium text-gray-900'>
                  {product?.selectedQuantity}
                </span>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() =>
                    handleQuantityChange(product.selectedQuantity + 1)
                  }
                  disabled={product.selectedQuantity >= maxQuantity}
                  className='h-8 w-8 p-0 hover:bg-gray-100'>
                  <Plus className='w-3 h-3' />
                </Button>
              </div>
              <span className='text-xs text-gray-500'>
                {maxQuantity} available
              </span>
            </div>

            <div className='text-right'>
              {product?.discount > 0 ? (
                <div className='font-semibold text-gray-900'>
                  <del className='text-red-600'>
                    ৳{product?.unitPrice * product?.selectedQuantity}
                  </del>
                  <span className='font-semibold text-gray-900 ml-1'>
                    ৳{product?.updatedPrice * product?.selectedQuantity}
                  </span>
                </div>
              ) : (
                <div className='font-semibold text-gray-900'>
                  ৳{product?.unitPrice * product?.selectedQuantity}
                </div>
              )}
              {product?.discount > 0 ? (
                <div className='text-xs text-gray-500'>
                  <del className='text-red-600'>
                    {" "}
                    ৳{(product?.unitPrice).toFixed(2)}
                  </del>{" "}
                  ৳{(product?.updatedPrice).toFixed(2)} each
                </div>
              ) : (
                <div className='text-xs text-gray-500'>
                  ৳{(product?.unitPrice).toFixed(2)} each
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSelectedProductList = () => {
    if (!selectedProducts || selectedProducts.length === 0) {
      return (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <ShoppingBag className='w-12 h-12 text-gray-200 mb-3' />
          <p className='text-sm font-medium text-gray-500'>
            No items added yet
          </p>
          <p className='text-xs text-gray-400 mt-1'>
            Search and select products to add them to the order
          </p>
        </div>
      );
    }

    return (
      <div className='max-h-[calc(100vh-450px)] overflow-y-auto -mx-4'>
        <div className='px-4'>
          {selectedProducts.map((product: IOrderProduct, index) =>
            renderSelectedProductCard(product, index)
          )}
        </div>
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Product Search Section - Medusa Style */}
        <Card className='border border-gray-200 shadow-sm rounded-lg bg-white'>
          <CardHeader className='border-b border-gray-200 p-4'>
            <CardTitle className='text-base font-medium text-gray-900'>
              Products
            </CardTitle>
            <CardDescription className='text-sm text-gray-500 mt-1'>
              Search and select products for the order
            </CardDescription>
          </CardHeader>
          <CardContent className='p-4'>
            {/* Search Input - Medusa Style */}
            <div className='relative mb-4'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <Input
                type='text'
                placeholder='Search products...'
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className='pl-10 h-10 text-sm border-gray-300 focus:border-violet-500 focus:ring-violet-500'
              />
              {isSearching && (
                <Loader2 className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-violet-600' />
              )}
            </div>

            {/* Results Summary */}
            {query && !isSearching && products.length > 0 && (
              <div className='mb-4 text-xs text-gray-500'>
                {products.length} product{products.length !== 1 ? "s" : ""}{" "}
                found
              </div>
            )}

            {/* Product Cards */}
            {renderProductCards()}
          </CardContent>
        </Card>

        {/* Selected Products Section - Medusa Style */}
        <Card className='border border-gray-200 shadow-sm bg-white'>
          <CardHeader className='border-b border-gray-200 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-base font-medium text-gray-900'>
                  Items
                </CardTitle>
                <CardDescription className='text-sm text-gray-500 mt-1'>
                  {selectedProducts.length > 0
                    ? `${selectedProducts.length} item${
                        selectedProducts.length !== 1 ? "s" : ""
                      } selected`
                    : "No items selected"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-4'>
            {renderSelectedProductList()}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons - Medusa Style */}
      <div className='flex items-center justify-between pt-4'>
        <Button
          variant='outline'
          onClick={() => {
            setSelectedProducts([]);
            setTransection(defaultTransaction);
            setQuery("");
            setProducts([]);
            toast.success("Order cleared successfully");
          }}
          className='h-10 px-4 text-sm font-medium border-gray-300 hover:bg-gray-50'
          disabled={selectedProducts.length === 0}>
          <RotateCcw className='w-4 h-4 mr-2' />
          Clear
        </Button>

        <Button
          disabled={!selectedProducts || selectedProducts.length < 1}
          onClick={() => {
            handleProductDataSubmit(selectedProducts, transection);
            toast.success(
              `Proceeding with ${selectedProducts.length} products! 🚀`
            );
          }}
          className='h-10 px-6 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white'>
          Continue
          <ArrowRight className='w-4 h-4 ml-2' />
        </Button>
      </div>
    </div>
  );
};

export default OrderProductList;
