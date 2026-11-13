// Detail dialog shown when a notification is clicked on the notifications
// page. Follows the aiSeo modal design language (StreamingAIModal): warm
// paper background, dark header tile, uppercase section labels, slate borders.
import { format } from "date-fns";
import {
  ArrowRight,
  CalendarDays,
  Flag,
  MessageSquareText,
  Tag,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { getTopicStyle } from "../../notification/notificationTopics";
import { cn } from "../../lib/utils";

export interface NotificationDetail {
  _id: string;
  subject?: string;
  message?: string;
  topic: string;
  data?: Record<string, any>;
  createdAt: string;
  read?: boolean;
  priority?: string;
  actionUrl?: string;
  actionText?: string;
}

interface NotificationDetailModalProps {
  notification: NotificationDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: (url: string) => void;
}

// Payload keys that are internal plumbing, not useful detail rows
const HIDDEN_DATA_KEYS = new Set(["notificationId", "topic"]);

// snake_case data keys → readable labels (Order number → "Order Number")
const DATA_LABELS: Record<string, string> = {
  ticketId: "Ticket ID",
  orderId: "Order ID",
  orderNumber: "Order Number",
  productId: "Product ID",
  customerId: "Customer ID",
  userId: "User ID",
  amount: "Amount",
  courierName: "Courier",
  trackingCode: "Tracking Code",
  consignmentId: "Consignment ID",
  previousStatus: "Previous Status",
  newStatus: "New Status",
  status: "Status",
  stock: "Stock",
  productName: "Product",
};

function dataLabel(key: string): string {
  if (DATA_LABELS[key]) return DATA_LABELS[key];
  return key
    .replace(/[_-]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value == null || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

export default function NotificationDetailModal({
  notification,
  open,
  onOpenChange,
  onNavigate,
}: NotificationDetailModalProps) {
  if (!notification) return null;

  const { icon: TopicIcon, tile, label } = getTopicStyle(notification.topic);
  const dataEntries = Object.entries(notification.data || {}).filter(
    ([key, value]) =>
      !HIDDEN_DATA_KEYS.has(key) && value != null && value !== ""
  );

  const handleAction = () => {
    if (!notification.actionUrl) return;
    onOpenChange(false);
    if (notification.data?.ticketId) {
      onNavigate?.(`/chat?ticket=${notification.data.ticketId}`);
      return;
    }
    onNavigate?.(notification.actionUrl);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white border-slate-200 p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-slate-200">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex items-center justify-center w-9 h-9 rounded-lg border border-slate-100 shrink-0",
                tile
              )}>
              <TopicIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-sm font-semibold text-[#141413] leading-snug break-words">
                {notification.subject || label}
              </DialogTitle>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {label} ·{" "}
                {format(new Date(notification.createdAt), "MMM d, yyyy h:mm a")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-7 w-7 p-0 rounded-md text-slate-400 hover:text-[#141413] shrink-0"
              aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto space-y-4">
          {/* Message */}
          {notification.message && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <MessageSquareText className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Message
                </span>
              </div>
              <div className="text-[13px] text-[#141413] leading-relaxed bg-white border border-slate-200 rounded-md p-3 whitespace-pre-wrap break-words">
                {notification.message}
              </div>
            </div>
          )}

          {/* Details grid from payload */}
          {(dataEntries.length > 0 || notification.priority) && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Details
                </span>
              </div>
              <div className="rounded-md border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
                {notification.priority && (
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-[12px] text-slate-400 flex items-center gap-1.5">
                      <Flag className="h-3 w-3" />
                      Priority
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center px-1.5 py-px rounded border text-[10px] font-semibold uppercase tracking-wide",
                        notification.priority === "urgent" &&
                          "bg-red-50 text-red-700 border-red-200",
                        notification.priority === "high" &&
                          "bg-amber-50 text-amber-700 border-amber-200",
                        notification.priority === "low" &&
                          "bg-slate-100 text-slate-500 border-slate-200",
                        notification.priority === "normal" &&
                          "bg-slate-100 text-slate-500 border-slate-200"
                      )}>
                      {notification.priority}
                    </span>
                  </div>
                )}
                {dataEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-start justify-between gap-4 px-3 py-2">
                    <span className="text-[12px] text-slate-400 shrink-0">
                      {dataLabel(key)}
                    </span>
                    <span className="text-[12px] text-[#141413] font-medium text-right break-all">
                      {formatValue(value)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-[12px] text-slate-400 flex items-center gap-1.5">
                    <CalendarDays className="h-3 w-3" />
                    Received
                  </span>
                  <span className="text-[12px] text-[#141413] font-medium text-right">
                    {format(
                      new Date(notification.createdAt),
                      "MMM d, yyyy h:mm a"
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {notification.read ? "Read" : "Marked as read"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 rounded-md border-slate-300 text-slate-600 hover:bg-slate-50 text-[12px]">
              Close
            </Button>
            {notification.actionUrl && (
              <Button
                size="sm"
                onClick={handleAction}
                className="h-8 rounded-md bg-[#141413] hover:bg-[#2a2a2a] text-white gap-1.5 text-[12px]">
                {notification.actionText || "View details"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
