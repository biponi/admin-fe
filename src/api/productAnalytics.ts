import axios from "./axios";
import config from "../utils/config";
import { handleApiError } from ".";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  warning?: string;
}

// ============= Type Definitions =============

export interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface ProductOrderHistoryResponse {
  product: {
    id: string;
    name: string;
    sku: string;
    slug: string;
    thumbnail: string;
    unitPrice: number;
    currentStock: number;
  };
  summary: {
    totalOrders: number;
    totalQuantitySold: number;
    totalRevenue: number;
    averageOrderValue: number;
    averageQuantityPerOrder: number;
    uniqueCustomers: number;
    statusBreakdown: Record<string, number>;
  };
  orders: OrderData[];
  customers: CustomerData[];
  pagination: PaginationMetadata;
}

export interface OrderData {
  orderId: string;
  orderNumber: number;
  customer: {
    name: string;
    email: string;
    phoneNumber: string;
    address?: string;
  };
  productDetails: {
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discount: number;
    variantId?: string;
    variation?: {
      size?: string;
      color?: string;
    };
  }[];
  orderDate: string;
  status: string;
  orderTotal: number;
  deliveryStatus: string | null;
  paid: number;
  remaining: number;
  discount: number;
  deliveryCharge: number;
  notes?: string;
  orderCreatedBy: string;
  courier?: string;
  estimatedDeliveryDate?: string | null;
}

export interface CustomerData {
  customerPhone: string;
  customerName: string;
  customerEmail: string;
  customerAddress?: string;
  totalOrders: number;
  totalQuantity: number;
  totalSpent: number;
  averageOrderValue: number;
  firstOrderDate: string;
  lastOrderDate: string;
}

export interface ProductPurchaseHistoryResponse {
  product: {
    id: string;
    name: string;
    sku: string;
    currentStock: number;
    lastPurchasedAt: string;
  };
  summary: {
    totalPurchaseOrders: number;
    totalQuantityPurchased: number;
    totalCost: number;
    averagePurchaseQuantity: number;
    averageCostPerUnit: number;
    lastPurchaseOrder: {
      purchaseNumber: number;
      date: string;
      quantity: number;
      unitPrice: number;
    };
  };
  purchaseOrders: PurchaseOrderData[];
  suppliers: any[];
  pagination: PaginationMetadata;
}

export interface PurchaseOrderData {
  purchaseOrderId: string;
  purchaseNumber: number;
  productDetails: {
    quantity: number;
    unitPrice: number;
    totalCost: number;
    variantId?: string;
    title: string;
    sku: string;
    variation?: {
      size?: string;
      color?: string;
    };
  }[];
  purchaseDate: string;
  totalAmount: number;
  createdAt: string;
}

export interface ProductAdjustmentHistoryResponse {
  product: {
    id: string;
    name: string;
    sku: string;
    currentQuantity: number;
  };
  summary: {
    totalAdjustments: number;
    totalAdded: number;
    totalRemoved: number;
    totalSet: number;
    netChange: number;
    pendingApprovals: number;
    approvedAdjustments: number;
    rejectedAdjustments: number;
    typeBreakdown: Record<string, number>;
    statusBreakdown: Record<string, number>;
  };
  adjustments: AdjustmentData[];
  adjustmentSummary: any[];
  pagination: PaginationMetadata;
}

export interface AdjustmentData {
  adjustmentId: string;
  adjustmentType: "add" | "remove" | "set";
  oldQuantity: number;
  newQuantity: number;
  quantityChange: number;
  variationId?: string;
  variationDetails?: {
    size?: string;
    color?: string;
    sku?: string;
  };
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
  approvedBy?: {
    userId: string;
    userName: string;
    approvedAt: string;
  };
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

// ============= API Functions =============

/**
 * Get product order history with pagination and filtering
 */
export const getProductOrderHistory = async (
  productId: string,
  params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    startDate?: string;
    endDate?: string;
    status?: string;
  }
): Promise<ApiResponse<ProductOrderHistoryResponse>> => {
  try {
    const response = await axios.get<any>(
      config.product.getProductOrderHistory(productId),
      { params }
    );

    if (response.status === 200 && response.data?.success) {
      return { success: true, data: response.data.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch order history",
      };
    }
  } catch (error: any) {
    console.error("Error fetching order history:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get product purchase history with pagination and filtering
 */
export const getProductPurchaseHistory = async (
  productId: string,
  params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    startDate?: string;
    endDate?: string;
  }
): Promise<ApiResponse<ProductPurchaseHistoryResponse>> => {
  try {
    const response = await axios.get<any>(
      config.product.getProductPurchaseHistory(productId),
      { params }
    );

    if (response.status === 200 && response.data?.success) {
      return { success: true, data: response.data.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch purchase history",
      };
    }
  } catch (error: any) {
    console.error("Error fetching purchase history:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get product adjustment history with pagination and filtering
 */
export const getProductAdjustmentHistory = async (
  productId: string,
  params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    startDate?: string;
    endDate?: string;
    adjustmentType?: "add" | "remove" | "set";
    status?: string;
  }
): Promise<ApiResponse<ProductAdjustmentHistoryResponse>> => {
  try {
    const response = await axios.get<any>(
      config.product.getProductAdjustmentHistory(productId),
      { params }
    );

    if (response.status === 200 && response.data?.success) {
      return { success: true, data: response.data.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch adjustment history",
      };
    }
  } catch (error: any) {
    console.error("Error fetching adjustment history:", error.message);
    return handleApiError(error);
  }
};

/**
 * Send bulk SMS or Email to customers
 */
export const bulkCustomerAction = async (
  customerPhones: string[],
  actionType: "sms" | "email",
  message?: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post<any>(
      config.product.bulkCustomerAction(),
      {
        customerPhones,
        actionType,
        message,
      }
    );

    if (response.status === 200 && response.data?.success) {
      return { success: true, data: response.data.data };
    } else {
      return {
        success: false,
        error: response.data?.error || `Failed to send bulk ${actionType}`,
      };
    }
  } catch (error: any) {
    console.error(`Error sending bulk ${actionType}:`, error.message);
    return handleApiError(error);
  }
};
