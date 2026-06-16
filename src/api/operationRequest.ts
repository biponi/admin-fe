import axios from "./axios";
import config from "../utils/config";
import { handleApiError } from ".";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface CreateProductDeleteRequestParams {
  productId: string;
  reason: string;
}

interface GetRequestsParams {
  status?: string;
  operationType?: string;
  targetId?: string;
  requesterId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface RejectRequestParams {
  requestId: string;
  adminNotes?: string;
}

/**
 * Create a product deletion request
 * POST /api/v1/operation-request/product-delete/:productId
 */
export const createProductDeleteRequest = async ({
  productId,
  reason,
}: CreateProductDeleteRequestParams): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post<any>(
      config.operationRequest.createProductDelete(productId),
      { reason }
    );

    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to create deletion request",
      };
    }
  } catch (error: any) {
    console.error("Error creating deletion request:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get all operation requests
 * GET /api/v1/operation-request/requests
 */
export const getOperationRequests = async (
  params?: GetRequestsParams
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(
      config.operationRequest.getRequests(),
      { params }
    );

    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch requests",
      };
    }
  } catch (error: any) {
    console.error("Error fetching requests:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get single operation request by ID
 * GET /api/v1/operation-request/request/:id
 */
export const getRequestById = async (
  requestId: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(
      config.operationRequest.getRequest(requestId)
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch request",
      };
    }
  } catch (error: any) {
    console.error("Error fetching request:", error.message);
    return handleApiError(error);
  }
};

/**
 * Approve an operation request (Admin only)
 * PUT /api/v1/operation-request/:id/approve
 */
export const approveRequest = async (
  requestId: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.put<any>(
      config.operationRequest.approve(requestId)
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to approve request",
      };
    }
  } catch (error: any) {
    console.error("Error approving request:", error.message);
    return handleApiError(error);
  }
};

/**
 * Reject an operation request (Admin only)
 * PUT /api/v1/operation-request/:id/reject
 */
export const rejectRequest = async ({
  requestId,
  adminNotes,
}: RejectRequestParams): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.put<any>(
      config.operationRequest.reject(requestId),
      { adminNotes }
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to reject request",
      };
    }
  } catch (error: any) {
    console.error("Error rejecting request:", error.message);
    return handleApiError(error);
  }
};

/**
 * Cancel an operation request (Requester only)
 * PUT /api/v1/operation-request/:id/cancel
 */
export const cancelRequest = async (
  requestId: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.put<any>(
      config.operationRequest.cancel(requestId)
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to cancel request",
      };
    }
  } catch (error: any) {
    console.error("Error cancelling request:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get current user's requests
 * GET /api/v1/operation-request/my-requests
 */
export const getMyRequests = async (
  params?: Pick<GetRequestsParams, "status" | "operationType" | "page" | "limit">
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(
      config.operationRequest.myRequests(),
      { params }
    );

    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch my requests",
      };
    }
  } catch (error: any) {
    console.error("Error fetching my requests:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get operation request statistics (Admin only)
 * GET /api/v1/operation-request/statistics
 */
export const getStatistics = async (
  params?: { startDate?: string; endDate?: string }
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(
      config.operationRequest.statistics(),
      { params }
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch statistics",
      };
    }
  } catch (error: any) {
    console.error("Error fetching statistics:", error.message);
    return handleApiError(error);
  }
};
