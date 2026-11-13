import React, { useEffect, useRef } from "react";
import {
  X,
  Check,
  Trash2,
  Bell,
  CheckCheck,
  Inbox,
  ArrowRight,
} from "lucide-react";
import { useNotifications } from "./useNotifications";
import { getTopicStyle, PRIORITY_STYLES } from "./notificationTopics";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** When provided, the panel is fixed-positioned (e.g. portaled to body by
   * NotificationBell) instead of absolutely positioned under a relative
   * parent — avoids being clipped by containers with overflow-hidden. */
  fixedPosition?: { top: number; right: number };
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  fixedPosition,
}) => {
  const {
    notifications,
    loading,
    hasMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
  } = useNotifications();

  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Infinite scroll
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

      if (
        scrollTop + clientHeight >= scrollHeight - 20 &&
        hasMore &&
        !loading
      ) {
        loadMore();
      }
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }

    if (notification.data?.ticketId) {
      window.location.href = `/chat?ticket=${notification.data.ticketId}`;
      onClose();
      return;
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
      onClose();
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={panelRef}
      className={cn(
        "w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200",
        fixedPosition ? "fixed" : "absolute right-0 top-12"
      )}
      style={fixedPosition ? { top: fixedPosition.top, right: fixedPosition.right } : undefined}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#141413] shrink-0">
          <Bell className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[#141413] leading-tight">
            Notifications
          </h3>
          <p className="text-[11px] text-slate-400">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "You're all caught up"}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px] rounded-md text-slate-500 hover:text-[#141413] gap-1">
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 rounded-md text-slate-400 hover:text-[#141413]"
            aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notification List */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="max-h-96 overflow-y-auto bg-white">
        {notifications.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100">
              <Inbox className="h-5 w-5 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-medium text-[#141413]">
                No notifications yet
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                We'll notify you when something arrives
              </p>
            </div>
          </div>
        )}

        {notifications.map((notification) => {
          const isUnread = !notification.read;
          const { icon: TopicIcon, tile } = getTopicStyle(notification.topic);
          const priorityClass = PRIORITY_STYLES[notification.priority];

          return (
            <div
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={cn(
                "group relative flex items-start gap-3 px-4 py-3 border-b border-slate-100 cursor-pointer transition-colors last:border-b-0",
                isUnread ? "bg-white" : "bg-white hover:bg-slate-50"
              )}>
              {/* Topic icon tile */}
              <div
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg border border-slate-100 shrink-0",
                  tile
                )}>
                <TopicIcon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={cn(
                      "text-[13px] truncate",
                      isUnread
                        ? "font-semibold text-[#141413]"
                        : "font-medium text-slate-600"
                    )}>
                    {notification.subject}
                  </p>
                  {notification.priority &&
                    notification.priority !== "normal" &&
                    priorityClass && (
                      <span
                        className={cn(
                          "shrink-0 inline-flex items-center px-1.5 py-px rounded border text-[10px] font-semibold uppercase tracking-wide",
                          priorityClass
                        )}>
                        {notification.priority}
                      </span>
                    )}
                </div>

                <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {notification.message}
                </p>

                <div className="flex items-center gap-1.5 mt-1.5">
                  {isUnread && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  )}
                  <span className="text-[11px] text-slate-400">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  {notification.actionUrl && notification.actionText && (
                    <>
                      <span className="text-[11px] text-slate-300">·</span>
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[#141413] group-hover:gap-1 transition-all">
                        {notification.actionText}
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Row actions */}
              <div
                className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={(e) => e.stopPropagation()}>
                {isUnread && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification._id);
                    }}
                    className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    aria-label="Mark as read"
                    title="Mark as read">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification._id);
                  }}
                  className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  aria-label="Delete"
                  title="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="px-4 py-3 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-slate-200 border-t-slate-400 animate-spin" />
            <span className="text-[11px] text-slate-400">
              Loading more...
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-200 bg-white">
          <Button
            onClick={() => {
              window.location.href = "/notifications";
              onClose();
            }}
            size="sm"
            className="w-full h-8 bg-[#141413] hover:bg-[#2a2a2a] text-white rounded-md text-[12px] font-medium">
            View all notifications
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
