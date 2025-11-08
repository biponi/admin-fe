import React, { useState } from "react";
import {
  Plus,
  Bell,
  BellOff,
  Trash2,
  CheckCheck,
  Filter,
  Check,
} from "lucide-react";
import { useNotifications } from "../../notification/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

import { ScrollArea } from "../../components/ui/scroll-area";
import CreateNotificationModal from "./CreateNotificationModal";
import { cn } from "../../lib/utils";
import { hasPagePermission } from "../../utils/helperFunction";
import { useSelector } from "react-redux";

const NotificationPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    fetchNotifications,
  } = useNotifications();
  const userState = useSelector((state: any) => state?.user);

  const [activeTab, setActiveTab] = useState<"all" | "unread" | "read">("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notification) => {
    const isUnread = !notification.read && !notification.recipients?.[0]?.read;

    if (activeTab === "unread") return isUnread;
    if (activeTab === "read") return !isUnread;
    return true; // 'all' tab
  });

  // Further filter by topic
  const displayNotifications =
    selectedTopic === "all"
      ? filteredNotifications
      : filteredNotifications.filter((n) => n.topic === selectedTopic);

  // Get unique topics from notifications
  const uniqueTopics = Array.from(new Set(notifications.map((n) => n.topic)));

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
      low: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300",
      normal:
        "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-300",
      high: "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 border-orange-300",
      urgent:
        "bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-red-300 animate-pulse",
    };
    return colors[priority] || colors.normal;
  };

  // Handle notification click
  const handleNotificationClick = (notification: any) => {
    if (!notification.read && !notification.recipients?.[0]?.read) {
      markAsRead(notification._id);
    }
  };

  // Handle scroll for infinite loading
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore && !loading) {
      loadMore();
    }
  };

  return (
    <div className='container mx-auto py-8 px-4 max-w-7xl'>
      {/* Header with gradient */}
      <div className='relative mb-8 p-8 rounded-3xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-gray-200/50 shadow-lg overflow-hidden'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl opacity-30 -mr-32 -mt-32'></div>
        <div className='absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full blur-3xl opacity-30 -ml-32 -mb-32'></div>

        <div className='relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div className='flex items-center gap-4'>
            <div className='p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl'>
              <Bell size={32} className='text-white' />
            </div>
            <div>
              <h1 className='text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                Notifications
              </h1>
              <p className='text-gray-600 mt-1 font-medium'>
                Manage and view all your notifications
              </p>
            </div>
          </div>
          <div className='flex gap-3'>
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant='outline'
                className='flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white border-2 shadow-md hover:shadow-lg transition-all duration-300'>
                <CheckCheck className='h-4 w-4' />
                Mark All Read
              </Button>
            )}
            {hasPagePermission(
              "notifications",
              "create",
              userState?.permissions
            ) && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className='flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300'>
                <Plus className='h-4 w-4' />
                Create Notification
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards with gradients */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <Card className='relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group'>
          <div className='absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50'></div>
          <CardHeader className='pb-3 relative'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-semibold text-gray-600 uppercase tracking-wide'>
                Total Notifications
              </CardTitle>
              <div className='p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300'>
                <Bell size={18} className='text-white' />
              </div>
            </div>
          </CardHeader>
          <CardContent className='relative'>
            <div className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
              {notifications.length}
            </div>
            <p className='text-sm text-gray-500 mt-1'>All time</p>
          </CardContent>
        </Card>

        <Card className='relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group'>
          <div className='absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50'></div>
          <CardHeader className='pb-3 relative'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-semibold text-gray-600 uppercase tracking-wide'>
                Unread
              </CardTitle>
              <div className='p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300'>
                <BellOff size={18} className='text-white' />
              </div>
            </div>
          </CardHeader>
          <CardContent className='relative'>
            <div className='text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
              {unreadCount}
            </div>
            <p className='text-sm text-gray-500 mt-1'>Needs attention</p>
          </CardContent>
        </Card>

        <Card className='relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group'>
          <div className='absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 opacity-50'></div>
          <CardHeader className='pb-3 relative'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-semibold text-gray-600 uppercase tracking-wide'>
                Read
              </CardTitle>
              <div className='p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300'>
                <CheckCheck size={18} className='text-white' />
              </div>
            </div>
          </CardHeader>
          <CardContent className='relative'>
            <div className='text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent'>
              {notifications.length - unreadCount}
            </div>
            <p className='text-sm text-gray-500 mt-1'>Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <Card className='border-0 shadow-xl overflow-hidden'>
        <CardHeader className='bg-gradient-to-r from-gray-50 to-white border-b'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as any)}
              className='w-full sm:w-auto'>
              <TabsList className='bg-white shadow-md border'>
                <TabsTrigger
                  value='all'
                  className='flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white'>
                  <Bell className='h-4 w-4' />
                  All ({notifications.length})
                </TabsTrigger>
                <TabsTrigger
                  value='unread'
                  className='flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white'>
                  <Bell className='h-4 w-4' />
                  Unread ({unreadCount})
                </TabsTrigger>
                <TabsTrigger
                  value='read'
                  className='flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white'>
                  <BellOff className='h-4 w-4' />
                  Read ({notifications.length - unreadCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Topic Filter */}
            <div className='flex items-center gap-2 bg-white rounded-lg shadow-md border px-3 py-2'>
              <Filter className='h-4 w-4 text-gray-500' />
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className='border-none bg-transparent text-sm focus:outline-none focus:ring-0 pr-8'>
                <option value='all'>All Topics</option>
                {uniqueTopics.map((topic) => (
                  <option key={topic} value={topic}>
                    {getTopicIcon(topic).emoji} {topic.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <ScrollArea
            className='h-[calc(100vh-450px)]'
            onScrollCapture={handleScroll}>
            {loading && notifications.length === 0 ? (
              <div className='flex flex-col justify-center items-center py-16'>
                <div className='relative'>
                  <div className='animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600'></div>
                  <div className='absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 blur-lg opacity-30 animate-pulse'></div>
                </div>
                <p className='mt-4 text-gray-600 font-medium'>
                  Loading notifications...
                </p>
              </div>
            ) : displayNotifications.length === 0 ? (
              <div className='text-center py-16'>
                <div className='relative inline-block mb-6'>
                  <div className='absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-2xl opacity-50 animate-pulse'></div>
                  <div className='relative p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full shadow-lg'>
                    <Bell className='h-20 w-20 text-gray-400' />
                  </div>
                </div>
                <h3 className='text-xl font-bold text-gray-700 mb-2'>
                  No notifications found
                </h3>
                <p className='text-gray-500 text-lg'>
                  {activeTab === "unread"
                    ? "You're all caught up! 🎉"
                    : activeTab === "read"
                    ? "No read notifications yet"
                    : "No notifications to display"}
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {displayNotifications.map((notification, index) => {
                  const isUnread =
                    !notification.read && !notification.recipients?.[0]?.read;
                  const iconData = getTopicIcon(notification.topic);

                  return (
                    <div
                      key={notification._id}
                      className={cn(
                        "group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer hover:shadow-lg",
                        isUnread
                          ? "bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-blue-200 shadow-md"
                          : "bg-white border-gray-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white",
                        "animate-in fade-in slide-in-from-bottom-2"
                      )}
                      style={{ animationDelay: `${index * 30}ms` }}
                      onClick={() => handleNotificationClick(notification)}>
                      {/* Unread indicator */}
                      {isUnread && (
                        <div className='absolute top-5 left-0 w-1 h-12 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full'></div>
                      )}

                      <div className='flex items-start gap-5'>
                        {/* Icon with gradient background */}
                        <div className='flex-shrink-0 relative'>
                          <div
                            className={cn(
                              "w-14 h-14 rounded-xl shadow-lg flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl",
                              iconData.bg
                            )}>
                            {iconData.emoji}
                          </div>
                          {isUnread && (
                            <div className='absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-md'></div>
                          )}
                        </div>

                        {/* Content */}
                        <div className='flex-1 min-w-0'>
                          {/* Header */}
                          <div className='flex items-start justify-between gap-3 mb-2'>
                            <div className='flex-1'>
                              <h3
                                className={cn(
                                  "text-base font-bold mb-2 transition-colors",
                                  isUnread ? "text-gray-900" : "text-gray-700"
                                )}>
                                {notification.subject}
                              </h3>
                              <div className='flex flex-wrap items-center gap-2'>
                                <Badge
                                  variant='outline'
                                  className='text-xs font-semibold bg-white/80 backdrop-blur-sm shadow-sm'>
                                  {notification.topic.replace(/_/g, " ")}
                                </Badge>
                                {notification.priority &&
                                  notification.priority !== "normal" && (
                                    <Badge
                                      className={cn(
                                        "text-xs font-semibold border shadow-sm",
                                        getPriorityColor(notification.priority)
                                      )}>
                                      {notification.priority.toUpperCase()}
                                    </Badge>
                                  )}
                                <span className='text-xs text-gray-500 font-medium flex items-center gap-1'>
                                  <span className='w-1 h-1 bg-gray-400 rounded-full'></span>
                                  {formatDistanceToNow(
                                    new Date(notification.createdAt),
                                    {
                                      addSuffix: true,
                                    }
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className='flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                              {isUnread && (
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification._id);
                                  }}
                                  className='h-9 w-9 p-0 hover:bg-blue-100 text-blue-600 rounded-lg transition-all duration-200'
                                  title='Mark as read'>
                                  <Check className='h-4 w-4' />
                                </Button>
                              )}
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (
                                    window.confirm("Delete this notification?")
                                  ) {
                                    deleteNotification(notification._id);
                                  }
                                }}
                                className='h-9 w-9 p-0 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200'
                                title='Delete'>
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          </div>

                          {/* Message */}
                          <p className='text-sm text-gray-600 mb-3 leading-relaxed'>
                            {notification.message}
                          </p>

                          {/* Action URL */}
                          {notification.actionUrl && (
                            <div className='pt-3 border-t border-gray-100'>
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href =
                                    notification.actionUrl!;
                                }}
                                className='inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-semibold group-hover:gap-2 transition-all duration-200 cursor-pointer'>
                                {notification.actionText || "View Details"}
                                <span className='text-lg'>→</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Loading more indicator */}
                {loading && notifications.length > 0 && (
                  <div className='flex flex-col justify-center items-center py-8'>
                    <div className='relative'>
                      <div className='animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600'></div>
                      <div className='absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 blur-lg opacity-30 animate-pulse'></div>
                    </div>
                    <p className='mt-3 text-sm text-gray-600 font-medium'>
                      Loading more...
                    </p>
                  </div>
                )}

                {/* No more notifications */}
                {!hasMore && displayNotifications.length > 0 && (
                  <div className='text-center py-6'>
                    <div className='inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full shadow-sm'>
                      <CheckCheck size={16} className='text-gray-600' />
                      <span className='text-sm text-gray-600 font-medium'>
                        You've reached the end
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Create Notification Modal */}
      <CreateNotificationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchNotifications(1, false);
        }}
      />
    </div>
  );
};

export default NotificationPage;
