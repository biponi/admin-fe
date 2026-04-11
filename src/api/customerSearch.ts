import axios from "../api/axios";
import config from "../utils/config";

// TypeScript Interfaces for Customer Search APIs

export interface CustomerInfo {
  name: string;
  mobile: string;
  email: string | null;
}

export interface AddressDetails {
  division: string;
  district: string;
  address: string;
  orderCount: number;
  firstOrderDate: string;
  lastOrderDate: string;
  totalSpent: number;
  orderNumbers: number[];
}

// For single customer with search
export interface CustomerAddressesResponse {
  success: boolean;
  data: {
    customer: CustomerInfo;
    addresses: AddressDetails[];
  };
}

// For multiple customers without search (most frequent)
export interface CustomerWithAddresses {
  customer: CustomerInfo;
  addresses: AddressDetails[];
  orderCount: number;
  totalSpent: number;
  orderNumbers: number[];
}

export interface CustomerAddressesListResponse {
  success: boolean;
  data: {
    customers: CustomerWithAddresses[];
    totalOrdersAnalyzed: number;
  };
}

// Unified customer info for dropdown (combines customer + first address)
export interface CustomerListItem {
  customer: CustomerInfo;
  addresses: AddressDetails[];
  orderCount?: number;
  totalSpent?: number;
}

// Customer Search API
export const customerSearchAPI = {
  /**
   * Get list of most frequent customers (default 10 for dropdown)
   * @param search - Search query (name or phone number) - if empty, returns most frequent customers
   * @param limit - Number of results to return (default: 10, max: 100)
   * @returns List of customers with their addresses
   */
  getCustomerList: async (
    search: string = "",
    limit: number = 10,
  ): Promise<{ success: boolean; data: CustomerListItem[] }> => {
    const params: Record<string, string | number> = {
      limit,
    };

    // Only add search parameter if it's not empty
    if (search && search.trim().length > 0) {
      params.search = search;
    }

    const response = await axios.get(config.order.getCustomerAddress(), {
      params,
    });

    const responseData = response.data;

    // Handle two different response structures:
    // 1. With search: { data: { customer: {...}, addresses: [...] } }
    // 2. Without search: { data: { customers: [...], totalOrdersAnalyzed: 100 } }

    if (responseData.success) {
      if (responseData.data.customers) {
        // Multiple customers (empty search)
        return {
          success: true,
          data: responseData.data.customers,
        };
      } else if (responseData.data.customer) {
        // Single customer (with search)
        return {
          success: true,
          data: [responseData.data],
        };
      }
    }

    // Fallback: return empty array
    return {
      success: responseData.success || false,
      data: [],
    };
  },

  /**
   * Get customer addresses with order history
   * @param search - Search query (name or phone number)
   * @returns Customer addresses with order details
   */
  getCustomerAddresses: async (
    search: string,
  ): Promise<CustomerAddressesResponse> => {
    const params: Record<string, string> = {
      search,
    };

    const response = await axios.get(config.order.getCustomerAddress(), {
      params,
    });
    return response.data;
  },
};

// Helper Functions

/**
 * Format ISO date to readable string
 */
export const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format currency to BDT
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
  }).format(amount);
};
