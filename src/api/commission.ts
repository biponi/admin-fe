import api from "./axios";
import config from "../utils/config";
import { handleApiError } from "./index";

// Types
export interface Commission {
  id: string;
  orderId: string;
  orderNumber: number;
  userId: string;
  userName: string;
  userAvatar: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  quantity: number;
  totalPrice: number;
  commissionType: "percentage" | "fixed";
  commissionRate: number;
  commissionAmount: number;
  status: "pending" | "unpaid" | "paid" | "hold" | "cancelled" | "removed";
  paidOffDate: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionListResponse {
  commissions: Commission[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
  summary: {
    totalCommissionAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    pendingAmount: number;
    totalCommissions: number;
  };
}

export interface CommissionSummaryResponse {
  period: {
    startDate: string | null;
    endDate: string | null;
  };
  overview: {
    totalCommissions: number;
    totalCommissionAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    pendingAmount: number;
    holdAmount: number;
    cancelledAmount: number;
    removedAmount: number;
    paidCount: number;
    unpaidCount: number;
    pendingCount: number;
    holdCount: number;
    cancelledCount: number;
    removedCount: number;
  };
  statusBreakdown: Array<{
    status: string;
    count: number;
    totalAmount: number;
  }>;
  topUsers: Array<{
    userId: string;
    userName: string;
    userAvatar: string;
    totalCommission: number;
    commissionCount: number;
    paidAmount: number;
    unpaidAmount: number;
    pendingAmount: number;
  }>;
}

export interface UserCommissionResponse {
  userId: string;
  userName: string;
  userAvatar: string;
  commissions: Commission[];
  pagination: CommissionListResponse["pagination"];
  userTotals: {
    totalCommissions: number;
    totalPaidAmount: number;
    totalUnpaidAmount: number;
    totalPendingAmount: number;
    totalHoldAmount: number;
  };
}

export interface CommissionQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
  userId?: string;
  limit?: number;
}

// API Functions
export const getCommissions = async (
  params?: CommissionQueryParams,
): Promise<{
  success: boolean;
  data?: CommissionListResponse;
  error?: string;
}> => {
  try {
    const response = await api.get<any>(config.commission.getAll(), { params });

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch commissions",
      };
    }
  } catch (error: any) {
    console.error("Error fetching commissions:", error.message);
    return handleApiError(error);
  }
};

export const getCommissionSummary = async (
  params?: DateRangeParams,
): Promise<{
  success: boolean;
  data?: CommissionSummaryResponse;
  error?: string;
}> => {
  try {
    const response = await api.get<any>(config.commission.getSummary(), {
      params,
    });

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch commission summary",
      };
    }
  } catch (error: any) {
    console.error("Error fetching commission summary:", error.message);
    return handleApiError(error);
  }
};

export const getUserCommissions = async (
  userId: string,
  params?: CommissionQueryParams,
): Promise<{
  success: boolean;
  data?: UserCommissionResponse;
  error?: string;
}> => {
  try {
    const response = await api.get<any>(
      config.commission.getUserCommissions(userId),
      {
        params,
      },
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch user commissions",
      };
    }
  } catch (error: any) {
    console.error("Error fetching user commissions:", error.message);
    return handleApiError(error);
  }
};

export const getPersonalCommissions = async (
  params?: CommissionQueryParams,
): Promise<{
  success: boolean;
  data?: UserCommissionResponse;
  error?: string;
}> => {
  try {
    const response = await api.get<any>(
      config.commission.getPersonalCommissions(),
      {
        params,
      },
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch user commissions",
      };
    }
  } catch (error: any) {
    console.error("Error fetching personal commissions:", error.message);
    return handleApiError(error);
  }
};

export const getCommissionById = async (
  id: string,
): Promise<{ success: boolean; data?: Commission; error?: string }> => {
  try {
    const response = await api.get<any>(config.commission.getById(id));

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch commission",
      };
    }
  } catch (error: any) {
    console.error("Error fetching commission:", error.message);
    return handleApiError(error);
  }
};

export const updateCommissionStatus = async (
  id: string,
  status: string,
  notes?: string,
): Promise<{ success: boolean; data?: Commission; error?: string }> => {
  try {
    const response = await api.patch<any>(config.commission.updateStatus(id), {
      status,
      notes,
    });

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to update commission status",
      };
    }
  } catch (error: any) {
    console.error("Error updating commission status:", error.message);
    return handleApiError(error);
  }
};
