import React, { useState } from "react";
import { Plus, Bell, BellOff, Trash2, CheckCheck, Filter } from "lucide-react";
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
      low: "bg-gray-100 text-gray-800 border-gray-300",
      normal: "bg-blue-100 text-blue-800 border-blue-300",
      high: "bg-orange-100 text-orange-800 border-orange-300",
      urgent: "bg-red-100 text-red-800 border-red-300",
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
    <div className='container mx-auto py-6 px-4 max-w-7xl'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Notifications</h1>
          <p className='text-gray-500 mt-1'>
            Manage and view all your notifications
          </p>
        </div>
        <div className='flex gap-2'>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant='outline'
              className='flex items-center gap-2'>
              <CheckCheck className='h-4 w-4' />
              Mark All Read
            </Button>
          )}
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className='flex items-center gap-2'>
            <Plus className='h-4 w-4' />
            Create Notification
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Total Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{notifications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Unread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-blue-600'>
              {unreadCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              Read
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold text-green-600'>
              {notifications.length - unreadCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <Card>
        <CardHeader>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as any)}
              className='w-full sm:w-auto'>
              <TabsList>
                <TabsTrigger value='all' className='flex items-center gap-2'>
                  <Bell className='h-4 w-4' />
                  All ({notifications.length})
                </TabsTrigger>
                <TabsTrigger value='unread' className='flex items-center gap-2'>
                  <Bell className='h-4 w-4' />
                  Unread ({unreadCount})
                </TabsTrigger>
                <TabsTrigger value='read' className='flex items-center gap-2'>
                  <BellOff className='h-4 w-4' />
                  Read ({notifications.length - unreadCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Topic Filter */}
            <div className='flex items-center gap-2'>
              <Filter className='h-4 w-4 text-gray-500' />
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className='border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'>
                <option value='all'>All Topics</option>
                {uniqueTopics.map((topic) => (
                  <option key={topic} value={topic}>
                    {getTopicIcon(topic)} {topic.replace(/_/g, " ")}
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
              <div className='flex justify-center items-center py-12'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
              </div>
            ) : displayNotifications.length === 0 ? (
              <div className='text-center py-12'>
                <Bell className='h-16 w-16 text-gray-300 mx-auto mb-4' />
                <h3 className='text-lg font-semibold text-gray-600 mb-2'>
                  No notifications found
                </h3>
                <p className='text-gray-500'>
                  {activeTab === "unread"
                    ? "You're all caught up!"
                    : activeTab === "read"
                    ? "No read notifications yet"
                    : "No notifications to display"}
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                {displayNotifications.map((notification) => {
                  const isUnread =
                    !notification.read && !notification.recipients?.[0]?.read;

                  return (
                    <div
                      key={notification._id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                        isUnread
                          ? "bg-blue-50 border-blue-200"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => handleNotificationClick(notification)}>
                      <div className='flex items-start gap-4'>
                        {/* Icon */}
                        <div className='flex-shrink-0 text-3xl'>
                          {getTopicIcon(notification.topic)}
                        </div>

                        {/* Content */}
                        <div className='flex-1 min-w-0'>
                          {/* Header */}
                          <div className='flex items-start justify-between gap-2 mb-2'>
                            <div className='flex-1'>
                              <h3 className='text-base font-semibold text-gray-900 mb-1'>
                                {notification.subject}
                                {isUnread && (
                                  <span className='ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full'></span>
                                )}
                              </h3>
                              <div className='flex flex-wrap items-center gap-2'>
                                <Badge variant='outline' className='text-xs'>
                                  {notification.topic.replace(/_/g, " ")}
                                </Badge>
                                {notification.priority &&
                                  notification.priority !== "normal" && (
                                    <Badge
                                      variant='outline'
                                      className={`text-xs ${getPriorityColor(
                                        notification.priority
                                      )}`}>
                                      {notification.priority}
                                    </Badge>
                                  )}
                                <span className='text-xs text-gray-500'>
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
                            <div className='flex items-center gap-1'>
                              {isUnread && (
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification._id);
                                  }}
                                  className='h-8 w-8 p-0'
                                  title='Mark as read'>
                                  <CheckCheck className='h-4 w-4' />
                                </Button>
                              )}
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (prompt("Delete this notification?")) {
                                    deleteNotification(notification._id);
                                  }
                                }}
                                className='h-8 w-8 p-0 text-red-600 hover:text-red-700'
                                title='Delete'>
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          </div>

                          {/* Message */}
                          <p className='text-sm text-gray-600 mb-2'>
                            {notification.message}
                          </p>

                          {/* Action URL */}
                          {notification.actionUrl && (
                            <Button
                              variant='link'
                              className='h-auto p-0 text-blue-600 text-sm'
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = notification.actionUrl!;
                              }}>
                              {notification.actionText || "View Details"} →
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Loading more indicator */}
                {loading && notifications.length > 0 && (
                  <div className='flex justify-center py-4'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                  </div>
                )}

                {/* No more notifications */}
                {!hasMore && displayNotifications.length > 0 && (
                  <div className='text-center py-4 text-gray-500 text-sm'>
                    No more notifications
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
