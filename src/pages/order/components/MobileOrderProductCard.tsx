import React, { useState } from "react";
import {
  Package,
  Plus,
  Minus,
  Check,
  ChevronDown,
  ShoppingCart,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { cn } from "../../../utils/functions";
import { IProduct, IOrderProduct } from "../../product/interface";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

interface MobileOrderProductCardProps {
  product: IProduct;
  onAddProduct: (product: IOrderProduct) => void;
  isSelected?: boolean;
  selectedQuantity?: number;
  selectedVariant?: any;
}

const MobileOrderProductCard: React.FC<MobileOrderProductCardProps> = ({
  product,
  onAddProduct,
  isSelected = false,
  selectedQuantity = 1,
  selectedVariant,
}) => {
  const [quantity, setQuantity] = useState(selectedQuantity);
  const [variant, setVariant] = useState(selectedVariant || null);
  const [showDetails, setShowDetails] = useState(false);

  // Use the same variation logic as desktop - check for hasVariation and variation array
  const hasVariants =
    product.hasVariation && product.variation && product.variation.length > 0;
  const availableVariants = hasVariants
    ? product.variation.filter((v) => v?.quantity > 0)
    : [];

  const handleAddToOrder = () => {
    if (hasVariants && !variant) {
      // Don't allow adding without selecting a variant
      return;
    }

    const unitPrice =
      hasVariants && variant ? variant.unitPrice : product.unitPrice;
    const orderProduct: IOrderProduct = {
      ...product,
      selectedQuantity: quantity,
      selectedVariant: hasVariants ? variant : null,
      totalPrice: unitPrice * quantity,
      discount: 0,
    };
    onAddProduct(orderProduct);
  };

  // Get max quantity based on variant selection or product quantity
  const getMaxQuantity = () => {
    if (hasVariants && variant) {
      return variant.quantity;
    }
    return product.quantity;
  };

  const incrementQuantity = () => {
    const maxQuantity = getMaxQuantity();
    if (quantity < maxQuantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div
      className={cn(
        "bg-white rounded-xl border transition-all duration-200",
        isSelected
          ? "border-primary shadow-lg ring-2 ring-primary/20"
          : "border-gray-200 shadow-sm hover:shadow-md"
      )}>
      {/* Main Content */}
      <div className='p-3'>
        {/* Header Row */}
        <div className='flex items-start gap-3 mb-2'>
          {/* Product Image */}
          <div className='w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden'>
            {product.thumbnail ? (
              <img
                src={product.thumbnail}
                alt={product.name}
                className='w-full h-full object-cover'
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const nextElement = e.currentTarget
                    .nextElementSibling as HTMLElement;
                  if (nextElement) nextElement.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={cn(
                "w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200",
                product.thumbnail ? "hidden" : "flex"
              )}>
              <Package className='h-5 w-5 text-gray-400' />
            </div>
          </div>

          {/* Product Info */}
          <div className='flex-1 min-w-0'>
            <h3 className=' uppercase font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-1'>
              {product.name}
            </h3>
            <div className='flex items-center gap-2 mb-1'>
              <Badge
                variant='outline'
                className='text-xs px-1.5 py-0.5 bg-gray-50 hidden'>
                {product.sku}
              </Badge>
              <Badge
                variant={product.active ? "default" : "secondary"}
                className='text-xs px-1.5 py-0.5'>
                {product.active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <span className='text-lg font-bold text-gray-900'>
                  ৳
                  {hasVariants && variant
                    ? variant.unitPrice
                    : product.unitPrice}
                </span>
                <div className='text-xs text-gray-500'>
                  Stock:{" "}
                  {hasVariants && variant ? variant.quantity : product.quantity}
                </div>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowDetails(!showDetails)}
                className='h-6 w-6 p-0 rounded-full'>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform",
                    showDetails && "rotate-180"
                  )}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Details Section */}
        {showDetails && (
          <div className='mt-3 pt-3 border-t border-gray-100 space-y-3'>
            {/* Variants Selection - Match desktop structure */}
            {hasVariants && (
              <div>
                <label className='text-xs font-medium text-gray-700 mb-1 block'>
                  Select Variant
                </label>
                <Select
                  value={variant ? `${variant.color}-${variant.size}` : ""}
                  onValueChange={(value) => {
                    const selectedVariant = availableVariants.find(
                      (v) => `${v.color}-${v.size}` === value
                    );
                    setVariant(selectedVariant || null);
                    // Reset quantity when variant changes
                    if (selectedVariant) {
                      setQuantity(Math.min(quantity, selectedVariant.quantity));
                    }
                  }}>
                  <SelectTrigger className='h-8 text-xs'>
                    <SelectValue placeholder='Choose variant' />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVariants.map((variant, index) => (
                      <SelectItem
                        key={index}
                        value={`${variant.color}-${variant.size}`}>
                        <div className='flex items-center gap-2 text-xs'>
                          <span className='font-medium'>{variant.color}</span>
                          {variant.size && (
                            <>
                              <span className='text-gray-400'>•</span>
                              <span>{variant.size}</span>
                            </>
                          )}
                          <span className='text-gray-500'>
                            ({variant.quantity} left)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity Selection */}
            <div>
              <label className='text-xs font-medium text-gray-700 mb-1 block'>
                Quantity
              </label>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className='h-8 w-8 p-0 rounded-lg'>
                  <Minus className='h-3 w-3' />
                </Button>
                <Input
                  type='number'
                  value={quantity}
                  onChange={(e) => {
                    const maxQuantity = getMaxQuantity();
                    const newQuantity = Math.max(
                      1,
                      Math.min(maxQuantity, parseInt(e.target.value) || 1)
                    );
                    setQuantity(newQuantity);
                  }}
                  className='h-8 w-16 text-center text-sm'
                  min={1}
                  max={getMaxQuantity()}
                />
                <Button
                  variant='outline'
                  size='sm'
                  onClick={incrementQuantity}
                  disabled={quantity >= getMaxQuantity()}
                  className='h-8 w-8 p-0 rounded-lg'>
                  <Plus className='h-3 w-3' />
                </Button>
              </div>
            </div>

            {/* Total Price */}
            <div className='flex items-center justify-between pt-2 border-t border-gray-100'>
              <span className='text-xs text-gray-600'>Total:</span>
              <span className='font-bold text-primary'>
                ৳
                {(
                  (hasVariants && variant
                    ? variant.unitPrice
                    : product.unitPrice) * quantity
                ).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className='mt-3 pt-3 border-t border-gray-100'>
          <Button
            onClick={handleAddToOrder}
            disabled={
              !product.active ||
              getMaxQuantity() < 1 ||
              (hasVariants && !variant)
            }
            className={cn(
              "w-full h-8 text-xs font-semibold rounded-lg transition-all duration-200",
              isSelected
                ? "bg-green-600 hover:bg-green-700"
                : "bg-primary hover:bg-primary/90"
            )}>
            {isSelected ? (
              <>
                <Check className='h-3 w-3 mr-1' />
                Added to Order
              </>
            ) : hasVariants && !variant ? (
              <>
                <ShoppingCart className='h-3 w-3 mr-1' />
                Select Variant
              </>
            ) : (
              <>
                <ShoppingCart className='h-3 w-3 mr-1' />
                Add to Order
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileOrderProductCard;
