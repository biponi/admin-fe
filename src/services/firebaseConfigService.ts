/**
 * Firebase Configuration Service
 * Fetches Firebase configuration from backend API
 */

import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:7001";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  vapidKey?: string;
}

/**
 * Fetch Firebase configuration from backend
 * @returns Firebase configuration object
 */
export const fetchFirebaseConfig = async (): Promise<{
  success: boolean;
  data: FirebaseConfig;
}> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/config/firebase`);

    if (!response.data) {
      throw new Error("Firebase config not found in response");
    }

    return response.data;
  } catch (error) {
    console.error("Failed to fetch Firebase config from backend:", error);
    throw new Error(
      "Unable to load Firebase configuration. Please ensure your backend API is running and accessible."
    );
  }
};

/**
 * Cache for Firebase config to avoid repeated API calls
 */
let cachedConfig: FirebaseConfig | null = null;

/**
 * Get Firebase configuration with caching
 * @returns Firebase configuration object
 */
export const getFirebaseConfig = async (): Promise<FirebaseConfig> => {
  if (cachedConfig) {
    return cachedConfig;
  }

  const response = await fetchFirebaseConfig();

  cachedConfig = response?.data;
  return cachedConfig;
};

/**
 * Clear cached configuration (useful for testing or when config changes)
 */
export const clearFirebaseConfigCache = (): void => {
  cachedConfig = null;
};
