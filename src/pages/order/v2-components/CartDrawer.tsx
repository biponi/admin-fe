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
import { CartTable } from "./CartTable";
import { CustomerSelector } from "./CustomerSelector";
import { ShippingForm } from "./ShippingForm";
import { OrderAdjustments, CheckoutBar } from "./OrderSummary";
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
  validationErrors?: Record<string, string[]>;
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
  validationErrors,
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
    // FIX 1: modal={false} prevents the Drawer from trapping focus and
    // intercepting outside-clicks from Radix popovers (CustomerSelector
    // dropdown). Without this, closing the popover causes the Drawer body
    // to remeasure with height:0 on mobile → white screen.
    <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
      {/* FIX 2: Added `flex flex-col` so DrawerHeader + ScrollArea form a
          proper flex column. Without this, ScrollArea has no bounded height
          and collapses after any child interaction. */}
      <DrawerContent className='h-[92vh] max-h-[900px] rounded-t-2xl flex flex-col'>
        {/* Header — fixed height, does not grow */}
        <DrawerHeader className='px-4 py-3.5 border-b border-border bg-background flex-shrink-0'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary'>
                <ShoppingCart className='h-4 w-4 text-primary-foreground' />
              </div>
              <div>
                <DrawerTitle className='text-sm font-semibold text-foreground leading-tight'>
                  Cart &amp; Checkout
                </DrawerTitle>
                <p className='mt-0.5 text-xs text-muted-foreground'>
                  {cartItemCount} {cartItemCount === 1 ? "item" : "items"} · ৳
                  {cartSubtotal.toFixed(2)}
                </p>
              </div>
            </div>
            <DrawerClose asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground'>
                <X className='h-4 w-4' />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* FIX 3: `flex-1 min-h-0` is the critical pair.
            - flex-1  → takes all remaining space after the header
            - min-h-0 → overrides the default min-height:auto on flex children,
              which otherwise prevents the ScrollArea from shrinking and causes
              the container to overflow invisibly (white screen, no scroll). */}
        <ScrollArea className='flex-1 min-h-0 px-3 sm:px-4 overflow-x-hidden'>
          <div className='py-4 space-y-5 px-1'>
            <CartTable
              cart={cart}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
            />

            {/* Customer & Shipping Information */}
            <div className='space-y-5'>
              {/* FIX 4: Wrap CustomerSelector in a relative-positioned
                  container so its Popover/Command portal stays anchored
                  correctly when rendered inside a ScrollArea on mobile. */}
              <div className='relative'>
                <CustomerSelector
                  customer={customerInfo}
                  onChange={onCustomerChange}
                  onShippingChange={onShippingChange}
                  validationErrors={validationErrors}
                />
              </div>

              <ShippingForm
                shipping={shippingInfo}
                onChange={onShippingChange}
                // FIX: send only { deliveryCharge } — the store merges
                // internally; spreading `transaction` here caused a loop
                // (same fix as CartPanel's stable-callback pattern).
                onDeliveryChargeChange={(charge) => {
                  onTransactionChange({ deliveryCharge: charge });
                }}
                validationErrors={validationErrors}
              />
            </div>

            <OrderAdjustments
              transaction={transaction}
              notes={notes}
              onTransactionChange={onTransactionChange}
              onNotesChange={onNotesChange}
            />
          </div>
        </ScrollArea>

        {/* Checkout footer — outside the ScrollArea so totals + submit
            stay reachable without scrolling. */}
        <div className='flex-shrink-0 border-t border-border bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]'>
          <CheckoutBar
            transaction={transaction}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            cartItemCount={cartItemCount}
            cartSubtotal={cartSubtotal}
          />
        </div>
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
      className='fixed bottom-20 sm:bottom-24 right-4 z-40 h-14 px-6 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-xl'>
      <ShoppingCart className='h-5 w-5' />
      {itemCount > 0 && (
        <Badge className='ml-2 bg-background text-primary hover:bg-background shadow-sm'>
          {itemCount}
        </Badge>
      )}
    </Button>
  );
}
