import { ShoppingCart, CheckCircle2 } from "lucide-react";
import { useCallback, useRef, useEffect } from "react";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { CartTable } from "./CartTable";
import { CustomerSelector } from "./CustomerSelector";
import { ShippingForm } from "./ShippingForm";
import { OrderAdjustments, CheckoutBar } from "./OrderSummary";
import {
  useCreateOrderLayoutStore,
  type CartItem,
} from "../createOrderLayoutStore";
import { evaluatePrepaymentRules } from "../../../api/prepaymentRule";
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

/** Micro section label in the Claude style, with a done-check when filled. */
function SectionLabel({
  label,
  done,
}: {
  label: string;
  done?: boolean;
}) {
  return (
    <div className='flex items-center gap-1.5'>
      <span className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70'>
        {label}
      </span>
      {done && <CheckCircle2 className='h-3 w-3 text-emerald-600' />}
    </div>
  );
}

export function CartPanel({
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
}: CartPanelProps) {
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const customerDone = Boolean(customerInfo.name && customerInfo.phoneNumber);
  const shippingDone = Boolean(
    shippingInfo.division && shippingInfo.district && shippingInfo.address,
  );

  // Store in ref — updating a ref never triggers a re-render, so
  // handleDeliveryChargeChange stays the same reference forever.
  // This breaks the loop:
  //   old: transaction dep changes → useCallback recreates fn → ShippingForm
  //        useEffect sees new ref → calls fn → store updates → loop
  //   new: ref updates silently, fn reference is stable → no loop
  const onTransactionChangeRef = useRef(onTransactionChange);
  useEffect(() => {
    onTransactionChangeRef.current = onTransactionChange;
  });

  // FIX: no deps array entries that change on every render.
  // FIX: send only { deliveryCharge } — store merges internally,
  //      spreading `transaction` here caused a new object every call.
  const handleDeliveryChargeChange = useCallback((charge: number) => {
    onTransactionChangeRef.current({ deliveryCharge: charge });
  }, []); // ← zero deps, completely stable reference

  // Prepayment rules suggestion (advisory): evaluate when cart + address are
  // known. The paid field is NOT prefilled — a warning plus a submit-time
  // confirmation modal handle skipped advances instead.
  useEffect(() => {
    const district = shippingInfo?.district;
    const division = shippingInfo?.division;
    if (!district || !division || cart.length === 0) {
      if (cart.length === 0) {
        useCreateOrderLayoutStore.getState().setPrepaymentSuggestion(null);
      }
      return;
    }

    let cancelled = false;
    (async () => {
      const result = await evaluatePrepaymentRules({
        shipping: { district, division },
        orderItems: cart.map((item) => ({
          productId: item.productId || item.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        deliveryCharge: null,
        // needed when a rule matches on fraud risk levels
        customerPhone: customerInfo?.phoneNumber,
      });
      if (cancelled) return;
      const store = useCreateOrderLayoutStore.getState();
      store.setPrepaymentSuggestion(result.success ? result.data ?? null : null);
    })();
    return () => {
      cancelled = true;
    };
  }, [shippingInfo.district, shippingInfo.division, customerInfo?.phoneNumber, cart]);

  return (
    <div className='flex flex-col h-full bg-background'>
      {/* Header */}
      <header className='shrink-0 px-5 py-4 border-b border-border'>
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary'>
            <ShoppingCart className='h-4 w-4 text-primary-foreground' />
          </div>
          <div className='min-w-0'>
            <h2 className='text-sm font-semibold leading-tight text-foreground'>
              Cart &amp; Checkout
            </h2>
            <p className='mt-0.5 truncate text-xs text-muted-foreground'>
              {cartItemCount} {cartItemCount === 1 ? "item" : "items"} · ৳
              {cartSubtotal.toFixed(2)}
            </p>
          </div>
        </div>
      </header>

      {/* Scrollable content — one ScrollArea, footer is a sibling below */}
      <ScrollArea className='flex-1 min-h-0'>
        <div className='px-5 py-4 space-y-5'>
          <section className='space-y-2.5'>
            <SectionLabel label='Items' />
            <CartTable
              cart={cart}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
            />
          </section>

          <section className='space-y-2.5'>
            <SectionLabel label='Customer' done={customerDone} />
            <CustomerSelector
              customer={customerInfo}
              onChange={onCustomerChange}
              onShippingChange={onShippingChange}
              validationErrors={validationErrors}
            />
          </section>

          <section className='space-y-2.5'>
            <SectionLabel label='Shipping' done={shippingDone} />
            <ShippingForm
              shipping={shippingInfo}
              onChange={onShippingChange}
              onDeliveryChargeChange={handleDeliveryChargeChange}
              validationErrors={validationErrors}
            />
          </section>

          <section className='space-y-2.5'>
            <SectionLabel label='Payment & Notes' />
            <OrderAdjustments
              transaction={transaction}
              notes={notes}
              onTransactionChange={onTransactionChange}
              onNotesChange={onNotesChange}
            />
          </section>
        </div>
      </ScrollArea>

      {/* Sticky checkout footer — totals + submit always visible */}
      <footer className='shrink-0 border-t border-border bg-background px-5 py-4'>
        <CheckoutBar
          transaction={transaction}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          cartItemCount={cartItemCount}
          cartSubtotal={cartSubtotal}
        />
      </footer>
    </div>
  );
}
