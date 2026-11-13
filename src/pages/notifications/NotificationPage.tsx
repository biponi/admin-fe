import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Plus,
  Bell,
  Inbox,
  Trash2,
  CheckCheck,
  Check,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { useNotifications } from "../../notification/useNotifications";
import { getTopicStyle, PRIORITY_STYLES } from "../../notification/notificationTopics";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import CreateNotificationModal from "./CreateNotificationModal";
import NotificationDetailModal, {
  type NotificationDetail,
} from "./NotificationDetailModal";
import { cn } from "../../lib/utils";
import { hasPagePermission } from "../../utils/helperFunction";
import { PageHeader } from "../../components/PageHeader";
import { MobilePage, rippleProps } from "../../components/mobile";

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
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"all" | "unread" | "read">("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [detailNotification, setDetailNotification] =
    useState<NotificationDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const readCount = notifications.length - unreadCount;

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notification) => {
    const isUnread = !notification.read;

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

  // Clicking a row opens the detail modal (and marks it read). Navigation
  // happens from the modal's action button, not the row itself.
  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    setDetailNotification(notification);
    setIsDetailOpen(true);
  };

  // Handle scroll for infinite loading
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore && !loading) {
      loadMore();
    }
  };

  return (
    <MobilePage
      title="Notifications"
      icon={<Bell className="h-5 w-5" />}
      noBottomNav
      actions={
        <>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              aria-label="Mark all as read"
              className="m3-ripple grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary active:scale-95 transition-transform"
              {...rippleProps()}>
              <CheckCheck className="h-5 w-5" />
            </button>
          )}
          {hasPagePermission(
            "notifications",
            "create",
            userState?.permissions
          ) && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              aria-label="Create notification"
              className="m3-ripple grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm active:scale-95 transition-transform"
              {...rippleProps()}>
              <Plus className="h-5 w-5" />
            </button>
          )}
        </>
      }>
    <div className="container mx-auto py-8 px-4 max-w-5xl mobile:pb-[calc(5rem+env(safe-area-inset-bottom))]">
      {/* Header */}
      <PageHeader
        className="mb-6 mobile:hidden"
        icon={<Bell className="h-5 w-5 text-white" />}
        title="Notifications"
        subtitle={
          unreadCount > 0
            ? `${unreadCount} unread of ${notifications.length} total`
            : "You're all caught up"
        }
        count={
          <span className="rounded-md px-2.5 py-1 text-base font-semibold text-slate-500 tabular-nums">
            {notifications.length} total
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                size="sm"
                className="h-8 rounded-md border-slate-300 text-slate-600 hover:bg-slate-50 gap-1.5 text-[12px]">
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}
            {hasPagePermission(
              "notifications",
              "create",
              userState?.permissions
            ) && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                size="sm"
                className="h-8 rounded-md bg-[#141413] hover:bg-[#2a2a2a] text-white gap-1.5 text-[12px]">
                <Plus className="h-3.5 w-3.5" />
                Create notification
              </Button>
            )}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-3 mb-4">
        {[
          {
            label: "Total",
            value: notifications.length,
            tile: "bg-slate-100 text-slate-500",
            Icon: Bell,
          },
          {
            label: "Unread",
            value: unreadCount,
            tile: "bg-emerald-50 text-emerald-600",
            Icon: Inbox,
          },
          {
            label: "Read",
            value: readCount,
            tile: "bg-slate-100 text-slate-400",
            Icon: CheckCheck,
          },
        ].map(({ label, value, tile, Icon }) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {label}
              </p>
              <p className="text-2xl font-semibold text-[#141413] mt-0.5">
                {value}
              </p>
            </div>
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg",
                tile
              )}>
              <Icon className="h-4 w-4" />
            </div>
          </div>
        ))}
      </div>

      {/* List card */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-4 py-3 border-b border-slate-200 bg-[#FAF9F6] md:flex-row md:items-center">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="bg-white border border-slate-200 rounded-md h-8">
              <TabsTrigger
                value="all"
                className="text-[12px] rounded-sm data-[state=active]:bg-[#141413] data-[state=active]:text-white">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="text-[12px] rounded-sm data-[state=active]:bg-[#141413] data-[state=active]:text-white">
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger
                value="read"
                className="text-[12px] rounded-sm data-[state=active]:bg-[#141413] data-[state=active]:text-white">
                Read ({readCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Topic filter */}
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 h-8">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="border-none bg-transparent text-[12px] text-slate-600 focus:outline-none focus:ring-0 pr-6 cursor-pointer">
              <option value="all">All topics</option>
              {uniqueTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {getTopicStyle(topic).label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* List */}
        <div
          className="h-[calc(100vh-420px)] min-h-[320px] overflow-y-auto"
          onScroll={handleScroll}>
          {loading && notifications.length === 0 ? (
            <div>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-4 py-3.5 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2 py-0.5">
                    <div className="h-3 w-1/3 bg-slate-100 rounded animate-pulse" />
                    <div className="h-3 w-2/3 bg-slate-100 rounded animate-pulse" />
                    <div className="h-2.5 w-1/4 bg-slate-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100">
                <Inbox className="h-5 w-5 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-[#141413]">
                  No notifications found
                </p>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  {activeTab === "unread"
                    ? "You're all caught up"
                    : activeTab === "read"
                    ? "No read notifications yet"
                    : "No notifications to display"}
                </p>
              </div>
            </div>
          ) : (
            <div>
              {displayNotifications.map((notification) => {
                const isUnread = !notification.read;
                const { icon: TopicIcon, tile, label } = getTopicStyle(
                  notification.topic
                );
                const priorityClass = notification.priority
                  ? PRIORITY_STYLES[notification.priority]
                  : undefined;

                return (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "group relative flex items-start gap-3 px-4 py-3.5 border-b border-slate-100 cursor-pointer transition-colors last:border-b-0",
                      isUnread ? "bg-[#FAF9F6]" : "bg-white hover:bg-slate-50"
                    )}>
                    {/* Unread rail */}
                    {isUnread && (
                      <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500" />
                    )}

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
                        <span className="shrink-0 text-[11px] text-slate-400">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>

                      <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                        {notification.message}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-1.5 py-px rounded border border-slate-200 bg-slate-50 text-[10px] font-medium text-slate-500">
                          {label}
                        </span>
                        {notification.priority &&
                          notification.priority !== "normal" &&
                          priorityClass && (
                            <span
                              className={cn(
                                "inline-flex items-center px-1.5 py-px rounded border text-[10px] font-semibold uppercase tracking-wide",
                                priorityClass
                              )}>
                              {notification.priority}
                            </span>
                          )}
                        {notification.actionUrl && (
                          <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[#141413] group-hover:gap-1 transition-all">
                            {notification.actionText || "View details"}
                            <ArrowRight className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Row actions */}
                    <div
                      className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mobile:opacity-100"
                      onClick={(e) => e.stopPropagation()}>
                      {isUnread && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification._id);
                          }}
                          className="h-9 w-9 p-0 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 mobile:h-8 mobile:w-8"
                          title="Mark as read">
                          <Check className="h-4 w-4 mobile:h-3.5 mobile:w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("Delete this notification?")) {
                            deleteNotification(notification._id);
                          }
                        }}
                        className="h-9 w-9 p-0 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 mobile:h-8 mobile:w-8"
                        title="Delete">
                        <Trash2 className="h-4 w-4 mobile:h-3.5 mobile:w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {/* Loading more */}
              {loading && notifications.length > 0 && (
                <div className="px-4 py-3 flex items-center gap-2 border-t border-slate-100">
                  <span className="h-3 w-3 rounded-full border-2 border-slate-200 border-t-slate-400 animate-spin" />
                  <span className="text-[11px] text-slate-400">
                    Loading more...
                  </span>
                </div>
              )}

              {/* End of list */}
              {!hasMore && displayNotifications.length > 0 && (
                <div className="text-center py-4">
                  <span className="text-[11px] text-slate-400">
                    You've reached the end
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Notification Modal */}
      <CreateNotificationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchNotifications(1, false);
        }}
      />

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        notification={detailNotification}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onNavigate={(url) => navigate(url)}
      />
    </div>
    </MobilePage>
  );
};

export default NotificationPage;
