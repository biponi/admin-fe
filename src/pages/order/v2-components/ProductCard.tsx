import { Package, ShoppingCart } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import PlaceHolderImage from "../../../assets/placeholder.svg";
import type { IProduct } from "../../product/interface";

interface ProductCardProps {
  product: IProduct;
  onAddToCart: (product: IProduct) => void;
  onProductClick: (product: IProduct) => void;
  isLoading?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  onProductClick,
  isLoading = false,
}: ProductCardProps) {
  const hasVariations =
    product.hasVariation && product.variation && product.variation.length > 0;
  const inStock = product.quantity > 0;
  const hasDiscount = product.discount > 0;

  const handleCardClick = () => {
    if (hasVariations) {
      onProductClick(product);
    } else {
      onAddToCart(product);
    }
  };

  const getImageUrl = () => {
    if (!product.thumbnail) return PlaceHolderImage;

    // Handle relative URLs
    if (product.thumbnail.startsWith("/")) {
      return product.thumbnail;
    }

    // Handle absolute URLs
    return product.thumbnail;
  };

  return (
    <Card
      className={`
        group relative overflow-hidden transition-all duration-300
        ${!inStock ? "opacity-60" : "hover:shadow-xl hover:border-blue-400 hover:-translate-y-1"}
        cursor-pointer rounded-md
      `}
      onClick={handleCardClick}>
      {/* Product Image - Square Aspect Ratio */}
      <div className='aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 relative'>
        <img
          src={getImageUrl()}
          alt={product.name}
          loading='lazy'
          className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-110'
          onError={(e) => {
            (e.target as HTMLImageElement).src = PlaceHolderImage;
          }}
        />

        {/* Badges */}
        <div className='absolute top-2 left-2 flex flex-col gap-1.5 z-10'>
          {hasVariations && (
            <Badge
              variant='secondary'
              className='text-xs font-semibold shadow-md backdrop-blur-sm bg-white/90'>
              Variations
            </Badge>
          )}
          {!inStock && (
            <Badge
              variant='destructive'
              className='text-xs font-semibold shadow-md'>
              Out of Stock
            </Badge>
          )}
          {hasDiscount && (
            <Badge
              variant='default'
              className='text-xs font-semibold shadow-md bg-gradient-to-r from-green-500 to-green-600'>
              {product?.discountType === "%"
                ? Math.ceil(
                    ((product.unitPrice - product.updatedPrice) /
                      product.unitPrice) *
                      100,
                  )
                : Math.floor(product.discount)}
              {product?.discountType === "%" ? "%" : "TK"} OFF
            </Badge>
          )}
        </div>

        {/* Stock Info Overlay */}
        {inStock && (
          <div className='absolute bottom-2 right-2 bg-gradient-to-r from-black/80 to-black/70 text-white text-xs px-2.5 py-1.5 rounded-lg font-medium backdrop-blur-sm shadow-lg'>
            {product.quantity} left
          </div>
        )}

        {/* Quick Add Overlay on Hover */}
        {inStock && !hasVariations && (
          <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100'>
            <ShoppingCart className='h-12 w-12 text-white drop-shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300' />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className='p-3.5 space-y-2.5 bg-white'>
        {/* Product Name */}
        <h3 className='font-semibold text-sm line-clamp-2 leading-tight uppercase'>
          {product.name}
        </h3>

        {/* SKU */}
        <p className='text-xs text-muted-foreground font-mono'>
          SKU: {product.sku}
        </p>

        {/* Price Section */}
        <div className='flex items-center justify-between pt-1'>
          <div className='flex flex-col'>
            {hasDiscount ? (
              <>
                <span className='text-lg font-bold text-green-600'>
                  ৳
                  {product.updatedPrice?.toFixed(2) ||
                    product.unitPrice.toFixed(2)}
                </span>
                <span className='text-xs text-muted-foreground line-through'>
                  ৳{product.unitPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className='text-lg font-bold text-gray-900'>
                ৳{product.unitPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            size='sm'
            disabled={!inStock || isLoading}
            className='h-8 px-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200'
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}>
            {hasVariations ? (
              <>
                <Package className='h-3 w-3 mr-1' />
                Select
              </>
            ) : (
              <>
                <ShoppingCart className='h-3 w-3 mr-1' />
                Add
              </>
            )}
          </Button>
        </div>

        {/* Category Badge (if available) */}
        {product.categoryNames && product.categoryNames.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {product.categoryNames.slice(0, 2).map((categoryName) => (
              <Badge
                key={categoryName}
                variant='outline'
                className='text-xs border-blue-200 text-blue-700'>
                {categoryName}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
