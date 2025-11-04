interface IDistrict {
  id: string;
  division_id: string;
  name: string;
  bn_name: string;
  lat: string;
  long: string;
}

interface IDivision {
  id: string;
  name: string;
  bn_name: string;
  lat: string;
  long: string;
}

export interface ITransection {
  totalPrice: number;
  paid: number;
  remaining: number;
  discount: number;
  deliveryCharge: number;
}

export interface FraudDetection {
  isFraud: boolean;
  riskLevel: "green" | "yellow" | "red";
  riskScore: number; // 0–100
  fraudProbability: number; // percentage (0–100)
  metrics: {
    cancellationRate: number;
    returnRate: number;
    completionRate: number;
    cancelledOrderCount?: number;
    returnOrderCount?: number;
    totalOrderCount?: number;
    lastCancellationDate: string;
  } | null;
  fraudFlags: string[]; // e.g. ["suspicious_returns", "multiple_cancellations"]
  lastAnalyzedAt: string | Date; // ISO string or Date object
}

export type ProductListResponse = {
  totalDocs: number;
  totalPages: number;
  currentPage: number;
  purchaseOrders: PurchaseOrder[];
};

export type ProductSearchResponse = {
  id: string;
  name: string;
  sku: string;
  unitPrice: number | string;
  updatePrice: number | string;
  discount: number | string;
  quantity: number;
  maxQuantity: number;
  image?: string;
  variant: {
    id: string;
    size: string;
    color: string;
  } | null;
};

// Enums for better type safety
export enum PaymentType {
  EMPTY = "",
  CASH = "cash",
  BKASH = "bkash",
  NAGAD = "nagad",
  CARD = "card",
  BANK = "bank",
  ONLINE = "online",
}

export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  CANCEL = "cancel",
  DELETE = "delete",
  FAILED = "failed",
}

export enum CourierProvider {
  STEADFAST = "steadfast",
  PATHAO = "pathao",
  REDX = "redx",
  ECOURIER = "ecourier",
  MANUAL = "manual",
}

export enum DeliveryStatus {
  NOT_SHIPPED = "not_shipped",
  PENDING = "pending",
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
  DELIVERED_APPROVAL_PENDING = "delivered_approval_pending",
  PARTIAL_DELIVERED = "partial_delivered",
  PARTIAL_DELIVERED_APPROVAL_PENDING = "partial_delivered_approval_pending",
  CANCELLED = "cancelled",
  CANCELLED_APPROVAL_PENDING = "cancelled_approval_pending",
  HOLD = "hold",
  IN_REVIEW = "in_review",
  UNKNOWN = "unknown",
  UNKNOWN_APPROVAL_PENDING = "unknown_approval_pending",
}

export enum CustomerRiskLevel {
  GREEN = "green",
  YELLOW = "yellow",
  RED = "red",
}

export enum TimelineUpdatedBy {
  SYSTEM = "system",
  WEBHOOK = "webhook",
  MANUAL = "manual",
  JOB = "job",
}

// Interface definitions
export interface IPayment {
  paymentType: PaymentType | string;
  paymentBy: string;
  amount: number;
  date: Date;
  transectionId?: string;
}

export interface ICustomer {
  name: string;
  email?: string;
  phoneNumber: string;
}

export interface IShipping {
  division: string;
  district: string;
  address: string;
}

export interface IProductVariation {
  id?: string;
  size?: string;
  color?: string;
}

export interface IOrderProduct {
  id: string;
  productId: string;
  name: string;
  thumbnail?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
  hasVariation?: boolean;
  title?: string;
  variantId?: string;
  variation?: IProductVariation;
}

export interface ITimestamps {
  createdAt: string;
  updatedAt: string;
}

export interface ICourier {
  provider: CourierProvider | string;
  consignmentId?: string;
  trackingCode?: string;
  invoice?: string;
  createdAt?: string | null;
}

export interface IDeliveryTimeline {
  status: string;
  timestamp: string;
  location?: string;
  remarks?: string;
  updatedBy: TimelineUpdatedBy | string;
}

export interface IOrder {
  _id?: string;
  id: number;
  active: boolean;
  notes?: string;
  orderCreatedBy: string;
  orderNumber: number;
  customer: ICustomer;
  status: OrderStatus | string;
  totalPrice: number;
  paid: number;
  discount: number;
  deliveryCharge: number;
  remaining: number;
  timestamps: ITimestamps;
  payment: IPayment[];
  shipping: IShipping;
  products: IOrderProduct[];

  // Fraud Detection Fields
  customerRiskLevel: CustomerRiskLevel | string;
  customerRiskScore: number;
  fraudFlags: string[];
  requiresManualReview: boolean;
  fraudDetection?: FraudDetection;

  // Courier/Delivery Tracking Fields
  courier: ICourier;
  deliveryStatus: DeliveryStatus | string;
  deliveryTimeline: IDeliveryTimeline[];
  courierResponse?: any;
  estimatedDeliveryDate?: Date | null;

  // Virtual fields (if needed)
  ageInDays?: number;
  statusDisplay?: string;
}

// DTOs (Data Transfer Objects) for API requests/responses
export interface ICreateOrderDTO {
  notes?: string;
  orderCreatedBy?: string;
  customer: ICustomer;
  status?: OrderStatus | string;
  totalPrice?: number;
  paid?: number;
  discount?: number;
  deliveryCharge?: number;
  payment?: IPayment[];
  shipping: IShipping;
  products: IOrderProduct[];
  customerRiskLevel?: CustomerRiskLevel | string;
  courier?: Partial<ICourier>;
}

export interface IUpdateOrderDTO {
  active?: boolean;
  notes?: string;
  customer?: Partial<ICustomer>;
  status?: OrderStatus | string;
  totalPrice?: number;
  paid?: number;
  discount?: number;
  deliveryCharge?: number;
  payment?: IPayment[];
  shipping?: Partial<IShipping>;
  products?: IOrderProduct[];
  customerRiskLevel?: CustomerRiskLevel | string;
  customerRiskScore?: number;
  fraudFlags?: string[];
  requiresManualReview?: boolean;
  courier?: Partial<ICourier>;
  deliveryStatus?: DeliveryStatus | string;
  estimatedDeliveryDate?: Date | null;
}

export interface IAddPaymentDTO {
  paymentType: PaymentType | string;
  paymentBy?: string;
  amount: number;
  date?: Date;
  transectionId?: string;
}

export interface IOrderSummary {
  id: string;
  orderNumber: number;
  customer: ICustomer;
  status: OrderStatus | string;
  totalPrice: number;
  paid: number;
  remaining: number;
  productsCount: number;
  createdAt: Date;
}

export interface IOrderStats {
  totalOrders: number;
  totalRevenue: number;
  totalPaid: number;
  totalRemaining: number;
  averageOrderValue: number;
}

export interface IOrderFilter {
  status?: OrderStatus | string;
  active?: boolean;
  startDate?: Date;
  endDate?: Date;
  customerPhone?: string;
  customerEmail?: string;
  orderNumber?: number;
  minAmount?: number;
  maxAmount?: number;
  deliveryStatus?: DeliveryStatus | string;
  courierProvider?: CourierProvider | string;
  customerRiskLevel?: CustomerRiskLevel | string;
  requiresManualReview?: boolean;
}

export interface IPaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// API Response types
export interface IApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface IOrderResponse extends IApiResponse<IOrder> {}
export interface IOrdersResponse
  extends IApiResponse<IPaginatedResponse<IOrder>> {}
export interface IOrderSummaryResponse extends IApiResponse<IOrderSummary> {}
export interface IOrderStatsResponse extends IApiResponse<IOrderStats> {}

// Type guards for validation
export const isValidOrderStatus = (status: string): status is OrderStatus => {
  return Object.values(OrderStatus).includes(status as OrderStatus);
};

export const isValidPaymentType = (type: string): type is PaymentType => {
  return Object.values(PaymentType).includes(type as PaymentType);
};

export const isValidCourierProvider = (
  provider: string
): provider is CourierProvider => {
  return Object.values(CourierProvider).includes(provider as CourierProvider);
};

export const isValidDeliveryStatus = (
  status: string
): status is DeliveryStatus => {
  return Object.values(DeliveryStatus).includes(status as DeliveryStatus);
};

// Utility types for partial updates
export type PartialOrder = Partial<IOrder>;
export type OrderWithoutId = Omit<IOrder, "_id" | "id" | "orderNumber">;
export type OrderProductWithoutTotals = Omit<IOrderProduct, "totalPrice">;

// Webhook payload types (for courier integrations)
export interface ICourierWebhookPayload {
  trackingCode: string;
  consignmentId: string;
  status: DeliveryStatus | string;
  location?: string;
  remarks?: string;
  timestamp: Date;
  courierProvider: CourierProvider | string;
}

// Notification payload for Firebase
export interface IOrderNotificationData {
  orderId: string;
  orderNumber: number;
  customerName: string;
  amount: number;
  status: OrderStatus | string;
  type: "new_order" | "status_update" | "payment_received" | "delivery_update";
  timestamp: string;
}

// Export all types as a namespace for organized imports
export namespace OrderTypes {
  export type Order = IOrder;
  export type CreateOrder = ICreateOrderDTO;
  export type UpdateOrder = IUpdateOrderDTO;
  export type OrderSummary = IOrderSummary;
  export type OrderStats = IOrderStats;
  export type OrderFilter = IOrderFilter;
  export type PaginationParams = IPaginationParams;
  export type PaginatedResponse<T> = IPaginatedResponse<T>;
  export type ApiResponse<T> = IApiResponse<T>;
  export type Payment = IPayment;
  export type Customer = ICustomer;
  export type Shipping = IShipping;
  export type OrderProduct = IOrderProduct;
  export type ProductVariation = IProductVariation;
  export type Courier = ICourier;
  export type DeliveryTimeline = IDeliveryTimeline;
}
