import axios from "./axios";
import {
  StoreReserveHistoryResponse,
  StoreHistoryByStoreResponse,
  StoreHistoryByRecordResponse,
  StoreHistoryQueryParams,
  StoreHistoryApiResponse,
} from "../pages/product/interface.store-history";

const baseURL = `/api/v1`;

const config = {
  productHistory: {
    // Get complete product history
    getProductHistory: (productId: string) =>
      `${baseURL}/product/history/${productId}`,

    // Get product history by store
    getProductHistoryByStore: (productId: string, storeId: number) =>
      `${baseURL}/product/history/${productId}/by-store/${storeId}`,

    // Get product history by record
    getProductHistoryByRecord: (productId: string, recordId: string) =>
      `${baseURL}/product/history/${productId}/by-record/${recordId}`,
  },
};

/**
 * Get complete product history across all stores
 * @param productId - The unique ID of the product
 * @param params - Query parameters for filtering and pagination
 * @returns Store reserve history response
 */
export const getProductHistory = async (
  productId: string,
  params?: StoreHistoryQueryParams
): Promise<StoreHistoryApiResponse<StoreReserveHistoryResponse>> => {
  try {
    const response = await axios.get<any>(
      config.productHistory.getProductHistory(productId),
      {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 20,
          startDate: params?.startDate,
          endDate: params?.endDate,
          sortBy: params?.sortBy || "createdAt",
          sortOrder: params?.sortOrder || "desc",
        },
      }
    );

    if (response.status === 200 && response.data?.success) {
      return {
        success: true,
        message: response.data.message,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        message: response.data?.message || "Failed to fetch product history",
        error: response.data?.error || "Failed to fetch product history",
      };
    }
  } catch (error: any) {
    console.error("Error fetching product history:", error.message);
    return {
      success: false,
      message: "Error fetching product history",
      error: error.message || "Error fetching product history",
    };
  }
};

/**
 * Get product history filtered by a specific store
 * @param productId - The unique ID of the product
 * @param storeId - The ID of the store
 * @param params - Query parameters for filtering and pagination
 * @returns Store-specific history response
 */
export const getProductHistoryByStore = async (
  productId: string,
  storeId: number,
  params?: StoreHistoryQueryParams
): Promise<StoreHistoryApiResponse<StoreHistoryByStoreResponse>> => {
  try {
    const response = await axios.get<any>(
      config.productHistory.getProductHistoryByStore(productId, storeId),
      {
        params: {
          page: params?.page || 1,
          limit: params?.limit || 20,
          startDate: params?.startDate,
          endDate: params?.endDate,
          sortBy: params?.sortBy || "createdAt",
          sortOrder: params?.sortOrder || "desc",
        },
      }
    );

    if (response.status === 200 && response.data?.success) {
      return {
        success: true,
        message: response.data.message,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        message: response.data?.message || "Failed to fetch store history",
        error: response.data?.error || "Failed to fetch store history",
      };
    }
  } catch (error: any) {
    console.error("Error fetching store history:", error.message);
    return {
      success: false,
      message: "Error fetching store history",
      error: error.message || "Error fetching store history",
    };
  }
};

/**
 * Get detailed information about a specific reservation record
 * @param productId - The unique ID of the product
 * @param recordId - The UUID of the record
 * @returns Record-specific history response
 */
export const getProductHistoryByRecord = async (
  productId: string,
  recordId: string
): Promise<StoreHistoryApiResponse<StoreHistoryByRecordResponse>> => {
  try {
    const response = await axios.get<any>(
      config.productHistory.getProductHistoryByRecord(productId, recordId)
    );

    if (response.status === 200 && response.data?.success) {
      return {
        success: true,
        message: response.data.message,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        message: response.data?.message || "Failed to fetch record details",
        error: response.data?.error || "Failed to fetch record details",
      };
    }
  } catch (error: any) {
    console.error("Error fetching record details:", error.message);
    return {
      success: false,
      message: "Error fetching record details",
      error: error.message || "Error fetching record details",
    };
  }
};
