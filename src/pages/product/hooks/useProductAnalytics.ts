import { useState } from "react";
import { useToast } from "../../../components/ui/use-toast";
import {
  getProductOrderHistory,
  getProductPurchaseHistory,
  getProductAdjustmentHistory,
} from "../../../api/productAnalytics";
import {
  ProductOrderHistoryResponse,
  ProductPurchaseHistoryResponse,
  ProductAdjustmentHistoryResponse,
  AnalyticsQueryParams,
} from "../interface.analytics";

export const useProductAnalytics = (productId: string) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Order History State
  const [orderHistory, setOrderHistory] =
    useState<ProductOrderHistoryResponse | null>(null);
  const [orderParams, setOrderParams] = useState<AnalyticsQueryParams>({
    page: 1,
    limit: 20,
  });

  // Purchase History State
  const [purchaseHistory, setPurchaseHistory] =
    useState<ProductPurchaseHistoryResponse | null>(null);
  const [purchaseParams, setPurchaseParams] = useState<AnalyticsQueryParams>({
    page: 1,
    limit: 20,
  });

  // Adjustment History State
  const [adjustmentHistory, setAdjustmentHistory] =
    useState<ProductAdjustmentHistoryResponse | null>(null);
  const [adjustmentParams, setAdjustmentParams] =
    useState<AnalyticsQueryParams>({
      page: 1,
      limit: 20,
    });

  const fetchOrderHistory = async (params?: AnalyticsQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProductOrderHistory(productId, {
        ...orderParams,
        ...params,
      });
      if (response?.success && response?.data) {
        setOrderHistory(response.data);
        if (params) setOrderParams({ ...orderParams, ...params });
      } else {
        setError(response?.error || "Failed to fetch order history");
        toast({
          variant: "destructive",
          title: "Error",
          description: response?.error,
        });
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseHistory = async (params?: AnalyticsQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProductPurchaseHistory(productId, {
        ...purchaseParams,
        ...params,
      });
      if (response?.success && response?.data) {
        setPurchaseHistory(response.data);
        if (params) setPurchaseParams({ ...purchaseParams, ...params });
      } else {
        setError(response?.error || "Failed to fetch purchase history");
        toast({
          variant: "destructive",
          title: "Error",
          description: response?.error,
        });
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAdjustmentHistory = async (params?: AnalyticsQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProductAdjustmentHistory(productId, {
        ...adjustmentParams,
        ...params,
      });
      if (response?.success && response?.data) {
        setAdjustmentHistory(response.data);
        if (params) setAdjustmentParams({ ...adjustmentParams, ...params });
      } else {
        setError(response?.error || "Failed to fetch adjustment history");
        toast({
          variant: "destructive",
          title: "Error",
          description: response?.error,
        });
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    orderHistory,
    purchaseHistory,
    adjustmentHistory,
    loading,
    error,
    fetchOrderHistory,
    fetchPurchaseHistory,
    fetchAdjustmentHistory,
    orderParams,
    purchaseParams,
    adjustmentParams,
  };
};
