import React, { useMemo, useState } from "react";
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
  Calendar,
  ChevronDown,
  Package,
} from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../components/ui/sheet";
import { formatDeliveryStatus } from "../../delivery/types";
import { Button } from "../../../components/ui/button";

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
      lineColor: "bg-gradient-to-b from-emerald-400 to-emerald-200",
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
      lineColor: "bg-gradient-to-b from-blue-400 to-blue-200",
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
      lineColor: "bg-gradient-to-b from-amber-400 to-amber-200",
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
      lineColor: "bg-gradient-to-b from-red-400 to-red-200",
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
      lineColor: "bg-gradient-to-b from-gray-400 to-gray-200",
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
      lineColor: "bg-gradient-to-b from-purple-400 to-purple-200",
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
    lineColor: "bg-gradient-to-b from-slate-400 to-slate-200",
    emoji: "ℹ️",
    label: status,
  };
};

export const DeliveryTimelineBadge: React.FC<{
  deliveryTimeline: IDeliveryTimeline[];
  provider: string;
}> = ({ deliveryTimeline, provider }) => {
  const [open, setOpen] = useState(false);
  const [expandedStatuses, setExpandedStatuses] = useState<Set<string>>(
    new Set()
  );

  // Group timeline entries by status and keep only unique statuses with their occurrences
  const groupedTimeline = useMemo(() => {
    const statusMap = new Map<string, IDeliveryTimeline[]>();

    // Reverse to show latest first
    [...deliveryTimeline].reverse().forEach((entry) => {
      const normalizedStatus = entry.status.toLowerCase();
      if (!statusMap.has(normalizedStatus)) {
        statusMap.set(normalizedStatus, []);
      }
      statusMap.get(normalizedStatus)!.push(entry);
    });

    return Array.from(statusMap.entries()).map(([status, entries]) => ({
      status,
      entries,
      latestEntry: entries[0],
      count: entries.length,
    }));
  }, [deliveryTimeline]);

  const toggleExpanded = (status: string) => {
    setExpandedStatuses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }
      return newSet;
    });
  };

  if (!deliveryTimeline || deliveryTimeline.length === 0) {
    return null;
  }

  const latestStatus = deliveryTimeline[deliveryTimeline.length - 1];
  const statusConfig = getStatusConfig(latestStatus.status);

  const providerLogo = provider.includes("pathao")
    ? "https://logosandtypes.com/wp-content/uploads/2025/04/Pathao.png"
    : "https://play-lh.googleusercontent.com/9OYsIvc-iKHte4jqVe-c4sA0vNL-tljBDVPguou6B-qdxQgSKpj8pZ7ZYh6MYEbawbo=w240-h480-rw";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={"ghost"} className='flex items-center gap-2'>
          <img
            className='rounded-full shadow w-5 h-5 object-cover'
            src={providerLogo}
            alt='provider'
          />
          {statusConfig.label}
        </Button>
      </SheetTrigger>

      <SheetContent className='overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-2xl'>
        <SheetHeader>
          <SheetTitle className='text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent flex items-center gap-2'>
            <Package className='w-6 h-6 text-slate-700' />
            Delivery Timeline
          </SheetTitle>
        </SheetHeader>

        <div className='relative mt-8 space-y-2'>
          {groupedTimeline.map((group: any, index: number) => {
            const config = getStatusConfig(group.status);
            const StatusIconComponent = config.icon;
            const isExpanded = expandedStatuses.has(group.status);
            const hasMultiple = group.count > 1;
            const isFirst = index === 0;
            const isLast = index === groupedTimeline.length - 1;

            return (
              <div key={group.status} className='relative'>
                {/* Timeline Line */}
                {!isLast && (
                  <div
                    className={`absolute left-6 top-14 w-0.5 h-full ${config.lineColor} -z-0`}
                  />
                )}

                {/* Main Status Card */}
                <div className='relative'>
                  {/* Timeline Dot with Pulse Animation */}
                  <div className='absolute left-0 top-4'>
                    <div
                      className={`relative w-12 h-12 rounded-full ${config.color} flex items-center justify-center shadow-lg`}>
                      {isFirst && (
                        <div
                          className={`absolute inset-0 rounded-full ${config.color} animate-ping opacity-75`}
                        />
                      )}
                      <StatusIconComponent className='w-6 h-6 text-white relative z-10' />
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className='ml-16 bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-2'>
                          <div className='flex items-center gap-2'>
                            <img
                              className='rounded-full shadow w-8 h-8 object-cover'
                              src={providerLogo}
                              alt='provider'
                            />
                          </div>
                          <Badge
                            className={`${config.badgeColor} text-white border-0 text-sm font-semibold px-3 py-1`}>
                            <span className='mr-1'>{config.emoji}</span>
                            {formatDeliveryStatus(group.status)}
                          </Badge>
                          {isFirst && (
                            <span className='text-xs font-bold text-blue-600 uppercase tracking-wide bg-blue-50 px-2 py-1 rounded-full'>
                              Current
                            </span>
                          )}
                          {hasMultiple && (
                            <span className='text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full'>
                              {group.count}x
                            </span>
                          )}
                        </div>

                        {/* Latest Entry Details */}
                        <div className='space-y-2 text-sm'>
                          <div className='flex items-center gap-2 text-slate-600'>
                            <Calendar className='w-4 h-4 flex-shrink-0' />
                            <span className='font-medium'>
                              {new Date(
                                group.latestEntry.timestamp
                              ).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          {group.latestEntry.location && (
                            <div className='flex items-center gap-2 text-slate-700'>
                              <MapPin className='w-4 h-4 flex-shrink-0 text-red-500' />
                              <span className='font-medium'>
                                {group.latestEntry.location}
                              </span>
                            </div>
                          )}

                          {group.latestEntry.remarks && (
                            <p className='text-slate-600 pl-6 italic'>
                              "{group.latestEntry.remarks}"
                            </p>
                          )}

                          <div className='flex items-center gap-2 text-slate-500 text-xs pl-6'>
                            <User className='w-3 h-3' />
                            <span>by {group.latestEntry.updatedBy}</span>
                          </div>
                        </div>
                      </div>

                      {/* Expand Button for Multiple Entries */}
                      {hasMultiple && (
                        <button
                          onClick={() => toggleExpanded(group.status)}
                          className='ml-2 p-2 hover:bg-slate-100 rounded-lg transition-colors'>
                          <ChevronDown
                            className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Expanded Additional Entries */}
                    {hasMultiple && isExpanded && (
                      <div className='mt-4 pt-4 border-t border-slate-200 space-y-3'>
                        <p className='text-xs font-semibold text-slate-500 uppercase tracking-wide'>
                          Previous Occurrences
                        </p>
                        {group.entries
                          .slice(1)
                          .map((entry: any, entryIndex: number) => (
                            <div
                              key={entryIndex}
                              className='bg-slate-50 rounded-xl p-3 space-y-1.5'>
                              <div className='flex items-center gap-2 text-xs text-slate-600'>
                                <Clock className='w-3 h-3' />
                                <span>
                                  {new Date(entry.timestamp).toLocaleString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      hour: "numeric",
                                      minute: "2-digit",
                                    }
                                  )}
                                </span>
                              </div>
                              {entry.location && (
                                <div className='flex items-center gap-2 text-xs text-slate-600'>
                                  <MapPin className='w-3 h-3 text-red-400' />
                                  <span>{entry.location}</span>
                                </div>
                              )}
                              {entry.remarks && (
                                <p className='text-xs text-slate-500 pl-5'>
                                  "{entry.remarks}"
                                </p>
                              )}
                              <div className='flex items-center gap-1.5 text-xs text-slate-400 pl-5'>
                                <User className='w-2.5 h-2.5' />
                                <span>{entry.updatedBy}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
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
