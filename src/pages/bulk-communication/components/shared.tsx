import { CampaignStatus } from "../interface";

export const STATUS_CONFIG: Record<
  CampaignStatus,
  { label: string; className: string; dot: string }
> = {
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  queued: {
    label: "Queued",
    className: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    dot: "bg-blue-500",
  },
  processing: {
    label: "Processing",
    className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dot: "bg-amber-500 animate-pulse",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
    dot: "bg-slate-400",
  },
  failed: {
    label: "Failed",
    className: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    dot: "bg-rose-500",
  },
  draft: {
    label: "Draft",
    className: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    dot: "bg-violet-400",
  },
};

export const StatusBadge = ({ status }: { status: CampaignStatus }) => {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export const ProgressBar = ({ value }: { value: number }) => (
  <div className='flex items-center gap-2 min-w-[100px]'>
    <div className='flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden'>
      <div
        className='h-full bg-indigo-500 rounded-full transition-all duration-300'
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
    <span className='text-xs tabular-nums text-slate-500 w-8 text-right'>
      {value}%
    </span>
  </div>
);

export const RECIPIENT_STATUS_CONFIG: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    dot: "bg-slate-400",
  },
  sent: {
    label: "Sent",
    className: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    dot: "bg-blue-500",
  },
  delivered: {
    label: "Delivered",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  failed: {
    label: "Failed",
    className: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    dot: "bg-rose-500",
  },
  opened: {
    label: "Opened",
    className: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
    dot: "bg-indigo-500",
  },
  clicked: {
    label: "Clicked",
    className: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
    dot: "bg-violet-500",
  },
};

export const RecipientStatusBadge = ({ status }: { status: string }) => {
  const config = RECIPIENT_STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
