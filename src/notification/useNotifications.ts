import { useCallback, useRef } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";
import {
  requestNotificationPermission,
  onMessageListener,
} from "../config/firebase";
import {
  registerFCMToken,
  getNotifications,
  getUnreadCount,
  markAsRead as apiMarkAsRead,
  deleteNotification as apiDeleteNotification,
  markAllAsRead as apiMarkAllAsRead,
} from "./notificationService";

interface Notification {
  _id: string;
  subject: string;
  message: string;
  topic: string;
  data?: any;
  createdAt: string;
  read?: boolean;
  recipients?: Array<{ read: boolean }>;
  broadcast?: boolean;
  priority?: string;
  actionUrl?: string;
  actionText?: string;
}

// External store for notification state
class NotificationStore {
  private listeners: Array<() => void> = [];
  private state = {
    notifications: [] as Notification[],
    unreadCount: 0,
    loading: false,
    page: 1,
    hasMore: true,
    fcmToken: localStorage.getItem("fcmToken") as string | null,
  };

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getSnapshot() {
    return this.state;
  }

  private emitChange() {
    this.listeners.forEach((listener) => listener());
  }

  // State updaters
  setLoading(loading: boolean) {
    this.state.loading = loading;
    this.emitChange();
  }

  setNotifications(notifications: Notification[], append: boolean = false) {
    this.state.notifications = append
      ? [...this.state.notifications, ...notifications]
      : notifications;
    this.emitChange();
  }

  setUnreadCount(count: number) {
    this.state.unreadCount = count;
    this.emitChange();
  }

  setPagination(page: number, hasMore: boolean) {
    this.state.page = page;
    this.state.hasMore = hasMore;
    this.emitChange();
  }

  setFcmToken(token: string) {
    this.state.fcmToken = token;
    localStorage.setItem("fcmToken", token);
    this.emitChange();
  }

  markAsRead(notificationId: string) {
    this.state.notifications = this.state.notifications.map((n) =>
      n._id === notificationId
        ? {
            ...n,
            recipients: n.recipients?.map((r) => ({ ...r, read: true })),
            read: true,
          }
        : n
    );
    this.state.unreadCount = Math.max(0, this.state.unreadCount - 1);
    this.emitChange();
  }

  markAllAsRead() {
    this.state.notifications = this.state.notifications.map((n) => ({
      ...n,
      recipients: n.recipients?.map((r) => ({ ...r, read: true })),
      read: true,
    }));
    this.state.unreadCount = 0;
    this.emitChange();
  }

  deleteNotification(notificationId: string) {
    this.state.notifications = this.state.notifications.filter(
      (n) => n._id !== notificationId
    );
    this.emitChange();
  }

  addNewNotification(notification: Notification) {
    this.state.notifications = [notification, ...this.state.notifications];
    this.state.unreadCount += 1;
    this.emitChange();
  }
}

// Singleton store instance
const store = new NotificationStore();

export const useNotifications = () => {
  const initializedRef = useRef(false);
  const messageListenerRef = useRef<(() => void) | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to external store
  const state = useSyncExternalStore(
    store.subscribe.bind(store),
    store.getSnapshot.bind(store)
  );

  /**
   * Initialize FCM and request permission
   */
  const initializeFCM = useCallback(async (topics: string[]) => {
    try {
      const token = await requestNotificationPermission();
      if (token) {
        store.setFcmToken(token);
        await registerFCMToken(token);
      }
    } catch (error) {
      console.error("Error initializing FCM:", error);
    }
    //eslint-disable-next-line
  }, []);

  /**
   * Fetch notifications from backend
   */
  const fetchNotifications = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      try {
        store.setLoading(true);
        const response = await getNotifications(pageNum, 20, false);
        const { notifications: newNotifications, pagination } = response.data;

        store.setNotifications(newNotifications, append);
        store.setPagination(pageNum, pagination.page < pagination.totalPages);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        store.setLoading(false);
      }
    },
    []
  );

  /**
   * Fetch unread count
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      store.setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, []);

  /**
   * Mark notification as read
   */
  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    try {
      await apiMarkAsRead(notificationId);
      store.markAsRead(notificationId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await apiMarkAllAsRead();
      store.markAllAsRead();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, []);

  /**
   * Delete notification
   */
  const handleDelete = useCallback(async (notificationId: string) => {
    try {
      await apiDeleteNotification(notificationId);
      store.deleteNotification(notificationId);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  }, []);

  /**
   * Load more notifications (pagination)
   */
  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      fetchNotifications(state.page + 1, true);
    }
  }, [state.loading, state.hasMore, state.page, fetchNotifications]);

  /**
   * Handle foreground messages
   */
  const setupMessageListener = useCallback(() => {
    const listenToMessages = async () => {
      try {
        const payload: any = await onMessageListener();

        if (payload) {
          console.log("Foreground message:", payload);

          // Show browser notification
          if (Notification.permission === "granted") {
            new Notification(
              payload.notification?.title || "New Notification",
              {
                body: payload.notification?.body || payload.data?.message,
                icon: "/logo192.png",
                tag: payload.data?.notificationId,
              }
            );
          }

          // Add to notifications list
          const newNotification: Notification = {
            _id: payload.data?.notificationId || Date.now().toString(),
            subject: payload.data?.subject || payload.notification?.title,
            message: payload.data?.message || payload.notification?.body,
            topic: payload.data?.topic || "custom",
            data: payload.data,
            createdAt: new Date().toISOString(),
            read: false,
            priority: payload.data?.priority,
            actionUrl: payload.data?.actionUrl,
            actionText: payload.data?.actionText,
          };

          store.addNewNotification(newNotification);
        }
      } catch (err) {
        // Listener is waiting for messages or no message received
      }
    };

    // Set up polling for messages
    pollingIntervalRef.current = setInterval(listenToMessages, 1000);
    messageListenerRef.current = listenToMessages;

    // Initial call
    listenToMessages();
  }, []);

  /**
   * Cleanup function
   */
  const cleanup = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    messageListenerRef.current = null;
  }, []);

  /**
   * Initialize on first call
   */
  if (!initializedRef.current) {
    initializedRef.current = true;

    // Initialize FCM and fetch data
    // initializeFCM();
    // fetchNotifications();
    // fetchUnreadCount();

    // Set up message listener
    //setupMessageListener();

    // Set up polling for unread count
    //const unreadCountInterval = setInterval(fetchUnreadCount, 300000);

    // Cleanup on unmount (if the component using this hook unmounts)
    // Note: In a real app, you might want to handle this differently
    // as custom hooks don't have their own unmount lifecycle
  }

  return {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    loading: state.loading,
    hasMore: state.hasMore,
    fcmToken: state.fcmToken,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDelete,
    loadMore,
    setupMessageListener,
    initializeFCM,
    cleanup, // Export cleanup for manual control
  };
};
