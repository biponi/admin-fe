import axios from "./axios";
import config from "../utils/config";
import { handleApiError } from ".";
import { IOrder } from "../pages/order/interface";

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
  status='processing'
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(config.order.getOrders(), {
      params: { limit, page,status },
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
  status:string = 'processing',
  limit = 50,
  page = 1,
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post<any>(config.order.searchOrder(), {
      params: { limit, page },
      query,
      status
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
  courierProvider?: "steadfast" | "pathao"
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

    const response = await axios.put<any>(config.order.updateOrderStatus(), payload);
    if (response.status === 200) {
      return {
        success: true,
        data: response.data?.data,
        warning: response.data?.warning
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
  courierProvider?: "steadfast" | "pathao"
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

    const response = await axios.post<any>(config.order.orderBulkAction(), payload);
    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        warning: response.data?.warning,
        courierOrdersQueued: response.data?.courierOrdersQueued,
        courierOrdersTotal: response.data?.courierOrdersTotal,
        courierFailures: response.data?.courierFailures
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
