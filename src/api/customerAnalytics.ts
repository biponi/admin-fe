import axios from 'axios';
import {
  CustomerAnalyticsResponse,
  CustomerDetailsResponse,
  CustomerStatsResponse,
  CustomerQueryParams,
} from '../pages/customers/interface';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Get authentication token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with auth headers
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Get Customer Analytics
 * GET /api/v1/customers/analytics
 */
export const getCustomerAnalytics = async (
  params?: CustomerQueryParams
): Promise<CustomerAnalyticsResponse> => {
  try {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = queryParams.toString()
      ? `/customers/analytics?${queryParams.toString()}`
      : '/customers/analytics';

    const response = await axiosInstance.get<CustomerAnalyticsResponse>(url);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      data: { customers: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } },
      message: error.response?.data?.message || 'Failed to fetch customer analytics',
    };
  }
};

/**
 * Get Customer Details
 * GET /api/v1/customers/details/:phone/:email
 */
export const getCustomerDetails = async (
  phone: string,
  email?: string
): Promise<CustomerDetailsResponse> => {
  try {
    // URL encode phone and email to handle special characters
    const encodedPhone = encodeURIComponent(phone);
    const encodedEmail = email ? encodeURIComponent(email) : '';

    const url = email
      ? `/customers/details/${encodedPhone}/${encodedEmail}`
      : `/customers/details/${encodedPhone}`;

    const response = await axiosInstance.get<CustomerDetailsResponse>(url);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      data: {} as any,
      message: error.response?.data?.message || 'Failed to fetch customer details',
    };
  }
};

/**
 * Get Customer Statistics
 * GET /api/v1/customers/stats
 */
export const getCustomerStats = async (): Promise<CustomerStatsResponse> => {
  try {
    const response = await axiosInstance.get<CustomerStatsResponse>('/customers/stats');
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      data: {} as any,
      message: error.response?.data?.message || 'Failed to fetch customer statistics',
    };
  }
};
