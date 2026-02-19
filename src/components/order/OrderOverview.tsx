import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { User, MapPin, Truck, FileText } from 'lucide-react';
import { IOrder } from '../../pages/order/interface';

interface OrderOverviewProps {
  order: IOrder;
}

export const OrderOverview = ({ order }: OrderOverviewProps) => {
  return (
    <div className="space-y-6">
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <User className="mr-2 h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{order.customer.name}</p>
              {order.customer.email && (
                <p className="text-sm text-gray-500">{order.customer.email}</p>
              )}
            </div>
          </div>
          <Separator className="my-3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{order.customer.phoneNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created By</p>
              <p className="font-medium">{order.orderCreatedBy}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <MapPin className="mr-2 h-5 w-5" />
            Shipping Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Division</p>
              <p className="font-medium">{order.shipping.division}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">District</p>
              <p className="font-medium">{order.shipping.district}</p>
            </div>
            <div className="md:col-span-1">
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium">{order.shipping.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courier Information - Conditional */}
      {order.courier && Object.keys(order.courier).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Truck className="mr-2 h-5 w-5" />
              Courier Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Provider</p>
                <p className="font-medium capitalize">{order.courier.provider}</p>
              </div>
              {order.courier.consignmentId && (
                <div>
                  <p className="text-sm text-gray-600">Consignment ID</p>
                  <p className="font-medium">{order.courier.consignmentId}</p>
                </div>
              )}
              {order.courier.trackingCode && (
                <div>
                  <p className="text-sm text-gray-600">Tracking Code</p>
                  <p className="font-medium">{order.courier.trackingCode}</p>
                </div>
              )}
              {order.estimatedDeliveryDate && (
                <div>
                  <p className="text-sm text-gray-600">Est. Delivery Date</p>
                  <p className="font-medium">
                    {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Notes - Conditional */}
      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FileText className="mr-2 h-5 w-5" />
              Order Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
