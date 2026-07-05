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
import {
  getProviderConfig,
  getTrackingUrl,
} from "../../../config/courierProviders";

const ProviderLogo: React.FC<{ provider: string }> = ({ provider }) => {
  const cfg = getProviderConfig(provider);
  if (cfg.image) {
    return (
      <img className='rounded-lg shadow w-10' src={cfg.image} alt={cfg.label} />
    );
  }
  return (
    <div
      className={`w-10 h-10 rounded-lg ${cfg.iconBgColor} flex items-center justify-center text-white font-bold shadow`}>
      {cfg.fallbackInitials || cfg.label.charAt(0)}
    </div>
  );
};

interface CourierOrderCardProps {
  order: CourierOrder;
  onViewDetails?: () => void;
}

export const CourierOrderCard: React.FC<CourierOrderCardProps> = ({
  order,
  onViewDetails,
}) => {
  const statusClasses = getStatusBadgeClasses(
    order.deliveryStatus as DeliveryStatus,
  );

  const handleCopyTracking = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <Card className='hover:shadow-lg transition-all duration-200 border-slate-200 shadow-sm'>
      <CardContent className='p-4 space-y-3'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-2'>
            <ProviderLogo provider={order?.provider} />
            <div>
              <h3 className='font-semibold text-slate-900'>
                Order #{order.orderId}
              </h3>
              <p className='text-xs text-slate-500'>Invoice: {order.invoice}</p>
            </div>
          </div>
          <Badge
            className={`${statusClasses.bg} ${statusClasses.text} border-0`}>
            {formatDeliveryStatus(order.deliveryStatus as DeliveryStatus)}
          </Badge>
        </div>

        {/* Tracking Info */}
        <div className='space-y-2 bg-slate-50 p-3 rounded-lg'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-slate-600'>Consignment:</span>
            <div className='flex items-center gap-2'>
              <span className='font-medium text-slate-900'>
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
            <span className='text-slate-600'>Tracking:</span>
            <div className='flex items-center gap-2'>
              <span className='font-medium text-slate-900'>
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
            <span className='text-slate-600'>Tracking Link:</span>
            <div className='flex items-center gap-2'>
              <Input
                disabled
                type='text'
                className='w-full overflow-hidden border-slate-200 text-slate-950 bg-white'
                value={getTrackingUrl(
                  order?.provider,
                  order?.consignmentId,
                  order?.recipientPhone,
                )}
                placeholder='courier'
              />
              <Button
                size='sm'
                variant='ghost'
                className='h-6 w-6 p-0'
                onClick={() =>
                  handleCopyTracking(
                    getTrackingUrl(
                      order?.provider,
                      order?.consignmentId,
                      order?.recipientPhone,
                    ),
                    "Tracking Link",
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
            <User className='w-4 h-4 text-slate-400' />
            <span className='text-slate-900 font-medium'>
              {order.recipientName}
            </span>
          </div>
          <div className='flex items-center gap-2 text-sm'>
            <Phone className='w-4 h-4 text-slate-400' />
            <span className='text-slate-700'>{order.recipientPhone}</span>
          </div>
          <div className='flex items-center gap-2 text-sm'>
            <MapPin className='w-4 h-4 text-slate-400' />
            <span className='text-slate-700 line-clamp-1'>
              {order.recipientAddress}
            </span>
          </div>
        </div>

        {/* Amount Info */}
        <div className='flex items-center justify-between p-2 bg-emerald-50 rounded-lg'>
          <div className='flex items-center gap-2'>
            <DollarSign className='w-4 h-4 text-emerald-600' />
            <span className='text-sm text-slate-600'>COD Amount:</span>
          </div>
          <span className='text-lg font-bold text-emerald-600'>
            ৳{order.codAmount.toLocaleString()}
          </span>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between pt-2 border-t border-slate-200'>
          <div className='flex items-center gap-1 text-xs text-slate-500'>
            <Calendar className='w-3 h-3' />
            {dayjs(order.timestamps.createdAt).format("MMM D, YYYY")}
          </div>
          {onViewDetails && (
            <Button
              size='sm'
              variant='outline'
              onClick={onViewDetails}
              className='gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-150'>
              <ExternalLink className='w-3 h-3' />
              Details
            </Button>
          )}
        </div>

        {/* Note */}
        {order.note && (
          <div className='text-xs text-slate-600 bg-amber-50 p-2 rounded border-l-2 border-amber-400'>
            <span className='font-medium'>Note:</span> {order.note}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourierOrderCard;
