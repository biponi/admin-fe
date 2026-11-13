import axiosInstance from "./axios";
import { handleApiError } from ".";

const baseURL = "/api/v1/pending-order";

export type PendingOrderStatus =
  | "awaiting_payment"
  | "converted"
  | "cancelled"
  | "payment_failed"
  | "product_unavailable";

export interface PendingOrderProduct {
  id: string;
  productId: string;
  name: string;
  thumbnail: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
}

export interface PendingOrder {
  id: string;
  paymentId: string | null;
  tempOrderNumber: string;
  customer: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  status: PendingOrderStatus;
  totalPrice: number;
  discount: number;
  deliveryCharge: number;
  shipping: {
    division: string;
    district: string;
    address: string;
  };
  products: PendingOrderProduct[];
  createdAt: string;
  /** TTL cleanup timestamp — null/absent once the order reaches a terminal status */
  expiresAt?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const getPendingOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: PendingOrderStatus | "all";
  search?: string;
}): Promise<
  ApiResponse<{
    pendingOrders: PendingOrder[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
    meta?: { note?: string };
  }>
> => {
  try {
    const response = await axiosInstance.get(`${baseURL}/`, { params });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error fetching pending orders:", error.message);
    return handleApiError(error);
  }
};
