import axios from "./axios";
import config from "../utils/config";
import { handleApiError } from ".";
import type {
  ApiResponse,
  Package,
  PackageActivity,
  PackageStatus,
  PaginatedResponse,
  DashboardStats,
  BarcodeValidationResult,
  BulkOperationResponse,
  PackageCourier,
  BarcodeResponse,
  PackagingSlipResponse,
} from "../pages/package/interface";

// Helper function to handle responses
const handleResponse = <T>(response: any): ApiResponse<T> => {
  if (response.status === 200 && response.data?.success) {
    return { success: true, data: response.data.data };
  } else {
    return {
      success: false,
      error: response.data?.error || "Operation failed",
    };
  }
};

/**
 * Get package by order number
 * Response structure: { package: Package, order: OrderSummary }
 */
export const getPackage = async (
  orderNumber: number,
): Promise<ApiResponse<Package>> => {
  try {
    const response = await axios.get<any>(config.package.getPackage(orderNumber));
    if (response.status === 200 && response.data?.success) {
      // Merge package and order data
      const { package: pkg, order } = response.data.data;
      const mergedPackage = { ...pkg, order };
      return { success: true, data: mergedPackage };
    } else {
      return {
        success: false,
        error: response.data?.error || "Operation failed",
      };
    }
  } catch (error: any) {
    console.error("Error fetching package:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get packages by status
 * Response structure: { packages: Package[], pagination: {...} }
 * Each package now includes embedded order data
 */
export const getPackagesByStatus = async (
  status: PackageStatus,
  page = 1,
  limit = 50,
): Promise<ApiResponse<PaginatedResponse<Package>>> => {
  try {
    const response = await axios.get<any>(config.package.getByStatus(status), {
      params: { page, limit },
    });
    if (response.status === 200 && response.data?.success) {
      // Order data is already embedded in each package by the backend
      return { success: true, data: response.data.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Operation failed",
      };
    }
  } catch (error: any) {
    console.error("Error fetching packages by status:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get package dashboard stats
 */
export const getPackageDashboard = async (): Promise<
  ApiResponse<{
    stats: DashboardStats;
    recentActivity: PackageActivity[];
  }>
> => {
  try {
    const response = await axios.get<any>(config.package.getDashboard());
    return handleResponse<{
      stats: DashboardStats;
      recentActivity: PackageActivity[];
    }>(response);
  } catch (error: any) {
    console.error("Error fetching package dashboard:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get package activity log
 */
export const getPackageActivities = async (
  orderNumber: number,
  page = 1,
  limit = 50,
): Promise<ApiResponse<PaginatedResponse<PackageActivity>>> => {
  try {
    const response = await axios.get<any>(
      config.package.getActivities(orderNumber),
      {
        params: { page, limit },
      },
    );
    return handleResponse<PaginatedResponse<PackageActivity>>(response);
  } catch (error: any) {
    console.error("Error fetching package activities:", error.message);
    return handleApiError(error);
  }
};

/**
 * Generate barcode for package
 */
export const getPackageBarcode = async (
  orderNumber: number,
): Promise<ApiResponse<BarcodeResponse>> => {
  try {
    const response = await axios.get<any>(
      config.package.getBarcode(orderNumber),
    );
    return handleResponse<BarcodeResponse>(response);
  } catch (error: any) {
    console.error("Error generating barcode:", error.message);
    return handleApiError(error);
  }
};

/**
 * Download packaging slip (also returns barcode)
 */
export const downloadPackagingSlip = async (
  orderNumber: number,
): Promise<ApiResponse<PackagingSlipResponse>> => {
  try {
    const response = await axios.get<any>(
      config.package.downloadSlip(orderNumber),
    );
    return handleResponse<PackagingSlipResponse>(response);
  } catch (error: any) {
    console.error("Error downloading packaging slip:", error.message);
    return handleApiError(error);
  }
};

/**
 * Create package for order
 */
export const createPackage = async (
  orderNumber: number,
): Promise<ApiResponse<Package>> => {
  try {
    const response = await axios.post<any>(config.package.create(), {
      orderNumber,
    });
    return handleResponse<Package>(response);
  } catch (error: any) {
    console.error("Error creating package:", error.message);
    return handleApiError(error);
  }
};

/**
 * Mark package as packed
 */
export const markPackageAsPacked = async (
  orderNumber: number,
  notes?: string,
): Promise<ApiResponse<Package>> => {
  try {
    const response = await axios.post<any>(config.package.markPacked(), {
      orderNumber,
      notes,
    });
    return handleResponse<Package>(response);
  } catch (error: any) {
    console.error("Error marking package as packed:", error.message);
    return handleApiError(error);
  }
};

/**
 * Update package status
 */
export const updatePackageStatus = async (
  orderNumber: number,
  status: PackageStatus,
): Promise<ApiResponse<Package>> => {
  try {
    const response = await axios.put<any>(config.package.updateStatus(orderNumber), {
      status,
    });
    return handleResponse<Package>(response);
  } catch (error: any) {
    console.error("Error updating package status:", error.message);
    return handleApiError(error);
  }
};

/**
 * Request shipping for single package
 */
export const requestPackageShipping = async (
  orderNumber: number,
  courier: PackageCourier,
): Promise<ApiResponse<Package>> => {
  try {
    const response = await axios.post<any>(
      config.package.requestShipping(),
      {
        orderNumber,
        courier,
      },
    );
    return handleResponse<Package>(response);
  } catch (error: any) {
    console.error("Error requesting shipping:", error.message);
    return handleApiError(error);
  }
};

/**
 * Bulk shipping request (async)
 */
export const bulkRequestShipping = async (
  orderNumbers: number[],
  courier: PackageCourier,
): Promise<ApiResponse<BulkOperationResponse>> => {
  try {
    const response = await axios.post<any>(
      config.package.bulkShippingRequest(),
      {
        orderNumbers,
        courier,
      },
    );
    return handleResponse<BulkOperationResponse>(response);
  } catch (error: any) {
    console.error("Error requesting bulk shipping:", error.message);
    return handleApiError(error);
  }
};

/**
 * Validate barcodes
 */
export const validateBarcodes = async (
  barcodes: string[],
): Promise<ApiResponse<BarcodeValidationResult>> => {
  try {
    const response = await axios.post<any>(
      config.package.validateBarcodes(),
      { barcodes },
    );
    return handleResponse<BarcodeValidationResult>(response);
  } catch (error: any) {
    console.error("Error validating barcodes:", error.message);
    return handleApiError(error);
  }
};

/**
 * Cancel package
 */
export const cancelPackage = async (
  orderNumber: number,
  reason?: string,
): Promise<ApiResponse<Package>> => {
  try {
    const response = await axios.put<any>(
      config.package.cancel(orderNumber),
      { reason },
    );
    return handleResponse<Package>(response);
  } catch (error: any) {
    console.error("Error cancelling package:", error.message);
    return handleApiError(error);
  }
};
