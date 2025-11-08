import axios from "./axios";
import config from "../utils/config";
import { handleApiError } from ".";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ===== Dashboard Overview Types =====

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface OperationCounts {
  creates: number;
  statusUpdates: number;
  paymentUpdates: number;
  bulkActions: number;
}

export interface OrderAuditSummary {
  totalAudits: number;
  uniqueOrdersCount: number;
  uniqueUsersCount: number;
  operationCounts: OperationCounts;
}

export interface ProductAdjustmentSummary {
  totalAdjustments: number;
  totalAdded: number;
  totalRemoved: number;
  uniqueProductsCount: number;
  uniqueUsersCount: number;
}

export interface RecentActivity {
  orderActions: Array<{
    id: string;
    orderId: string;
    orderNumber: number;
    operation: string;
    reason: string;
    performedBy: {
      userName: string;
      userAvatar?: string;
    };
    timestamps: {
      createdAt: string;
    };
  }>;
  productAdjustments: Array<{
    id: string;
    reason: string;
    productName: string;
    adjustmentType: string;
    quantityChange: number;
    adjustedBy: {
      userName: string;
      userAvatar?: string;
    };
    timestamps: {
      createdAt: string;
    };
  }>;
}

export interface HourlyActivity {
  hour: number;
  count: number;
}

export interface DashboardOverviewResponse {
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  orderAudits: OrderAuditSummary;
  productAdjustments: ProductAdjustmentSummary;
  recentActivities: RecentActivity;
  todayActivity: HourlyActivity[];
}

// ===== User Performance Types =====

export interface UserOrderOperations {
  total: number;
  creates: number;
  statusUpdates: number;
  paymentUpdates: number;
  bulkActions: number;
}

export interface UserProductAdjustments {
  total: number;
  quantityAdded: number;
  quantityRemoved: number;
  uniqueProducts: number;
}

export interface UserPerformanceSummary {
  userId: string;
  userName: string;
  userEmail: string;
  userType: string;
  orderOperations: UserOrderOperations;
  productAdjustments: UserProductAdjustments;
  lastActivity: string;
}

export interface UserPerformanceOverviewResponse {
  totalUsers: number;
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  users: UserPerformanceSummary[];
}

// ===== Detailed User Performance Types =====

export interface OperationBreakdown {
  operation: string;
  count: number;
  lastPerformed: string;
}

export interface AdjustmentTypeBreakdown {
  type: string;
  count: number;
  totalQuantityChange: number;
}

export interface ActivityTrend {
  date: string;
  orderActions: number;
  productAdjustments: number;
}

export interface UserPerformanceDetailResponse {
  user: {
    id: string;
    name: string;
    email: string;
    type: string;
  };
  summary: {
    totalOrderActions: number;
    totalProductAdjustments: number;
    dateRange: {
      startDate: string | null;
      endDate: string | null;
    };
  };
  orderOperations: {
    recentActions: any[];
    breakdown: OperationBreakdown[];
  };
  productAdjustments: {
    recentAdjustments: any[];
    typeBreakdown: AdjustmentTypeBreakdown[];
  };
  activityTrend: ActivityTrend[];
}

// ===== Top Performers Types =====

export type PerformanceMetric = "total" | "orders" | "adjustments";

export interface TopPerformer {
  userId: string;
  userName: string;
  userEmail: string;
  orderActions: number;
  productAdjustments: number;
  totalActions: number;
}

export interface TopPerformersResponse {
  metric: PerformanceMetric;
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  topPerformers: TopPerformer[];
}

// ===== API Functions =====

/**
 * Get comprehensive overview of all system activities
 * @param params - Date range parameters
 * @returns Promise with dashboard overview data
 */
export const getAuditDashboard = async (
  params?: DateRangeParams
): Promise<ApiResponse<DashboardOverviewResponse>> => {
  try {
    const response = await axios.get<any>(config.admin.auditDashboard(), {
      params,
    });

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch audit dashboard",
      };
    }
  } catch (error: any) {
    console.error("Error fetching audit dashboard:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get performance metrics for all users
 * @param params - Date range and limit parameters
 * @returns Promise with user performance overview
 */
export const getUserPerformanceOverview = async (params?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<ApiResponse<UserPerformanceOverviewResponse>> => {
  try {
    const response = await axios.get<any>(
      config.admin.userPerformanceOverview(),
      { params }
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error:
          response.data.error || "Failed to fetch user performance overview",
      };
    }
  } catch (error: any) {
    console.error("Error fetching user performance overview:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get comprehensive performance report for a specific user
 * @param userId - User ID to analyze
 * @param params - Date range parameters
 * @returns Promise with detailed user performance data
 */
export const getUserPerformanceDetail = async (
  userId: string,
  params?: DateRangeParams
): Promise<ApiResponse<UserPerformanceDetailResponse>> => {
  try {
    const response = await axios.get<any>(
      config.admin.userPerformanceDetail(userId),
      { params }
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error:
          response.data.error || "Failed to fetch user performance details",
      };
    }
  } catch (error: any) {
    console.error("Error fetching user performance details:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get ranking of most active users based on different metrics
 * @param params - Query parameters (date range, limit, metric)
 * @returns Promise with top performers data
 */
export const getTopPerformers = async (params?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
  metric?: PerformanceMetric;
}): Promise<ApiResponse<TopPerformersResponse>> => {
  try {
    const response = await axios.get<any>(config.admin.topPerformers(), {
      params,
    });

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch top performers",
      };
    }
  } catch (error: any) {
    console.error("Error fetching top performers:", error.message);
    return handleApiError(error);
  }
};
