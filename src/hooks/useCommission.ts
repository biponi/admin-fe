import { useState, useCallback } from "react";
import {
  getCommissions,
  getCommissionSummary,
  getUserCommissions,
  getCommissionById,
  updateCommissionStatus,
  Commission,
  CommissionListResponse,
  CommissionSummaryResponse,
  UserCommissionResponse,
  CommissionQueryParams,
  DateRangeParams,
  getPersonalCommissions,
  // Order-wise imports
  getOrderCommissions,
  getOrderCommissionDetails,
  getOrderCommissionCount,
  bulkUpdateCommissionStatus,
  bulkUpdateCommissionStatusDirect,
  bulkUpdateOrderCommissionStatus,
  bulkUpdateOrderCommissionStatusDirect,
  getBulkOperationStatus,
  OrderCommissionListResponse,
  OrderCommissionDetails,
  OrderCommissionQueryParams,
  BulkCommissionUpdateRequest,
  BulkOperationStatus,
  // User-wise imports
  getUserCommissionsList,
  getUserCommissionHistory,
  getUserCommissionCount,
  getTopPerformers,
  getUserWiseSummaryStats,
  UserCommissionSummary,
  UserCommissionListResponse,
  UserCommissionHistory,
  UserCommissionQueryParams,
  // Export imports
  downloadCommissionPdfSplit,
  downloadCommissionPdf,
  downloadCommissionCsv,
} from "../api/commission";

/**
 * Custom hook for commission management
 * Provides functions to fetch and manage commissions
 */
export const useCommission = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommissions = useCallback(
    async (
      params?: CommissionQueryParams,
    ): Promise<CommissionListResponse | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getCommissions(params);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.error || "Failed to fetch commissions");
          return null;
        }
      } catch (err: any) {
        const errorMessage = "An error occurred while fetching commissions";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchCommissionSummary = useCallback(
    async (
      params?: DateRangeParams,
    ): Promise<CommissionSummaryResponse | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getCommissionSummary(params);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.error || "Failed to fetch summary");
          return null;
        }
      } catch (err: any) {
        const errorMessage = "An error occurred while fetching summary";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchUserCommissions = useCallback(
    async (
      userId: string,
      params?: CommissionQueryParams,
    ): Promise<UserCommissionResponse | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getUserCommissions(userId, params);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.error || "Failed to fetch user commissions");
          return null;
        }
      } catch (err: any) {
        const errorMessage =
          "An error occurred while fetching user commissions";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchPersonalCommissions = useCallback(
    async (
      params?: CommissionQueryParams,
    ): Promise<UserCommissionResponse | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getPersonalCommissions(params);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.error || "Failed to fetch personal commissions");
          return null;
        }
      } catch (err: any) {
        const errorMessage =
          "An error occurred while fetching user commissions";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchCommissionById = useCallback(
    async (id: string): Promise<Commission | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getCommissionById(id);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.error || "Failed to fetch commission");
          return null;
        }
      } catch (err: any) {
        const errorMessage = "An error occurred while fetching commission";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updateStatus = useCallback(
    async (
      id: string,
      status: string,
      notes?: string,
    ): Promise<Commission | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await updateCommissionStatus(id, status, notes);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.error || "Failed to update commission status");
          return null;
        }
      } catch (err: any) {
        const errorMessage =
          "An error occurred while updating commission status";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Order-wise commission functions
  const fetchOrderCommissions = useCallback(
    async (
      params?: OrderCommissionQueryParams,
    ): Promise<OrderCommissionListResponse | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getOrderCommissions(params);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.error || "Failed to fetch order commissions");
          return null;
        }
      } catch (err: any) {
        const errorMessage =
          "An error occurred while fetching order commissions";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchOrderCommissionDetails = useCallback(
    async (orderId: string): Promise<OrderCommissionDetails | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getOrderCommissionDetails(orderId);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.error || "Failed to fetch order commission details");
          return null;
        }
      } catch (err: any) {
        const errorMessage =
          "An error occurred while fetching order commission details";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchOrderCommissionCount = useCallback(
    async (orderId: string): Promise<number | null> => {
      try {
        const result = await getOrderCommissionCount(orderId);
        if (result.success && result.data) {
          return result.data.count;
        }
        return null;
      } catch (err: any) {
        console.error("Error fetching order commission count:", err);
        return null;
      }
    },
    [],
  );

  const submitBulkCommissionUpdate = useCallback(
    async (
      request: BulkCommissionUpdateRequest,
    ): Promise<{ success: boolean; jobId?: string; error?: string }> => {
      setIsLoading(true);
      setError(null);
      try {
        // Use direct update if <= 10 items, otherwise use queue
        const useDirect = (request.commissionIds?.length || 0) <= 10;
        const result = useDirect
          ? await bulkUpdateCommissionStatusDirect(request)
          : await bulkUpdateCommissionStatus(request);

        if (result.success) {
          return {
            success: true,
            jobId: result.data?.jobId,
          };
        } else {
          setError(result.error || "Failed to submit bulk update");
          return { success: false, error: result.error };
        }
      } catch (err: any) {
        const errorMessage = "An error occurred while submitting bulk update";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const submitBulkOrderCommissionUpdate = useCallback(
    async (
      request: BulkCommissionUpdateRequest,
    ): Promise<{ success: boolean; jobId?: string; error?: string }> => {
      setIsLoading(true);
      setError(null);
      try {
        // Use direct update if <= 10 orders, otherwise use queue
        const useDirect = (request.orderNumbers?.length || 0) <= 10;
        const result = useDirect
          ? await bulkUpdateOrderCommissionStatusDirect(request)
          : await bulkUpdateOrderCommissionStatus(request);

        if (result.success) {
          return {
            success: true,
            jobId: result.data?.jobId,
          };
        } else {
          setError(result.error || "Failed to submit bulk order update");
          return { success: false, error: result.error };
        }
      } catch (err: any) {
        const errorMessage =
          "An error occurred while submitting bulk order update";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchBulkOperationStatus = useCallback(
    async (jobId: string): Promise<BulkOperationStatus | null> => {
      try {
        const result = await getBulkOperationStatus(jobId);
        if (result.success && result.data) {
          return result.data;
        }
        return null;
      } catch (err: any) {
        console.error("Error fetching bulk operation status:", err);
        return null;
      }
    },
    [],
  );

  // User-wise commission functions
  const fetchUserCommissionsList = useCallback(
    async (
      params?: UserCommissionQueryParams,
    ): Promise<UserCommissionListResponse | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getUserCommissionsList(params);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.error || "Failed to fetch user commissions list");
          return null;
        }
      } catch (err: any) {
        const errorMessage = "An error occurred while fetching user commissions list";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchUserCommissionHistory = useCallback(
    async (
      userId: string,
      params?: { interval?: "daily" | "weekly" | "monthly"; startDate?: string; endDate?: string; includePerformance?: boolean },
    ): Promise<UserCommissionHistory | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getUserCommissionHistory(userId, params);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.error || "Failed to fetch user commission history");
          return null;
        }
      } catch (err: any) {
        const errorMessage = "An error occurred while fetching user commission history";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const fetchUserCommissionCountById = useCallback(
    async (userId: string): Promise<number | null> => {
      try {
        const result = await getUserCommissionCount(userId);
        if (result.success && result.data) {
          return result.data.totalCommissionCount;
        }
        return null;
      } catch (err: any) {
        console.error("Error fetching user commission count:", err);
        return null;
      }
    },
    [],
  );

  const fetchTopPerformers = useCallback(
    async (
      params?: { limit?: number; status?: string; startDate?: string; endDate?: string },
    ): Promise<{ data: any[]; count: number } | null> => {
      try {
        const result = await getTopPerformers(params);
        if (result.success && result.data) {
          return result.data;
        }
        return null;
      } catch (err: any) {
        console.error("Error fetching top performers:", err);
        return null;
      }
    },
    [],
  );

  const fetchUserWiseSummaryStats = useCallback(
    async (
      params?: { status?: string; startDate?: string; endDate?: string },
    ): Promise<any | null> => {
      try {
        const result = await getUserWiseSummaryStats(params);
        if (result.success && result.data) {
          return result.data;
        }
        return null;
      } catch (err: any) {
        console.error("Error fetching user wise summary stats:", err);
        return null;
      }
    },
    [],
  );

  // Export commission report (client-side)
  const downloadCommissionReport = useCallback(
    async (
      mode: "order-wise" | "user-wise" | "combined",
      filters?: {
        startDate?: string;
        endDate?: string;
        status?: string;
      },
      onProgress?: (progress: number, message?: string) => void
    ) => {
      try {
        const { downloadCommissionPdfClientSide } = await import(
          "../utils/commissionExport"
        );

        const result = await downloadCommissionPdfClientSide(
          {
            mode,
            startDate: filters?.startDate,
            endDate: filters?.endDate,
            status: filters?.status,
          },
          onProgress
        );

        if (result.success) {
          return { success: true, filename: result.filename };
        } else {
          return { success: false, error: result.error };
        }
      } catch (err: any) {
        console.error("Error downloading commission report:", err);
        return {
          success: false,
          error: err.message || "Failed to download commission report",
        };
      }
    },
    []
  );

  return {
    fetchCommissions,
    fetchCommissionSummary,
    fetchUserCommissions,
    fetchPersonalCommissions,
    fetchCommissionById,
    updateStatus,
    // Order-wise functions
    fetchOrderCommissions,
    fetchOrderCommissionDetails,
    fetchOrderCommissionCount,
    submitBulkCommissionUpdate,
    submitBulkOrderCommissionUpdate,
    fetchBulkOperationStatus,
    // User-wise functions
    fetchUserCommissionsList,
    fetchUserCommissionHistory,
    fetchUserCommissionCountById,
    fetchTopPerformers,
    fetchUserWiseSummaryStats,
    // Export functions
    downloadCommissionReport,
    isLoading,
    error,
  };
};
