import React, { useState } from "react";
import {
  MapPin,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Truck,
  Box,
  Home,
  TruckElectric,
} from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../components/ui/sheet";

interface IDeliveryTimeline {
  status: string;
  timestamp: string;
  location?: string;
  remarks?: string;
  updatedBy: string;
}

const getStatusConfig = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes("delivered")) {
    return {
      icon: CheckCircle2,
      color: "bg-gradient-to-br from-emerald-400 to-emerald-600",
      badgeColor:
        "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
      dotColor: "bg-emerald-500",
      emoji: "✅",
      label: "Delivered",
    };
  } else if (
    statusLower.includes("transit") ||
    statusLower.includes("shipping")
  ) {
    return {
      icon: Truck,
      color: "bg-gradient-to-br from-blue-400 to-blue-600",
      badgeColor:
        "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      dotColor: "bg-blue-500",
      emoji: "🚚",
      label: "In Transit",
    };
  } else if (
    statusLower.includes("processing") ||
    statusLower.includes("preparing")
  ) {
    return {
      icon: Box,
      color: "bg-gradient-to-br from-amber-400 to-amber-600",
      badgeColor:
        "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
      dotColor: "bg-amber-500",
      emoji: "📦",
      label: "Processing",
    };
  } else if (
    statusLower.includes("cancelled") ||
    statusLower.includes("failed")
  ) {
    return {
      icon: XCircle,
      color: "bg-gradient-to-br from-red-400 to-red-600",
      badgeColor:
        "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
      dotColor: "bg-red-500",
      emoji: "❌",
      label: "Cancelled",
    };
  } else if (
    statusLower.includes("pending") ||
    statusLower.includes("awaiting")
  ) {
    return {
      icon: Clock,
      color: "bg-gradient-to-br from-gray-400 to-gray-600",
      badgeColor:
        "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700",
      dotColor: "bg-gray-500",
      emoji: "⏳",
      label: "Pending",
    };
  } else if (statusLower.includes("out for delivery")) {
    return {
      icon: Home,
      color: "bg-gradient-to-br from-purple-400 to-purple-600",
      badgeColor:
        "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
      dotColor: "bg-purple-500",
      emoji: "🏠",
      label: "Out for Delivery",
    };
  }

  return {
    icon: AlertCircle,
    color: "bg-gradient-to-br from-slate-400 to-slate-600",
    badgeColor:
      "bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700",
    dotColor: "bg-slate-500",
    emoji: "ℹ️",
    label: status,
  };
};

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return {
    date: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

export const DeliveryTimelineBadge: React.FC<{
  deliveryTimeline: IDeliveryTimeline[];
}> = ({ deliveryTimeline }) => {
  const [open, setOpen] = useState(false);

  if (!deliveryTimeline || deliveryTimeline.length === 0) {
    return null;
  }

  const latestStatus = deliveryTimeline[deliveryTimeline.length - 1];
  const statusConfig = getStatusConfig(latestStatus.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Badge
          className={`${statusConfig.badgeColor} text-white px-4 py-2 cursor-pointer 
                     shadow-lg hover:shadow-xl transition-all duration-300 
                     backdrop-blur-sm border-0 text-sm font-medium
                     hover:scale-105 active:scale-95`}>
          <span className='mr-1.5'>{statusConfig.emoji}</span>
          <StatusIcon className='w-4 h-4 mr-1.5' />
          {statusConfig.label}
        </Badge>
      </SheetTrigger>

      <SheetContent className='max-w-2xl  overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-2xl'>
        <SheetHeader>
          <SheetTitle className='text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent flex items-center gap-2'>
            <TruckElectric className='w-6 h-6 text-slate-700' />
            Delivery Timeline
          </SheetTitle>
        </SheetHeader>

        <div className='relative mt-6 max-h-[80vh] overflow-y-auto'>
          {deliveryTimeline.map((item, index) => {
            const config = getStatusConfig(item.status);
            const Icon = config.icon;
            const { date, time } = formatDate(item.timestamp);
            const isLast = index === deliveryTimeline.length - 1;

            return (
              <div key={index} className='relative flex gap-4 pb-8 group'>
                {/* Timeline line */}
                {!isLast && (
                  <div className='absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-slate-300 to-slate-200' />
                )}

                {/* Icon container */}
                <div className='relative z-10 flex-shrink-0'>
                  {item.status === "pending" ? (
                    <img
                      src='https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/bc/77/84/bc7784eb-5758-6e3a-6a6a-32048cb878eb/AppIcon-0-0-1x_U007epad-0-85-220.png/1024x1024.jpg'
                      alt='steadFast'
                      className='size-14 rounded-full shadow-lg 
                                 transition-all duration-300 group-hover:scale-110 
                                 group-hover:shadow-xl backdrop-blur-sm'
                    />
                  ) : (
                    <div
                      className={`${config.color} rounded-full p-3 shadow-lg 
                                 transition-all duration-300 group-hover:scale-110 
                                 group-hover:shadow-xl backdrop-blur-sm`}>
                      <Icon className='w-6 h-6 text-white' />
                    </div>
                  )}
                  {!isLast && (
                    <div
                      className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 
                                   w-2 h-2 ${config.dotColor} rounded-full animate-pulse`}
                    />
                  )}
                </div>

                {/* Content */}
                <div
                  className='flex-1 bg-white rounded-xl p-5 shadow-md hover:shadow-xl 
                              transition-all duration-300 border border-slate-200
                              hover:border-slate-300 backdrop-blur-sm'>
                  <div className='flex items-start justify-between mb-2'>
                    <div className='flex items-center gap-2'>
                      <span className='text-lg'>{config.emoji}</span>
                      <h3 className='font-bold text-slate-800 text-lg'>
                        {item.status}
                      </h3>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-semibold text-slate-700'>
                        {date}
                      </p>
                      <p className='text-xs text-slate-500 flex items-center justify-end gap-1'>
                        <Clock className='w-3 h-3' />
                        {time}
                      </p>
                    </div>
                  </div>

                  {item.location && (
                    <div className='flex items-center gap-2 text-slate-600 mb-2'>
                      <MapPin className='w-4 h-4 text-slate-500' />
                      <p className='text-sm'>{item.location}</p>
                    </div>
                  )}

                  {item.remarks && (
                    <p className='text-sm text-slate-600 mb-2 italic bg-slate-50 p-2 rounded-lg'>
                      {item.remarks}
                    </p>
                  )}

                  <div className='flex items-center gap-2 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100'>
                    <User className='w-3 h-3' />
                    <span>
                      Updated by:{" "}
                      <span className='font-medium text-slate-700'>
                        {item.updatedBy}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
