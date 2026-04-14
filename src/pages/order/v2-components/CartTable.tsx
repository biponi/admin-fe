import { Minus, Plus, Trash2, Package } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import PlaceHolderImage from '../../../assets/placeholder.svg';
import type { CartItem } from '../createOrderLayoutStore';

interface CartTableProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function CartTable({ cart, onUpdateQuantity, onRemove }: CartTableProps) {
  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-4 shadow-inner">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
        <p className="text-sm text-muted-foreground">
          Add products to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cart.map((item) => {
        // Calculate max stock for this item
        const maxStock = item.selectedVariant
          ? (item.variantStock || item.selectedVariant.quantity || 99)
          : (item.availableStock || item.quantity || 99);

        const stockRemaining = maxStock - item.quantity;

        return (
          <div
            key={item.id}
            className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all bg-white group"
          >
            {/* Product Thumbnail */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden shadow-sm">
              <img
                src={item.thumbnail || PlaceHolderImage}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PlaceHolderImage;
                }}
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-xs sm:text-sm line-clamp-1 text-gray-900">{item.name}</h4>
              {item.variation && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.variation.color && <span>Color: {item.variation.color}</span>}
                  {item.variation.color && item.variation.size && <span> • </span>}
                  {item.variation.size && <span>Size: {item.variation.size}</span>}
                </p>
              )}
              <p className="text-xs sm:text-sm font-bold text-green-600 mt-0.5 sm:mt-1">
                ৳{item.unitPrice.toFixed(2)}
              </p>
              {stockRemaining <= 5 && stockRemaining > 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  Only {stockRemaining} left in stock!
                </p>
              )}
            </div>

            {/* Quantity Controls */}
            <div className="flex flex-col items-center gap-1 sm:gap-2 shrink-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 border-gray-200 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>

                <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-semibold text-gray-900">{item.quantity}</span>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8 border-gray-200 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= maxStock}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {stockRemaining > 0 && stockRemaining <= 10 && (
                <span className="text-xs text-gray-500 hidden sm:block">
                  {stockRemaining} left
                </span>
              )}
            </div>

            {/* Total Price */}
            <div className="w-16 sm:w-24 text-right shrink-0">
              <p className="text-xs sm:text-sm font-bold text-gray-900">
                ৳{item.totalPrice.toFixed(2)}
              </p>
            </div>

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all shrink-0"
              onClick={() => onRemove(item.id)}
            >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
