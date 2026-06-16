/**
 * Daily Report PDF Data Processing Utilities
 * Handles data transformation and processing for PDF generation
 */

import { DailyReportData } from "../api/dailyReport";

/**
 * Interface for processed PDF data
 */
export interface ProcessedPdfData {
  reports: DailyReportData[];
  summary: SummaryData;
  reportCount: number;
  dateRange: {
    start: string;
    end: string;
  };
}

/**
 * Interface for summary data
 */
export interface SummaryData {
  totalRevenue: number;
  totalPaid: number;
  totalOrders: number;
  totalCustomers: number;
  totalProductsProcessed: number;
  averageOrderValue: number;
  totalDiscount: number;
  totalDeliveryCharge: number;
}

/**
 * Aggregate summary statistics from multiple reports
 */
export const aggregateSummaryStats = (reports: DailyReportData[]): SummaryData => {
  return reports.reduce(
    (summary, report) => ({
      totalRevenue: summary.totalRevenue + report.sales.totalRevenue,
      totalPaid: summary.totalPaid + report.sales.totalPaid,
      totalOrders: summary.totalOrders + report.orders.totalCount,
      totalCustomers: summary.totalCustomers + report.customers.totalCustomers,
      totalProductsProcessed: summary.totalProductsProcessed + report.products.totalProcessed,
      averageOrderValue:
        summary.totalOrders + report.orders.totalCount > 0
          ? (summary.averageOrderValue * summary.totalOrders +
              report.sales.averageOrderValue * report.orders.totalCount) /
            (summary.totalOrders + report.orders.totalCount)
          : 0,
      totalDiscount: summary.totalDiscount + report.sales.totalDiscount,
      totalDeliveryCharge: summary.totalDeliveryCharge + report.sales.totalDeliveryCharge,
    }),
    {
      totalRevenue: 0,
      totalPaid: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalProductsProcessed: 0,
      averageOrderValue: 0,
      totalDiscount: 0,
      totalDeliveryCharge: 0,
    }
  );
};

/**
 * Process reports for PDF generation
 */
export const processReportsForPDF = (reports: DailyReportData[]): ProcessedPdfData => {
  const summary = aggregateSummaryStats(reports);

  return {
    reports,
    summary,
    reportCount: reports.length,
    dateRange: {
      start: reports[0]?.date || "",
      end: reports[reports.length - 1]?.date || "",
    },
  };
};

/**
 * Prepare data for order status chart
 */
export const prepareOrderStatusChartData = (data: DailyReportData) => {
  return Object.entries(data.orders.byStatus)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Prepare data for payment methods chart
 */
export const preparePaymentMethodsChartData = (data: DailyReportData) => {
  const methodLabels: { [key: string]: string } = {
    cash: "Cash",
    bkash: "bKash",
    nagad: "Nagad",
    card: "Card",
    bank: "Bank Transfer",
    online: "Online",
  };

  return Object.entries(data.payments.byMethod)
    .filter(([_, amount]) => amount > 0)
    .map(([method, amount]) => ({
      name: methodLabels[method] || method,
      value: amount,
    }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Prepare data for customer distribution
 */
export const prepareCustomerDistributionData = (data: DailyReportData) => {
  return [
    {
      name: "New Customers",
      value: data.customers.newCustomers,
      color: "#10b981",
    },
    {
      name: "Returning Customers",
      value: data.customers.returningCustomers,
      color: "#3b82f6",
    },
  ];
};

/**
 * Prepare data for geographic distribution
 */
export const prepareGeographicDistributionData = (data: DailyReportData) => {
  return data.customers.geographicDistribution
    .map((item) => ({
      division: item.division,
      customers: item.count,
      revenue: item.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue);
};

/**
 * Calculate percentage change between two values
 */
export const calculatePercentageChange = (
  oldValue: number,
  newValue: number
): { percentage: number; isIncrease: boolean } => {
  if (oldValue === 0) {
    return {
      percentage: newValue > 0 ? 100 : 0,
      isIncrease: newValue > 0,
    };
  }

  const percentage = ((newValue - oldValue) / Math.abs(oldValue)) * 100;
  return {
    percentage: Math.abs(percentage),
    isIncrease: newValue > oldValue,
  };
};

/**
 * Format currency for display
 */
export const formatCurrencyForDisplay = (amount: number): string => {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format number with commas
 */
export const formatNumberWithCommas = (value: number): string => {
  return new Intl.NumberFormat("en-BD").format(value);
};

/**
 * Validate report data before processing
 */
export const validateReportData = (data: DailyReportData): boolean => {
  // Check if required fields exist
  const requiredFields = [
    "date",
    "timestamp",
    "products",
    "sales",
    "orders",
    "payments",
    "customers",
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }

  // Check if numerical values are valid
  if (data.sales.totalRevenue < 0 || data.orders.totalCount < 0) {
    console.error("Invalid numerical values detected");
    return false;
  }

  return true;
};

/**
 * Filter and sort reports for PDF export
 */
export const filterAndSortReports = (
  reports: DailyReportData[],
  sortOrder: "asc" | "desc" = "desc"
): DailyReportData[] => {
  const validReports = reports.filter(validateReportData);

  return validReports.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Get report metadata for PDF header
 */
export const getReportMetadata = (reports: DailyReportData[]) => {
  if (reports.length === 0) {
    return {
      reportCount: 0,
      dateRange: "No reports",
      generatedAt: new Date().toISOString(),
    };
  }

  const sortedReports = [...reports].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return {
    reportCount: reports.length,
    dateRange:
      reports.length === 1
        ? sortedReports[0].date
        : `${sortedReports[0].date} to ${sortedReports[reports.length - 1].date}`,
    generatedAt: new Date().toISOString(),
  };
};
