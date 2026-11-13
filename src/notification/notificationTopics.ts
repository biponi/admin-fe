// Shared notification topic styling — single source for both the bell popup
// and the notifications page. Follows the aiSeo design language: subtle
// tinted tiles (bg-*-50 / text-*-600) instead of loud gradients.
import {
  ShoppingCart,
  Package,
  Truck,
  PackageCheck,
  Banknote,
  XCircle,
  TriangleAlert,
  UserPlus,
  BellRing,
  Bell,
  Ticket,
  MessageSquare,
  Users,
  ArrowLeftRight,
  LifeBuoy,
  Undo2,
  BadgeCheck,
  Ban,
  PackageOpen,
  PackageSearch,
  Receipt,
  ClipboardList,
  ClipboardCheck,
  ClipboardX,
  Timer,
  type LucideIcon,
} from "lucide-react";

export interface NotificationTopicStyle {
  icon: LucideIcon;
  /** Tile classes for the rounded icon container. */
  tile: string;
  /** Label shown in filters/badges (human-readable topic name). */
  label: string;
}

const TOPICS: Record<string, NotificationTopicStyle> = {
  order_created: {
    icon: ShoppingCart,
    tile: "bg-blue-50 text-blue-600",
    label: "Order Created",
  },
  order_status_changed: {
    icon: Package,
    tile: "bg-indigo-50 text-indigo-600",
    label: "Order Status",
  },
  order_returned: {
    icon: Undo2,
    tile: "bg-amber-50 text-amber-600",
    label: "Order Returned",
  },
  order_confirmed: {
    icon: BadgeCheck,
    tile: "bg-blue-50 text-blue-600",
    label: "Order Confirmed",
  },
  order_cancelled: {
    icon: Ban,
    tile: "bg-red-50 text-red-600",
    label: "Order Cancelled",
  },
  package_shipping: {
    icon: PackageOpen,
    tile: "bg-purple-50 text-purple-600",
    label: "Packaging",
  },
  package_status: {
    icon: PackageSearch,
    tile: "bg-fuchsia-50 text-fuchsia-600",
    label: "Package Status",
  },
  commission_status: {
    icon: Receipt,
    tile: "bg-emerald-50 text-emerald-600",
    label: "Commission",
  },
  operation_request_created: {
    icon: ClipboardList,
    tile: "bg-sky-50 text-sky-600",
    label: "Request Created",
  },
  operation_request_approved: {
    icon: ClipboardCheck,
    tile: "bg-green-50 text-green-600",
    label: "Request Approved",
  },
  operation_request_rejected: {
    icon: ClipboardX,
    tile: "bg-red-50 text-red-600",
    label: "Request Rejected",
  },
  operation_request_cancelled: {
    icon: XCircle,
    tile: "bg-orange-50 text-orange-600",
    label: "Request Cancelled",
  },
  operation_request_timeout: {
    icon: Timer,
    tile: "bg-yellow-50 text-yellow-600",
    label: "Request Timed Out",
  },
  courier_shipped: {
    icon: Truck,
    tile: "bg-purple-50 text-purple-600",
    label: "Shipped",
  },
  courier_delivered: {
    icon: PackageCheck,
    tile: "bg-green-50 text-green-600",
    label: "Delivered",
  },
  payment_received: {
    icon: Banknote,
    tile: "bg-emerald-50 text-emerald-600",
    label: "Payment Received",
  },
  payment_failed: {
    icon: XCircle,
    tile: "bg-red-50 text-red-600",
    label: "Payment Failed",
  },
  low_stock: {
    icon: TriangleAlert,
    tile: "bg-amber-50 text-amber-600",
    label: "Low Stock",
  },
  user_registered: {
    icon: UserPlus,
    tile: "bg-cyan-50 text-cyan-600",
    label: "New User",
  },
  system_alert: {
    icon: BellRing,
    tile: "bg-orange-50 text-orange-600",
    label: "System Alert",
  },
  new_ticket: {
    icon: Ticket,
    tile: "bg-pink-50 text-pink-600",
    label: "New Ticket",
  },
  new_message: {
    icon: MessageSquare,
    tile: "bg-violet-50 text-violet-600",
    label: "New Message",
  },
  ticket_assigned: {
    icon: Users,
    tile: "bg-teal-50 text-teal-600",
    label: "Ticket Assigned",
  },
  ticket_transferred: {
    icon: ArrowLeftRight,
    tile: "bg-sky-50 text-sky-600",
    label: "Ticket Transferred",
  },
  agent_requested: {
    icon: LifeBuoy,
    tile: "bg-rose-50 text-rose-600",
    label: "Agent Requested",
  },
  custom: {
    icon: Bell,
    tile: "bg-slate-100 text-slate-500",
    label: "Custom",
  },
};

const FALLBACK = TOPICS.custom;

export function getTopicStyle(topic: string): NotificationTopicStyle {
  return TOPICS[topic] || FALLBACK;
}

/** Compact priority badge classes — only non-normal priorities get a badge. */
export const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-slate-100 text-slate-500 border-slate-200",
  high: "bg-amber-50 text-amber-700 border-amber-200",
  urgent: "bg-red-50 text-red-700 border-red-200",
};
