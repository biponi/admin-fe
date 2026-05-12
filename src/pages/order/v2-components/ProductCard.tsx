import { ShoppingCart, Palette } from "lucide-react";
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
    product.hasVariation === true ||
    (product.variation && product.variation.length > 0);
  const inStock = product.quantity > 0;
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
        group relative overflow-hidden rounded-xl border border-zinc-200
        bg-white transition-all duration-300
        ${
          inStock
            ? "cursor-pointer hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)]"
            : "opacity-55 cursor-default"
        }
      `}
      onClick={handleCardClick}>
      {/* Image */}
      <div className='relative aspect-square w-full overflow-hidden bg-zinc-50'>
        <img
          src={getImageUrl()}
          alt={product.name}
          loading='lazy'
          className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
          onError={(e) => {
            (e.target as HTMLImageElement).src = PlaceHolderImage;
          }}
        />

        {/* Badges */}
        <div className='absolute left-2.5 top-2.5 z-10 flex flex-col gap-1.5'>
          {hasVariations && (
            <span className='rounded-sm bg-white/95 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-zinc-700 shadow-sm'>
              Variations
            </span>
          )}
          {!inStock && (
            <span className='rounded-sm bg-zinc-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-zinc-300'>
              Out of Stock
            </span>
          )}
          {hasDiscount && (
            <span className='rounded-sm bg-emerald-600 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-emerald-50'>
              {discountPercent}
              {product.discountType === "%" ? "%" : "tk"} off
            </span>
          )}
        </div>

        {/* Stock pill */}
        {inStock && (
          <div className='absolute bottom-2.5 right-2.5 rounded-sm bg-black/60 px-2 py-1 text-[10px] tracking-wide text-white backdrop-blur-sm'>
            {product.quantity} left
          </div>
        )}

        {/* Hover CTA */}
        {inStock && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/8'>
            <div className='flex h-10 w-10 scale-75 items-center justify-center rounded-full bg-white opacity-0 shadow-md transition-all duration-300 group-hover:scale-100 group-hover:opacity-100'>
              {hasVariations ? (
                <Palette className='h-4 w-4 text-zinc-700' />
              ) : (
                <ShoppingCart className='h-4 w-4 text-zinc-700' />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className='p-3.5'>
        {/* Categories */}
        {product.categoryNames && product.categoryNames.length > 0 && (
          <div className='mb-1.5 flex gap-1.5'>
            {product.categoryNames.slice(0, 2).map((name, i) => (
              <span
                key={name}
                className='text-[9px] uppercase tracking-[0.08em] text-zinc-400 font-light'>
                {i > 0 && <span className='mr-1.5 opacity-40'>·</span>}
                {name}
              </span>
            ))}
          </div>
        )}

        {/* Name */}
        <h3 className='font-serif text-[15px] font-normal leading-snug tracking-[0.01em] text-zinc-900'>
          {product.name}
        </h3>

        {/* SKU */}
        <p className='mt-1 text-[10px] font-light tracking-wide text-zinc-400'>
          SKU: {product.sku}
        </p>

        {/* Divider */}
        <div className='my-2.5 h-px bg-zinc-100' />

        {/* Price + action */}
        <div className='flex items-end justify-between'>
          <div className='flex items-baseline gap-1.5'>
            <span
              className={`font-serif text-[19px] font-medium leading-none ${
                hasDiscount ? "text-emerald-700" : "text-zinc-900"
              }`}>
              ৳{displayPrice}
            </span>
            {hasDiscount && (
              <span className='text-[11px] font-light text-zinc-400 line-through'>
                ৳{product.unitPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Action label */}
        <button
          disabled={!inStock || isLoading}
          className='mt-2 hidden w-full items-center gap-1.5 text-[10px] uppercase tracking-[0.07em] font-medium text-zinc-400 transition-colors duration-200 group-hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50'
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick(e);
          }}>
          {hasVariations ? (
            <>
              <Palette className='h-3 w-3' /> Select variation
            </>
          ) : (
            <>
              <ShoppingCart className='h-3 w-3' /> Add to cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
