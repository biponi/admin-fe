import { DollarSign, Wallet, Receipt } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import type { ITransection } from "../../order/interface.d";

interface OrderSummaryProps {
  transaction: Partial<ITransection>;
  notes: string;
  onTransactionChange: (transaction: Partial<ITransection>) => void;
  onNotesChange: (notes: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  cartItemCount: number;
  cartSubtotal: number;
}

export function OrderSummary({
  transaction,
  notes,
  onTransactionChange,
  onNotesChange,
  onSubmit,
  isSubmitting = false,
  cartItemCount,
  cartSubtotal,
}: OrderSummaryProps) {
  // Use the actual cart subtotal instead of reverse-calculating from totalPrice
  const subtotal = cartSubtotal;

  return (
    <div className='space-y-4'>
      <Card className='shadow-sm border-gray-200'>
        <CardContent className='p-4 space-y-4'>
          {/* Discount */}
          <div className='space-y-2'>
            <Label
              htmlFor='discount'
              className='text-xs flex items-center gap-2 font-semibold text-gray-700'>
              <DollarSign className='h-3.5 w-3.5 text-green-600' />
              Discount
            </Label>
            <Input
              id='discount'
              type='number'
              min='0'
              step='0.01'
              placeholder='0.00'
              value={
                (transaction.discount ?? 0) > 0 ? transaction.discount : ""
              }
              onChange={(e) =>
                onTransactionChange({
                  ...transaction,
                  discount: parseFloat(e.target.value) || 0,
                })
              }
              className='w-full h-10 border-gray-200 focus:border-green-400 focus-visible:ring-2 focus-visible:ring-green-400/20'
            />
          </div>

          {/* Delivery Charge */}
          <div className='space-y-2'>
            <Label
              htmlFor='delivery'
              className='text-xs flex items-center gap-2 font-semibold text-gray-700'>
              <Receipt className='h-3.5 w-3.5 text-blue-600' />
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
                  ...transaction,
                  deliveryCharge: parseFloat(e.target.value) || 0,
                })
              }
              className='w-full h-10 border-gray-200 focus:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-400/20'
            />
          </div>

          {/* Paid Amount */}
          <div className='space-y-2'>
            <Label
              htmlFor='paid'
              className='text-xs flex items-center gap-2 font-semibold text-gray-700'>
              <Wallet className='h-3.5 w-3.5 text-purple-600' />
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
                  ...transaction,
                  paid: parseFloat(e.target.value) || 0,
                })
              }
              className='w-full h-10 border-gray-200 focus:border-purple-400 focus-visible:ring-2 focus-visible:ring-purple-400/20'
            />
          </div>
        </CardContent>
      </Card>

      {/* Price Breakdown - Premium Gradient Card */}
      <Card className='bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 border-0 shadow-lg'>
        <CardContent className='p-5 space-y-3 text-white'>
          <div className='flex justify-between text-sm'>
            <span className='text-white/80'>Subtotal</span>
            <span className='font-medium'>৳{subtotal.toFixed(2)}</span>
          </div>

          <div className='flex justify-between text-sm'>
            <span className='text-white/80'>Discount</span>
            <span className='font-medium text-green-300'>
              -৳{(transaction.discount ?? 0).toFixed(2)}
            </span>
          </div>

          <div className='flex justify-between text-sm'>
            <span className='text-white/80'>Delivery</span>
            <span className='font-medium'>
              ৳{(transaction.deliveryCharge || 0).toFixed(2)}
            </span>
          </div>

          <div className='border-t border-white/20 pt-3 mt-3'>
            <div className='flex justify-between text-lg font-bold'>
              <span>Total</span>
              <span className='text-white'>
                ৳{(transaction.totalPrice || 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div className='flex justify-between text-sm border-t border-white/20 pt-3'>
            <span className='text-white/80'>Paid</span>
            <span className='font-medium text-green-300'>
              ৳{(transaction.paid ?? 0).toFixed(2)}
            </span>
          </div>

          {transaction.remaining !== undefined && transaction.remaining > 0 && (
            <div className='flex justify-between text-sm'>
              <span className='text-white/80'>Remaining</span>
              <span className='font-medium text-orange-300'>
                ৳{transaction.remaining.toFixed(2)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <div className='space-y-2'>
        <Label htmlFor='notes' className='text-xs font-semibold text-gray-700'>
          Order Notes (Optional)
        </Label>
        <Input
          id='notes'
          type='text'
          placeholder='Add any special instructions...'
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className='w-full h-10 border-gray-200 focus:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-400/20'
        />
      </div>

      {/* Submit Button - Premium Gradient */}
      <Button
        onClick={onSubmit}
        disabled={isSubmitting || cartItemCount === 0}
        className={`w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg ${
          isSubmitting ? "animate-pulse" : ""
        }`}
        size='lg'>
        {isSubmitting ? (
          <>Creating Order...</>
        ) : (
          <>Create Order • ৳{(transaction.totalPrice || 0).toFixed(2)}</>
        )}
      </Button>
    </div>
  );
}
