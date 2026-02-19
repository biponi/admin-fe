import { useState, useCallback } from 'react';
import { useToast } from '../../../components/ui/use-toast';
import {
  CustomerQueryParams,
  Customer,
  CustomerDetails,
  CustomerStats,
} from '../interface';
import * as customerAnalyticsAPI from '../../../api/customerAnalytics';

export const useCustomerAnalytics = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  // Fetch customers list
  const fetchCustomers = useCallback(async (params?: CustomerQueryParams) => {
    setLoading(true);

    const response = await customerAnalyticsAPI.getCustomerAnalytics(params);

    if (response?.success && response?.data) {
      setCustomers(response.data.customers);
      setPagination(response.data.pagination);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response?.message || 'Failed to fetch customers',
      });
      setCustomers([]);
      setPagination({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
    }
    setLoading(false);
  }, [toast]);

  // Fetch single customer details
  const fetchCustomerDetails = useCallback(async (phone: string, email?: string) => {
    setLoading(true);

    const response = await customerAnalyticsAPI.getCustomerDetails(phone, email);

    if (response?.success && response?.data) {
      setSelectedCustomer(response.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response?.message || 'Failed to fetch customer details',
      });
      setSelectedCustomer(null);
    }
    setLoading(false);
  }, [toast]);

  // Fetch customer statistics
  const fetchStats = useCallback(async () => {
    setLoading(true);

    const response = await customerAnalyticsAPI.getCustomerStats();

    if (response?.success && response?.data) {
      setStats(response.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response?.message || 'Failed to fetch customer statistics',
      });
      setStats(null);
    }
    setLoading(false);
  }, [toast]);

  return {
    loading,
    customers,
    selectedCustomer,
    stats,
    pagination,
    fetchCustomers,
    fetchCustomerDetails,
    fetchStats,
    setSelectedCustomer,
  };
};
