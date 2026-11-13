import axiosInstance from "./axios";
import { handleApiError } from ".";
import type {
  CustomerRiskProfile,
  FraudGroupItem,
} from "../pages/order/interface.d";

const baseURL = "/api/v1/fraud";

export type RiskLevel = "green" | "yellow" | "red";

export interface FraudDashboardStats {
  totalCustomers: number;
  riskDistribution: { red: number; yellow: number; green: number };
  recentlyFlaggedCount: number;
  lastAnalysisDate: string | null;
}

export interface FraudCustomer {
  phoneNumber: string;
  customerName: string;
  email: string;
  riskLevel: RiskLevel;
  riskScore: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  cancellationRate: number;
  returnRate: number;
  completionRate: number;
  fraudFlags: string[];
  manualFraud?: CustomerRiskProfile["manualFraud"];
  manualRiskOverride?: CustomerRiskProfile["manualRiskOverride"];
  lastOrderDate?: string | null;
  lastAnalyzedAt?: string;
  accountAge?: number;
}

export interface PaginatedCustomers<T = FraudCustomer> {
  customers: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface FraudGroupResponse {
  items: FraudGroupItem[];
  total: number;
  page: number;
  limit: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const getFraudDashboard =
  async (): Promise<ApiResponse<FraudDashboardStats>> => {
    try {
      const response = await axiosInstance.get(`${baseURL}/dashboard`);
      return { success: true, data: response.data.data };
    } catch (error: any) {
      console.error("Error fetching fraud dashboard:", error.message);
      return handleApiError(error);
    }
  };

export const getHighRiskCustomers = async (params?: {
  page?: number;
  limit?: number;
}): Promise<ApiResponse<PaginatedCustomers>> => {
  try {
    const response = await axiosInstance.get(`${baseURL}/high-risk`, { params });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error fetching high-risk customers:", error.message);
    return handleApiError(error);
  }
};

export const getMediumRiskCustomers = async (params?: {
  page?: number;
  limit?: number;
}): Promise<ApiResponse<PaginatedCustomers>> => {
  try {
    const response = await axiosInstance.get(`${baseURL}/medium-risk`, {
      params,
    });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error fetching medium-risk customers:", error.message);
    return handleApiError(error);
  }
};

export const getRecentlyFlagged = async (params?: {
  days?: number;
}): Promise<ApiResponse<{ customers: FraudCustomer[]; count: number }>> => {
  try {
    const response = await axiosInstance.get(`${baseURL}/recently-flagged`, {
      params,
    });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error fetching recently flagged customers:", error.message);
    return handleApiError(error);
  }
};

export const searchFraudCustomers = async (
  q: string
): Promise<ApiResponse<{ customers: FraudCustomer[]; count: number }>> => {
  try {
    const response = await axiosInstance.get(`${baseURL}/search`, {
      params: { q },
    });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error searching fraud customers:", error.message);
    return handleApiError(error);
  }
};

export const getCustomerRiskProfile = async (
  phoneNumber: string
): Promise<ApiResponse<CustomerRiskProfile>> => {
  try {
    const response = await axiosInstance.get(
      `${baseURL}/customer/${encodeURIComponent(phoneNumber)}`
    );
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error fetching customer risk profile:", error.message);
    return handleApiError(error);
  }
};

export const getFraudGroup = async (params?: {
  page?: number;
  limit?: number;
}): Promise<ApiResponse<FraudGroupResponse>> => {
  try {
    const response = await axiosInstance.get(`${baseURL}/fraud-group`, {
      params,
    });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error fetching fraud group:", error.message);
    return handleApiError(error);
  }
};

export const addToFraudGroup = async (
  phoneNumber: string,
  payload: { reason: string; expiresInDays?: number }
): Promise<ApiResponse<CustomerRiskProfile>> => {
  try {
    const response = await axiosInstance.post(
      `${baseURL}/fraud-group/${encodeURIComponent(phoneNumber)}`,
      payload
    );
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error adding customer to fraud group:", error.message);
    return handleApiError(error);
  }
};

export const removeFromFraudGroup = async (
  phoneNumber: string
): Promise<ApiResponse<CustomerRiskProfile>> => {
  try {
    const response = await axiosInstance.delete(
      `${baseURL}/fraud-group/${encodeURIComponent(phoneNumber)}`
    );
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error removing customer from fraud group:", error.message);
    return handleApiError(error);
  }
};

export const analyzeFraudCustomer = async (
  phoneNumber: string
): Promise<ApiResponse<CustomerRiskProfile>> => {
  try {
    const response = await axiosInstance.post(
      `${baseURL}/analyze/${encodeURIComponent(phoneNumber)}`
    );
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error analyzing customer:", error.message);
    return handleApiError(error);
  }
};

export const triggerFraudAnalysisAll = async (): Promise<
  ApiResponse<{ message: string }>
> => {
  try {
    const response = await axiosInstance.post(`${baseURL}/analyze-all`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Error triggering fraud analysis:", error.message);
    return handleApiError(error);
  }
};

export const overrideRiskLevel = async (
  phoneNumber: string,
  payload: { riskLevel: RiskLevel; reason: string }
): Promise<ApiResponse<CustomerRiskProfile>> => {
  try {
    const response = await axiosInstance.put(
      `${baseURL}/override/${encodeURIComponent(phoneNumber)}`,
      payload
    );
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error overriding risk level:", error.message);
    return handleApiError(error);
  }
};

export const removeRiskOverride = async (
  phoneNumber: string
): Promise<ApiResponse<{ newRiskLevel: string; riskScore: number }>> => {
  try {
    const response = await axiosInstance.delete(
      `${baseURL}/override/${encodeURIComponent(phoneNumber)}`
    );
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error removing risk override:", error.message);
    return handleApiError(error);
  }
};

export const updateFraudNotes = async (
  phoneNumber: string,
  notes: string
): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const response = await axiosInstance.put(
      `${baseURL}/notes/${encodeURIComponent(phoneNumber)}`,
      { notes }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Error updating fraud notes:", error.message);
    return handleApiError(error);
  }
};

/** CSV export — blob download (see JobManagement's export patterns) */
export const exportFraudReport = async (riskLevel?: RiskLevel) => {
  try {
    const response = await axiosInstance.get(`${baseURL}/export`, {
      params: riskLevel ? { riskLevel } : {},
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fraud_report_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return { success: true as const };
  } catch (error: any) {
    console.error("Error exporting fraud report:", error.message);
    return handleApiError(error);
  }
};
