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

  return {
    fetchCommissions,
    fetchCommissionSummary,
    fetchUserCommissions,
    fetchPersonalCommissions,
    fetchCommissionById,
    updateStatus,
    isLoading,
    error,
  };
};
