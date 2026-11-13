import { useState } from "react";
import { DollarSign, Wallet, Receipt } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import type { ITransection } from "../../order/interface.d";
import { useCreateOrderLayoutStore } from "../createOrderLayoutStore";
import PrepaymentWarningModal from "../components/PrepaymentWarningModal";

interface OrderAdjustmentsProps {
  transaction: Partial<ITransection>;
  notes: string;
  onTransactionChange: (transaction: Partial<ITransection>) => void;
  onNotesChange: (notes: string) => void;
}

/**
 * Discount / delivery / paid inputs + notes — the scrollable part of
 * checkout. Pairs with `CheckoutBar`, which owns the totals + submit.
 */
export function OrderAdjustments({
  transaction,
  notes,
  onTransactionChange,
  onNotesChange,
}: OrderAdjustmentsProps) {
  return (
    <div className='rounded-xl border border-border bg-background overflow-hidden'>
      {/* Section header */}
      <div className='flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-muted/50'>
        <span className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70'>
          Payment & Notes
        </span>
      </div>

      <div className='p-4 space-y-4'>
        {/* Discount */}
        <div className='space-y-1.5'>
          <Label
            htmlFor='discount'
            className='text-xs flex items-center gap-1.5 font-medium text-foreground'>
            <DollarSign className='h-3.5 w-3.5 text-muted-foreground/70' />
            Discount
          </Label>
          <Input
            id='discount'
            type='number'
            min='0'
            step='0.01'
            placeholder='0.00'
            value={(transaction.discount ?? 0) > 0 ? transaction.discount : ""}
            onChange={(e) =>
              onTransactionChange({
                discount: parseFloat(e.target.value) || 0,
              })
            }
            className='w-full h-9 border-border focus-visible:ring-ring'
          />
        </div>

        {/* Delivery Charge */}
        <div className='space-y-1.5'>
          <Label
            htmlFor='delivery'
            className='text-xs flex items-center gap-1.5 font-medium text-foreground'>
            <Receipt className='h-3.5 w-3.5 text-muted-foreground/70' />
            Delivery Charge
          </Label>
          <Input
            id='delivery'
            type='number'
            min='0'
            step='0.01'
            placeholder='0.00'
            value={transaction.deliveryCharge || 0}
            onChange={(e) =>
              onTransactionChange({
                deliveryCharge: parseFloat(e.target.value) || 0,
              })
            }
            className='w-full h-9 border-border focus-visible:ring-ring'
          />
        </div>

        {/* Paid Amount */}
        <div className='space-y-1.5'>
          <Label
            htmlFor='paid'
            className='text-xs flex items-center gap-1.5 font-medium text-foreground'>
            <Wallet className='h-3.5 w-3.5 text-muted-foreground/70' />
            Paid Amount
          </Label>
          <Input
            id='paid'
            type='number'
            min='0'
            step='0.01'
            placeholder='0.00'
            value={(transaction.paid ?? 0) > 0 ? transaction.paid : ""}
            onChange={(e) =>
              onTransactionChange({
                paid: parseFloat(e.target.value) || 0,
              })
            }
            className='w-full h-9 border-border focus-visible:ring-ring'
          />
        </div>

        {/* Notes */}
        <div className='space-y-1.5'>
          <Label
            htmlFor='notes'
            className='text-xs font-medium text-foreground'>
            Order Notes (Optional)
          </Label>
          <Input
            id='notes'
            type='text'
            placeholder='Add any special instructions...'
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className='w-full h-9 border-border focus-visible:ring-ring'
          />
        </div>
      </div>
    </div>
  );
}

interface CheckoutBarProps {
  transaction: Partial<ITransection>;
  onSubmit: () => void;
  isSubmitting?: boolean;
  cartItemCount: number;
  cartSubtotal: number;
}

/**
 * Sticky checkout footer — totals breakdown + submit button. Owns the
 * prepayment gate: a required advance that isn't collected opens the
 * typed-"yes" confirmation modal instead of creating the order outright.
 */
export function CheckoutBar({
  transaction,
  onSubmit,
  isSubmitting = false,
  cartItemCount,
  cartSubtotal,
}: CheckoutBarProps) {
  // Use the actual cart subtotal instead of reverse-calculating from totalPrice
  const subtotal = cartSubtotal;
  const prepaymentSuggestion = useCreateOrderLayoutStore(
    (state) => state.prepaymentSuggestion,
  );

  const [skipAdvanceOpen, setSkipAdvanceOpen] = useState(false);
  const requiredAdvance = prepaymentSuggestion?.required
    ? prepaymentSuggestion.amount
    : 0;
  const advanceMissing =
    requiredAdvance > 0 && (transaction.paid ?? 0) < requiredAdvance;

  const handleSubmitClick = () => {
    if (advanceMissing) {
      setSkipAdvanceOpen(true);
      return;
    }
    onSubmit();
  };

  const grandTotal =
    (transaction.totalPrice || 0) +
    (transaction.deliveryCharge || 0) -
    (transaction.discount || 0);

  return (
    <div className='space-y-3'>
      {/* Prepayment notice (also shown in OrderAdjustments context) */}
      {prepaymentSuggestion?.required && prepaymentSuggestion.appliedRule && (
        <p className='text-[11px] leading-snug text-amber-700 bg-amber-50/60 border border-amber-200 rounded-md px-2.5 py-1.5'>
          Prepayment rule “{prepaymentSuggestion.appliedRule.name}” requires an
          advance of ৳{prepaymentSuggestion.amount}
          {advanceMissing &&
            ` — paid amount is ৳${(transaction.paid ?? 0).toFixed(2)}. Creating the order will ask for confirmation.`}
        </p>
      )}

      {/* Totals breakdown */}
      <div className='space-y-1.5 text-xs'>
        <div className='flex justify-between text-muted-foreground'>
          <span>
            Subtotal{" "}
            <span className='text-muted-foreground/70'>({cartItemCount} items)</span>
          </span>
          <span className='tabular-nums'>৳{subtotal.toFixed(2)}</span>
        </div>

        <div className='flex justify-between text-muted-foreground'>
          <span>Discount</span>
          <span className='tabular-nums text-emerald-600'>
            −৳{(transaction.discount ?? 0).toFixed(2)}
          </span>
        </div>

        <div className='flex justify-between text-muted-foreground'>
          <span>Delivery</span>
          <span className='tabular-nums'>৳{(transaction.deliveryCharge || 0).toFixed(2)}</span>
        </div>

        <div className='flex justify-between pt-1.5 border-t border-border'>
          <span className='text-sm font-semibold text-foreground'>Total</span>
          <span className='text-base font-semibold tabular-nums text-foreground'>
            ৳{grandTotal.toFixed(2)}
          </span>
        </div>

        <div className='flex justify-between text-muted-foreground'>
          <span>Paid</span>
          <span className='tabular-nums text-emerald-600'>
            ৳{(transaction.paid ?? 0).toFixed(2)}
          </span>
        </div>

        {transaction.remaining !== undefined && transaction.remaining > 0 && (
          <div className='flex justify-between text-muted-foreground'>
            <span>Remaining</span>
            <span className='tabular-nums text-amber-600 font-medium'>
              ৳{transaction.remaining.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmitClick}
        disabled={isSubmitting || cartItemCount === 0}
        className='w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'>
        {isSubmitting ? (
          <>Creating Order…</>
        ) : (
          <>Create Order • ৳{grandTotal.toFixed(2)}</>
        )}
      </Button>

      <PrepaymentWarningModal
        open={skipAdvanceOpen}
        onOpenChange={setSkipAdvanceOpen}
        ruleName={prepaymentSuggestion?.appliedRule?.name}
        amount={requiredAdvance}
        paid={transaction.paid ?? 0}
        isBusy={isSubmitting}
        onConfirm={() => {
          setSkipAdvanceOpen(false);
          onSubmit();
        }}
      />
    </div>
  );
}
