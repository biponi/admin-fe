import { useState, useCallback } from "react";
import * as operationRequestApi from "../../../api/operationRequest";
import { toast } from "sonner";

export interface OperationRequest {
  id: string;
  operationType: string;
  targetType: string;
  targetId: string;
  targetName: string;
  requester: string;
  reason?: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | "timeout_expired";
  requestedAt: string;
  expiresAt?: string;
  isExpired?: boolean;
  approver?: string;
  actionAt?: string;
  adminNotes?: string;
}

export interface RequestStatistics {
  operationType: string;
  totalRequests: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  timeoutExpired: number;
}

interface UseOperationRequestsReturn {
  // State
  requests: OperationRequest[];
  statistics: RequestStatistics[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;

  // Actions
  fetchRequests: (params?: {
    status?: string;
    operationType?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  fetchMyRequests: (params?: {
    status?: string;
    operationType?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  fetchStatistics: (startDate?: string, endDate?: string) => Promise<void>;
  approveRequest: (requestId: string) => Promise<boolean>;
  rejectRequest: (requestId: string, adminNotes?: string) => Promise<boolean>;
  cancelRequest: (requestId: string) => Promise<boolean>;
  refresh: () => Promise<void>;

  // Utility
  clearError: () => void;
}

export const useOperationRequests = (): UseOperationRequestsReturn => {
  const [requests, setRequests] = useState<OperationRequest[]>([]);
  const [statistics, setStatistics] = useState<RequestStatistics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);
  const [currentParams, setCurrentParams] = useState<any>({});

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchRequests = useCallback(
    async (params?: {
      status?: string;
      operationType?: string;
      page?: number;
      limit?: number;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const result = await operationRequestApi.getOperationRequests(params);

        if (result.success && result.data) {
          setRequests(result.data.data || []);
          setPagination(result.data.pagination || null);
          setCurrentParams(params || {});
        } else {
          setError(result.error || "Failed to fetch requests");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch requests");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchMyRequests = useCallback(
    async (params?: {
      status?: string;
      operationType?: string;
      page?: number;
      limit?: number;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const result = await operationRequestApi.getMyRequests(params);

        if (result.success && result.data) {
          setRequests(result.data.data || []);
          setPagination(result.data.pagination || null);
          setCurrentParams(params || {});
        } else {
          setError(result.error || "Failed to fetch my requests");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch my requests");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchStatistics = useCallback(
    async (startDate?: string, endDate?: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await operationRequestApi.getStatistics({
          startDate,
          endDate,
        });

        if (result.success && result.data) {
          setStatistics(result.data || []);
        } else {
          setError(result.error || "Failed to fetch statistics");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch statistics");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const approveRequest = useCallback(
    async (requestId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const result = await operationRequestApi.approveRequest(requestId);

        if (result.success) {
          // Update the request in the list
          setRequests((prev) =>
            prev.map((req) =>
              req.id === requestId
                ? { ...req, status: "approved", actionAt: new Date().toISOString() }
                : req
            )
          );
          toast.success("Request approved successfully");
          return true;
        } else {
          setError(result.error || "Failed to approve request");
          toast.error(result.error || "Failed to approve request");
          return false;
        }
      } catch (err: any) {
        const errorMsg = err.message || "Failed to approve request";
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const rejectRequest = useCallback(
    async (requestId: string, adminNotes?: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const result = await operationRequestApi.rejectRequest({
          requestId,
          adminNotes,
        });

        if (result.success) {
          // Update the request in the list
          setRequests((prev) =>
            prev.map((req) =>
              req.id === requestId
                ? {
                    ...req,
                    status: "rejected",
                    adminNotes,
                    actionAt: new Date().toISOString(),
                  }
                : req
            )
          );
          toast.success("Request rejected successfully");
          return true;
        } else {
          setError(result.error || "Failed to reject request");
          toast.error(result.error || "Failed to reject request");
          return false;
        }
      } catch (err: any) {
        const errorMsg = err.message || "Failed to reject request";
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const cancelRequest = useCallback(
    async (requestId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const result = await operationRequestApi.cancelRequest(requestId);

        if (result.success) {
          // Update the request in the list
          setRequests((prev) =>
            prev.map((req) =>
              req.id === requestId
                ? { ...req, status: "cancelled", actionAt: new Date().toISOString() }
                : req
            )
          );
          toast.success("Request cancelled successfully");
          return true;
        } else {
          setError(result.error || "Failed to cancel request");
          toast.error(result.error || "Failed to cancel request");
          return false;
        }
      } catch (err: any) {
        const errorMsg = err.message || "Failed to cancel request";
        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refresh = useCallback(async () => {
    await fetchRequests(currentParams);
  }, [fetchRequests, currentParams]);

  return {
    // State
    requests,
    statistics,
    loading,
    error,
    pagination,

    // Actions
    fetchRequests,
    fetchMyRequests,
    fetchStatistics,
    approveRequest,
    rejectRequest,
    cancelRequest,
    refresh,

    // Utility
    clearError,
  };
};
