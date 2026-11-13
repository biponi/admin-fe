import axiosInstance from "./axios";
import { handleApiError } from ".";

const baseURL = "/api/v1/bkash-transaction";

export type BkashEventType =
  | "payment_initiated"
  | "create_result"
  | "callback_received"
  | "execute_success"
  | "execute_failed"
  | "order_converted"
  | "payment_timeout"
  | "payment_not_found"
  | "refund_initiated"
  | "refund_success"
  | "refund_failed"
  | "query"
  | "search";

export interface BkashTransactionLog {
  id: string;
  paymentId: string | null;
  trxID: string | null;
  orderId: string | null;
  orderNumber: number | null;
  amount: number | null;
  mobileNumber: string | null;
  gateway: "bkash";
  eventType: BkashEventType;
  statusCode: string | null;
  transactionStatus: string | null;
  requestBody: Record<string, unknown> | null;
  responseObject: Record<string, unknown> | null;
  errorMessage: string | null;
  context: {
    source: string | null;
    ip: string | null;
    userAgent: string | null;
  };
  metadata: Record<string, unknown>;
  timestamps: {
    createdAt: string;
    updatedAt: string;
  };
}

export interface BkashTransactionStats {
  totalEvents: number;
  eventCounts: Partial<Record<BkashEventType, number>>;
  collectedAmount: number;
  refundedAmount: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface BkashLogFilters {
  page?: number;
  limit?: number;
  paymentId?: string;
  orderId?: string;
  trxID?: string;
  eventType?: BkashEventType | "";
  startDate?: string;
  endDate?: string;
}

export const getBkashTransactionLogs = async (
  params?: BkashLogFilters
): Promise<
  ApiResponse<{
    logs: BkashTransactionLog[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>
> => {
  try {
    const response = await axiosInstance.get(`${baseURL}/`, { params });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error fetching bkash transaction logs:", error.message);
    return handleApiError(error);
  }
};

export const getBkashTransactionTimeline = async (
  paymentId: string
): Promise<ApiResponse<{ paymentId: string; events: BkashTransactionLog[] }>> => {
  try {
    const response = await axiosInstance.get(`${baseURL}/payment/${paymentId}`);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error fetching bkash transaction timeline:", error.message);
    return handleApiError(error);
  }
};

export const getBkashTransactionStats = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<BkashTransactionStats>> => {
  try {
    const response = await axiosInstance.get(`${baseURL}/stats`, { params });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error fetching bkash transaction stats:", error.message);
    return handleApiError(error);
  }
};
