import { useCallback } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";
import {
  requestNotificationPermission,
  onForegroundMessage,
} from "../config/firebase";
import {
  registerFCMToken,
  getNotifications,
  getUnreadCount,
  markAsRead as apiMarkAsRead,
  deleteNotification as apiDeleteNotification,
  markAllAsRead as apiMarkAllAsRead,
} from "./notificationService";

// Helper function to check if browser notifications are enabled via feature flag
const isBrowserNotificationEnabled = (): boolean => {
  return import.meta.env.VITE_ADD_NOTIFICATION === "true";
};

const UNREAD_POLL_INTERVAL_MS = 300_000; // 5 minutes

interface Notification {
  _id: string;
  subject: string;
  message: string;
  topic: string;
  data?: any;
  createdAt: string;
  read?: boolean;
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
      n._id === notificationId ? { ...n, read: true } : n
    );
    const unread = this.state.notifications.filter((n) => !n.read).length;
    this.state.unreadCount = Math.min(this.state.unreadCount, unread);
    this.emitChange();
  }

  markAllAsRead() {
    this.state.notifications = this.state.notifications.map((n) => ({
      ...n,
      read: true,
    }));
    this.state.unreadCount = 0;
    this.emitChange();
  }

  deleteNotification(notificationId: string) {
    const deleted = this.state.notifications.find(
      (n) => n._id === notificationId
    );
    this.state.notifications = this.state.notifications.filter(
      (n) => n._id !== notificationId
    );
    if (deleted && !deleted.read) {
      this.state.unreadCount = Math.max(0, this.state.unreadCount - 1);
    }
    this.emitChange();
  }

  addNewNotification(notification: Notification) {
    this.state.notifications = [notification, ...this.state.notifications];
    this.state.unreadCount += 1;
    this.emitChange();
  }

  reset() {
    this.state.notifications = [];
    this.state.unreadCount = 0;
    this.state.loading = false;
    this.state.page = 1;
    this.state.hasMore = true;
    this.emitChange();
  }
}

// Singleton store instance
const store = new NotificationStore();

// ---------------------------------------------------------------------------
// App-wide singleton instance (init + poll). Module-level — NOT per-component —
// so multiple components using the hook never create duplicate intervals.
// At most one live interval exists at any time.
// ---------------------------------------------------------------------------
let initialized = false;
let pollingIntervalId: ReturnType<typeof setInterval> | null = null;
let unsubscribeMessage: (() => void) | null = null;
let unreadCountAbortController: AbortController | null = null;
let pagehideListenerRegistered = false;

/**
 * Fetch unread count. Cancels any in-flight request first so there is never
 * more than one unread-count request at a time.
 */
const fetchUnreadCount = async () => {
  unreadCountAbortController?.abort();
  unreadCountAbortController = new AbortController();
  try {
    const count = await getUnreadCount(unreadCountAbortController.signal);
    store.setUnreadCount(count);
  } catch (error) {
    console.error("Error fetching unread count:", error);
  } finally {
    unreadCountAbortController = null;
  }
};

/**
 * Initialize FCM and request permission
 */
const initializeFCM = async () => {
  try {
    const token = await requestNotificationPermission();
    if (token) {
      store.setFcmToken(token);
      await registerFCMToken(token);
    }
  } catch (error) {
    console.error("Error initializing FCM:", error);
  }
};

/**
 * Fetch notifications from backend
 */
const fetchNotifications = async (pageNum: number = 1, append = false) => {
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
};

/**
 * Handle foreground messages — a single subscription, unsubscribed on
 * destroy (never polled).
 */
const setupMessageListener = async () => {
  if (unsubscribeMessage) return; // already subscribed

  unsubscribeMessage = await onForegroundMessage((payload) => {
    // Show browser notification (only if enabled via feature flag)
    if (
      isBrowserNotificationEnabled() &&
      Notification.permission === "granted"
    ) {
      new Notification(payload.notification?.title || "New Notification", {
        body: payload.notification?.body || payload.data?.message,
        icon: "/logo192.png",
        tag: payload.data?.notificationId,
      });
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
  });
};

/**
 * Destroy the notification instance: kills the polling interval, unsubscribes
 * the foreground listener, aborts any in-flight unread-count request, resets
 * store state, and clears the init guard so the next ensureNotificationInit()
 * starts fresh.
 */
export const destroyNotificationInstance = () => {
  if (pollingIntervalId) {
    clearInterval(pollingIntervalId);
    pollingIntervalId = null;
  }
  if (unsubscribeMessage) {
    unsubscribeMessage();
    unsubscribeMessage = null;
  }
  if (unreadCountAbortController) {
    unreadCountAbortController.abort();
    unreadCountAbortController = null;
  }
  initialized = false;
  store.reset();
};

/**
 * Initialize the notification instance exactly once app-wide. Destroys any
 * previous instance first, guaranteeing only one live interval can exist.
 * A page refresh resets the timer (previous instance torn down via pagehide,
 * a fresh one is created on next load).
 */
export const ensureNotificationInit = () => {
  destroyNotificationInstance();
  initialized = true;

  // Initialize FCM, fetch data, subscribe to foreground push
  initializeFCM();
  fetchNotifications();
  fetchUnreadCount();
  setupMessageListener();

  // Polling fallback: keeps badge/panel correct when push is unavailable
  // (permission denied, Electron, or FCM down)
  pollingIntervalId = setInterval(fetchUnreadCount, UNREAD_POLL_INTERVAL_MS);

  // On refresh/navigating away, tear the instance down explicitly
  if (!pagehideListenerRegistered) {
    pagehideListenerRegistered = true;
    window.addEventListener("pagehide", destroyNotificationInstance);
  }
};

export const useNotifications = () => {
  // Subscribe to external store
  const state = useSyncExternalStore(
    store.subscribe.bind(store),
    store.getSnapshot.bind(store)
  );

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
  }, [state.loading, state.hasMore, state.page]);

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
    cleanup: destroyNotificationInstance, // Export cleanup for manual control
  };
};
