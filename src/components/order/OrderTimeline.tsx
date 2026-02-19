import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Clock, CheckCircle, XCircle, AlertCircle, Package, Truck } from 'lucide-react';
import { IOrder } from '../../pages/order/interface';
import { format } from 'date-fns';

interface OrderTimelineProps {
  order: IOrder;
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'confirmed':
      return <CheckCircle className="h-4 w-4" />;
    case 'processing':
      return <Package className="h-4 w-4" />;
    case 'shipped':
      return <Truck className="h-4 w-4" />;
    case 'delivered':
      return <CheckCircle className="h-4 w-4" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4" />;
    case 'returned':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'secondary';
    case 'confirmed':
      return 'default';
    case 'processing':
      return 'outline';
    case 'shipped':
      return 'default';
    case 'delivered':
      return 'default';
    case 'cancelled':
      return 'destructive';
    case 'returned':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export const OrderTimeline = ({ order }: OrderTimelineProps) => {
  return (
    <div className="space-y-6">
      {/* Order Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="rounded-full p-2 bg-blue-100">
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Order Created</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(order.timestamps.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="rounded-full p-2 bg-gray-100">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Last Updated</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(order.timestamps.updatedAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
            {order.courier && Object.keys(order.courier).length > 0 && (
              <div className="flex items-start space-x-3">
                <div className="rounded-full p-2 bg-purple-100">
                  <Truck className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Courier Assigned</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {order.courier.provider}
                  </p>
                  {order.courier.createdAt && (
                    <p className="text-xs text-gray-500">
                      {format(new Date(order.courier.createdAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  )}
                </div>
              </div>
            )}
            {order.isReturn && (
              <div className="flex items-start space-x-3">
                <div className="rounded-full p-2 bg-red-100">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-red-600">Order Returned</p>
                  {order.returnedAt && (
                    <p className="text-xs text-gray-500">
                      {format(new Date(order.returnedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Tracking - Conditional */}
      {order.deliveryTimeline && order.deliveryTimeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Delivery Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.deliveryTimeline.map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-4 pb-4 border-b last:border-0"
                >
                  <div
                    className={`rounded-full p-2 ${
                      event.status === 'delivered' ? 'bg-green-100' : 'bg-blue-100'
                    }`}
                  >
                    <Truck className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{event.status}</p>
                    {event.remarks && (
                      <p className="text-sm text-gray-500">{event.remarks}</p>
                    )}
                    {event.timestamp && (
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm')}
                      </p>
                    )}
                  </div>
                  {event.location && <Badge variant="outline">{event.location}</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
