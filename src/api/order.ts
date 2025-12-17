import axios from "./axios";
import config from "../utils/config";
import { handleApiError } from ".";
import { CourierProvider, IOrder } from "../pages/order/interface";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  warning?: string;
  courierOrdersQueued?: number;
  courierOrdersTotal?: number;
  courierFailures?: Array<{
    orderId: string;
    orderNumber: number;
    error: string;
  }>;
}

// Function to create a new product
export const createOrder = async (
  orderData: any
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post<any>(
      config.order.createOrder(),
      orderData
    );
    if (response.status === 200) {
      return { success: true, data: response.data.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to create product",
      };
    }
  } catch (error: any) {
    console.error("Error creating product:", error.message);
    return handleApiError(error);
  }
};

export const updateOrderProductData = async (
  orderData: any
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.patch<any>(
      config.order.updateOrderProduct(),
      orderData
    );
    if (response.status === 200) {
      return { success: true, data: response.data.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to create product",
      };
    }
  } catch (error: any) {
    console.error("Error creating product:", error.message);
    return handleApiError(error);
  }
};

// Function to search for products
export const getOrders = async (
  limit = 20,
  page = 1,
  status = "processing"
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(config.order.getOrders(), {
      params: { limit, page, status },
    });
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to search orders",
      };
    }
  } catch (error: any) {
    console.error("Error searching orders:", error.message);
    return handleApiError(error);
  }
};

// Function to search for products
export const searchOrders = async (
  query: string,
  status: string = "processing",
  limit = 50,
  page = 1
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post<any>(config.order.searchOrder(), {
      params: { limit, page },
      query,
      status,
    });
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to search orders",
      };
    }
  } catch (error: any) {
    console.error("Error searching orders:", error.message);
    return handleApiError(error);
  }
};

// Function to search for products
export const getOrderAnalysis = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(config.order.getOrderAnalytics());
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to get order analytics",
      };
    }
  } catch (error: any) {
    console.error("Error gettings order analytics:", error.message);
    return handleApiError(error);
  }
};

// Function to add category
export const deleteOrder = async (id: string): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.delete<any>(config.order.deleteOrder(id));
    if (response.status === 200) {
      return { success: true };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to delete order",
      };
    }
  } catch (error: any) {
    console.error("Error deleting order:", error.message);
    return handleApiError(error);
  }
};

// Function to add category
export const updateOrder = async (order: IOrder): Promise<ApiResponse<any>> => {
  try {
    const { id, ...updatedOrder } = order;
    const response = await axios.put<any>(config.order.editOrder(), {
      updatedData: { ...updatedOrder },
      orderId: id,
    });
    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data.message || "Failed to update order",
      };
    }
  } catch (error: any) {
    console.error("Error deleting order:", error.message);
    return handleApiError(error);
  }
};

export const updateOrderStatusData = async (
  orderId: string,
  status: string,
  courierProvider?: CourierProvider
): Promise<ApiResponse<any>> => {
  try {
    const payload: any = {
      orderId,
      status,
    };

    // Add courierProvider if provided and status is shipped
    if (courierProvider && status === "shipped") {
      payload.courierProvider = courierProvider;
    }

    const response = await axios.put<any>(
      config.order.updateOrderStatus(),
      payload
    );
    if (response.status === 200) {
      return {
        success: true,
        data: response.data?.data,
        warning: response.data?.warning,
      };
    } else {
      return {
        success: false,
        error: response.data.message || "Failed to update order",
      };
    }
  } catch (error: any) {
    console.error("Error deleting order:", error.message);
    return handleApiError(error);
  }
};

export const orderBulkAction = async (
  orderIds: number[],
  actionType: string,
  courierProvider?: string
): Promise<ApiResponse<any>> => {
  try {
    const payload: any = {
      orderIds,
      actionType,
    };

    // Add courierProvider if provided and action is shipped
    if (courierProvider && actionType === "shipped") {
      payload.courierProvider = courierProvider;
    }

    const response = await axios.post<any>(
      config.order.orderBulkAction(),
      payload
    );
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        warning: response.data?.warning,
        courierOrdersQueued: response.data?.courierOrdersQueued,
        courierOrdersTotal: response.data?.courierOrdersTotal,
        courierFailures: response.data?.courierFailures,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to update order",
      };
    }
  } catch (error: any) {
    console.error("Error deleting order:", error.message);
    return handleApiError(error);
  }
};

// New modify order API function (Production-ready)
export interface ModifyOrderPayload {
  products: Array<{
    productId: string;
    quantity: number;
    variationId?: string;
  }>;
  pricing?: {
    deliveryCharge?: number;
  };
  customer?: {
    name?: string;
    email?: string;
    phoneNumber?: string;
  };
  shipping?: {
    address?: string;
    district?: string;
    division?: string;
  };
  notes?: string;
}

export interface ModifyOrderResponse {
  message: string;
  order: any;
  summary: {
    oldProductCount: number;
    newProductCount: number;
    oldTotalPrice: number;
    newTotalPrice: number;
    priceDifference: number;
    stockRestored: number;
    stockDeducted: number;
  };
}

export const modifyOrder = async (
  orderId: string,
  payload: ModifyOrderPayload
): Promise<ApiResponse<ModifyOrderResponse>> => {
  try {
    const response = await axios.post<{
      success: boolean;
      data?: ModifyOrderResponse;
      error?: string;
    }>(config.order.modifyOrder(orderId), payload);
    if (response.status === 200 && response.data.success) {
      return { success: true, data: response.data.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to modify order",
      };
    }
  } catch (error: any) {
    console.error("Error modifying order:", error.message);
    return handleApiError(error);
  }
};

// Validation response interfaces
export interface ValidationResult {
  productId: string;
  productName: string;
  variationId?: string;
  variationDetails?: string;
  requestedQuantity: number;
  availableStock: number;
  valid: boolean;
  error?: string;
}

export interface ValidationResponse {
  valid: boolean;
  validationResults: ValidationResult[];
  message?: string;
  estimatedChanges?: {
    oldProductCount: number;
    newProductCount: number;
    oldTotalPrice: number;
    newTotalPrice: number;
    priceDifference: number;
  };
}

// Validate modification before applying (dry-run)
export const validateModification = async (
  orderId: string,
  payload: ModifyOrderPayload
): Promise<ApiResponse<ValidationResponse>> => {
  try {
    const response = await axios.post<{
      success: boolean;
      data?: ValidationResponse;
      error?: string;
    }>(config.order.validateModification(orderId), payload);
    if (response.status === 200 && response.data.success) {
      return { success: true, data: response.data.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to validate modification",
      };
    }
  } catch (error: any) {
    console.error("Error validating modification:", error.message);
    return handleApiError(error);
  }
};

// Modification history interfaces - Updated to match actual API response
export interface ModificationHistoryEntry {
  _id: string;
  orderId: string;
  orderNumber: number;
  operation: string;
  operationDescription: string;
  oldState: any;
  newState: any;
  changesummary: {
    field: string;
    oldValue: any;
    newValue: any;
    _id: string;
  }[];
  performedBy: {
    userId: string;
    userName: string;
    userEmail: string;
    userType: string;
  };
  reason: string;
  notes: string;
  ipAddress: string;
  userAgent: string;
  requestMethod: string;
  requestUrl: string;
  timestamps: {
    createdAt: string;
  };
  isBulkOperation: boolean;
  bulkOperationId: string | null;
  affectedOrdersCount: number;
  id: string;
  __v: number;
}

export interface ModificationHistoryResponse {
  orderId: string;
  modifications: ModificationHistoryEntry[];
}

// Get modification history for an order
export const getModificationHistory = async (
  orderId: string
): Promise<ApiResponse<ModificationHistoryResponse>> => {
  try {
    const response = await axios.get<{
      success: boolean;
      data?: ModificationHistoryResponse;
      error?: string;
    }>(config.order.getModificationHistory(orderId));
    if (response.status === 200 && response.data.success) {
      return { success: true, data: response.data.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to get modification history",
      };
    }
  } catch (error: any) {
    console.error("Error getting modification history:", error.message);
    return handleApiError(error);
  }
};
