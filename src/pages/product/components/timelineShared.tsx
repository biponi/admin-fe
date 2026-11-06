import {
  Package,
  PackagePlus,
  ShoppingBag,
  RotateCcw,
  XCircle,
  AlignCenter,
  AlertTriangle,
  ArrowLeftRight,
  Bookmark,
  Undo2,
  History,
} from "lucide-react";
import { format } from "date-fns";
import { TimelineEvent } from "../../../api/stockTimeline";

export const NODE_STYLES: Record<string, string> = {
  creation: "bg-slate-700",
  purchase: "bg-emerald-600",
  sale: "bg-indigo-600",
  return: "bg-amber-500",
  cancellation: "bg-rose-600",
  adjustment: "bg-violet-600",
  restock: "bg-emerald-500",
  damage: "bg-red-600",
  transfer: "bg-sky-600",
  reservation: "bg-slate-500",
  release: "bg-teal-600",
};

export const getEventIcon = (movementType?: string, size = "h-4 w-4") => {
  switch (movementType) {
    case "creation":
      return <Package className={size} />;
    case "purchase":
      return <PackagePlus className={size} />;
    case "sale":
      return <ShoppingBag className={size} />;
    case "return":
      return <RotateCcw className={size} />;
    case "cancellation":
      return <XCircle className={size} />;
    case "adjustment":
      return <AlignCenter className={size} />;
    case "restock":
      return <PackagePlus className={size} />;
    case "damage":
      return <AlertTriangle className={size} />;
    case "transfer":
      return <ArrowLeftRight className={size} />;
    case "reservation":
      return <Bookmark className={size} />;
    case "release":
      return <Undo2 className={size} />;
    default:
      return <History className={size} />;
  }
};

export const getBadgeVariant = (
  movementType?: string,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (movementType) {
    case "sale":
    case "purchase":
    case "restock":
      return "default";
    case "return":
    case "adjustment":
    case "release":
      return "secondary";
    case "cancellation":
    case "damage":
      return "destructive";
    default:
      return "outline";
  }
};

// soft background per action type (for the action label badge)
export const ACTION_BADGE: Record<string, string> = {
  creation: "bg-slate-200 text-slate-800 border-slate-300",
  purchase: "bg-emerald-100 text-emerald-800 border-emerald-200",
  sale: "bg-indigo-100 text-indigo-800 border-indigo-200",
  return: "bg-amber-100 text-amber-800 border-amber-200",
  cancellation: "bg-rose-100 text-rose-800 border-rose-200",
  adjustment: "bg-violet-100 text-violet-800 border-violet-200",
  restock: "bg-teal-100 text-teal-800 border-teal-200",
  damage: "bg-red-100 text-red-800 border-red-200",
  transfer: "bg-sky-100 text-sky-800 border-sky-200",
  reservation: "bg-slate-100 text-slate-700 border-slate-200",
  release: "bg-cyan-100 text-cyan-800 border-cyan-200",
};

// solid color per action type (for the quantity-after badge)
export const ACTION_SOLID: Record<string, string> = {
  creation: "bg-slate-700 text-white border-slate-700",
  purchase: "bg-emerald-600 text-white border-emerald-600",
  sale: "bg-indigo-600 text-white border-indigo-600",
  return: "bg-amber-500 text-white border-amber-500",
  cancellation: "bg-rose-600 text-white border-rose-600",
  adjustment: "bg-violet-600 text-white border-violet-600",
  restock: "bg-teal-600 text-white border-teal-600",
  damage: "bg-red-600 text-white border-red-600",
  transfer: "bg-sky-600 text-white border-sky-600",
  reservation: "bg-slate-500 text-white border-slate-500",
  release: "bg-cyan-600 text-white border-cyan-600",
};

export const changePillClass = (change?: number | null) => {
  if (change === null || change === undefined || change === 0)
    return "bg-slate-100 text-slate-600 border-slate-200";
  return change > 0
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-rose-50 text-rose-700 border-rose-200";
};

export const formatChange = (change?: number | null) => {
  if (change === null || change === undefined) return "0";
  return `${change > 0 ? "+" : ""}${change}`;
};

export const dayLabel = (date: Date) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(date, today)) return "Today";
  if (sameDay(date, yesterday)) return "Yesterday";
  return format(date, "EEEE, dd MMMM yyyy");
};

export const groupByDay = (items: TimelineEvent[]) => {
  const groups: { key: string; date: Date; events: TimelineEvent[] }[] = [];
  for (const event of items) {
    const date = new Date(event.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.events.push(event);
    } else {
      groups.push({ key, date, events: [event] });
    }
  }
  return groups;
};

export const TimelineEmptyState = () => (
  <div className='flex flex-col items-center justify-center py-16 px-6 text-center'>
    <div className='h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-4'>
      <History className='h-6 w-6 text-slate-400' />
    </div>
    <p className='text-sm font-medium text-slate-700'>
      No timeline events found
    </p>
    <p className='mt-1 text-xs text-slate-500'>
      Events appear as soon as stock moves (purchases, sales, returns,
      adjustments).
    </p>
  </div>
);
