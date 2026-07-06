import React, { useEffect, useState } from "react";
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
  Phone,
  ExternalLink,
  Loader2,
  Circle,
  Copy,
  Check,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatDeliveryStatus } from "@/pages/delivery/types";
import { Button } from "@/components/ui/button";
import {
  getProviderLogo,
  getProviderConfig,
  getTrackingUrl,
} from "@/config/courierProviders";
import config from "@/utils/config";
import axiosInstance from "@/api/axios";
import DeliveryStageTracker from "./DeliveryStageCard";

interface IDeliveryTimeline {
  status: string;
  timestamp: string;
  location?: string;
  remarks?: string;
  updatedBy: string;
}

interface ICourierInfo {
  provider: string;
  consignmentId: string;
  trackingCode: string;
  invoice: string;
  deliveryStatus: string;
  providerRawStatus: string;
  deliveryManId: string;
  deliveryManName: string;
  deliveryManPhone: string;
  codAmount: number;
  collectedAmount: number;
  deliveryCharge: number;
  createdAt: string;
}

interface IDeliveryHistoryResponse {
  courier: ICourierInfo | null;
  statusHistory: IDeliveryTimeline[];
  deliveryTimeline: IDeliveryTimeline[];
}

// Strip the phone query param from a tracking URL before it's shown or copied
const sanitizeTrackingUrl = (url?: string | null): string | null => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.delete("phone");
    return urlObj.toString();
  } catch {
    // Fallback for relative/malformed URLs: strip phone param with regex
    return url
      .replace(/([?&])phone=[^&]*(&|$)/i, (_, lead, trail) =>
        trail === "&" ? lead : "",
      )
      .replace(/[?&]$/, "");
  }
};

const IN_PROGRESS_KEYWORDS = [
  "pending",
  "created",
  "request",
  "picked",
  "pickup",
  "transit",
  "hub",
  "warehouse",
  "out for delivery",
  "assigned for delivery",
  "hold",
];

const TERMINAL_KEYWORDS = ["delivered", "partial", "return", "cancel", "fail"];

// Horizontal header stepper (Pathao-style): fixed happy-path stages, with a
// truck icon that travels along the progress line to the current stage.
const POSITIVE_STAGES: {
  key: string;
  label: string;
  icon: any;
  match: string[];
}[] = [
  {
    key: "placed",
    label: "Order Placed",
    icon: Box,
    match: ["pending", "created", "request"],
  },
  {
    key: "picked",
    label: "Picked Up",
    icon: Package,
    match: ["picked", "pickup"],
  },
  {
    key: "transit",
    label: "In Transit",
    icon: Truck,
    match: ["transit", "hub", "warehouse"],
  },
  {
    key: "out",
    label: "Out for Delivery",
    icon: Truck,
    match: ["out for delivery", "assigned for delivery"],
  },
];

const getTerminalLabel = (statusLower: string) => {
  if (statusLower.includes("cancel")) return "Cancelled";
  if (statusLower.includes("fail")) return "Failed";
  return "Returned";
};

// Scans every known timeline entry and returns the furthest stage reached,
// so the stepper reflects real progress even if the "current" entry is a
// side-status like "hold" that doesn't map to a stage directly.
const computeStageIndex = (
  entries: { status: string }[],
  stages: { match: string[] }[],
) => {
  let idx = 0;
  stages.forEach((stage, i) => {
    const matched = entries.some((entry) => {
      const s = entry.status?.toLowerCase() || "";
      return stage.match.some((k) => s.includes(k));
    });
    if (matched && i > idx) idx = i;
  });
  return idx;
};

const getProviderTheme = (provider: string) => {
  const p = provider?.toLowerCase() || "";
  switch (p) {
    case "steadfast":
      return {
        gradient: "from-blue-600 to-blue-800",
        lightBg: "bg-blue-50",
        lightBorder: "border-blue-200",
        accentText: "text-blue-700",
        dot: "bg-blue-500",
        line: "bg-blue-200",
        lineActive: "bg-blue-500",
        headerGradient: "from-blue-600 via-blue-700 to-blue-950",
        badgeBg: "bg-blue-100 text-blue-800",
        ring: "ring-blue-200",
        solidChip: "bg-blue-600",
      };
    case "pathao":
      return {
        gradient: "from-rose-600 to-rose-800",
        lightBg: "bg-rose-50",
        lightBorder: "border-rose-200",
        accentText: "text-rose-700",
        dot: "bg-rose-500",
        line: "bg-rose-200",
        lineActive: "bg-rose-500",
        headerGradient: "from-rose-600 via-rose-700 to-rose-950",
        badgeBg: "bg-rose-100 text-rose-800",
        ring: "ring-rose-200",
        solidChip: "bg-rose-600",
      };
    case "carrybee":
      return {
        gradient: "from-amber-500 to-amber-700",
        lightBg: "bg-amber-50",
        lightBorder: "border-amber-200",
        accentText: "text-amber-700",
        dot: "bg-amber-500",
        line: "bg-amber-200",
        lineActive: "bg-amber-500",
        headerGradient: "from-amber-500 via-amber-600 to-amber-900",
        badgeBg: "bg-amber-100 text-amber-800",
        ring: "ring-amber-200",
        solidChip: "bg-amber-600",
      };
    default:
      return {
        gradient: "from-slate-600 to-slate-800",
        lightBg: "bg-slate-50",
        lightBorder: "border-slate-200",
        accentText: "text-slate-700",
        dot: "bg-slate-500",
        line: "bg-slate-200",
        lineActive: "bg-slate-500",
        headerGradient: "from-slate-600 via-slate-700 to-slate-950",
        badgeBg: "bg-slate-100 text-slate-800",
        ring: "ring-slate-200",
        solidChip: "bg-slate-600",
      };
  }
};

const getStatusStepInfo = (status: string) => {
  const s = status?.toLowerCase() || "";
  if (s.includes("delivered") && !s.includes("partial"))
    return {
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500",
      label: "Delivered",
    };
  if (s.includes("partial"))
    return {
      icon: CheckCircle2,
      color: "text-teal-500",
      bg: "bg-teal-500",
      label: "Partial Delivery",
    };
  if (s.includes("returned") || s.includes("return"))
    return {
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-500",
      label: "Returned",
    };
  if (s.includes("cancel"))
    return {
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-500",
      label: "Cancelled",
    };
  if (s.includes("fail"))
    return {
      icon: XCircle,
      color: "text-red-400",
      bg: "bg-red-400",
      label: "Failed",
    };
  if (s.includes("hold"))
    return {
      icon: AlertCircle,
      color: "text-orange-500",
      bg: "bg-orange-500",
      label: "On Hold",
    };
  if (s.includes("out for delivery") || s.includes("assigned for delivery"))
    return {
      icon: Truck,
      color: "text-purple-500",
      bg: "bg-purple-500",
      label: "Out for Delivery",
    };
  if (s.includes("transit") || s.includes("hub") || s.includes("warehouse"))
    return {
      icon: Truck,
      color: "text-blue-500",
      bg: "bg-blue-500",
      label: "In Transit",
    };
  if (s.includes("picked") || s.includes("pickup"))
    return {
      icon: Package,
      color: "text-cyan-500",
      bg: "bg-cyan-500",
      label: "Picked Up",
    };
  if (s.includes("pending") || s.includes("created") || s.includes("request"))
    return {
      icon: Clock,
      color: "text-gray-400",
      bg: "bg-gray-400",
      label: "Pending",
    };
  return {
    icon: Circle,
    color: "text-slate-400",
    bg: "bg-slate-400",
    label: formatDeliveryStatus(status),
  };
};

export const DeliveryTimelineBadge: React.FC<{
  deliveryTimeline: IDeliveryTimeline[];
  provider: string;
  orderNumber?: number;
}> = ({ deliveryTimeline, provider, orderNumber }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] =
    useState<IDeliveryHistoryResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const providerTheme = getProviderTheme(provider);
  const providerConfig = getProviderConfig(provider);
  const providerLogo = getProviderLogo(provider);

  useEffect(() => {
    if (open && orderNumber) {
      setLoading(true);
      setHistoryData(null);
      axiosInstance
        .get(config.courier.deliveryHistory(orderNumber))
        .then((res) => {
          if (res.data?.success) {
            setHistoryData(res.data.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open, orderNumber]);

  // Reset the "copied" toast whenever the sheet is closed/reopened
  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  const courier = historyData?.courier;

  // Merge both sources, deduplicate by status (keep latest timestamp)
  const merged = new Map<string, IDeliveryTimeline>();
  const allRaw = [
    ...(historyData?.statusHistory || []),
    ...(historyData?.deliveryTimeline || []),
  ];
  allRaw.forEach((entry) => {
    const key = entry.status.toLowerCase();
    const existing = merged.get(key);
    if (
      !existing ||
      new Date(entry.timestamp).getTime() >
        new Date(existing.timestamp).getTime()
    ) {
      merged.set(key, entry);
    }
  });
  const allTimeline = Array.from(merged.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  if (!deliveryTimeline || deliveryTimeline.length === 0) {
    return null;
  }

  const latestStatus = deliveryTimeline[deliveryTimeline.length - 1];
  const statusStepInfo = getStatusStepInfo(latestStatus.status);
  const latestStatusLower = latestStatus.status?.toLowerCase() || "";

  const isInProgress = IN_PROGRESS_KEYWORDS.some((k) =>
    latestStatusLower.includes(k),
  );
  const isTerminal = TERMINAL_KEYWORDS.some((k) =>
    latestStatusLower.includes(k),
  );
  const showMovingTruck = isInProgress && !isTerminal;

  // --- Horizontal header stepper ---
  const isDelivered =
    latestStatusLower.includes("delivered") &&
    !latestStatusLower.includes("partial");
  const isNegativeTerminal =
    latestStatusLower.includes("return") ||
    latestStatusLower.includes("cancel") ||
    latestStatusLower.includes("fail");

  const finalStageLabel = isNegativeTerminal
    ? getTerminalLabel(latestStatusLower)
    : "Delivered";
  const finalStageIcon = isNegativeTerminal ? XCircle : CheckCircle2;

  const stages = [
    ...POSITIVE_STAGES,
    {
      key: "final",
      label: finalStageLabel,
      icon: finalStageIcon,
      match: ["delivered"],
    },
  ];

  // Prefer the merged history once loaded; fall back to the prop passed in
  // from the parent so the stepper still has something to show immediately.
  const entriesForStage =
    allTimeline.length > 0 ? allTimeline : deliveryTimeline;

  const stageIndex =
    isNegativeTerminal || isDelivered
      ? stages.length - 1
      : computeStageIndex(entriesForStage, POSITIVE_STAGES);

  const stageProgressPct =
    stages.length > 1 ? (stageIndex / (stages.length - 1)) * 100 : 0;
  const truckIsMoving = showMovingTruck && !isDelivered && !isNegativeTerminal;

  const consignmentId = courier?.consignmentId || "";
  const rawTrackingUrl = getTrackingUrl(provider, consignmentId);
  const trackingUrl = sanitizeTrackingUrl(rawTrackingUrl);

  const handleCopyLink = async () => {
    if (!trackingUrl) return;
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard write failed silently — no-op
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant='ghost'
          className='flex items-center gap-2 px-2 h-8 rounded-full hover:bg-slate-100 transition-colors'>
          <img
            className='rounded-full shadow-sm w-5 h-5 object-cover ring-1 ring-black/5'
            src={providerLogo}
            alt={provider}
          />
          <span className='text-sm font-medium text-slate-700'>
            {formatDeliveryStatus(latestStatus.status)}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent className='w-full sm:max-w-[440px] p-0 overflow-hidden border-0 shadow-2xl bg-slate-50'>
        {/* Provider Header */}
        <div
          className={`bg-gradient-to-br ${providerTheme.headerGradient} px-6 pt-6 pb-5 text-white relative overflow-hidden`}>
          <div className='absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5' />
          <div className='absolute -right-2 top-14 w-16 h-16 rounded-full bg-white/5' />

          <div className='flex items-center gap-3 mb-4 relative'>
            <img
              className='rounded-full shadow-lg w-11 h-11 object-cover bg-white p-0.5 ring-1 ring-white/20'
              src={providerLogo}
              alt={provider}
            />
            <div className='min-w-0'>
              <h3 className='font-bold text-lg leading-tight tracking-tight'>
                {providerConfig.label}
              </h3>
              <p className='text-white/60 text-xs truncate'>
                {providerConfig.description}
              </p>
            </div>
          </div>

          {/* Current status pill */}
          <div className='flex items-center gap-2 mb-3 relative'>
            <div className='flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5'>
              <statusStepInfo.icon className='w-3.5 h-3.5' />
              <span className='text-xs font-semibold'>
                {formatDeliveryStatus(latestStatus.status)}
              </span>
            </div>
            {showMovingTruck && (
              <div className='flex items-center gap-1 text-white/70 text-[11px]'>
                <Truck className='w-3 h-3' />
                <span>moving</span>
              </div>
            )}
          </div>

          {courier && (
            <div className='flex items-center gap-2 flex-wrap text-sm relative'>
              {courier.consignmentId && (
                <Badge className='bg-white/15 text-white border-white/20 hover:bg-white/25 text-xs font-normal'>
                  ID {courier.consignmentId}
                </Badge>
              )}
              {trackingUrl && (
                <div className='flex items-center gap-1'>
                  <a
                    href={trackingUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1 text-white/85 hover:text-white text-xs underline underline-offset-2'>
                    Track shipment <ExternalLink className='w-3 h-3' />
                  </a>
                  <button
                    type='button'
                    onClick={handleCopyLink}
                    className='relative inline-flex items-center justify-center w-6 h-6 rounded-md text-white/80 hover:text-white hover:bg-white/15 transition-colors'
                    aria-label='Copy tracking link'
                    title='Copy tracking link'>
                    {copied ? (
                      <Check
                        key='check'
                        className='w-3.5 h-3.5 copy-pop text-emerald-300'
                      />
                    ) : (
                      <Copy key='copy' className='w-3.5 h-3.5' />
                    )}
                  </button>
                  {copied && (
                    <span className='text-[10px] text-emerald-300 font-medium copy-pop'>
                      Copied
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {/* Content */}
        <div className='overflow-y-auto max-h-[calc(100vh-190px)] px-6 py-5'>
          {loading ? (
            <div className='flex flex-col items-center justify-center py-16 gap-3'>
              <Loader2 className='w-8 h-8 animate-spin text-slate-400' />
              <p className='text-sm text-slate-500'>Loading delivery info...</p>
            </div>
          ) : (
            <>
              {/* Horizontal step tracker with a traveling truck, Pathao-style */}
              <DeliveryStageTracker
                stages={stages}
                stageIndex={stageIndex}
                stageProgressPct={stageProgressPct}
                isNegativeTerminal={isNegativeTerminal}
                truckIsMoving={truckIsMoving}
                provider={provider.toLowerCase()}
              />
              {/* Deliveryman Card */}
              {courier?.deliveryManName && (
                <div
                  className={`rounded-2xl mt-2 border ${providerTheme.lightBorder} ${providerTheme.lightBg} p-4 mb-4 shadow-sm`}>
                  <div className='flex items-center gap-2 mb-3'>
                    <div
                      className={`w-8 h-8 rounded-full ${providerTheme.gradient} bg-gradient-to-br flex items-center justify-center shadow-sm`}>
                      <User className='w-4 h-4 text-white' />
                    </div>
                    <span
                      className={`text-sm font-bold ${providerTheme.accentText}`}>
                      Delivery Man
                    </span>
                  </div>
                  <div className='space-y-2 ml-1'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-semibold text-slate-800'>
                        {courier.deliveryManName}
                      </span>
                    </div>
                    {courier.deliveryManPhone && (
                      <div className='flex items-center gap-2'>
                        <Phone className='w-3.5 h-3.5 text-slate-400' />
                        <a
                          href={`tel:${courier.deliveryManPhone}`}
                          className='text-sm text-slate-600 hover:text-slate-900 underline underline-offset-2'>
                          {courier.deliveryManPhone}
                        </a>
                      </div>
                    )}
                    {courier.deliveryManId && (
                      <div className='flex items-center gap-2 text-xs text-slate-500'>
                        <span>ID: {courier.deliveryManId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* COD Info */}
              {courier &&
                (courier.codAmount > 0 || courier.collectedAmount > 0) && (
                  <div className='rounded-2xl mt-2 border border-slate-200 bg-white p-4 mb-4 shadow-sm'>
                    <div className='grid grid-cols-2 gap-3'>
                      {courier.codAmount > 0 && (
                        <div>
                          <p className='text-xs text-slate-500 mb-0.5'>
                            COD Amount
                          </p>
                          <p className='text-sm font-bold text-slate-800'>
                            &#2547; {courier.codAmount.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {courier.collectedAmount > 0 && (
                        <div>
                          <p className='text-xs text-slate-500 mb-0.5'>
                            Collected
                          </p>
                          <p className='text-sm font-bold text-emerald-600'>
                            &#2547; {courier.collectedAmount.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {courier.deliveryCharge > 0 && (
                        <div>
                          <p className='text-xs text-slate-500 mb-0.5'>
                            Delivery Charge
                          </p>
                          <p className='text-sm font-semibold text-slate-700'>
                            &#2547; {courier.deliveryCharge.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Status Timeline */}
              <div className='rounded-2xl mt-2 border border-slate-200 bg-white p-4 shadow-sm'>
                <h4 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-4'>
                  Status History
                </h4>
                {allTimeline.length === 0 ? (
                  <p className='text-sm text-slate-500 text-center py-8'>
                    No status history available
                  </p>
                ) : (
                  <div className='relative space-y-1'>
                    {allTimeline.map((entry, index) => {
                      const stepInfo = getStatusStepInfo(entry.status);
                      const StepIcon = stepInfo.icon;
                      const isFirst = index === 0;
                      const isLast = index === allTimeline.length - 1;
                      const isCompleted = !isFirst; // anything before "current" already happened

                      return (
                        <div key={index} className='relative flex gap-3'>
                          {/* Vertical line + dot */}
                          <div className='flex flex-col items-center'>
                            <div
                              className={`relative w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform ${
                                isFirst
                                  ? `${stepInfo.bg} ring-4 ${providerTheme.ring} current-pulse`
                                  : isCompleted
                                    ? `${providerTheme.solidChip}`
                                    : `${providerTheme.lightBg}`
                              }`}>
                              <StepIcon
                                className={`w-4 h-4 ${
                                  isFirst || isCompleted
                                    ? "text-white"
                                    : stepInfo.color
                                }`}
                              />
                            </div>
                            {/* {!isLast && (
                              <div
                                className={`relative w-0.5 flex-1 my-1 ${
                                  isFirst
                                    ? providerTheme.line
                                    : providerTheme.line
                                }`}>
                                {isFirst && showMovingTruck && (
                                  <Truck
                                    className={`truck-drive absolute -left-[7px] top-0 w-4 h-4 ${providerTheme.accentText} bg-white rounded-full p-0.5 shadow`}
                                  />
                                )}
                              </div>
                            )} */}
                          </div>
                          {/* Content */}
                          <div
                            className={`pb-4 flex-1 ${isLast ? "pb-0" : ""}`}>
                            <div className='flex items-center gap-2 flex-wrap'>
                              <span
                                className={`text-sm font-semibold ${
                                  isFirst ? "text-slate-900" : "text-slate-700"
                                }`}>
                                {formatDeliveryStatus(entry.status)}
                              </span>
                              {isFirst ? (
                                <Badge className='bg-blue-100 text-blue-700 border-0 text-[10px] px-1.5 py-0'>
                                  Current
                                </Badge>
                              ) : (
                                <Badge className='bg-emerald-50 text-emerald-600 border-0 text-[10px] px-1.5 py-0 gap-0.5 inline-flex items-center'>
                                  <Check className='w-2.5 h-2.5' />
                                  Completed
                                </Badge>
                              )}
                            </div>
                            <div className='flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap'>
                              <Calendar className='w-3 h-3' />
                              <span>
                                {new Date(entry.timestamp).toLocaleString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                              {entry.location && (
                                <>
                                  <span className='text-slate-300'>|</span>
                                  <MapPin className='w-3 h-3 text-red-400' />
                                  <span>{entry.location}</span>
                                </>
                              )}
                            </div>
                            {entry.remarks && (
                              <p className='text-xs text-slate-500 mt-1 italic'>
                                &quot;{entry.remarks}&quot;
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DeliveryTimelineBadge;
