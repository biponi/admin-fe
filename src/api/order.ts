import axios from "./axios";
import config from "../utils/config";
import { handleApiError } from ".";
import { IOrder } from "../pages/order/interface";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
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

// Function to search for products
export const getOrders = async (
  limit = 20,
  page = 1
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get<any>(config.order.getOrders(), {
      params: { limit, page },
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
  limit = 50,
  page = 1
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post<any>(config.order.searchOrder(), {
      params: { limit, page },
      query,
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
  status: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.put<any>(config.order.updateOrderStatus(), {
      orderId,
      status,
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



export const orderBulkAction = async (
  orderIds: number[],
  actionType: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post<any>(config.order.orderBulkAction(), {
      orderIds,
      actionType,
    });
    if (response.status === 200) {
      return { success: true, data: response.data?.message };
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
