import axios from "./axios";
import config from "../utils/config";
import { handleApiError } from ".";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type AuditOperation =
  | "create"
  | "status_update"
  | "payment_update"
  | "product_update"
  | "bulk_action"
  | "customer_update"
  | "shipping_update"
  | "courier_update"
  | "cancel"
  | "delete"
  | "restore"
  | "fraud_review"
  | "notes_update";

export interface AuditLogEntry {
  id: string;
  orderId: string;
  orderNumber: number;
  operation: AuditOperation;
  operationDescription: string;
  changesummary?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  performedBy: {
    userId: string;
    userName: string;
    userEmail: string;
    userType: string;
  };
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamps: {
    createdAt: string;
  };
  isBulkOperation?: boolean;
}

export interface OrderAuditResponse {
  success: true;
  orderId: string;
  totalLogs: number;
  auditLogs: AuditLogEntry[];
}

export interface AllAuditsResponse {
  auditLogs: AuditLogEntry[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalAudits: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface UserAuditsResponse {
  success: true;
  userId: string;
  totalLogs: number;
  auditLogs: AuditLogEntry[];
}

export interface AuditStatsResponse {
  success: true;
  stats: {
    totalAudits: number;
    uniqueOrdersCount: number;
    uniqueUsersCount: number;
    operationBreakdown: AuditOperation[];
  };
}

/**
 * Get complete audit trail for a specific order
 * @param orderId - Order ID
 * @param params - Query parameters (limit, operation)
 * @returns Promise with order audit trail
 */
export const getOrderAudit = async (
  orderId: string,
  params?: {
    limit?: number;
    operation?: AuditOperation;
  }
): Promise<ApiResponse<OrderAuditResponse>> => {
  try {
    const response = await axios.get<any>(
      config.order.getOrderAudit(orderId),
      { params }
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch order audit trail",
      };
    }
  } catch (error: any) {
    console.error("Error fetching order audit trail:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get all audit logs with filtering options
 * @param params - Query parameters (limit, page, operation, userId, orderId, startDate, endDate)
 * @returns Promise with all audit logs
 */
export const getAllAudits = async (params?: {
  limit?: number;
  page?: number;
  operation?: AuditOperation;
  userId?: string;
  orderId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<AllAuditsResponse>> => {
  try {
    const response = await axios.get<any>(config.order.getAllAudits(), {
      params,
    });

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch audit logs",
      };
    }
  } catch (error: any) {
    console.error("Error fetching audit logs:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get all audit logs for a specific user (for user activity tracking)
 * @param userId - User ID
 * @param params - Query parameters (limit, startDate, endDate)
 * @returns Promise with user audit logs
 */
export const getUserAudits = async (
  userId: string,
  params?: {
    limit?: number;
    startDate?: string;
    endDate?: string;
  }
): Promise<ApiResponse<UserAuditsResponse>> => {
  try {
    const response = await axios.get<any>(
      config.order.getUserAudits(userId),
      { params }
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch user audit logs",
      };
    }
  } catch (error: any) {
    console.error("Error fetching user audit logs:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get statistical overview of all audit logs
 * @param params - Query parameters (startDate, endDate)
 * @returns Promise with audit statistics
 */
export const getAuditStats = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<AuditStatsResponse>> => {
  try {
    const response = await axios.get<any>(config.order.getAuditStats(), {
      params,
    });

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch audit statistics",
      };
    }
  } catch (error: any) {
    console.error("Error fetching audit statistics:", error.message);
    return handleApiError(error);
  }
};
