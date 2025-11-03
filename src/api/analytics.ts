import axiosInstance from "./axios";

const API_BASE = "/api/v1/analytics";

// Types for Firebase GA4 Analytics
export interface DashboardOverview {
  activeUsers: number;
  totalUsers: number;
  newUsers: number;
  sessions: number;
  averageSessionDuration: number;
  bounceRate: number;
  pageViews: number;
  totalRevenue: number;
  transactions: number;
  averageOrderValue: number;
  conversionRate: number;
  itemsViewed: number;
  itemsAddedToCart: number;
  cartToViewRate: number;
  purchaseToCartRate: number;
}

export interface DailyTrend {
  date: string;
  activeUsers: number;
  sessions: number;
  pageViews: number;
  transactions: number;
  revenue: number;
}

export interface DashboardResponse {
  overview: DashboardOverview;
  dailyTrend: DailyTrend[];
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface RealtimeSession {
  country: string;
  city: string;
  device: string;
  browser: string;
  pageViews: number;
  startedAt: string;
}

export interface RealtimeResponse {
  activeUsers: number;
  sessions: RealtimeSession[];
  topPages: Array<{
    pagePath: string;
    views: number;
  }>;
  topCountries: Array<{
    country: string;
    users: number;
  }>;
  timestamp: string;
}

export interface UserBehavior {
  segment: string;
  users: number;
  sessions: number;
  avgSessionDuration: number;
  bounceRate: number;
}

export interface TopPage {
  pagePath: string;
  pageTitle: string;
  pageViews: number;
  uniquePageViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

export interface UserJourneyResponse {
  userBehavior: UserBehavior[];
  topPages: TopPage[];
  landingPages: Array<{
    pagePath: string;
    sessions: number;
    bounceRate: number;
  }>;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface FunnelStep {
  step: string;
  count: number;
  rate: number;
}

export interface FunnelResponse {
  funnel: FunnelStep[];
  dropOffRate: number;
  conversionRate: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface TopProduct {
  itemId: string;
  itemName: string;
  itemViews: number;
  addToCarts: number;
  purchases: number;
  itemRevenue: number;
  category: string;
  conversionRate: number;
}

export interface TopProductsResponse {
  products: TopProduct[];
  total: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface CountryData {
  country: string;
  users: number;
  sessions: number;
  revenue: number;
}

export interface CityData {
  city: string;
  users: number;
  sessions: number;
  revenue: number;
}

export interface DeviceData {
  deviceCategory: string;
  users: number;
  sessions: number;
  revenue: number;
}

export interface BrowserData {
  browser: string;
  users: number;
  sessions: number;
}

export interface DemographicsResponse {
  byCountry: CountryData[];
  byCity: CityData[];
  byDevice: DeviceData[];
  byBrowser: BrowserData[];
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface TrafficSource {
  source: string;
  medium: string;
  users: number;
  sessions: number;
  revenue: number;
  conversionRate: number;
}

export interface TrafficSourcesResponse {
  sources: TrafficSource[];
  total: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface TimeSeriesData {
  date: string;
  activeUsers: number;
  sessions: number;
  pageViews: number;
  transactions: number;
  revenue: number;
  averageSessionDuration: number;
  bounceRate: number;
}

export interface TimeSeriesResponse {
  timeseries: TimeSeriesData[];
  metric: string;
  total: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface HourlyActivityData {
  hour: number;
  users: number;
  sessions: number;
  transactions: number;
  revenue: number;
}

export interface HourlyActivityResponse {
  hourlyActivity: HourlyActivityData[];
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface RetentionData {
  daysSinceFirstVisit: number;
  users: number;
  sessions: number;
  revenue: number;
}

export interface CustomerRetentionResponse {
  retention: RetentionData[];
  summary: {
    newUsers: number;
    returningUsers: number;
    retentionRate: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface CustomEvent {
  eventName: string;
  eventCount: number;
  users: number;
  eventValue: number;
}

export interface CustomEventsResponse {
  events: CustomEvent[];
  total: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

// API Functions
export const analyticsAPI = {
  getDashboard: async (
    startDate?: string,
    endDate?: string
  ): Promise<DashboardResponse> => {
    const response = await axiosInstance.get(`${API_BASE}/dashboard`, {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  getRealtime: async (): Promise<RealtimeResponse> => {
    const response = await axiosInstance.get(`${API_BASE}/realtime`);
    return response.data.data;
  },

  getUserJourney: async (
    startDate?: string,
    endDate?: string
  ): Promise<UserJourneyResponse> => {
    const response = await axiosInstance.get(`${API_BASE}/user-journey`, {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  getFunnel: async (
    startDate?: string,
    endDate?: string
  ): Promise<FunnelResponse> => {
    const response = await axiosInstance.get(`${API_BASE}/ecommerce-funnel`, {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  getTopProducts: async (
    startDate?: string,
    endDate?: string,
    limit: number = 20
  ): Promise<TopProductsResponse> => {
    const response = await axiosInstance.get(`${API_BASE}/top-products`, {
      params: { startDate, endDate, limit },
    });

    const products = response.data.data.products.map((product: any) => ({
      itemId: product?.id,
      itemName: product?.name,
      itemViews: product?.views,
      addToCarts: product?.addedToCart,
      purchases: product?.purchased,
      itemRevenue: product?.revenue,
      conversionRate: product?.conversionRate,
      category: product?.category,
    }));
    return { ...response.data.data, products };
  },

  getDemographics: async (
    startDate?: string,
    endDate?: string
  ): Promise<DemographicsResponse> => {
    const response = await axiosInstance.get(`${API_BASE}/demographics`, {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  getTrafficSources: async (
    startDate?: string,
    endDate?: string
  ): Promise<TrafficSourcesResponse> => {
    const response = await axiosInstance.get(`${API_BASE}/traffic-sources`, {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  getCustomEvents: async (
    startDate?: string,
    endDate?: string,
    eventName?: string
  ): Promise<CustomEventsResponse> => {
    const response = await axiosInstance.get(`${API_BASE}/custom-events`, {
      params: { startDate, endDate, eventName },
    });
    return response.data.data;
  },

  getTimeSeries: async (
    startDate?: string,
    endDate?: string,
    metric: string = "revenue"
  ): Promise<TimeSeriesResponse> => {
    const response = await axiosInstance.get(`${API_BASE}/timeseries`, {
      params: { startDate, endDate, metric },
    });
    return response.data.data;
  },

  getHourlyActivity: async (
    startDate?: string,
    endDate?: string
  ): Promise<HourlyActivityResponse> => {
    const response = await axiosInstance.get(`${API_BASE}/hourly-activity`, {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  getCustomerRetention: async (
    startDate?: string,
    endDate?: string
  ): Promise<CustomerRetentionResponse> => {
    const response = await axiosInstance.get(`${API_BASE}/customer-retention`, {
      params: { startDate, endDate },
    });
    return response.data.data;
  },
};
