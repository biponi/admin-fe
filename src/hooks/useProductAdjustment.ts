import { useState } from "react";
import {
  adjustProductStock,
  getProductAdjustments,
  getAdjustmentStats,
  ProductAdjustmentRequest,
  AdjustmentHistoryResponse,
  AdjustmentStatsResponse,
  ProductAdjustmentResponse,
} from "../api/productAdjustment";

/**
 * Custom hook for product stock adjustments
 * Provides functions to adjust stock and track adjustment history
 */
export const useProductAdjustment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Adjust product stock with audit trail
   */
  const adjustStock = async (
    adjustmentData: ProductAdjustmentRequest
  ): Promise<ProductAdjustmentResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adjustProductStock(adjustmentData);

      if (!response.success || !response.data) {
        const errorMsg = response.error || "Failed to adjust product stock";
        setError(errorMsg);
        return null;
      }

      return response.data;
    } catch (err: any) {
      const errorMsg = err.message || "An unexpected error occurred";
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch adjustment history for a product
   */
  const fetchAdjustmentHistory = async (
    productId?: string,
    params?: {
      limit?: number;
      page?: number;
      startDate?: string;
      endDate?: string;
      userId?: string;
    }
  ): Promise<AdjustmentHistoryResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getProductAdjustments(productId, params);

      if (!response.success || !response.data) {
        const errorMsg = response.error || "Failed to fetch adjustment history";
        setError(errorMsg);
        return null;
      }

      return response.data;
    } catch (err: any) {
      const errorMsg = err.message || "An unexpected error occurred";
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch adjustment statistics
   */
  const fetchAdjustmentStats = async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<AdjustmentStatsResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getAdjustmentStats(params);

      if (!response.success || !response.data) {
        const errorMsg =
          response.error || "Failed to fetch adjustment statistics";
        setError(errorMsg);
        return null;
      }

      return response.data;
    } catch (err: any) {
      const errorMsg = err.message || "An unexpected error occurred";
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    adjustStock,
    fetchAdjustmentHistory,
    fetchAdjustmentStats,
    isLoading,
    error,
  };
};

/**
 * Example usage:
 *
 * const ProductStockManager = ({ productId }) => {
 *   const { adjustStock, fetchAdjustmentHistory, isLoading, error } = useProductAdjustment();
 *   const [history, setHistory] = useState([]);
 *
 *   const handleStockAdjustment = async () => {
 *     const result = await adjustStock({
 *       productId: productId,
 *       adjustmentType: 'add',
 *       quantity: 50,
 *       reason: 'Received new stock from supplier XYZ',
 *       notes: 'Invoice #INV-2024-001',
 *       referenceNumber: 'PO-2024-001'
 *     });
 *
 *     if (result) {
 *       console.log('Stock adjusted successfully');
 *       console.log('New quantity:', result.product.newQuantity);
 *       loadHistory(); // Refresh history
 *     }
 *   };
 *
 *   const loadHistory = async () => {
 *     const historyData = await fetchAdjustmentHistory(productId, { limit: 20, page: 1 });
 *     if (historyData) {
 *       setHistory(historyData.adjustments);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleStockAdjustment} disabled={isLoading}>
 *         Adjust Stock
 *       </button>
 *       {error && <div className="error">{error}</div>}
 *       {isLoading && <div>Loading...</div>}
 *     </div>
 *   );
 * };
 */
