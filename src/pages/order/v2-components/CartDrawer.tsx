import { ShoppingCart, X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../../../components/ui/drawer";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
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

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  customerInfo: Partial<ICustomer>;
  shippingInfo: Partial<IShipping>;
  transaction: Partial<ITransection>;
  notes: string;
  onUpdateQuantity: (cartItemId: string, quantity: number) => void;
  onRemove: (cartItemId: string) => void;
  onCustomerChange: (customer: Partial<ICustomer>) => void;
  onShippingChange: (shipping: Partial<IShipping>) => void;
  onTransactionChange: (transaction: Partial<ITransection>) => void;
  onNotesChange: (notes: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function CartDrawer({
  open,
  onOpenChange,
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
}: CartDrawerProps) {
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className='h-[92vh] max-h-[900px] rounded-t-2xl'>
        {/* Premium Header with White Background */}
        <DrawerHeader className='px-4 py-4 border-b bg-white'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center'>
                <ShoppingCart className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <DrawerTitle className='text-lg font-semibold text-gray-900'>
                  Cart & Checkout
                </DrawerTitle>
                <p className='text-xs text-gray-600'>
                  {cartItemCount} {cartItemCount === 1 ? "item" : "items"} in
                  cart
                </p>
              </div>
            </div>
            <DrawerClose asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-9 w-9 text-gray-600 hover:bg-gray-100'>
                <X className='h-5 w-5' />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <ScrollArea className='flex-1 px-3 sm:px-4 overflow-x-hidden'>
          <div className='py-5 space-y-5 px-1'>
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

            {/* Customer & Shipping Information - Stacked for Mobile */}
            <div className='space-y-5'>
              {/* Customer Information */}
              <CustomerSelector
                customer={customerInfo}
                onChange={onCustomerChange}
                onShippingChange={onShippingChange}
              />

              {/* Shipping Information */}
              <ShippingForm
                shipping={shippingInfo}
                onChange={onShippingChange}
                onDeliveryChargeChange={(charge) => {
                  onTransactionChange({
                    ...transaction,
                    deliveryCharge: charge,
                  });
                }}
              />
            </div>

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
              cartSubtotal={cartSubtotal}
            />
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}

// Mobile Cart Trigger Button
interface CartTriggerButtonProps {
  itemCount: number;
  onClick: () => void;
}

export function CartTriggerButton({
  itemCount,
  onClick,
}: CartTriggerButtonProps) {
  return (
    <Button
      onClick={onClick}
      size='lg'
      className='fixed bottom-20 sm:bottom-24 right-4 z-40 h-14 px-6 rounded-full shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl'>
      <ShoppingCart className='h-8 w-8' />
      {itemCount > 0 && (
        <Badge className='ml-2 bg-white text-blue-600 hover:bg-white shadow-md animate-pulse'>
          {itemCount}
        </Badge>
      )}
    </Button>
  );
}
