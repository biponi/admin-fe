import { ShoppingCart } from "lucide-react";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Separator } from "../../../components/ui/separator";
import { CartTable } from "./CartTable";
import { CustomerSelector } from "./CustomerSelector";
import { ShippingForm } from "./ShippingForm";
import { OrderSummary } from "./OrderSummary";
import type { CartItem } from "../createOrderLayoutStore";
import type {
  ICustomer,
  IShipping,
  ITransection,
} from "../../order/interface.d";

interface CartPanelProps {
  cart: CartItem[];
  customerInfo: Partial<ICustomer>;
  shippingInfo: Partial<IShipping>;
  transaction: Partial<ITransection>;
  notes: string;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCustomerChange: (customer: Partial<ICustomer>) => void;
  onShippingChange: (shipping: Partial<IShipping>) => void;
  onTransactionChange: (transaction: Partial<ITransection>) => void;
  onNotesChange: (notes: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function CartPanel({
  cart,
  customerInfo,
  shippingInfo,
  transaction,
  notes,
  onUpdateQuantity,
  onRemove,
  onCustomerChange,
  onShippingChange,
  onTransactionChange,
  onNotesChange,
  onSubmit,
  isSubmitting = false,
}: CartPanelProps) {
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className='flex flex-col h-full bg-white border-l shadow-[-4px_0_24px_rgba(0,0,0,0.05)] pt-2 md:mr-4 rounded-md'>
      {/* Premium Header */}
      <div className='p-5 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md shadow mx-2'>
        <div className='flex items-center gap-3'>
          <div className='h-10 w-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm'>
            <ShoppingCart className='h-5 w-5' />
          </div>
          <div>
            <h2 className='font-semibold text-lg'>Cart & Checkout</h2>
            <p className='text-xs text-white/80 mt-0.5'>
              {cartItemCount} {cartItemCount === 1 ? "item" : "items"} in cart
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className='flex-1 py-5 px-2'>
        <div className='space-y-6'>
          {/* Cart Items */}
          <div className='space-y-3'>
            <h3 className='font-semibold text-base flex items-center gap-2'>
              <ShoppingCart className='h-4 w-4 text-blue-600' />
              Cart Items
            </h3>
            <CartTable
              cart={cart}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
            />
          </div>

          <Separator className='bg-gradient-to-r from-transparent via-gray-200 to-transparent' />

          {/* Customer Information */}
          <CustomerSelector
            customer={customerInfo}
            onChange={onCustomerChange}
            onShippingChange={onShippingChange}
          />

          <Separator className='bg-gradient-to-r from-transparent via-gray-200 to-transparent' />

          {/* Shipping Information */}
          <ShippingForm shipping={shippingInfo} onChange={onShippingChange} />

          <Separator className='bg-gradient-to-r from-transparent via-gray-200 to-transparent' />

          {/* Order Summary */}
          <OrderSummary
            transaction={transaction}
            notes={notes}
            onTransactionChange={onTransactionChange}
            onNotesChange={onNotesChange}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            cartItemCount={cartItemCount}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
