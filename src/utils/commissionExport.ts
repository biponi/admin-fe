import { saveAs } from "file-saver";
import dayjs from "dayjs";
import api from "../api/axios";
import config from "./config";

/**
 * Commission Export Options
 */
interface CommissionExportOptions {
  format?: "pdf" | "csv";
  version?: "order-wise" | "user-wise" | "product-wise";
  startDate?: string;
  endDate?: string;
  status?: string;
  onProgress?: (progress: number) => void;
}

/**
 * Generate Commission Report
 * Makes API request to backend and returns blob data
 */
export const generateCommissionReport = async (
  options: CommissionExportOptions = {}
): Promise<{
  success: boolean;
  data?: Blob;
  filename?: string;
  error?: string;
}> => {
  try {
    const params: Record<string, string> = {
      format: options.format || "pdf",
      version: options.version || "order-wise",
    };

    // Add optional filters
    if (options.startDate) params.startDate = options.startDate;
    if (options.endDate) params.endDate = options.endDate;
    if (options.status) params.status = options.status;

    const response = await api.get(config.commission.getExportReport(), {
      params,
      responseType: "blob",
      onDownloadProgress: (progressEvent) => {
        if (options.onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          options.onProgress(progress);
        }
      },
    });

    if (response.status === 200) {
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers?.["content-disposition"];
      let filename = `commission-report-${dayjs().format("YYYY-MM-DD")}.${options.format}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch?.[1]) {
          filename = filenameMatch[1];
        }
      }

      return {
        success: true,
        data: response.data,
        filename,
      };
    }

    return {
      success: false,
      error: "Failed to generate commission report",
    };
  } catch (error: any) {
    console.error("Commission export error:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to generate report",
    };
  }
};

/**
 * Download Commission PDF
 * Wrapper function that triggers PDF download
 */
export const downloadCommissionPdf = async (
  options: Omit<CommissionExportOptions, "format"> = {}
): Promise<{ success: boolean; filename?: string; error?: string }> => {
  const result = await generateCommissionReport({ ...options, format: "pdf" });

  if (result.success && result.data) {
    const blob = new Blob([result.data], { type: "application/pdf" });
    saveAs(blob, result.filename);
    return { success: true, filename: result.filename };
  }

  return { success: false, error: result.error };
};

/**
 * Download Commission CSV
 * Wrapper function that triggers CSV download
 */
export const downloadCommissionCsv = async (
  options: Omit<CommissionExportOptions, "format"> = {}
): Promise<{ success: boolean; filename?: string; error?: string }> => {
  const result = await generateCommissionReport({ ...options, format: "csv" });

  if (result.success && result.data) {
    const blob = new Blob([result.data], { type: "text/csv" });
    saveAs(blob, result.filename);
    return { success: true, filename: result.filename };
  }

  return { success: false, error: result.error };
};

/**
 * Download Commission Report (PDF Split Version)
 * Main entry point following the pattern from productReportExport
 */
export const downloadCommissionPdfSplit = async (
  startDate?: string,
  endDate?: string,
  status?: string,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; filename?: string; error?: string }> => {
  return downloadCommissionPdf({
    version: "order-wise",
    startDate,
    endDate,
    status,
    onProgress,
  });
};

/**
 * Download Commission PDF (Client-Side Generation)
 * Uses client-side PDF generation instead of backend API
 */
export const downloadCommissionPdfClientSide = async (
  options: {
    mode: "order-wise" | "user-wise" | "combined";
    startDate?: string;
    endDate?: string;
    status?: string;
  },
  onProgress?: (progress: number, message?: string) => void
): Promise<{ success: boolean; filename?: string; error?: string }> => {
  try {
    const { downloadCommissionPdfClientSide: generate } = await import(
      "./commissionPdfExport"
    );
    return await generate(options, onProgress);
  } catch (error: any) {
    console.error("Client-side PDF generation error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate PDF client-side",
    };
  }
};
