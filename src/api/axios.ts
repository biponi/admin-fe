import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { refreshApiToken } from "./index";

const baseHostName = process.env.REACT_APP_API_BASE_URL;
const axiosInstance = axios.create({
  baseURL: baseHostName,
  headers: {
    "Access-Control-Allow-Origin": "*",
  },
});

// Track ongoing refresh request to avoid multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    if (config.headers && token) {
      config.headers.set("x-access-token", token);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 403 Forbidden (token expired or invalid)
    if (error.response?.status === 403 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers["x-access-token"] = token;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("🔄 Token expired, attempting to refresh...");

        // Attempt to refresh token
        const tokenResponse = await refreshApiToken();

        if (tokenResponse?.success && tokenResponse?.data?.accessToken) {
          const newToken = tokenResponse.data.accessToken;
          const newRefreshToken = tokenResponse.data.refreshToken;

          // Update localStorage
          localStorage.setItem("token", newToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          console.log("✅ Token refreshed successfully");

          // Process queued requests
          processQueue(null, newToken);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers["x-access-token"] = newToken;
          }

          isRefreshing = false;
          return axiosInstance(originalRequest);
        } else {
          throw new Error("Token refresh failed");
        }
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);

        // Process queued requests with error
        processQueue(refreshError, null);

        // Clear tokens and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");

        // Redirect to login page
        window.location.href = "/login";

        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    // Handle 401 Unauthorized (similar to 403 but for different scenarios)
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("🔒 Unauthorized access - redirecting to login");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
