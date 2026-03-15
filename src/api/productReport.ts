import axios from "./axios";
import type { AxiosProgressEvent } from "axios";
import config from "../utils/config";
import { handleApiError } from ".";

/**
 * Product Report API Service
 * Handles product inventory report generation requests
 */

export interface ProductReportOptions {
  format: "pdf" | "csv";
  version: "flat" | "grouped" | "split";
  categoryId?: string | null;
  includeInactive?: boolean;
  onProgress?: (progress: number) => void;
}

export interface ProductReportResponse {
  success: boolean;
  data?: Blob;
  filename?: string;
  error?: string;
}

/**
 * Generate product inventory report
 * @param options - Report generation options
 * @returns Response with blob data and filename
 */
export const generateProductReport = async (
  options: ProductReportOptions
): Promise<ProductReportResponse> => {
  try {
    const {
      format,
      version,
      categoryId = null,
      includeInactive = false,
      onProgress,
    } = options;

    // Build query parameters
    const params: Record<string, string> = {
      format: format.toLowerCase(),
      version: version.toLowerCase(),
      includeInactive: includeInactive.toString(),
    };

    if (categoryId) {
      params.categoryId = categoryId;
    }

    // Make request with blob response type
    const response = await axios.get<any>(
      config.product.getProductReport(),
      {
        params,
        responseType: "blob",
        onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      }
    );

    if (response.status === 200) {
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers?.["content-disposition"];
      let filename = `product-report-${new Date().toISOString().split("T")[0]}.${format}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      return {
        success: true,
        data: response.data,
        filename,
      };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to generate report",
      };
    }
  } catch (error: any) {
    console.error("Error generating product report:", error.message);
    return handleApiError(error);
  }
};

export default generateProductReport;
