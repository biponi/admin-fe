import axios from "./axios";
import { handleApiError } from "./index";

const baseURL = `/api/v1`;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface SalesOverview {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
  statusBreakdown: Array<{
    status: string;
    count: number;
    revenue: number;
  }>;
}

interface SalesTrend {
  period: {
    startDate: string;
    endDate: string;
    interval: string;
  };
  trends: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

interface CustomerInsights {
  period: {
    startDate: string;
    endDate: string;
  };
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    totalOrders: number;
    totalSpent: number;
  }>;
}

interface ProductPerformance {
  period: {
    startDate: string;
    endDate: string;
  };
  topProducts: Array<{
    productId: string;
    productName: string;
    unitsSold: number;
    revenue: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    revenue: number;
    unitsSold: number;
  }>;
}

/**
 * Reports API Service
 * Provides methods for generating and downloading reports
 */

// Get sales overview report
export const getSalesOverview = async (
  startDate: string,
  endDate: string
): Promise<ApiResponse<SalesOverview>> => {
  try {
    const response = await axios.get<any>(`${baseURL}/report/sales-overview`, {
      params: { startDate, endDate },
    });

    if (response.status === 200) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch sales overview",
      };
    }
  } catch (error: any) {
    console.error("Error fetching sales overview:", error.message);
    return handleApiError(error);
  }
};

// Get sales trend report
export const getSalesTrend = async (
  startDate: string,
  endDate: string,
  interval: "day" | "week" | "month" = "day"
): Promise<ApiResponse<SalesTrend>> => {
  try {
    const response = await axios.get<any>(`${baseURL}/report/sales-trend`, {
      params: { startDate, endDate, interval },
    });

    if (response.status === 200) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch sales trend",
      };
    }
  } catch (error: any) {
    console.error("Error fetching sales trend:", error.message);
    return handleApiError(error);
  }
};

// Get customer insights report
export const getCustomerInsights = async (
  startDate: string,
  endDate: string
): Promise<ApiResponse<CustomerInsights>> => {
  try {
    console.log({ from: startDate, to: endDate });
    const response = await axios.get<any>(
      `${baseURL}/report/customer-insights`,
      {
        params: { startDate, endDate },
      }
    );

    if (response.status === 200) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch customer insights",
      };
    }
  } catch (error: any) {
    console.error("Error fetching customer insights:", error.message);
    return handleApiError(error);
  }
};

// Get product performance report
export const getProductPerformance = async (
  startDate: string,
  endDate: string
): Promise<ApiResponse<ProductPerformance>> => {
  try {
    const response = await axios.get<any>(
      `${baseURL}/report/product-performance`,
      {
        params: { startDate, endDate },
      }
    );

    if (response.status === 200) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch product performance",
      };
    }
  } catch (error: any) {
    console.error("Error fetching product performance:", error.message);
    return handleApiError(error);
  }
};

// Export report as CSV
export const exportReportCSV = async (
  startDate: string,
  endDate: string,
  reportType?: string
): Promise<ApiResponse<Blob>> => {
  try {
    const params: any = { format: "csv", startDate, endDate };
    if (reportType) {
      params.reportType = reportType;
    }

    const response = await axios.get<Blob>(`${baseURL}/report/export`, {
      params,
      responseType: "blob",
    });

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      return {
        success: false,
        error: "Failed to export CSV",
      };
    }
  } catch (error: any) {
    console.error("Error exporting CSV:", error.message);
    return handleApiError(error);
  }
};

// Export report as PDF
export const exportReportPDF = async (
  startDate: string,
  endDate: string,
  reportType?: string
): Promise<ApiResponse<Blob>> => {
  try {
    const params: any = { format: "pdf", startDate, endDate };
    if (reportType) {
      params.reportType = reportType;
    }

    const response = await axios.get<Blob>(`${baseURL}/report/export`, {
      params,
      responseType: "blob",
    });

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      return {
        success: false,
        error: "Failed to export PDF",
      };
    }
  } catch (error: any) {
    console.error("Error exporting PDF:", error.message);
    return handleApiError(error);
  }
};

// Add these interfaces to your types file

interface OrderFulfillmentData {
  period: {
    startDate: string;
    endDate: string;
  };
  statusDistribution: Array<{
    status: string;
    count: number;
    totalValue: number;
    averageValue: number;
  }>;
  stuckOrders: {
    count: number;
    orders: Array<{
      orderNumber: number;
      customerName: string;
      customerPhone: string;
      totalPrice: number;
      createdAt: string;
      ageInDays: number;
    }>;
  };
  averageAgeByStatus: Array<{
    status: string;
    averageAgeInDays: number;
  }>;
}

interface PaymentMethodBreakdownData {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalTransactions: number;
    totalAmount: number;
  };
  breakdown: Array<{
    paymentType: string;
    transactionCount: number;
    totalAmount: number;
    averageAmount: number;
  }>;
}

// API Functions

export const getOrderFulfillment = async (
  startDate: string,
  endDate: string
): Promise<ApiResponse<OrderFulfillmentData>> => {
  try {
    const response = await axios.get<any>(
      `${baseURL}/report/order-fulfillment`,
      {
        params: { startDate, endDate },
      }
    );

    if (response.status === 200) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch order fulfillment data",
      };
    }
  } catch (error: any) {
    console.error("Error fetching order fulfillment:", error.message);
    return handleApiError(error);
  }
};

export const getPaymentMethodBreakdown = async (
  startDate: string,
  endDate: string
): Promise<ApiResponse<PaymentMethodBreakdownData>> => {
  try {
    const response = await axios.get<any>(`${baseURL}/report/payment-methods`, {
      params: { startDate, endDate },
    });

    if (response.status === 200) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error:
          response.data.error || "Failed to fetch payment method breakdown",
      };
    }
  } catch (error: any) {
    console.error("Error fetching payment method breakdown:", error.message);
    return handleApiError(error);
  }
};
