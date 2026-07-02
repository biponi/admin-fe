import axios from "./axios";
import { handleApiError } from "./index";

const baseURL = `/api/v1/report`;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

export interface DashboardData {
  period: DateRange;
  kpis: {
    sales: {
      grossRevenue: number;
      netRevenue: number;
      totalOrders: number;
      completedOrders: number;
      pendingOrders: number;
      processingOrders: number;
      shippedOrders: number;
      cancelledOrders: number;
      returnedOrders: number;
      refundedOrders: number;
      growth: { revenue: number; orders: number };
    };
    financial: {
      totalProfit: number;
      totalDiscount: number;
      shippingIncome: number;
      refundAmount: number;
    };
    customer: {
      totalCustomers: number;
      newCustomers: number;
      returningCustomers: number;
    };
    performance: {
      aov: number;
      avgRevenuePerCustomer: number;
      orderCompletionRate: number;
      refundRate: number;
      returnRate: number;
    };
  };
  charts: {
    salesTrend: Array<{ date: string; sales: number; orders: number }>;
    revenueDistribution: Array<{ segment: string; value: number }>;
    topCategories: Array<{ category: string; revenue: number }>;
    salesHeatmap: Array<{ hour: number; sales: number; orders: number }>;
  };
  businessSummary: {
    currentPeriod: Record<string, number>;
    previousPeriod: Record<string, number>;
  };
}

export interface SalesData {
  period: DateRange;
  dailySales: Array<{
    date: string;
    orders: number;
    grossRevenue: number;
    discounts: number;
    netRevenue: number;
    profit: number;
    deliveryCharges: number;
    aov: number;
  }>;
  comparison: {
    currentPeriod: {
      period: DateRange;
      totalOrders: number;
      totalRevenue: number;
      totalDiscounts: number;
      aov: number;
    };
    previousPeriod: {
      period: DateRange;
      totalOrders: number;
      totalRevenue: number;
      totalDiscounts: number;
      aov: number;
    };
    growth: { orders: number; revenue: number; aov: number };
  };
  byCategory: Array<{
    categoryId: string;
    orders: number;
    revenue: number;
    quantitySold: number;
    categoryName: string;
  }>;
  byBrand: Array<{
    brand: string;
    revenue: number;
    quantitySold: number;
    orders: number;
  }>;
  byPaymentMethod: Array<{
    paymentMethod: string;
    orders: number;
    revenue: number;
  }>;
  byChannel: Array<{
    channel: string;
    orders: number;
    revenue: number;
    discounts: number;
  }>;
}

export interface OrdersData {
  period: DateRange;
  summary: Array<{
    status: string;
    count: number;
    revenue: number;
    subtotal: number;
  }>;
  dailyReport: Array<{
    date: string;
    totalOrders: number;
    totalRevenue: number;
    completed: number;
    cancelled: number;
    returned: number;
  }>;
  topCancelledProducts: Array<{
    productId: string;
    productName: string;
    cancelledOrders: number;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  lifecycle: {
    avgFulfillmentHours: number;
    minFulfillmentHours: number;
    maxFulfillmentHours: number;
    totalOrders: number;
  };
}

export interface ProductsData {
  period: DateRange;
  summary: {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    outOfStock: number;
    lowStock: number;
  };
  bestSellingProducts: Array<{
    productId: string;
    productName: string;
    sku: string;
    thumbnail: string;
    totalSold: number;
    totalRevenue: number;
    avgUnitPrice: number;
    orderCount: number;
  }>;
  worstSellingProducts: Array<any>;
  highestRevenueProducts: Array<any>;
  highestProfitProducts: Array<{
    productId: string;
    productName: string;
    totalRevenue: number;
    totalSold: number;
    estimatedMargin: number;
  }>;
  neverSoldProducts: Array<{
    productId: string;
    productName: string;
    sku: string;
    stock: number;
    createdAt: string;
  }>;
  categoryPerformance: Array<{
    categoryId: string;
    revenue: number;
    orders: number;
    productsSold: number;
  }>;
  brandPerformance: Array<{ brand: string; revenue: number; orders: number }>;
}

export interface CustomersData {
  period: DateRange;
  summary: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    totalRevenue: number;
    avgRevenuePerCustomer: number;
  };
  customerLifetimeValue: Array<{
    phoneNumber: string;
    customerName: string;
    email: string;
    totalOrders: number;
    totalSpend: number;
    avgOrderValue: number;
    lifetimeValue: number;
    firstOrderDate: string;
    lastOrderDate: string;
  }>;
  inactiveCustomers: Array<{
    phoneNumber: string;
    customerName: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate: string;
    daysSinceLastOrder: number;
  }>;
  locationReport: Array<{
    district: string;
    division: string;
    customerCount: number;
    orders: number;
    revenue: number;
  }>;
  repeatPurchaseAnalysis: {
    summary: {
      totalCustomers: number;
      oneTimeCustomers: number;
      repeatCustomers: number;
      repeatRate: number;
      avgDaysBetweenOrders: number;
    };
    topRepeatCustomers: Array<any>;
  };
}

export interface PaymentsData {
  period: DateRange;
  summary: {
    totalPayments: number;
    totalAmount: number;
    successful: { count: number; amount: number };
    failed: { count: number; amount: number };
    processing: { count: number; amount: number };
  };
  methodAnalysis: Array<{
    method: string;
    orders: number;
    revenue: number;
    successRate: number;
  }>;
  failedPayments: Array<any>;
  successTrend: Array<{
    period: string;
    total: number;
    completed: number;
    failed: number;
    totalAmount: number;
    successRate: number;
  }>;
}

export interface FinanceData {
  period: DateRange;
  summary: {
    grossRevenue: number;
    netRevenue: number;
    totalDiscounts: number;
    totalDeliveryCharges: number;
    estimatedProductCost: number;
    grossProfit: number;
    totalRefunds: number;
    netProfit: number;
    totalOrders: number;
    aov: number;
  };
  profitTrend: Array<{
    period: string;
    revenue: number;
    discounts: number;
    deliveryCharges: number;
    estimatedCost: number;
    profit: number;
    orders: number;
    margin: number;
  }>;
  grossMarginByCategory: Array<{
    categoryId: string;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  }>;
  profitByProduct: Array<{
    productId: string;
    productName: string;
    revenue: number;
    cost: number;
    profit: number;
    quantity: number;
  }>;
  cashFlow: {
    moneyIn: { productSales: number; shippingCharges: number; total: number };
    moneyOut: { refunds: number; estimatedProductCost: number; total: number };
    netCashFlow: number;
    collected: number;
    outstanding: number;
  };
}

export interface InventoryData {
  summary: {
    totalProducts: number;
    totalStock: number;
    totalCostValue: number;
    totalSellingValue: number;
    potentialProfit: number;
    outOfStock: number;
    lowStock: number;
  };
  currentInventory: {
    products: Array<any>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  inventoryValue: Array<any>;
  deadStock: Array<{
    productId: string;
    productName: string;
    sku: string;
    stock: number;
    value: number;
  }>;
  inventoryAging: Array<{
    period: string;
    productCount: number;
    totalStock: number;
    totalValue: number;
  }>;
}

export interface ShippingData {
  period: DateRange;
  summary: {
    totalShipments: number;
    delivered: number;
    inTransit: number;
    pending: number;
    failed: number;
    returned: number;
    totalDeliveryCharges: number;
    totalCollected: number;
    providers: Array<{ provider: string; count: number }>;
  };
  courierPerformance: Array<{
    provider: string;
    totalOrders: number;
    delivered: number;
    failed: number;
    returned: number;
    totalCOD: number;
    totalCollected: number;
    avgDeliveryCharge: number;
    deliveryRate: number;
  }>;
  failedDeliveries: Array<any>;
}

export interface RefundsData {
  period: DateRange;
  summary: {
    refundRequests: number;
    approvedRefunds: number;
    pendingRefunds: number;
    failedRefunds: number;
    returnedOrders: number;
    totalRefundAmount: number;
  };
  reasonAnalysis: Array<{
    reason: string;
    count: number;
    totalAmount: number;
    percentage: number;
  }>;
  mostReturnedProducts: Array<{
    productId: string;
    productName: string;
    returnCount: number;
    totalReturnedQty: number;
    revenueLost: number;
  }>;
  returnTrend: Array<{
    period: string;
    returns: number;
    refundAmount: number;
  }>;
}

export interface CouponsData {
  period: DateRange;
  summary: {
    couponsUsed: number;
    totalDiscount: number;
    revenueGenerated: number;
    averageDiscount: number;
  };
  performance: Array<{
    couponCode: string;
    couponType: string;
    usage: number;
    revenue: number;
    discount: number;
  }>;
  discountImpact: {
    withDiscount: {
      orders: number;
      totalDiscount: number;
      avgBasketSize: number;
      revenueGenerated: number;
    };
    withoutDiscount: {
      orders: number;
      avgBasketSize: number;
      revenueGenerated: number;
    };
  };
}

const buildParams = (
  startDate: string,
  endDate: string,
  extra?: Record<string, string>,
) => ({
  startDate,
  endDate,
  ...extra,
});

export const fetchDashboard = async (
  startDate: string,
  endDate: string,
): Promise<ApiResponse<DashboardData>> => {
  try {
    const response = await axios.get(`${baseURL}/dashboard`, {
      params: buildParams(startDate, endDate),
    });
    if (response.status === 200)
      return { success: true, data: response.data.data };
    return {
      success: false,
      error: response.data.error || "Failed to fetch dashboard",
    };
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const fetchSales = async (
  startDate: string,
  endDate: string,
): Promise<ApiResponse<SalesData>> => {
  try {
    const response = await axios.get(`${baseURL}/sales`, {
      params: buildParams(startDate, endDate),
    });
    if (response.status === 200)
      return { success: true, data: response.data.data };
    return {
      success: false,
      error: response.data.error || "Failed to fetch sales",
    };
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const fetchOrders = async (
  startDate: string,
  endDate: string,
): Promise<ApiResponse<OrdersData>> => {
  try {
    const response = await axios.get(`${baseURL}/orders`, {
      params: buildParams(startDate, endDate),
    });
    if (response.status === 200)
      return { success: true, data: response.data.data };
    return {
      success: false,
      error: response.data.error || "Failed to fetch orders",
    };
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const fetchProducts = async (
  startDate: string,
  endDate: string,
): Promise<ApiResponse<ProductsData>> => {
  try {
    const response = await axios.get(`${baseURL}/products`, {
      params: buildParams(startDate, endDate),
    });
    if (response.status === 200)
      return { success: true, data: response.data.data };
    return {
      success: false,
      error: response.data.error || "Failed to fetch products",
    };
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const fetchCustomers = async (
  startDate: string,
  endDate: string,
): Promise<ApiResponse<CustomersData>> => {
  try {
    const response = await axios.get(`${baseURL}/customers`, {
      params: buildParams(startDate, endDate),
    });
    if (response.status === 200)
      return { success: true, data: response.data.data };
    return {
      success: false,
      error: response.data.error || "Failed to fetch customers",
    };
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const fetchPayments = async (
  startDate: string,
  endDate: string,
): Promise<ApiResponse<PaymentsData>> => {
  try {
    const response = await axios.get(`${baseURL}/payments`, {
      params: buildParams(startDate, endDate),
    });
    if (response.status === 200)
      return { success: true, data: response.data.data };
    return {
      success: false,
      error: response.data.error || "Failed to fetch payments",
    };
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const fetchFinance = async (
  startDate: string,
  endDate: string,
): Promise<ApiResponse<FinanceData>> => {
  try {
    const response = await axios.get(`${baseURL}/finance`, {
      params: buildParams(startDate, endDate),
    });
    if (response.status === 200)
      return { success: true, data: response.data.data };
    return {
      success: false,
      error: response.data.error || "Failed to fetch finance",
    };
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const fetchInventory = async (): Promise<ApiResponse<InventoryData>> => {
  try {
    const response = await axios.get(`${baseURL}/inventory`);
    if (response.status === 200)
      return { success: true, data: response.data.data };
    return {
      success: false,
      error: response.data.error || "Failed to fetch inventory",
    };
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const fetchShipping = async (
  startDate: string,
  endDate: string,
): Promise<ApiResponse<ShippingData>> => {
  try {
    const response = await axios.get(`${baseURL}/shipping`, {
      params: buildParams(startDate, endDate),
    });
    if (response.status === 200)
      return { success: true, data: response.data.data };
    return {
      success: false,
      error: response.data.error || "Failed to fetch shipping",
    };
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const fetchRefunds = async (
  startDate: string,
  endDate: string,
): Promise<ApiResponse<RefundsData>> => {
  try {
    const response = await axios.get(`${baseURL}/refunds`, {
      params: buildParams(startDate, endDate),
    });
    if (response.status === 200)
      return { success: true, data: response.data.data };
    return {
      success: false,
      error: response.data.error || "Failed to fetch refunds",
    };
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const fetchCoupons = async (
  startDate: string,
  endDate: string,
): Promise<ApiResponse<CouponsData>> => {
  try {
    const response = await axios.get(`${baseURL}/coupons`, {
      params: buildParams(startDate, endDate),
    });
    if (response.status === 200)
      return { success: true, data: response.data.data };
    return {
      success: false,
      error: response.data.error || "Failed to fetch coupons",
    };
  } catch (error: any) {
    return handleApiError(error);
  }
};
