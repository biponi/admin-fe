// ============================================
// FILE: src/utils/dailyReportExport.ts
// ============================================
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { DailyReportData } from "../api/dailyReport";

/**
 * Transform daily report data for CSV export
 */
export const transformDailyReportForCSV = (report: DailyReportData) => {
  return {
    // Basic Info
    "Report Date": report.date,
    "Generated At": format(new Date(report.timestamp), "yyyy-MM-dd HH:mm:ss"),
    "Status": report.status,
    "Processing Time": report.processingTime || "N/A",

    // Products
    "Total Products Processed": report.products.totalProcessed,
    "Items Updated": report.products.itemsUpdated,
    "Product Processing Time": report.products.processingTime,

    // Sales
    "Total Revenue": report.sales.totalRevenue,
    "Total Paid": report.sales.totalPaid,
    "Total Discount": report.sales.totalDiscount,
    "Total Delivery Charge": report.sales.totalDeliveryCharge,
    "Average Order Value": report.sales.averageOrderValue,

    // Orders
    "Total Orders": report.orders.totalCount,
    "Pending Orders": report.orders.byStatus.pending,
    "Processing Orders": report.orders.byStatus.processing,
    "Shipped Orders": report.orders.byStatus.shipped,
    "Completed Orders": report.orders.byStatus.completed,
    "Cancelled Orders": report.orders.byStatus.cancelled,
    "Failed Orders": report.orders.byStatus.failed,
    "Fully Paid Orders": report.orders.byPaymentStatus.fullyPaid,
    "Partially Paid Orders": report.orders.byPaymentStatus.partiallyPaid,
    "Unpaid Orders": report.orders.byPaymentStatus.unpaid,

    // Payments
    "Cash Payments": report.payments.byMethod.cash,
    "bKash Payments": report.payments.byMethod.bkash,
    "Nagad Payments": report.payments.byMethod.nagad,
    "Card Payments": report.payments.byMethod.card,
    "Bank Payments": report.payments.byMethod.bank,
    "Online Payments": report.payments.byMethod.online,

    // Customers
    "Total Customers": report.customers.totalCustomers,
    "New Customers": report.customers.newCustomers,
    "Returning Customers": report.customers.returningCustomers,
  };
};

/**
 * Export single daily report to CSV
 */
export const exportSingleReportToCSV = (report: DailyReportData) => {
  try {
    const data = transformDailyReportForCSV(report);

    // CSV headers and values
    const headers = Object.keys(data);
    const values = Object.values(data);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      values.map((v) => `"${v}"`).join(","),
    ].join("\n");

    // Add UTF-8 BOM for proper encoding
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const filename = `daily_report_${report.date}.csv`;
    saveAs(blob, filename);

    return { success: true, filename };
  } catch (error) {
    console.error("Error exporting single report to CSV:", error);
    return { success: false, error: "Failed to export report to CSV" };
  }
};

/**
 * Export multiple reports to CSV
 */
export const exportMultipleReportsToCSV = (reports: DailyReportData[]) => {
  try {
    if (reports.length === 0) {
      return { success: false, error: "No reports to export" };
    }

    // Transform all reports
    const allData = reports.map(transformDailyReportForCSV);

    // Get headers from first report
    const headers = Object.keys(allData[0]);

    // Create CSV content
    const rows = allData.map((data) =>
      headers.map((header) => `"${data[header as keyof typeof data]}"`).join(",")
    );

    const csvContent = [headers.join(","), ...rows].join("\n");

    // Add UTF-8 BOM for proper encoding
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const startDate = reports[0].date;
    const endDate = reports[reports.length - 1].date;
    const filename = `daily_reports_${startDate}_to_${endDate}.csv`;
    saveAs(blob, filename);

    return { success: true, filename };
  } catch (error) {
    console.error("Error exporting multiple reports to CSV:", error);
    return { success: false, error: "Failed to export reports to CSV" };
  }
};

/**
 * Export geographic distribution to CSV
 */
export const exportGeographicToCSV = (
  data: Array<{ division: string; count: number; revenue: number }>,
  reportDate: string
) => {
  try {
    if (data.length === 0) {
      return { success: false, error: "No geographic data to export" };
    }

    // Headers
    const headers = ["Division", "Customer Count", "Revenue"];

    // Rows
    const rows = data.map((item) => [
      `"${item.division}"`,
      item.count,
      item.revenue,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    // Add UTF-8 BOM
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const filename = `geographic_distribution_${reportDate}.csv`;
    saveAs(blob, filename);

    return { success: true, filename };
  } catch (error) {
    console.error("Error exporting geographic data to CSV:", error);
    return { success: false, error: "Failed to export geographic data" };
  }
};

/**
 * Export customer insights to CSV
 */
export const exportCustomerInsightsToCSV = (
  data: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
  },
  reportDate: string
) => {
  try {
    const csvData = {
      "Report Date": reportDate,
      "Total Customers": data.totalCustomers,
      "New Customers": data.newCustomers,
      "Returning Customers": data.returningCustomers,
      "New Customer Percentage":
        data.totalCustomers > 0
          ? ((data.newCustomers / data.totalCustomers) * 100).toFixed(2) + "%"
          : "0%",
      "Returning Customer Percentage":
        data.totalCustomers > 0
          ? ((data.returningCustomers / data.totalCustomers) * 100).toFixed(2) + "%"
          : "0%",
    };

    const headers = Object.keys(csvData);
    const values = Object.values(csvData);

    const csvContent = [
      headers.join(","),
      values.map((v) => `"${v}"`).join(","),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const filename = `customer_insights_${reportDate}.csv`;
    saveAs(blob, filename);

    return { success: true, filename };
  } catch (error) {
    console.error("Error exporting customer insights to CSV:", error);
    return { success: false, error: "Failed to export customer insights" };
  }
};

/**
 * Export orders breakdown to CSV
 */
export const exportOrdersBreakdownToCSV = (
  data: {
    totalCount: number;
    byStatus: any;
    byPaymentStatus: any;
  },
  reportDate: string
) => {
  try {
    const rows = [
      ["Order Status", "Count"],
      ...Object.entries(data.byStatus).map(([status, count]) => [
        status,
        count,
      ]),
      [],
      ["Payment Status", "Count"],
      ...Object.entries(data.byPaymentStatus).map(([status, count]) => [
        status,
        count,
      ]),
    ];

    const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const filename = `orders_breakdown_${reportDate}.csv`;
    saveAs(blob, filename);

    return { success: true, filename };
  } catch (error) {
    console.error("Error exporting orders breakdown to CSV:", error);
    return { success: false, error: "Failed to export orders breakdown" };
  }
};

/**
 * Export payment methods to CSV
 */
export const exportPaymentsToCSV = (
  data: {
    byMethod: {
      cash: number;
      bkash: number;
      nagad: number;
      card: number;
      bank: number;
      online: number;
    };
  },
  reportDate: string
) => {
  try {
    const rows = [
      ["Payment Method", "Amount"],
      ["Cash", data.byMethod.cash],
      ["bKash", data.byMethod.bkash],
      ["Nagad", data.byMethod.nagad],
      ["Card", data.byMethod.card],
      ["Bank Transfer", data.byMethod.bank],
      ["Online", data.byMethod.online],
    ];

    const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const filename = `payment_methods_${reportDate}.csv`;
    saveAs(blob, filename);

    return { success: true, filename };
  } catch (error) {
    console.error("Error exporting payment methods to CSV:", error);
    return { success: false, error: "Failed to export payment methods" };
  }
};
