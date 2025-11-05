import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:7001";

// Create axios instance with auth token
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Access-Control-Allow-Origin": "*",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.set("x-access-token", token);
  }
  return config;
});

interface DeviceInfo {
  platform: string;
  browser: string;
  os: string;
}

interface NotificationResponse {
  success: boolean;
  data: any;
  message?: string;
}

/**
 * Register FCM token with backend
 */
export const registerFCMToken = async (
  token: string
): Promise<NotificationResponse> => {
  try {
    const deviceInfo: DeviceInfo = {
      platform: "web",
      browser:
        navigator.userAgent.match(
          /(firefox|msie|chrome|safari|trident)/gi
        )?.[0] || "unknown",
      os: navigator.platform,
    };

    // Subscribe to all relevant topics by default
    const topics = [
      "order_created",
      "order_status_changed",
      "courier_shipped",
      "courier_delivered",
      "payment_received",
      "payment_failed",
      "low_stock",
      "user_registered",
      "system_alert",
    ];

    const response = await api.post("/notification/register-token", {
      token,
      deviceInfo,
      topics,
    });

    return response.data;
  } catch (error) {
    console.error("Error registering FCM token:", error);
    throw error;
  }
};

/**
 * Get notifications list
 */
export const getNotifications = async (
  page: number = 1,
  limit: number = 20,
  unreadOnly: boolean = false
): Promise<NotificationResponse> => {
  try {
    const response = await api.get("/notification/list", {
      params: { page, limit, unreadOnly },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (): Promise<number> => {
  try {
    const response = await api.get("/notification/unread-count");
    return response.data.data.count;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (
  notificationId: string
): Promise<NotificationResponse> => {
  try {
    const response = await api.put(`/notification/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (
  notificationId: string
): Promise<NotificationResponse> => {
  try {
    const response = await api.delete(`/notification/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

/**
 * Subscribe to topic
 */
export const subscribeTopic = async (
  token: string,
  topic: string
): Promise<NotificationResponse> => {
  try {
    const response = await api.post("/notification/subscribe-topic", {
      token,
      topic,
    });
    return response.data;
  } catch (error) {
    console.error("Error subscribing to topic:", error);
    throw error;
  }
};

/**
 * Unsubscribe from topic
 */
export const unsubscribeTopic = async (
  token: string,
  topic: string
): Promise<NotificationResponse> => {
  try {
    const response = await api.post("/notification/unsubscribe-topic", {
      token,
      topic,
    });
    return response.data;
  } catch (error) {
    console.error("Error unsubscribing from topic:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<NotificationResponse> => {
  try {
    const response = await api.put("/notification/mark-all-read");
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};
