import axios from "../api/axios";
import config from "../utils/config";

// Types for API requests and responses
export interface CreateCourierOrderRequest {
  orderId: string;
  recipientName?: string;
  recipientPhone?: string;
  recipientAddress?: string;
  codAmount?: number;
  note?: string;
}

export interface BulkCreateCourierOrderRequest {
  orderIds: string[];
}

export interface CourierOrderResponse {
  success: boolean;
  data: {
    consignmentId: string;
    trackingCode: string;
    invoice: string;
    message: string;
  };
}

export interface BulkCourierOrderResponse {
  success: boolean;
  data: {
    total: number;
    successful: number;
    failed: number;
    skipped: number;
    results: {
      successful: Array<{
        orderId: string;
        orderNumber: number;
        consignmentId: string;
        trackingCode: string;
        invoice: string;
      }>;
      failed: Array<{
        orderId: string;
        orderNumber: number;
        error: string;
      }>;
    };
  };
}

export interface DeliveryStatusResponse {
  success: boolean;
  data: {
    consignment_id: string;
    tracking_code: string;
    invoice: string;
    delivery_status: string;
    location: string;
    remarks: string;
    updated_at: string;
  };
}

export interface DashboardStats {
  success: boolean;
  data: {
    totalOrders: number;
    statusBreakdown: Array<{
      _id: string;
      count: number;
      totalCOD: number;
      totalCollected: number;
    }>;
    filters: {
      startDate?: string;
      endDate?: string;
    };
  };
}

export interface CourierOrder {
  orderId: string;
  orderNumber: number;
  consignmentId: string;
  trackingCode: string;
  invoice: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number;
  deliveryStatus: string;
  note: string;
  timestamps: {
    createdAt: string;
    updatedAt: string;
  };
}

export interface CourierOrdersListResponse {
  success: boolean;
  data: {
    orders: CourierOrder[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface AccountBalanceResponse {
  success: boolean;
  data: {
    balance: number;
    message: string;
  };
}

export interface InvoiceDetailsResponse {
  success: boolean;
  data: {
    consignmentId: string;
    invoice: string;
    trackingCode: string;
  };
}

export interface DeliveryReportResponse {
  success: boolean;
  data: {
    report: Array<{
      _id: {
        status: string;
        date: string;
      };
      count: number;
      totalCOD: number;
      totalCollected: number;
      totalDeliveryCharges: number;
    }>;
    startDate: string;
    endDate: string;
    generatedAt: string;
  };
}

// API service class
export const courierAPI = {
  /**
   * Create a single courier order
   */
  createOrder: async (
    data: CreateCourierOrderRequest
  ): Promise<CourierOrderResponse> => {
    const response = await axios.post(config.courier.createOrder(), data);
    return response.data;
  },

  /**
   * Create bulk courier orders
   */
  bulkCreateOrders: async (
    data: BulkCreateCourierOrderRequest
  ): Promise<BulkCourierOrderResponse> => {
    const response = await axios.post(config.courier.bulkCreate(), data);
    return response.data;
  },

  /**
   * Check delivery status by identifier
   * @param identifier - consignment ID, invoice, or tracking code
   * @param type - "consignment" | "invoice" | "tracking"
   */
  checkStatus: async (
    identifier: string,
    type: "consignment" | "invoice" | "tracking" = "consignment"
  ): Promise<DeliveryStatusResponse> => {
    const response = await axios.get(
      `${config.courier.status(identifier)}?type=${type}`
    );
    return response.data;
  },

  /**
   * Get courier dashboard statistics
   */
  getDashboard: async (params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<DashboardStats> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.status) queryParams.append("status", params.status);

    const response = await axios.get(
      `${config.courier.dashboard()}?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get paginated courier orders list
   */
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<CourierOrdersListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);

    const response = await axios.get(
      `${config.courier.orders()}?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get account balance
   */
  getBalance: async (): Promise<AccountBalanceResponse> => {
    const response = await axios.get(config.courier.balance());
    return response.data;
  },

  /**
   * Get invoice details by consignment ID
   */
  getInvoice: async (
    consignmentId: string
  ): Promise<InvoiceDetailsResponse> => {
    const response = await axios.get(config.courier.invoice(consignmentId));
    return response.data;
  },

  /**
   * Get delivery report
   */
  getReport: async (
    startDate: string,
    endDate: string
  ): Promise<DeliveryReportResponse> => {
    const response = await axios.get(
      `${config.courier.report()}?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  },
};

export default courierAPI;
