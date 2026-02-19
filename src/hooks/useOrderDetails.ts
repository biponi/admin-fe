import { useState, useCallback } from 'react';
import { useToast } from '../components/ui/use-toast';
import { getOrderDetails } from '../api/order';
import { IOrder } from '../pages/order/interface';

export const useOrderDetails = () => {
  const { toast } = useToast();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async (orderNumber: string | number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getOrderDetails(String(orderNumber));

      if (response.success && response.data) {
        setOrder(response.data);
        return response.data;
      } else {
        const errorMsg = response.error || 'Failed to fetch order details';
        setError(errorMsg);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMsg,
        });
        return null;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch order details';
      setError(errorMsg);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMsg,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refresh = useCallback(async () => {
    if (order?.orderNumber) {
      return await fetchOrder(order.orderNumber);
    }
    return null;
  }, [order?.orderNumber, fetchOrder]);

  const clearOrder = useCallback(() => {
    setOrder(null);
    setError(null);
  }, []);

  return {
    order,
    loading,
    error,
    fetchOrder,
    refresh,
    clearOrder,
  };
};
