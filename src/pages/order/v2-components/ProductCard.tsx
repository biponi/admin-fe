import { ShoppingCart, Palette, Check } from "lucide-react";
import PlaceHolderImage from "../../../assets/placeholder.svg";
import type { IProduct } from "../../product/interface";

interface ProductCardProps {
  product: IProduct;
  onAddToCart: (product: IProduct) => void;
  onProductClick: (product: IProduct) => void;
  isLoading?: boolean;
  /** Total quantity of this product already in the cart (all variations). */
  cartQuantity?: number;
}

const LOW_STOCK_THRESHOLD = 5;

export function ProductCard({
  product,
  onAddToCart,
  onProductClick,
  isLoading = false,
  cartQuantity = 0,
}: ProductCardProps) {
  const hasVariations =
    product.hasVariation === true ||
    (product.variation && product.variation.length > 0);
  const inStock = product.quantity > 0;
  const lowStock = inStock && product.quantity <= LOW_STOCK_THRESHOLD;
  const hasDiscount = product.discount > 0;

  const discountPercent =
    product.discountType === "%"
      ? Math.ceil(
          ((product.unitPrice - product.updatedPrice) / product.unitPrice) *
            100,
        )
      : Math.floor(product.discount);

  const displayPrice = hasDiscount
    ? (product.updatedPrice?.toFixed(2) ?? product.unitPrice.toFixed(2))
    : product.unitPrice.toFixed(2);

  const handleCardClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    hasVariations ? onProductClick(product) : onAddToCart(product);
  };

  const getImageUrl = () => {
    if (!product.thumbnail) return PlaceHolderImage;
    return product.thumbnail;
  };

  return (
    <div
      className={`
        group relative md:shadow  overflow-hidden rounded-md border bg-background transition-colors duration-200
        ${
          inStock
            ? "border-border hover:border-border hover:shadow-sm cursor-pointer"
            : "border-border opacity-60 cursor-default"
        }
      `}
      onClick={handleCardClick}>
      {/* Image */}
      <div className='relative aspect-square w-full overflow-hidden bg-gray-50 md:p-1.5'>
        <img
          src={getImageUrl()}
          alt={product.name}
          loading='lazy'
          className={
            inStock
              ? "h-full  w-full object-cover rounded-md"
              : "h-full  w-full object-cover opacity-60 grayscale rounded-md"
          }
          onError={(e) => {
            (e.target as HTMLImageElement).src = PlaceHolderImage;
          }}
        />

        {/* Stock pill — quiet when healthy, amber when low, dark when out */}
        <div className='absolute left-2 top-2 z-10 flex flex-col gap-1 items-start'>
          {!inStock && (
            <span className='rounded-full bg-foreground/85 px-2 py-0.5 text-[10px] font-medium text-background backdrop-blur-sm'>
              Sold out
            </span>
          )}
          {lowStock && (
            <span className='rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700'>
              {product.quantity} left
            </span>
          )}
        </div>

        {/* Discount pill */}
        {hasDiscount && (
          <span className='absolute right-2 top-2 z-10 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700'>
            {discountPercent}
            {product.discountType === "%" ? "%" : "tk"} off
          </span>
        )}
      </div>

      {/* Info */}
      <div className='p-2.5'>
        {/* Name */}
        <h3 className='uppercase  line-clamp-2  text-[13px] font-medium leading-snug text-foreground'>
          {product.name}
        </h3>

        {/* Meta */}
        <p className='truncate text-[11px] text-muted-foreground/70'>
          {product.sku}
          {product.categoryNames && product.categoryNames.length > 0 && (
            <> · {product.categoryNames[0]}</>
          )}
          {hasVariations && <> · {product.variation.length} options</>}
        </p>

        {/* Price + action */}
        <div className='mt-1 flex items-center justify-between gap-2'>
          <div className='flex items-baseline gap-1.5 min-w-0'>
            <span
              className={`text-sm font-semibold leading-none tabular-nums ${
                hasDiscount ? "text-emerald-700" : "text-foreground"
              }`}>
              ৳{displayPrice}
            </span>
            {hasDiscount && (
              <span className='text-[11px] text-muted-foreground/70 line-through tabular-nums'>
                ৳{product.unitPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add / select variation — always visible, not hover-only */}
          <div className='relative shrink-0'>
            <button
              type='button'
              disabled={!inStock || isLoading}
              title={
                !inStock
                  ? "Out of stock"
                  : hasVariations
                    ? "Select variation"
                    : "Add to cart"
              }
              className={`flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                inStock
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  : "border border-border bg-muted/50 text-muted-foreground/70"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick(e);
              }}>
              {hasVariations ? (
                <Palette className='h-4 w-4' />
              ) : (
                <ShoppingCart className='h-4 w-4' />
              )}
            </button>

            {/* In-cart chip — emerald "applied" feedback */}
            {cartQuantity > 0 && (
              <span className='absolute -top-1.5 -right-1.5 flex items-center gap-0.5 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-sm'>
                <Check className='h-2.5 w-2.5' />
                {cartQuantity}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
