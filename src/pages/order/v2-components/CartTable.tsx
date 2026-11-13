import { Minus, Plus, Trash2, Package } from "lucide-react";
import PlaceHolderImage from "../../../assets/placeholder.svg";
import type { CartItem } from "../createOrderLayoutStore";
import { getVariationImageUrl } from "../../../utils/functions";

interface CartTableProps {
  cart: CartItem[];
  onUpdateQuantity: (cartItemId: string, quantity: number) => void;
  onRemove: (cartItemId: string) => void;
}

export function CartTable({
  cart,
  onUpdateQuantity,
  onRemove,
}: CartTableProps) {
  const getImageUrl = (item: CartItem): string => {
    // Try variation images → image groups
    if (item.selectedVariant) {
      const url = getVariationImageUrl(item.selectedVariant, item.imageGroups);
      if (url) return url;
    }

    return item.thumbnail || PlaceHolderImage;
  };

  if (cart.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-10 text-center'>
        <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted/50'>
          <Package className='h-5 w-5 text-muted-foreground/70' />
        </div>
        <h3 className='text-sm font-medium text-foreground'>
          Your cart is empty
        </h3>
        <p className='mt-1 text-xs text-muted-foreground/70'>
          Add products to get started
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-2.5'>
      {cart.map((item) => {
        const maxStock = item.selectedVariant
          ? item.variantStock || item.selectedVariant.quantity || 99
          : item.availableStock || item.quantity || 99;
        const stockRemaining = maxStock - item.quantity;

        return (
          <div
            key={item.cartItemId}
            className='rounded-lg border border-border bg-background p-3 transition-colors hover:border-border'>
            {/* TOP ROW: image + name/variation/unit price + delete */}
            <div className='flex items-start gap-3'>
              {/* Thumbnail */}
              <div className='h-[60px] w-[60px] shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted/50'>
                <img
                  src={getImageUrl(item)}
                  alt={item.name}
                  className='h-full w-full object-cover'
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PlaceHolderImage;
                  }}
                />
              </div>

              {/* Name + variation + unit price */}
              <div className='min-w-0 flex-1'>
                <p className='truncate text-[13px] font-medium text-foreground'>
                  {item.name}
                </p>

                {item.variation && (
                  <p className='mt-0.5 text-xs text-muted-foreground'>
                    {[
                      item.variation.color && `Color: ${item.variation.color}`,
                      item.variation.size && `Size: ${item.variation.size}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}

                <p className='mt-1 text-xs text-muted-foreground/70 tabular-nums'>
                  ৳{item.unitPrice.toFixed(2)} / piece
                </p>
              </div>

              {/* Delete */}
              <button
                onClick={() => onRemove(item.cartItemId)}
                className='flex-shrink-0 rounded-md p-1.5 text-muted-foreground/70 transition-colors hover:bg-rose-50 hover:text-rose-500'
                aria-label='Remove item'>
                <Trash2 className='h-4 w-4' />
              </button>
            </div>

            {/* BOTTOM ROW: quantity stepper + low stock + total */}
            <div className='mt-2.5 flex items-center justify-between border-t border-border/60 pt-2.5'>
              {/* Left: qty stepper + stock warning */}
              <div className='flex items-center gap-2.5'>
                <div className='flex items-center overflow-hidden rounded-md border border-border'>
                  <button
                    onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className='flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30'
                    aria-label='Decrease quantity'>
                    <Minus className='h-3 w-3' />
                  </button>
                  <span className='w-8 border-x border-border text-center text-xs font-medium leading-7 text-foreground tabular-nums'>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                    disabled={item.quantity >= maxStock}
                    className='flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30'
                    aria-label='Increase quantity'>
                    <Plus className='h-3 w-3' />
                  </button>
                </div>

                {stockRemaining > 0 && stockRemaining <= 5 && (
                  <span className='text-xs text-amber-600 font-medium'>
                    {stockRemaining} left
                  </span>
                )}
              </div>

              {/* Right: total */}
              <div className='text-right'>
                <p className='text-[10px] text-muted-foreground/70'>Total</p>
                <p className='text-sm font-semibold text-foreground tabular-nums'>
                  ৳{item.totalPrice.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
