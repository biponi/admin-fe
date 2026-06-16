import axios from "./axios";
import { handleApiError } from "./index";

// ==================== TYPE DEFINITIONS ====================

interface ProductMetrics {
  totalProcessed: number;
  itemsUpdated: number;
  processingTime: string;
}

interface SalesMetrics {
  totalRevenue: number;
  totalPaid: number;
  totalDiscount: number;
  totalDeliveryCharge: number;
  averageOrderValue: number;
}

interface OrderStatusBreakdown {
  pending: number;
  processing: number;
  shipped: number;
  completed: number;
  cancelled: number;
  cancel: number;
  failed: number;
  delete: number;
}

interface PaymentStatusBreakdown {
  fullyPaid: number;
  partiallyPaid: number;
  unpaid: number;
}

interface OrderMetrics {
  totalCount: number;
  byStatus: OrderStatusBreakdown;
  byPaymentStatus: PaymentStatusBreakdown;
}

interface PaymentMethodBreakdown {
  cash: number;
  bkash: number;
  nagad: number;
  card: number;
  bank: number;
  online: number;
}

interface PaymentMetrics {
  byMethod: PaymentMethodBreakdown;
}

interface GeographicDistribution {
  division: string;
  count: number;
  revenue: number;
}

interface CustomerMetrics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  geographicDistribution: GeographicDistribution[];
}

export interface DailyReportData {
  date: string;
  timestamp: string;
  products: ProductMetrics;
  sales: SalesMetrics;
  orders: OrderMetrics;
  payments: PaymentMetrics;
  customers: CustomerMetrics;
  processingTime: string;
  status: string;
  error?: string;
  metadata?: any;
}

export interface SummaryStats {
  totalRevenue: number;
  totalPaid: number;
  totalOrders: number;
  totalProductsUpdated: number;
  totalCustomers: number;
  reportCount: number;
}

export interface SummaryStatsResponse {
  success: boolean;
  period: {
    start: string;
    end: string;
  };
  data?: SummaryStats;
  error?: string;
}

export interface DailyReportResponse {
  success: boolean;
  date?: string;
  data?: DailyReportData;
  error?: string;
}

export interface DailyReportsResponse {
  success: boolean;
  count?: number;
  data?: DailyReportData[];
  error?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ==================== API ENDPOINTS ====================

const DAILY_REPORTS_BASE = "/api/v1/reports";

// ==================== API FUNCTIONS ====================

/**
 * Get today's daily report
 */
export const getTodayReport = async (): Promise<
  ApiResponse<DailyReportData>
> => {
  try {
    const response = await axios.get<any>(`${DAILY_REPORTS_BASE}/today`);

    if (response.status === 200) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch today's report",
      };
    }
  } catch (error: any) {
    console.error("Error fetching today's report:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get yesterday's daily report
 */
export const getYesterdayReport = async (): Promise<
  ApiResponse<DailyReportData>
> => {
  try {
    const response = await axios.get<any>(`${DAILY_REPORTS_BASE}/yesterday`);

    if (response.status === 200) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch yesterday's report",
      };
    }
  } catch (error: any) {
    console.error("Error fetching yesterday's report:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get the latest available daily report
 */
export const getLatestReport = async (): Promise<
  ApiResponse<DailyReportData>
> => {
  try {
    const response = await axios.get<any>(`${DAILY_REPORTS_BASE}/daily/latest`);

    if (response.status === 200) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch latest report",
      };
    }
  } catch (error: any) {
    console.error("Error fetching latest report:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get report for a specific date
 * @param date - Date in YYYY-MM-DD format
 */
export const getReportByDate = async (
  date: string,
): Promise<ApiResponse<DailyReportData>> => {
  try {
    const response = await axios.get<any>(
      `${DAILY_REPORTS_BASE}/daily/${date}`,
    );

    if (response.status === 200) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch report for this date",
      };
    }
  } catch (error: any) {
    console.error("Error fetching report by date:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get reports for a date range
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @param limit - Maximum reports to return (default: 30, max: 100)
 */
export const getReportsInRange = async (
  startDate: string,
  endDate: string,
  limit?: number,
): Promise<ApiResponse<DailyReportData[]>> => {
  try {
    const params: any = {
      start: startDate,
      end: endDate,
    };

    if (limit) {
      params.limit = limit;
    }

    const response = await axios.get<any>(`${DAILY_REPORTS_BASE}/daily`, {
      params,
    });

    if (response.status === 200) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch reports in date range",
      };
    }
  } catch (error: any) {
    console.error("Error fetching reports in range:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get summary statistics for a date range
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 */
export const getSummaryStats = async (
  startDate: string,
  endDate: string,
): Promise<SummaryStatsResponse> => {
  try {
    const response = await axios.get<any>(
      `${DAILY_REPORTS_BASE}/stats/summary`,
      {
        params: {
          start: startDate,
          end: endDate,
        },
      },
    );

    if (response.status === 200) {
      return {
        success: true,
        period: response.data.period,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to fetch summary statistics",
      };
    }
  } catch (error: any) {
    console.error("Error fetching summary stats:", error.message);
    return handleApiError(error);
  }
};
