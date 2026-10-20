import axios from "./axios";
import config from "../utils/config";
import { handleApiError } from ".";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ===== Types =====

export interface ActivityLogParams {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  method?: string;
  statusCode?: number | string;
  success?: string;
  startDate?: string;
  endDate?: string;
  ip?: string;
  search?: string;
  sortBy?: "asc" | "desc";
}

export interface ActivityLogEntry {
  _id: string;
  userId: string;
  userName: string;
  userEmail?: string | null;
  userMobile: string;
  userRoleId?: string | null;
  sessionId?: string;
  action: string;
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  success: boolean;
  resourceId?: string | null;
  resourceType?: string | null;
  changeDetails?: {
    before?: any;
    after?: any;
    changedFields?: string[];
  } | null;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    requestSize?: number;
    responseSize?: number;
    errorMessage?: string | null;
    additionalInfo?: {
      query?: any;
      params?: any;
      requestBody?: any;
    };
  };
  timestamp: string;
}

export interface ActivityPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ActivityFeedResponse {
  logs: ActivityLogEntry[];
  pagination: ActivityPagination;
}

export interface UserTimelineSummary {
  totalActions: number;
  actionBreakdown: Array<{ _id: string; count: number; lastSeen: string }>;
  firstActivity: string | null;
  lastActivity: string | null;
  ips: string[];
}

export interface UserTimelineResponse {
  userId: string;
  userName: string | null;
  logs: ActivityLogEntry[];
  summary: UserTimelineSummary;
  pagination: ActivityPagination;
}

export interface ActivityStatsResponse {
  totals: {
    totalActions: number;
    mutations: number;
    activeUsers: number;
    avgDuration: number;
    failures: number;
    successRate: number;
  };
  byDay: Array<{ date: string; count: number; failures: number }>;
  byAction: Array<{ action: string; count: number }>;
  topUsers: Array<{
    userId: string;
    userName: string;
    count: number;
    failures: number;
    lastActivity: string;
  }>;
  generatedAt: string;
  since: string | null;
}

// ===== API Functions =====

/**
 * Fetch the filterable, paginated activity feed
 */
export const getActivityFeed = async (
  params?: ActivityLogParams
): Promise<ApiResponse<ActivityFeedResponse>> => {
  try {
    const response = await axios.get<any>(config.admin.activityFeed(), {
      params,
    });

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch activity feed",
      };
    }
  } catch (error: any) {
    console.error("Error fetching activity feed:", error.message);
    return handleApiError(error);
  }
};

/**
 * Fetch one user's full action timeline
 */
export const getUserTimeline = async (
  userId: string,
  params?: ActivityLogParams
): Promise<ApiResponse<UserTimelineResponse>> => {
  try {
    const response = await axios.get<any>(
      config.admin.activityUserTimeline(userId),
      { params }
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch user timeline",
      };
    }
  } catch (error: any) {
    console.error("Error fetching user timeline:", error.message);
    return handleApiError(error);
  }
};

/**
 * Fetch aggregated activity statistics (totals, by day, by action, top users)
 */
export const getActivityStats = async (
  params?: ActivityLogParams
): Promise<ApiResponse<ActivityStatsResponse>> => {
  try {
    const response = await axios.get<any>(config.admin.activityStats(), {
      params,
    });

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch activity stats",
      };
    }
  } catch (error: any) {
    console.error("Error fetching activity stats:", error.message);
    return handleApiError(error);
  }
};

/**
 * Fetch a single activity entry by id (full detail, redacted at write time)
 */
export const getActivityEntry = async (
  id: string
): Promise<ApiResponse<ActivityLogEntry>> => {
  try {
    const response = await axios.get<any>(config.admin.activityEntry(id));

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch activity entry",
      };
    }
  } catch (error: any) {
    console.error("Error fetching activity entry:", error.message);
    return handleApiError(error);
  }
};

/**
 * Download the current filter set as CSV (server-generated blob)
 */
export const exportActivityCsv = async (
  params?: ActivityLogParams
): Promise<ApiResponse<Blob>> => {
  try {
    const response = await axios.get<Blob>(config.admin.activityExport(), {
      params,
      responseType: "blob",
    });

    if (response.status === 200) {
      return { success: true, data: response.data };
    }
    return { success: false, error: "Failed to export activity log" };
  } catch (error: any) {
    console.error("Error exporting activity CSV:", error.message);
    return handleApiError(error);
  }
};
