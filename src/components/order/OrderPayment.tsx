import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { DollarSign, CreditCard } from 'lucide-react';
import { IOrder } from '../../pages/order/interface';
import { format } from 'date-fns';

interface OrderPaymentProps {
  order: IOrder;
}

export const OrderPayment = ({ order }: OrderPaymentProps) => {
  return (
    <div className="space-y-6">
      {/* Pricing Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <DollarSign className="mr-2 h-5 w-5" />
            Pricing Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">৳{order.totalPrice.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span className="font-medium">-৳{order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Charge</span>
              <span className="font-medium">৳{order.deliveryCharge.toLocaleString()}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold">
                  ৳{(order.totalPrice + order.deliveryCharge).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <CreditCard className="mr-2 h-5 w-5" />
            Payment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-lg font-semibold">
                ৳{(order.totalPrice + order.deliveryCharge).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Paid Amount</p>
              <p className="text-lg font-semibold text-green-600">
                ৳{order.paid.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Remaining Amount</p>
              {order.remaining > 0 ? (
                <p className="text-lg font-semibold text-red-600">
                  ৳{order.remaining.toLocaleString()}
                </p>
              ) : (
                <Badge variant="default" className="text-sm">
                  Fully Paid
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History - Conditional */}
      {order.payment && order.payment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Paid By</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Transaction ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.payment.map((payment, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {payment.date
                        ? format(new Date(payment.date), 'MMM dd, yyyy HH:mm')
                        : '-'}
                    </TableCell>
                    <TableCell className="capitalize">{payment.paymentType}</TableCell>
                    <TableCell>{payment.paymentBy}</TableCell>
                    <TableCell>৳{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{payment.transectionId || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
