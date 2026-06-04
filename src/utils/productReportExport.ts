import { saveAs } from "file-saver";
import dayjs from "dayjs";
import {
  generateProductReport,
  ProductReportOptions,
} from "../api/productReport";

/**
 * Product Report Export Utility
 * Handles file download and export functionality for product reports
 */

export interface ExportResult {
  success: boolean;
  filename?: string;
  error?: string;
}

/**
 * Download product report with specified options
 * @param options - Report generation options
 * @param customFilename - Optional custom filename
 * @returns Export result with success status and filename
 */
export const downloadProductReport = async (
  options: ProductReportOptions,
  customFilename?: string,
): Promise<ExportResult> => {
  try {
    const response = await generateProductReport(options);

    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error || "Failed to generate report",
      };
    }

    // Determine content type based on format
    const contentType =
      options.format === "pdf" ? "application/pdf" : "text/csv;charset=utf-8;";

    // Create blob
    const blob = new Blob([response.data], { type: contentType });

    // Use custom filename or the one from API response
    const filename = customFilename || response.filename;

    // Download file
    saveAs(blob, filename);

    return {
      success: true,
      filename,
    };
  } catch (error: any) {
    console.error("Error downloading product report:", error.message);
    return {
      success: false,
      error: error.message || "Failed to download report",
    };
  }
};

/**
 * Quick export helpers for common report types
 */

export const downloadPdfFlat = (
  categoryId?: string | null,
  includeInactive?: boolean,
  onProgress?: (progress: number) => void,
): Promise<ExportResult> => {
  return downloadProductReport(
    {
      format: "pdf",
      version: "flat",
      categoryId,
      includeInactive,
      onProgress,
    },
    `product-report-flat-${dayjs().format("YYYY-MM-DD")}.pdf`,
  );
};

export const downloadPdfGrouped = (
  categoryId?: string | null,
  includeInactive?: boolean,
  onProgress?: (progress: number) => void,
): Promise<ExportResult> => {
  return downloadProductReport(
    {
      format: "pdf",
      version: "grouped",
      categoryId,
      includeInactive,
      onProgress,
    },
    `product-report-grouped-${dayjs().format("YYYY-MM-DD")}.pdf`,
  );
};

export const downloadPdfSplit = (
  categoryId?: string | null,
  includeInactive?: boolean,
  onProgress?: (progress: number) => void,
): Promise<ExportResult> => {
  return downloadProductReport(
    {
      format: "pdf",
      version: "split",
      categoryId,
      includeInactive,
      onProgress,
    },
    `product-report-split-${dayjs().format("YYYY-MM-DD")}.pdf`,
  );
};

export const downloadCsvFlat = (
  categoryId?: string | null,
  includeInactive?: boolean,
  onProgress?: (progress: number) => void,
): Promise<ExportResult> => {
  return downloadProductReport(
    {
      format: "csv",
      version: "flat",
      categoryId,
      includeInactive,
      onProgress,
    },
    `product-report-flat-${dayjs().format("YYYY-MM-DD")}.csv`,
  );
};

export const downloadCsvGrouped = (
  categoryId?: string | null,
  includeInactive?: boolean,
  onProgress?: (progress: number) => void,
): Promise<ExportResult> => {
  return downloadProductReport(
    {
      format: "csv",
      version: "grouped",
      categoryId,
      includeInactive,
      onProgress,
    },
    `product-report-grouped-${dayjs().format("YYYY-MM-DD")}.csv`,
  );
};

export const downloadCsvSplit = (
  categoryId?: string | null,
  includeInactive?: boolean,
  onProgress?: (progress: number) => void,
): Promise<ExportResult> => {
  return downloadProductReport(
    {
      format: "csv",
      version: "split",
      categoryId,
      includeInactive,
      onProgress,
    },
    `product-report-split-${dayjs().format("YYYY-MM-DD")}.csv`,
  );
};

export default downloadProductReport;
