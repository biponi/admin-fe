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

// Order-wise Commission Types
export interface OrderCommission {
  orderId: string;
  orderNumber: number;
  totalCommissionAmount: number;
  productCount: number;
  recipients: Array<{
    userId: string;
    userName: string;
    userAvatar: string;
    commissionAmount: number;
    productCount: number;
  }>;
  statusBreakdown: {
    [status: string]: {
      count: number;
      amount: number;
    };
  };
  createdAt: string;
}

export interface OrderCommissionListResponse {
  commissions: OrderCommission[];
  pagination: CommissionListResponse["pagination"];
  summary: {
    totalOrders: number;
    totalCommissionAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    pendingAmount: number;
    holdAmount: number;
    cancelledAmount: number;
    removedAmount: number;
  };
}

export interface OrderCommissionDetails {
  orderId: string;
  orderNumber: number;
  summary: {
    totalProducts: number;
    totalCommissionAmount: number;
    totalQuantity: number;
  };
  statusBreakdown: OrderCommission["statusBreakdown"];
  products: Array<{
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    productPrice: number;
    totalPrice: number;
    commission: {
      recipient: {
        userId: string;
        userName: string;
        userAvatar: string;
      };
      type: "percentage" | "fixed";
      rate: number;
      amount: number;
      status: string;
      commissionId: string;
      createdAt: string;
      paidOffDate: string | null;
    };
  }>;
  recipients: OrderCommission["recipients"];
  orderDates: {
    createdAt: string;
    firstCommissionCreated: string;
  };
}

export interface OrderCommissionQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
  orderId?: string;
  orderNumber?: number;
  startDate?: string;
  endDate?: string;
  paidOffStartDate?: string;
  paidOffEndDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// User-wise Commission Types
export interface UserCommissionSummary {
  userId: string;
  userName: string;
  userAvatar: string;
  totalCommissionAmount: number;
  totalOrders: number;
  totalProducts: number;
  statusBreakdown: {
    paid: { count: number; amount: number };
    unpaid: { count: number; amount: number };
    pending: { count: number; amount: number };
    hold: { count: number; amount: number };
    cancelled: { count: number; amount: number };
  };
  firstCommissionDate: string;
  lastCommissionDate: string;
}

export interface UserCommissionListResponse {
  data: UserCommissionSummary[];
  pagination: CommissionListResponse["pagination"];
  summary: {
    totalUsers: number;
    totalCommissionAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    pendingAmount: number;
    holdAmount: number;
    cancelledAmount: number;
    removedAmount: number;
  };
}

export interface UserCommissionHistory {
  userId: string;
  userName: string;
  userAvatar: string;
  summary: {
    totalCommissionAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    pendingAmount: number;
    holdAmount: number;
    cancelledAmount: number;
    totalOrders: number;
    totalProducts: number;
    firstCommissionDate: string;
    lastCommissionDate: string;
  };
  timeline: Array<{
    date: string;
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    pendingAmount: number;
    holdAmount: number;
    cancelledAmount: number;
    orderCount: number;
    productCount: number;
  }>;
  statusTrends: {
    paid: "up" | "down" | "stable";
    unpaid: "up" | "down" | "stable";
    pending: "up" | "down" | "stable";
    hold: "up" | "down" | "stable";
    cancelled: "up" | "down" | "stable";
  };
  topProducts: Array<{
    productId: string;
    productName: string;
    productImage: string;
    totalCommission: number;
    commissionCount: number;
  }>;
  performance: {
    growthRate: number;
    avgPerOrder: number;
    paymentRate: number;
    currentTotal: number;
    previousTotal: number;
  };
}

export interface UserCommissionQueryParams {
  page?: number;
  limit?: number;
  sortBy?:
    | "totalCommissionAmount"
    | "totalOrders"
    | "totalProducts"
    | "userName"
    | "firstCommissionDate"
    | "lastCommissionDate";
  sortOrder?: "asc" | "desc";
  status?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface BulkCommissionUpdateRequest {
  commissionIds?: string[];
  orderNumbers?: number[];
  status: string;
  notes?: string;
  paidOffDate?: string;
}

export interface BulkOperationStatus {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  totalItems: number;
  processedItems: number;
  successCount: number;
  failureCount: number;
  errors: Array<{
    commissionId: string;
    error: string;
  }>;
  createdAt: string;
  updatedAt: string;
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

// Order-wise Commission API Functions
export const getOrderCommissions = async (
  params?: OrderCommissionQueryParams,
): Promise<{
  success: boolean;
  data?: OrderCommissionListResponse;
  error?: string;
}> => {
  try {
    const response = await api.get<any>(
      config.commission.getOrderCommissions(),
      { params },
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch order commissions",
      };
    }
  } catch (error: any) {
    console.error("Error fetching order commissions:", error.message);
    return handleApiError(error);
  }
};

export const getOrderCommissionDetails = async (
  orderId: string,
): Promise<{
  success: boolean;
  data?: OrderCommissionDetails;
  error?: string;
}> => {
  try {
    const response = await api.get<any>(
      config.commission.getOrderCommissionDetails(orderId),
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error:
          response.data?.error || "Failed to fetch order commission details",
      };
    }
  } catch (error: any) {
    console.error("Error fetching order commission details:", error.message);
    return handleApiError(error);
  }
};

export const getOrderCommissionCount = async (
  orderId: string,
): Promise<{
  success: boolean;
  data?: { count: number };
  error?: string;
}> => {
  try {
    const response = await api.get<any>(
      config.commission.getOrderCommissionCount(orderId),
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch order commission count",
      };
    }
  } catch (error: any) {
    console.error("Error fetching order commission count:", error.message);
    return handleApiError(error);
  }
};

export const bulkUpdateCommissionStatus = async (
  request: BulkCommissionUpdateRequest,
): Promise<{
  success: boolean;
  data?: { jobId: string; message: string };
  error?: string;
}> => {
  try {
    const response = await api.post<any>(
      config.commission.bulkStatusUpdate(),
      request,
    );

    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to submit bulk status update",
      };
    }
  } catch (error: any) {
    console.error("Error submitting bulk status update:", error.message);
    return handleApiError(error);
  }
};

export const bulkUpdateCommissionStatusDirect = async (
  request: BulkCommissionUpdateRequest,
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> => {
  try {
    const response = await api.post<any>(
      config.commission.bulkStatusUpdateDirect(),
      request,
    );

    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to update bulk status",
      };
    }
  } catch (error: any) {
    console.error("Error updating bulk status:", error.message);
    return handleApiError(error);
  }
};

export const bulkUpdateOrderCommissionStatus = async (
  request: BulkCommissionUpdateRequest,
): Promise<{
  success: boolean;
  data?: { jobId: string; message: string };
  error?: string;
}> => {
  try {
    const response = await api.post<any>(
      config.commission.bulkStatusUpdateByOrders(),
      request,
    );

    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error:
          response.data?.error || "Failed to submit bulk order status update",
      };
    }
  } catch (error: any) {
    console.error("Error submitting bulk order status update:", error.message);
    return handleApiError(error);
  }
};

export const bulkUpdateOrderCommissionStatusDirect = async (
  request: BulkCommissionUpdateRequest,
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> => {
  try {
    const response = await api.post<any>(
      config.commission.bulkStatusUpdateByOrdersDirect(),
      request,
    );

    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to update bulk order status",
      };
    }
  } catch (error: any) {
    console.error("Error updating bulk order status:", error.message);
    return handleApiError(error);
  }
};

export const getBulkOperationStatus = async (
  jobId: string,
): Promise<{
  success: boolean;
  data?: BulkOperationStatus;
  error?: string;
}> => {
  try {
    const response = await api.get<any>(
      config.commission.getBulkOperationStatus(jobId),
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch bulk operation status",
      };
    }
  } catch (error: any) {
    console.error("Error fetching bulk operation status:", error.message);
    return handleApiError(error);
  }
};

// User-wise Commission API Functions
export const getUserCommissionsList = async (
  params?: UserCommissionQueryParams,
): Promise<{
  success: boolean;
  data?: UserCommissionListResponse;
  error?: string;
}> => {
  try {
    const response = await api.get<any>(
      config.commission.getUserCommissionsList(),
      { params },
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch user commissions list",
      };
    }
  } catch (error: any) {
    console.error("Error fetching user commissions list:", error.message);
    return handleApiError(error);
  }
};

export const getUserCommissionHistory = async (
  userId: string,
  params?: {
    interval?: "daily" | "weekly" | "monthly";
    startDate?: string;
    endDate?: string;
    includePerformance?: boolean;
  },
): Promise<{
  success: boolean;
  data?: UserCommissionHistory;
  error?: string;
}> => {
  try {
    const response = await api.get<any>(
      config.commission.getUserCommissionHistory(userId),
      { params },
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error:
          response.data?.error || "Failed to fetch user commission history",
      };
    }
  } catch (error: any) {
    console.error("Error fetching user commission history:", error.message);
    return handleApiError(error);
  }
};

export const getUserCommissionCount = async (
  userId: string,
): Promise<{
  success: boolean;
  data?: { userId: string; totalCommissionCount: number };
  error?: string;
}> => {
  try {
    const response = await api.get<any>(
      config.commission.getUserCommissionCount(userId),
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch user commission count",
      };
    }
  } catch (error: any) {
    console.error("Error fetching user commission count:", error.message);
    return handleApiError(error);
  }
};

export const getTopPerformers = async (params?: {
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{
  success: boolean;
  data?: { data: any[]; count: number };
  error?: string;
}> => {
  try {
    const response = await api.get<any>(config.commission.getTopPerformers(), {
      params,
    });

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch top performers",
      };
    }
  } catch (error: any) {
    console.error("Error fetching top performers:", error.message);
    return handleApiError(error);
  }
};

export const getUserWiseSummaryStats = async (params?: {
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{
  success: boolean;
  data?: {
    totalUsers: number;
    totalCommissionAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    pendingAmount: number;
    holdAmount: number;
    cancelledAmount: number;
    removedAmount: number;
  };
  error?: string;
}> => {
  try {
    const response = await api.get<any>(
      config.commission.getUserWiseSummaryStats(),
      { params },
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error:
          response.data?.error || "Failed to fetch user wise summary stats",
      };
    }
  } catch (error: any) {
    console.error("Error fetching user wise summary stats:", error.message);
    return handleApiError(error);
  }
};

// Export functions - wrappers for commissionExport utilities
export const downloadCommissionPdfSplit = async (
  startDate?: string,
  endDate?: string,
  status?: string,
  onProgress?: (progress: number) => void,
) => {
  const { downloadCommissionPdfSplit: downloadPdf } =
    await import("../utils/commissionExport");
  return downloadPdf(startDate, endDate, status, onProgress);
};

export const downloadCommissionPdf = async (options?: {
  version?: "order-wise" | "user-wise" | "product-wise";
  startDate?: string;
  endDate?: string;
  status?: string;
  onProgress?: (progress: number) => void;
}) => {
  const { downloadCommissionPdf: downloadPdf } =
    await import("../utils/commissionExport");
  return downloadPdf(options);
};

export const downloadCommissionCsv = async (options?: {
  version?: "order-wise" | "user-wise" | "product-wise";
  startDate?: string;
  endDate?: string;
  status?: string;
  onProgress?: (progress: number) => void;
}) => {
  const { downloadCommissionCsv: downloadCsv } =
    await import("../utils/commissionExport");
  return downloadCsv(options);
};
