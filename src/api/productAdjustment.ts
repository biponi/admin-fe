import axios from "./axios";
import config from "../utils/config";
import { handleApiError } from ".";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type AdjustmentType = "add" | "remove" | "set";

export interface ProductAdjustmentRequest {
  productId: string;
  variationId?: string;
  adjustmentType: AdjustmentType;
  quantity: number;
  reason: string;
  notes?: string;
  referenceNumber?: string;
}

export interface ProductAdjustmentResponse {
  success: true;
  adjustment: {
    id: string;
    productName: string;
    productSku: string;
    adjustmentType: AdjustmentType;
    quantityChange: number;
    reason: string;
    adjustedBy: string;
    createdAt: string;
    status: string;
  };
  product: {
    id: string;
    name: string;
    sku: string;
    oldQuantity: number;
    newQuantity: number;
    currentStock: number;
  };
}

export interface AdjustmentHistoryItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  variationId?: string | null;
  variationDetails?: any;
  adjustmentType: AdjustmentType;
  oldQuantity: number;
  newQuantity: number;
  quantityChange: number;
  reason: string;
  notes?: string;
  referenceNumber?: string;
  adjustedBy: {
    userId: string;
    userName: string;
    userEmail: string;
    userType: string;
  };
  status: string;
  timestamps: {
    createdAt: string;
  };
}

export interface AdjustmentHistoryResponse {
  adjustments: AdjustmentHistoryItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalAdjustments: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AdjustmentStatsResponse {
  totalAdjustments: number;
  totalAdded: number;
  totalRemoved: number;
  uniqueProductsCount: number;
  uniqueUsersCount: number;
}

/**
 * Adjust product stock quantity with mandatory audit trail
 * @param adjustmentData - The adjustment data
 * @returns Promise with adjustment result
 */
export const adjustProductStock = async (
  adjustmentData: ProductAdjustmentRequest
): Promise<ApiResponse<ProductAdjustmentResponse>> => {
  try {
    const response = await axios.post<any>(
      config.product.adjustStock(),
      adjustmentData
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to adjust product stock",
      };
    }
  } catch (error: any) {
    console.error("Error adjusting product stock:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get adjustment history for a specific product or all products
 * @param productId - Optional product ID to filter by
 * @param params - Query parameters (limit, page, startDate, endDate, userId)
 * @returns Promise with adjustment history
 */
export const getProductAdjustments = async (
  productId?: string,
  params?: {
    limit?: number;
    page?: number;
    startDate?: string;
    endDate?: string;
    userId?: string;
  }
): Promise<ApiResponse<AdjustmentHistoryResponse>> => {
  try {
    const response = await axios.get<any>(
      config.product.getAdjustments(productId),
      { params }
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch adjustment history",
      };
    }
  } catch (error: any) {
    console.error("Error fetching adjustment history:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get statistical overview of all product adjustments
 * @param params - Query parameters (startDate, endDate)
 * @returns Promise with adjustment statistics
 */
export const getAdjustmentStats = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<AdjustmentStatsResponse>> => {
  try {
    const response = await axios.get<any>(
      config.product.getAdjustmentStats(),
      { params }
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error:
          response.data.error || "Failed to fetch adjustment statistics",
      };
    }
  } catch (error: any) {
    console.error("Error fetching adjustment statistics:", error.message);
    return handleApiError(error);
  }
};
