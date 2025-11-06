import React, { useEffect, useRef } from "react";
import { X, Check, Trash2, Bell, Sparkles, CheckCheck } from "lucide-react";
import { useNotifications } from "./useNotifications";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
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
  const navigate = useNavigate();

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

  // Get notification icon based on topic
  const getTopicIcon = (
    topic: string
  ): { emoji: string; bg: string; ring: string } => {
    const icons: Record<string, { emoji: string; bg: string; ring: string }> = {
      order_created: {
        emoji: "🛒",
        bg: "bg-gradient-to-br from-blue-500 to-blue-600",
        ring: "ring-blue-200",
      },
      order_status_changed: {
        emoji: "📦",
        bg: "bg-gradient-to-br from-indigo-500 to-indigo-600",
        ring: "ring-indigo-200",
      },
      courier_shipped: {
        emoji: "🚚",
        bg: "bg-gradient-to-br from-purple-500 to-purple-600",
        ring: "ring-purple-200",
      },
      courier_delivered: {
        emoji: "✅",
        bg: "bg-gradient-to-br from-green-500 to-green-600",
        ring: "ring-green-200",
      },
      payment_received: {
        emoji: "💰",
        bg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
        ring: "ring-emerald-200",
      },
      payment_failed: {
        emoji: "❌",
        bg: "bg-gradient-to-br from-red-500 to-red-600",
        ring: "ring-red-200",
      },
      low_stock: {
        emoji: "⚠️",
        bg: "bg-gradient-to-br from-yellow-500 to-yellow-600",
        ring: "ring-yellow-200",
      },
      user_registered: {
        emoji: "👤",
        bg: "bg-gradient-to-br from-cyan-500 to-cyan-600",
        ring: "ring-cyan-200",
      },
      system_alert: {
        emoji: "🔔",
        bg: "bg-gradient-to-br from-orange-500 to-orange-600",
        ring: "ring-orange-200",
      },
      custom: {
        emoji: "📨",
        bg: "bg-gradient-to-br from-gray-500 to-gray-600",
        ring: "ring-gray-200",
      },
      new_ticket: {
        emoji: "🎫",
        bg: "bg-gradient-to-br from-pink-500 to-pink-600",
        ring: "ring-pink-200",
      },
      new_message: {
        emoji: "💬",
        bg: "bg-gradient-to-br from-violet-500 to-violet-600",
        ring: "ring-violet-200",
      },
      ticket_assigned: {
        emoji: "👥",
        bg: "bg-gradient-to-br from-teal-500 to-teal-600",
        ring: "ring-teal-200",
      },
      ticket_transferred: {
        emoji: "↔️",
        bg: "bg-gradient-to-br from-sky-500 to-sky-600",
        ring: "ring-sky-200",
      },
      agent_requested: {
        emoji: "🆘",
        bg: "bg-gradient-to-br from-rose-500 to-rose-600",
        ring: "ring-rose-200",
      },
    };
    return (
      icons[topic] || {
        emoji: "📨",
        bg: "bg-gradient-to-br from-gray-500 to-gray-600",
        ring: "ring-gray-200",
      }
    );
  };

  // Get priority badge color
  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      low: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300",
      normal:
        "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border border-blue-300",
      high: "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 border border-orange-300",
      urgent:
        "bg-gradient-to-r from-red-100 to-red-200 text-red-700 border border-red-300 animate-pulse",
    };
    return colors[priority] || colors.normal;
  };

  // Handle notification click
  const handleNotificationClick = (notification: any) => {
    if (!notification.read && !notification.recipients?.[0]?.read) {
      markAsRead(notification._id);
    }

    // Navigate if action URL exists
    if (notification.actionUrl) {
      navigate(notification.actionUrl ?? "/notifications");
      onClose();
    }

    // Navigate based on topic
    if (notification.data?.ticketId) {
      navigate(`/chat?ticket=${notification.data.ticketId}`);
      onClose();
    }
  };

  return (
    <div
      ref={panelRef}
      className=' absolute right-4 top-16 w-96 bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200/50 z-[9999] overflow-hidden backdrop-blur-sm animate-in slide-in-from-top-2 duration-300'>
      {/* Header with gradient */}
      <div className='relative flex items-center justify-between p-5 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50'>
        <div className='flex items-center gap-2'>
          <div className='p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg'>
            <Bell size={18} className='text-white' />
          </div>
          <div>
            <h3 className='text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
              Notifications
            </h3>
            {notifications.length > 0 && (
              <p className='text-xs text-gray-500'>
                {
                  notifications.filter(
                    (n) => !n.read && !n.recipients?.[0]?.read
                  ).length
                }{" "}
                unread
              </p>
            )}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {notifications.length > 0 && (
            <Button
              onClick={markAllAsRead}
              variant='ghost'
              size='sm'
              className='text-xs h-8 px-3 rounded-lg hover:bg-white/80 transition-all duration-200 flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-700'>
              <CheckCheck size={14} />
              Mark all read
            </Button>
          )}
          <button
            onClick={onClose}
            className='p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-lg transition-all duration-200'
            aria-label='Close'>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <ScrollArea className='h-96'>
        <div ref={scrollRef} onScroll={handleScroll} className='max-h-96'>
          {notifications.length === 0 && !loading && (
            <div className='p-12 text-center'>
              <div className='relative inline-block'>
                <div className='absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-2xl opacity-50 animate-pulse'></div>
                <div className='relative p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full shadow-lg'>
                  <Bell size={48} className='text-gray-400' />
                </div>
              </div>
              <p className='mt-4 text-gray-600 font-medium'>
                No notifications yet
              </p>
              <p className='text-sm text-gray-400 mt-1'>
                We'll notify you when something arrives
              </p>
            </div>
          )}

          {notifications.map((notification, index) => {
            const isUnread =
              !notification.recipients?.[0]?.read && !notification.read;
            const iconData = getTopicIcon(notification.topic);

            return (
              <div
                key={notification._id}
                className={cn(
                  "group relative p-4 border-b border-gray-100/50 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300 cursor-pointer",
                  isUnread &&
                    "bg-gradient-to-r from-blue-50/30 to-purple-50/30 border-l-4 border-l-blue-500",
                  "animate-in fade-in slide-in-from-right-2"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleNotificationClick(notification)}>
                {/* Unread indicator */}
                {isUnread && (
                  <div className='absolute top-4 left-0 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse'></div>
                )}

                <div className='flex items-start gap-4'>
                  {/* Icon with gradient background */}
                  <div className='flex-shrink-0 relative'>
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl shadow-md flex items-center justify-center text-xl transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg",
                        iconData.bg
                      )}>
                      <div className='relative z-10'>{iconData.emoji}</div>
                    </div>
                    {isUnread && (
                      <div className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse'></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className='flex-1 min-w-0'>
                    {/* Title & Priority */}
                    <div className='flex items-start justify-between gap-2 mb-1.5'>
                      <h4
                        className={cn(
                          "text-sm font-semibold truncate transition-colors",
                          isUnread ? "text-gray-900" : "text-gray-700"
                        )}>
                        {notification.subject}
                      </h4>
                      {notification.priority &&
                        notification.priority !== "normal" && (
                          <Badge
                            variant='secondary'
                            className={cn(
                              "px-2.5 py-0.5 text-xs font-semibold rounded-full shadow-sm",
                              getPriorityColor(notification.priority)
                            )}>
                            {notification.priority.toUpperCase()}
                          </Badge>
                        )}
                    </div>

                    {/* Message */}
                    <p className='text-sm text-gray-600 mb-2.5 line-clamp-2 leading-relaxed'>
                      {notification.message}
                    </p>

                    {/* Footer */}
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs text-gray-400 font-medium'>
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                            }
                          )}
                        </span>
                      </div>

                      {/* Actions */}
                      <div
                        className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                        onClick={(e) => e.stopPropagation()}>
                        {isUnread && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification._id);
                            }}
                            className='p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all duration-200'
                            aria-label='Mark as read'
                            title='Mark as read'>
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                          className='p-1.5 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-200'
                          aria-label='Delete'
                          title='Delete'>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Action Link */}
                    {notification.actionUrl && notification.actionText && (
                      <div className='mt-3 pt-2 border-t border-gray-100'>
                        <span className='inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium group-hover:gap-2 transition-all duration-200'>
                          {notification.actionText}
                          <span className='text-lg'>→</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className='p-8 text-center'>
              <div className='relative inline-block'>
                <div className='animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600 mx-auto'></div>
                <div className='absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 blur-lg opacity-30 animate-pulse'></div>
              </div>
              <p className='mt-3 text-sm text-gray-500 font-medium'>
                Loading more...
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer with gradient */}
      {notifications.length > 0 && (
        <div className='relative p-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-white text-center'>
          <button
            onClick={() => {
              navigate("/notifications");
              onClose();
            }}
            className='relative inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 group overflow-hidden'>
            <span className='absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300'></span>
            <span className='relative z-10'>View All Notifications</span>
            <Sparkles
              size={16}
              className='relative z-10 group-hover:rotate-12 transition-transform duration-300'
            />
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
