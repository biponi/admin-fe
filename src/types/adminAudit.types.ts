/**
 * Type definitions for Admin Audit Dashboard System
 */

// ===== Date Range Types =====

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

// ===== Dashboard Overview Types =====

export interface OperationCounts {
  creates: number;
  statusUpdates: number;
  paymentUpdates: number;
  bulkActions: number;
}

export interface OrderAuditSummary {
  totalAudits: number;
  uniqueOrdersCount: number;
  uniqueUsersCount: number;
  operationCounts: OperationCounts;
}

export interface ProductAdjustmentSummary {
  totalAdjustments: number;
  totalAdded: number;
  totalRemoved: number;
  uniqueProductsCount: number;
  uniqueUsersCount: number;
}

export interface UserPerformer {
  userName: string;
  userEmail?: string;
  userId?: string;
}

export interface RecentOrderAction {
  id: string;
  orderId: string;
  orderNumber: number;
  operation: string;
  operationDescription?: string;
  performedBy: UserPerformer;
  timestamps: {
    createdAt: string;
  };
}

export interface RecentProductAdjustment {
  id: string;
  productId?: string;
  productName: string;
  productSku?: string;
  adjustmentType: string;
  quantityChange: number;
  reason?: string;
  adjustedBy: UserPerformer;
  timestamps: {
    createdAt: string;
  };
}

export interface RecentActivities {
  orderActions: RecentOrderAction[];
  productAdjustments: RecentProductAdjustment[];
}

export interface HourlyActivity {
  hour: number;
  count: number;
}

export interface DashboardOverview {
  dateRange: DateRange;
  orderAudits: OrderAuditSummary;
  productAdjustments: ProductAdjustmentSummary;
  recentActivities: RecentActivities;
  todayActivity: HourlyActivity[];
}

// ===== User Performance Types =====

export interface UserOrderOperations {
  total: number;
  creates: number;
  statusUpdates: number;
  paymentUpdates: number;
  bulkActions: number;
}

export interface UserProductAdjustments {
  total: number;
  quantityAdded: number;
  quantityRemoved: number;
  uniqueProducts: number;
}

export interface UserPerformanceSummary {
  userId: string;
  userName: string;
  userEmail: string;
  userType: string;
  orderOperations: UserOrderOperations;
  productAdjustments: UserProductAdjustments;
  lastActivity: string;
}

export interface UserPerformanceOverview {
  totalUsers: number;
  dateRange: DateRange;
  users: UserPerformanceSummary[];
}

// ===== Detailed User Performance Types =====

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  type: string;
}

export interface PerformanceSummary {
  totalOrderActions: number;
  totalProductAdjustments: number;
  dateRange: DateRange;
}

export interface OperationBreakdown {
  operation: string;
  count: number;
  lastPerformed: string;
}

export interface AdjustmentTypeBreakdown {
  type: string;
  count: number;
  totalQuantityChange: number;
}

export interface ActivityTrend {
  date: string;
  orderActions: number;
  productAdjustments: number;
}

export interface OrderOperationsDetail {
  recentActions: any[]; // Use specific order audit type from audit.types.ts
  breakdown: OperationBreakdown[];
}

export interface ProductAdjustmentsDetail {
  recentAdjustments: any[]; // Use specific adjustment type from audit.types.ts
  typeBreakdown: AdjustmentTypeBreakdown[];
}

export interface UserPerformanceDetail {
  user: UserInfo;
  summary: PerformanceSummary;
  orderOperations: OrderOperationsDetail;
  productAdjustments: ProductAdjustmentsDetail;
  activityTrend: ActivityTrend[];
}

// ===== Top Performers Types =====

export type PerformanceMetric = "total" | "orders" | "adjustments";

export interface TopPerformer {
  userId: string;
  userName: string;
  userEmail: string;
  orderActions: number;
  productAdjustments: number;
  totalActions: number;
}

export interface TopPerformersData {
  metric: PerformanceMetric;
  dateRange: DateRange;
  topPerformers: TopPerformer[];
}

// ===== Query Parameter Types =====

export interface DashboardQueryParams extends DateRangeParams {}

export interface UserPerformanceQueryParams extends DateRangeParams {
  limit?: number;
}

export interface TopPerformersQueryParams extends DateRangeParams {
  limit?: number;
  metric?: PerformanceMetric;
}

// ===== Chart Data Types =====

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface PerformanceComparisonData {
  userId: string;
  userName: string;
  metrics: {
    [key: string]: number;
  };
}

// ===== Filter Types =====

export interface DashboardFilters {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  userType?: string;
  department?: string;
  operationType?: string;
}

// ===== Export Types =====

export interface ExportConfig {
  format: "csv" | "xlsx" | "pdf";
  includeCharts: boolean;
  dateRange: DateRange;
  selectedMetrics: string[];
}
