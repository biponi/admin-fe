import React from "react";
import { saveAs } from "file-saver";
import { pdf } from "@react-pdf/renderer";
import dayjs from "dayjs";
import { TransactionPDFDocument } from "../components/pdf/TransactionPDF";

export interface TransactionExportData {
  orderId: string | null;
  customerName?: string;
  customerPhone?: string;
  intent: string;
  amount: number;
  status: string;
  source: string;
  trxId: string;
  createdAt: string;
}

/**
 * Transform transaction data for export
 * Excludes: transaction ID, updated date
 * Includes: Order ID, Customer Name, Customer Phone, Amount, vendor_transaction_id as trxId, Created Date, Source
 */
export const transformTransactionData = (
  transactions: any[],
): TransactionExportData[] => {
  return transactions.map((transaction) => {
    // Source logic: if vendor_transaction_id exists, use it; otherwise use payment_from
    const source =
      transaction.vendor_transaction_id &&
      !["pathao", "steadfast", "redx"].includes(
        transaction?.payment_from.toLowerCase(),
      )
        ? "Bkash"
        : transaction.payment_from || "N/A";

    return {
      orderId: transaction.order_id ? `#${transaction.order_id}` : "N/A",
      customerName:
        transaction?.payment_from || transaction.customerName || "N/A",
      customerPhone:
        transaction.order?.customer?.phoneNumber ||
        transaction.customerPhone ||
        "N/A",
      intent: transaction.intent === "purchase" ? "Purchase" : "Sale",
      amount: transaction.amount,
      status: transaction.success ? "Success" : "Failed",
      source: source,
      trxId: transaction.vendor_transaction_id || "N/A",
      createdAt: dayjs(transaction.createdAt).format("Do MMMM YYYY hh.mm A"),
    };
  });
};

/**
 * Export transactions to CSV
 */
export const exportTransactionsToCSV = (
  transactions: any[],
  filename?: string,
) => {
  try {
    const exportData = transformTransactionData(transactions);

    // CSV headers
    const headers = [
      "Order ID",
      "Payment From",
      "Intent",
      "Amount",
      "Status",
      "Source",
      "Trx ID",
      "Created At",
    ];

    // CSV rows
    const rows = exportData.map((item) => [
      item.orderId,
      item.customerName || "N/A",
      item.intent,
      `TK ${Number(item.amount).toFixed(2)}`,
      item.status,
      item.source,
      item.trxId,
      item.createdAt,
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const defaultFilename = `transactions_${dayjs().format("YYYY-MM-DD")}.csv`;
    saveAs(blob, filename || defaultFilename);

    return { success: true };
  } catch (error: any) {
    console.error("Error exporting CSV:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate and download transactions PDF
 */
export const generateTransactionsPDF = async (
  transactions: any[],
  summary?: {
    totalCount: number;
    successCount: number;
    failedCount: number;
    totalAmount: number;
  },
) => {
  try {
    const exportData = transformTransactionData(transactions);

    // Create PDF document
    const blob = await pdf(
      <TransactionPDFDocument data={exportData} summary={summary} />,
    ).toBlob();

    // Download PDF
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions_report_${dayjs().format("YYYY-MM-DD")}.pdf`;
    link.click();
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    return { success: false, error: error.message };
  }
};
