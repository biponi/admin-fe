import React, { useEffect, useRef } from "react";
import { X, Check, Trash2, Bell } from "lucide-react";
import { useNotifications } from "./useNotifications";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

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
  const getTopicIcon = (topic: string): string => {
    const icons: Record<string, string> = {
      order_created: "🛒",
      order_status_changed: "📦",
      courier_shipped: "🚚",
      courier_delivered: "✅",
      payment_received: "💰",
      payment_failed: "❌",
      low_stock: "⚠️",
      user_registered: "👤",
      system_alert: "🔔",
      custom: "📨",
      new_ticket: "🎫",
      new_message: "💬",
      ticket_assigned: "👥",
      ticket_transferred: "↔️",
      agent_requested: "🆘",
    };
    return icons[topic] || "📨";
  };

  // Get priority badge color
  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      low: "bg-gray-100 text-gray-800",
      normal: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
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
      className='absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-gray-200'>
        <h3 className='text-lg font-semibold text-gray-900'>Notifications</h3>
        <div className='flex items-center gap-2'>
          {notifications.length > 0 && (
            <Button
              onClick={markAllAsRead}
              variant='ghost'
              size='sm'
              className='text-xs h-7 px-2'>
              Mark all read
            </Button>
          )}
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600'
            aria-label='Close'>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <ScrollArea className='h-96'>
        <div ref={scrollRef} onScroll={handleScroll} className='max-h-96'>
          {notifications.length === 0 && !loading && (
            <div className='p-8 text-center text-gray-500'>
              <Bell size={48} className='mx-auto mb-2 text-gray-300' />
              <p>No notifications yet</p>
            </div>
          )}

          {notifications.map((notification) => {
            const isUnread =
              !notification.recipients?.[0]?.read && !notification.read;

            return (
              <div
                key={notification._id}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                  isUnread ? "bg-blue-50" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}>
                <div className='flex items-start gap-3'>
                  {/* Icon */}
                  <div className='flex-shrink-0 text-2xl'>
                    {getTopicIcon(notification.topic)}
                  </div>

                  {/* Content */}
                  <div className='flex-1 min-w-0'>
                    {/* Title & Priority */}
                    <div className='flex items-start justify-between gap-2 mb-1'>
                      <h4 className='text-sm font-semibold text-gray-900 truncate'>
                        {notification.subject}
                      </h4>
                      {notification.priority &&
                        notification.priority !== "normal" && (
                          <Badge
                            variant='secondary'
                            className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityColor(
                              notification.priority
                            )}`}>
                            {notification.priority}
                          </Badge>
                        )}
                    </div>

                    {/* Message */}
                    <p className='text-sm text-gray-600 mb-2 line-clamp-2'>
                      {notification.message}
                    </p>

                    {/* Footer */}
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-gray-400'>
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </span>

                      {/* Actions */}
                      <div
                        className='flex items-center gap-2'
                        onClick={(e) => e.stopPropagation()}>
                        {isUnread && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification._id);
                            }}
                            className='p-1 text-blue-600 hover:text-blue-800'
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
                          className='p-1 text-red-600 hover:text-red-800'
                          aria-label='Delete'
                          title='Delete'>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Action Link */}
                    {notification.actionUrl && notification.actionText && (
                      <div className='mt-2'>
                        <span className='text-sm text-blue-600 hover:text-blue-800 font-medium'>
                          {notification.actionText} →
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className='p-4 text-center text-gray-500'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className='p-3 border-t border-gray-200 text-center'>
          <button
            onClick={() => {
              navigate("/notifications");
              onClose();
            }}
            className='text-sm text-blue-600 hover:text-blue-800 font-medium'>
            View All Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
