import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import { socketService } from "../services/socketService";
import {
  ensureFirebaseInitialized,
  requestNotificationPermission as requestFCMPermission,
  onMessageListener,
} from "../config/firebase";
import { registerFCMToken } from "../notification/notificationService";

export interface Notification {
  _id: string;
  type:
    | "new_ticket"
    | "new_message"
    | "ticket_assigned"
    | "ticket_transferred"
    | "agent_requested"
    | "system";
  title: string;
  message: string;
  priority: "low" | "normal" | "high" | "urgent";
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  relatedData?: {
    ticketId?: string;
    customerId?: string;
    messageId?: string;
  };
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

type NotificationAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_NOTIFICATIONS"; payload: Notification[] }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "MARK_AS_READ"; payload: string }
  | { type: "MARK_ALL_AS_READ" }
  | { type: "REMOVE_NOTIFICATION"; payload: string };

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// Helper function to check if browser notifications are supported
const isBrowserNotificationSupported = (): boolean => {
  return typeof window !== "undefined" && "Notification" in window;
};

// Helper function to get notification permission safely
const getNotificationPermission = ():
  | NotificationPermission
  | "unsupported" => {
  if (!isBrowserNotificationSupported()) {
    return "unsupported";
  }
  return Notification.permission;
};

// Helper function to request notification permission safely
const requestNotificationPermission = async (): Promise<
  NotificationPermission | "unsupported"
> => {
  if (!isBrowserNotificationSupported()) {
    return "unsupported";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.warn("Failed to request notification permission:", error);
    return "denied";
  }
};

function notificationReducer(
  state: NotificationState,
  action: NotificationAction
): NotificationState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };

    case "SET_NOTIFICATIONS":
      const unreadCount = action.payload.filter((n) => !n.read).length;
      return {
        ...state,
        notifications: action.payload,
        unreadCount,
        isLoading: false,
        error: null,
      };

    case "ADD_NOTIFICATION":
      const newNotifications = [action.payload, ...state.notifications];
      const newUnreadCount = newNotifications.filter((n) => !n.read).length;
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newUnreadCount,
      };

    case "MARK_AS_READ":
      const updatedNotifications = state.notifications.map((n) =>
        n._id === action.payload ? { ...n, read: true, readAt: new Date() } : n
      );
      const updatedUnreadCount = updatedNotifications.filter(
        (n) => !n.read
      ).length;
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedUnreadCount,
      };

    case "MARK_ALL_AS_READ":
      const allReadNotifications = state.notifications.map((n) => ({
        ...n,
        read: true,
        readAt: new Date(),
      }));
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0,
      };

    case "REMOVE_NOTIFICATION":
      const filteredNotifications = state.notifications.filter(
        (n) => n._id !== action.payload
      );
      const filteredUnreadCount = filteredNotifications.filter(
        (n) => !n.read
      ).length;
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredUnreadCount,
      };

    default:
      return state;
  }
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  refreshNotifications: () => void;
  isBrowserNotificationSupported: boolean;
  notificationPermission: NotificationPermission | "unsupported";
  requestNotificationPermission: () => Promise<
    NotificationPermission | "unsupported"
  >;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const [notificationPermission, setNotificationPermission] = React.useState<
    NotificationPermission | "unsupported"
  >(getNotificationPermission());

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio("notification.mp3");
      audio.volume = 0.5; // adjust volume (0.0 - 1.0)
      audio.play().catch((err) => {
        console.warn("Notification sound could not play:", err);
      });
    } catch (error) {
      console.warn("Could not play notification sound:", error);
    }
  }, []);

  // Show browser notification safely
  const showBrowserNotification = useCallback((notification: Notification) => {
    if (!isBrowserNotificationSupported()) {
      console.log("🔔 Browser notifications not supported on this device");
      return;
    }

    if (getNotificationPermission() === "granted") {
      try {
        console.log("🔔 Showing browser notification");
        new window.Notification(notification.title, {
          body: notification.message,
          icon: "/favicon.ico",
          tag: notification._id,
        });
      } catch (error) {
        console.warn("Failed to show browser notification:", error);
      }
    } else {
      console.log(
        "🔔 Browser notification permission not granted:",
        getNotificationPermission()
      );
    }
  }, []);

  // Handle incoming notifications from socket
  const handleNewNotification = useCallback(
    (notification: Notification) => {
      console.log(
        "🔔 handleNewNotification: Processing notification:",
        notification
      );

      dispatch({ type: "ADD_NOTIFICATION", payload: notification });
      console.log("🔔 handleNewNotification: Added notification to state");

      // Play notification sound
      console.log("🔔 handleNewNotification: Playing notification sound");
      playNotificationSound();

      // Show browser notification if supported and permitted
      showBrowserNotification(notification);
    },
    [playNotificationSound, showBrowserNotification]
  );

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    dispatch({ type: "MARK_AS_READ", payload: notificationId });
    socketService.markNotificationAsRead(notificationId);
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    dispatch({ type: "MARK_ALL_AS_READ" });
    socketService.markNotificationsAsRead([]);
  }, []);

  // Remove notification
  const removeNotification = useCallback((notificationId: string) => {
    dispatch({ type: "REMOVE_NOTIFICATION", payload: notificationId });
  }, []);

  // Refresh notifications
  const refreshNotifications = useCallback(() => {
    dispatch({ type: "SET_LOADING", payload: true });
    socketService.getNotifications();
  }, []);

  // Request notification permission with proper handling
  const handleRequestNotificationPermission = useCallback(async () => {
    try {
      // First, request browser notification permission
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);

      // If granted, also request FCM token for push notifications
      if (permission === "granted") {
        const fcmToken = await requestFCMPermission();
        if (fcmToken) {
          console.log("✅ FCM Token obtained:", fcmToken);

          // Send token to backend to save it
          try {
            await registerFCMToken(fcmToken);
            console.log("✅ FCM Token registered with backend");
          } catch (error) {
            console.error("❌ Failed to register FCM token with backend:", error);
          }
        }
      }

      return permission;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied";
    }
  }, []);

  // Setup socket listeners
  useEffect(() => {
    console.log("🔔 NotificationContext: Setting up notification callback");
    const socketCallbacks = {
      onNotification: (notification: Notification) => {
        console.log(
          "🔔 NotificationContext: handleNewNotification called with:",
          notification
        );
        handleNewNotification(notification);
      },
      onError: (error: any) => {
        dispatch({
          type: "SET_ERROR",
          payload: error.message || "Socket error occurred",
        });
      },
    };

    socketService.setCallbacks(socketCallbacks);

    // Initialize Firebase and setup foreground message listener
    const initializeFirebase = async () => {
      try {
        await ensureFirebaseInitialized();
        console.log("✅ Firebase initialized in NotificationContext");

        // Listen for foreground messages from Firebase (continuous listener)
        const handleFCMMessage = async () => {
          try {
            while (true) {
              const payload: any = await onMessageListener();
              console.log("📬 Foreground FCM message received:", payload);

              // Convert FCM payload to Notification format
              const notification: Notification = {
                _id: payload.data?.notificationId || Date.now().toString(),
                type: payload.data?.type || "system",
                title: payload.notification?.title || payload.data?.subject || "New Notification",
                message: payload.notification?.body || payload.data?.message || "",
                priority: payload.data?.priority || "normal",
                read: false,
                createdAt: new Date(),
                relatedData: payload.data?.relatedData ? JSON.parse(payload.data.relatedData) : undefined,
              };

              handleNewNotification(notification);
            }
          } catch (error) {
            console.error("Error in FCM listener loop:", error);
          }
        };

        // Start listening
        handleFCMMessage();

      } catch (error) {
        console.error("Failed to initialize Firebase:", error);
      }
    };

    initializeFirebase();

    // Request browser notification permission only if supported
    if (
      isBrowserNotificationSupported() &&
      getNotificationPermission() === "default"
    ) {
      handleRequestNotificationPermission();
    }

    return () => {
      // Cleanup if needed
    };
  }, [handleNewNotification, handleRequestNotificationPermission]);

  const value: NotificationContextType = {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    error: state.error,
    markAsRead,
    markAllAsRead,
    removeNotification,
    refreshNotifications,
    isBrowserNotificationSupported: isBrowserNotificationSupported(),
    notificationPermission,
    requestNotificationPermission: handleRequestNotificationPermission,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
