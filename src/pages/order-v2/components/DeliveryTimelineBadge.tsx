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
  X,
} from "lucide-react";
import { IDeliveryTimeline } from "../types";

// Status configuration map
const STATUS_CONFIGS = {
  delivered: {
    icon: CheckCircle2,
    gradient: "from-emerald-400 to-teal-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    emoji: "✅",
  },
  transit: {
    icon: Truck,
    gradient: "from-blue-400 to-indigo-500",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
    emoji: "🚚",
  },
  processing: {
    icon: Box,
    gradient: "from-amber-400 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    emoji: "📦",
  },
  cancelled: {
    icon: XCircle,
    gradient: "from-red-400 to-rose-500",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
    emoji: "❌",
  },
  pending: {
    icon: Clock,
    gradient: "from-slate-400 to-gray-500",
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-500",
    emoji: "⏳",
  },
  outForDelivery: {
    icon: Home,
    gradient: "from-violet-400 to-purple-500",
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-500",
    emoji: "🏠",
  },
  default: {
    icon: AlertCircle,
    gradient: "from-slate-400 to-slate-500",
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-500",
    emoji: "ℹ️",
  },
};

const getStatusConfig = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("delivered"))
    return { ...STATUS_CONFIGS.delivered, label: "Delivered" };
  if (s.includes("transit") || s.includes("shipping"))
    return { ...STATUS_CONFIGS.transit, label: "In Transit" };
  if (s.includes("processing") || s.includes("preparing"))
    return { ...STATUS_CONFIGS.processing, label: "Processing" };
  if (s.includes("cancelled") || s.includes("failed"))
    return { ...STATUS_CONFIGS.cancelled, label: "Cancelled" };
  if (s.includes("pending") || s.includes("awaiting"))
    return { ...STATUS_CONFIGS.pending, label: "Pending" };
  if (s.includes("out for delivery"))
    return { ...STATUS_CONFIGS.outForDelivery, label: "Out for Delivery" };
  return { ...STATUS_CONFIGS.default, label: status };
};

const formatDate = (timestamp: string, short = false) => {
  const options: Intl.DateTimeFormatOptions = short
    ? { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
    : {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      };
  return new Date(timestamp).toLocaleString("en-US", options);
};

const TimelineEntry = ({ entry, isNested = false }: any) => (
  <div
    className={`space-y-2 ${
      isNested ? "bg-white/60 rounded-xl p-3 border border-slate-100" : ""
    }`}>
    <div className='flex items-center gap-2 text-slate-600'>
      <Calendar
        className={`${isNested ? "w-3.5 h-3.5" : "w-4 h-4"} text-slate-400`}
      />
      <span className={`font-medium ${isNested ? "text-xs" : "text-sm"}`}>
        {formatDate(entry.timestamp, isNested)}
      </span>
    </div>
    {entry.location && (
      <div className='flex items-center gap-2 text-slate-700'>
        <MapPin
          className={`${isNested ? "w-3.5 h-3.5" : "w-4 h-4"} text-rose-400`}
        />
        <span className={isNested ? "text-xs" : "text-sm"}>
          {entry.location}
        </span>
      </div>
    )}
    {entry.remarks && (
      <p
        className={`text-slate-500 italic pl-6 ${
          isNested ? "text-xs" : "text-sm"
        }`}>
        "{entry.remarks}"
      </p>
    )}
    <div className='flex items-center gap-1.5 text-slate-400 pl-6'>
      <User className={isNested ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span className={isNested ? "text-xs" : "text-xs"}>
        {entry.updatedBy}
      </span>
    </div>
  </div>
);

const StatusCard = ({
  group,
  isFirst,
  isLast,
  providerLogo,
  provider,
  isExpanded,
  onToggle,
}: any) => {
  const config = getStatusConfig(group.status);
  const Icon = config.icon;
  const hasMultiple = group.count > 1;

  return (
    <div className='relative group'>
      {!isLast && (
        <div className='absolute left-6 top-16 w-0.5 h-[calc(100%-2rem)] bg-gradient-to-b from-slate-200 to-transparent' />
      )}

      <div className='flex gap-4'>
        <div className='relative flex-shrink-0'>
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-105`}>
            {isFirst && (
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${config.gradient} animate-pulse opacity-50`}
              />
            )}
            <Icon className='w-5 h-5 text-white relative z-10' />
          </div>
          {isFirst && (
            <div className='absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse' />
          )}
        </div>

        <div className='flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden'>
          <div className='p-4'>
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-2 flex-wrap'>
                <div className='relative'>
                  <img
                    className='w-7 h-7 rounded-lg object-cover ring-1 ring-slate-100'
                    src={providerLogo}
                    alt={provider}
                  />
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text} ${config.border} border`}>
                  <span>{config.emoji}</span>
                  {config.label}
                </span>
                {isFirst && (
                  <span className='text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100'>
                    Latest
                  </span>
                )}
                {hasMultiple && (
                  <span className='text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full'>
                    ×{group.count}
                  </span>
                )}
              </div>

              {hasMultiple && (
                <button
                  onClick={onToggle}
                  className='p-1.5 hover:bg-slate-50 rounded-lg transition-colors'>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
            </div>

            <TimelineEntry entry={group.latestEntry} />
          </div>

          {hasMultiple && isExpanded && (
            <div className='px-4 pb-4 pt-2 border-t border-slate-50 bg-slate-50/50'>
              <p className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3'>
                Previous Updates
              </p>
              <div className='space-y-2'>
                {group.entries.slice(1).map((entry: any, i: number) => (
                  <TimelineEntry key={i} entry={entry} isNested />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DeliveryTimelineBadge: React.FC<{
  deliveryTimeline: IDeliveryTimeline[];
  provider?: string;
}> = ({ deliveryTimeline, provider }) => {
  const [open, setOpen] = useState(false);
  const [expandedStatuses, setExpandedStatuses] = useState(new Set());

  const groupedTimeline = useMemo(() => {
    const statusMap = new Map();
    [...deliveryTimeline].reverse().forEach((entry) => {
      const key = entry.status.toLowerCase();
      if (!statusMap.has(key)) statusMap.set(key, []);
      statusMap.get(key).push(entry);
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
      const next = new Set(prev);
      next.has(status) ? next.delete(status) : next.add(status);
      return next;
    });
  };

  if (!deliveryTimeline?.length) return null;

  const latestStatus = deliveryTimeline[deliveryTimeline.length - 1];
  const config = getStatusConfig(latestStatus.status);
  const providerLogo =
    !!provider && provider.toLowerCase().includes("pathao")
      ? "https://logosandtypes.com/wp-content/uploads/2025/04/Pathao.png"
      : "https://play-lh.googleusercontent.com/9OYsIvc-iKHte4jqVe-c4sA0vNL-tljBDVPguou6B-qdxQgSKpj8pZ7ZYh6MYEbawbo=w240-h480-rw";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} ${config.border} border hover:shadow-md transition-all duration-200 cursor-pointer group`}>
        <img
          className='w-5 h-5 rounded-full object-cover ring-1 ring-white shadow-sm'
          src={providerLogo}
          alt={provider}
        />
        <span
          className={`text-sm font-semibold ${config.text} flex items-center gap-1.5`}>
          {config.label}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 ${config.text} opacity-50 group-hover:opacity-100 transition-opacity`}
        />
      </button>

      {open && (
        <div className='fixed inset-0 z-50 flex justify-end'>
          <div
            className='absolute inset-0 bg-black/20 backdrop-blur-sm'
            onClick={() => setOpen(false)}
          />
          <div className='relative w-full max-w-md bg-gradient-to-b from-slate-50 to-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-hidden flex flex-col'>
            <div className='p-6 border-b border-slate-100 bg-white/80 backdrop-blur-sm'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg'>
                    <Package className='w-5 h-5 text-white' />
                  </div>
                  <div>
                    <h2 className='text-lg font-bold text-slate-800'>
                      Delivery Timeline
                    </h2>
                    <p className='text-xs text-slate-500'>
                      {deliveryTimeline.length} updates tracked
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className='p-2 hover:bg-slate-100 rounded-xl transition-colors'>
                  <X className='w-5 h-5 text-slate-400' />
                </button>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto p-6'>
              <div className='space-y-4'>
                {groupedTimeline.map((group, index) => (
                  <StatusCard
                    key={group.status}
                    group={group}
                    isFirst={index === 0}
                    isLast={index === groupedTimeline.length - 1}
                    providerLogo={providerLogo}
                    provider={provider}
                    isExpanded={expandedStatuses.has(group.status)}
                    onToggle={() => toggleExpanded(group.status)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeliveryTimelineBadge;
