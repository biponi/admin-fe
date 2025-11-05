import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  User,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Copy,
} from "lucide-react";
import { CourierOrder } from "../../../services/courierApi";
import {
  getStatusBadgeClasses,
  formatDeliveryStatus,
  DeliveryStatus,
} from "../types";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";
import { Input } from "../../../components/ui/input";

interface CourierOrderCardProps {
  order: CourierOrder;
  onViewDetails?: () => void;
}

export const CourierOrderCard: React.FC<CourierOrderCardProps> = ({
  order,
  onViewDetails,
}) => {
  const statusClasses = getStatusBadgeClasses(
    order.deliveryStatus as DeliveryStatus
  );

  const handleCopyTracking = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <Card className='hover:shadow-lg transition-shadow duration-200 border-gray-200'>
      <CardContent className='p-4 space-y-3'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-2'>
            {order?.provider.includes("pathao") ? (
              <img
                className='rounded-lg shadow w-10'
                src='https://logosandtypes.com/wp-content/uploads/2025/04/Pathao.png'
                alt='pathao'
              />
            ) : (
              <img
                className='rounded-lg shadow w-10'
                src='https://play-lh.googleusercontent.com/9OYsIvc-iKHte4jqVe-c4sA0vNL-tljBDVPguou6B-qdxQgSKpj8pZ7ZYh6MYEbawbo=w240-h480-rw'
                alt='steadfast'
              />
            )}
            <div>
              <h3 className='font-semibold text-gray-900'>
                Order #{order.orderId}
              </h3>
              <p className='text-xs text-gray-500'>Invoice: {order.invoice}</p>
            </div>
          </div>
          <Badge
            className={`${statusClasses.bg} ${statusClasses.text} border-0`}>
            {formatDeliveryStatus(order.deliveryStatus as DeliveryStatus)}
          </Badge>
        </div>

        {/* Tracking Info */}
        <div className='space-y-2 bg-gray-50 p-3 rounded-lg'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-gray-600'>Consignment:</span>
            <div className='flex items-center gap-2'>
              <span className='font-medium text-gray-900'>
                {order.consignmentId}
              </span>
              <Button
                size='sm'
                variant='ghost'
                className='h-6 w-6 p-0'
                onClick={() =>
                  handleCopyTracking(order.consignmentId, "Consignment ID")
                }>
                <Copy className='w-3 h-3' />
              </Button>
            </div>
          </div>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-gray-600'>Tracking:</span>
            <div className='flex items-center gap-2'>
              <span className='font-medium text-gray-900'>
                {order.trackingCode}
              </span>
              <Button
                size='sm'
                variant='ghost'
                className='h-6 w-6 p-0'
                onClick={() =>
                  handleCopyTracking(order.trackingCode, "Tracking Code")
                }>
                <Copy className='w-3 h-3' />
              </Button>
            </div>
          </div>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-gray-600'>Tracking Link:</span>
            <div className='flex items-center gap-2'>
              <Input
                disabled
                type='text'
                className='w-full overflow-hidden border-gray-300 text-gray-950'
                value={
                  order?.provider.includes("pathao")
                    ? `https://merchant.pathao.com/tracking?consignment_id=${order?.consignmentId}&phone=${order?.recipientPhone}`
                    : `https://steadfast.com.bd/t/${order?.consignmentId}`
                }
                placeholder='courier'
              />
              <Button
                size='sm'
                variant='ghost'
                className='h-6 w-6 p-0'
                onClick={() =>
                  handleCopyTracking(
                    order?.provider.includes("pathao")
                      ? `https://merchant.pathao.com/tracking?consignment_id=${order?.consignmentId}&phone=${order?.recipientPhone}`
                      : `https://steadfast.com.bd/t/${order?.consignmentId}`,
                    "Tracking Link"
                  )
                }>
                <Copy className='w-3 h-3' />
              </Button>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className='space-y-2'>
          <div className='flex items-center gap-2 text-sm'>
            <User className='w-4 h-4 text-gray-400' />
            <span className='text-gray-900 font-medium'>
              {order.recipientName}
            </span>
          </div>
          <div className='flex items-center gap-2 text-sm'>
            <Phone className='w-4 h-4 text-gray-400' />
            <span className='text-gray-700'>{order.recipientPhone}</span>
          </div>
          <div className='flex items-center gap-2 text-sm'>
            <MapPin className='w-4 h-4 text-gray-400' />
            <span className='text-gray-700 line-clamp-1'>
              {order.recipientAddress}
            </span>
          </div>
        </div>

        {/* Amount Info */}
        <div className='flex items-center justify-between p-2 bg-green-50 rounded-lg'>
          <div className='flex items-center gap-2'>
            <DollarSign className='w-4 h-4 text-green-600' />
            <span className='text-sm text-gray-600'>COD Amount:</span>
          </div>
          <span className='text-lg font-bold text-green-600'>
            ৳{order.codAmount.toLocaleString()}
          </span>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between pt-2 border-t'>
          <div className='flex items-center gap-1 text-xs text-gray-500'>
            <Calendar className='w-3 h-3' />
            {dayjs(order.timestamps.createdAt).format("MMM D, YYYY")}
          </div>
          {onViewDetails && (
            <Button
              size='sm'
              variant='outline'
              onClick={onViewDetails}
              className='gap-2'>
              <ExternalLink className='w-3 h-3' />
              Details
            </Button>
          )}
        </div>

        {/* Note */}
        {order.note && (
          <div className='text-xs text-gray-600 bg-yellow-50 p-2 rounded border-l-2 border-yellow-400'>
            <span className='font-medium'>Note:</span> {order.note}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourierOrderCard;
