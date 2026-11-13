import axiosInstance from "./axios";
import { handleApiError } from ".";

const baseURL = "/api/v1/weather";

// Payload shape returned by GET /api/v1/weather/current (backend-rounded).
// weatherCode is a WMO code — the header icon map is built on WMO ranges.
export interface CurrentWeather {
  temperature: number;
  weatherCode: number;
  isDay: number; // 1 = day, 0 = night
  windSpeed: number; // km/h
  rainProbability: number; // %, day-level
  nextHourRainProbability: number; // %, next hour
  rainWarning: boolean; // true when next-hour chance crosses the backend threshold
  condition?: string;
  cached?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Current weather for the header pill. Authenticated via the shared axios
 * instance (x-access-token header + 403 refresh-token flow).
 */
export const getCurrentWeather = async (
  lat: number,
  lon: number
): Promise<ApiResponse<CurrentWeather>> => {
  try {
    const response = await axiosInstance.get(`${baseURL}/current`, {
      params: { lat, lon },
    });
    return { success: true, data: response.data?.data };
  } catch (error: any) {
    console.error("Error fetching weather:", error.message);
    return handleApiError(error);
  }
};
