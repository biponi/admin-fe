import { SearchX } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { IProduct } from "../../product/interface";

interface ProductGridProps {
  products: IProduct[];
  onAddToCart: (product: IProduct) => void;
  onProductClick: (product: IProduct) => void;
  isLoading?: boolean;
  /** Quantity of each product already in the cart, keyed by product id. */
  cartQtyByProductId?: Record<string, number>;
}

// Responsive grid — flows inside the left pane's single scroll
// (no inner max-h/overflow here; the pane owns scrolling).
const gridClasses =
  "grid grid-cols-2 gap-3 xl:gap-5 sm:grid-cols-4  xl:grid-cols-5 content-start";

export function ProductGrid({
  products,
  onAddToCart,
  onProductClick,
  isLoading = false,
  cartQtyByProductId = {},
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className={gridClasses}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className='overflow-hidden rounded-xl border border-border/60 bg-background'>
            <div className='aspect-square w-full animate-pulse bg-muted' />
            <div className='space-y-2 p-2.5'>
              <div className='h-3.5 w-4/5 animate-pulse rounded bg-muted' />
              <div className='h-2.5 w-1/2 animate-pulse rounded bg-muted' />
              <div className='flex items-center justify-between pt-1'>
                <div className='h-3.5 w-14 animate-pulse rounded bg-muted' />
                <div className='h-8 w-8 animate-pulse rounded-md bg-muted' />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-14 text-center'>
        <div className='flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-muted/50'>
          <SearchX className='h-6 w-6 text-muted-foreground/70' />
        </div>
        <h3 className='mt-4 text-sm font-semibold text-foreground'>
          No products found
        </h3>
        <p className='mt-1 max-w-xs text-[13px] text-muted-foreground'>
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className={gridClasses}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onProductClick={onProductClick}
          cartQuantity={cartQtyByProductId[product.id] ?? 0}
        />
      ))}
    </div>
  );
}
