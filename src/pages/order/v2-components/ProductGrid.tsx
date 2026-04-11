import { Loader2 } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { IProduct } from "../../product/interface";

interface ProductGridProps {
  products: IProduct[];
  onAddToCart: (product: IProduct) => void;
  onProductClick: (product: IProduct) => void;
  isLoading?: boolean;
}

export function ProductGrid({
  products,
  onAddToCart,
  onProductClick,
  isLoading = false,
}: ProductGridProps) {
  // Responsive grid:
  // Mobile: 2 columns (forced)
  // sm: 2 columns
  // md: 3 columns
  // lg: 2 columns (for product section)
  // xl: 3 columns
  // 2xl: 4 columns
  // 3xl: 5 columns
  const gridClasses = `
    grid grid-cols-2 gap-3 sm:gap-4
    sm:grid-cols-2
    xl:grid-cols-3
  `;

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
          <p className='text-3xl'>📦</p>
        </div>
        <h3 className='text-lg font-semibold mb-2'>No products found</h3>
        <p className='text-sm text-muted-foreground max-w-xs'>
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
        />
      ))}
    </div>
  );
}
