import axiosInstance from "../api/axios";

const BASE = "/api/v1/notification";

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
 * Register FCM token with backend (targeting is automatic for logged-in
 * admin users — no topic subscriptions)
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

    const response = await axiosInstance.post(`${BASE}/register-token`, {
      token,
      deviceInfo,
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
    const response = await axiosInstance.get(`${BASE}/list`, {
      params: { page, limit, unreadOnly },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Get unread notification count.
 * Accepts an optional AbortSignal so an in-flight request can be cancelled
 * (e.g. on logout, when the polling instance is destroyed).
 */
export const getUnreadCount = async (signal?: AbortSignal): Promise<number> => {
  try {
    const response = await axiosInstance.get(`${BASE}/unread-count`, { signal });
    return response.data.data.count;
  } catch (error: any) {
    // Aborted request (logout / instance teardown) — fail silently
    if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
      return 0;
    }
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
    const response = await axiosInstance.put(
      `${BASE}/${notificationId}/read`
    );
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Delete notification (hides it for the current user)
 */
export const deleteNotification = async (
  notificationId: string
): Promise<NotificationResponse> => {
  try {
    const response = await axiosInstance.delete(`${BASE}/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<NotificationResponse> => {
  try {
    const response = await axiosInstance.put(`${BASE}/mark-all-read`);
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};
