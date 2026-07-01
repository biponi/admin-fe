// Package Status
export type PackageStatus =
  | "requested"
  | "packing"
  | "packed"
  | "shipping_requested"
  | "shipped"
  | "completed"
  | "cancelled"
  | "returned";

// Courier Provider
export type CourierProvider =
  | "steadfast"
  | "pathao"
  | "redx"
  | "carrybee"
  | "manual"
  | "custom"
  | "self"
  | "";

// Courier Info
export interface PackageCourier {
  provider: CourierProvider;
  consignmentId: string;
  trackingCode: string;
  invoice: string;
}

// Order Summary (embedded in package response)
export interface OrderSummary {
  id: string;
  orderNumber: number;
  status: string;
  totalPrice: number;
  paid: number;
  remaining: number;
  quantity: number;
  notes?: string;
  customer: {
    name: string;
    phoneNumber: string;
    email?: string;
    address?: string;
  };
  shipping: {
    address: string;
    division?: string;
    district?: string;
    postalCode?: string;
  };
  timestamps: {
    createdAt: string;
    updatedAt: string;
  };
}

// Package
export interface Package {
  _id: string;
  packageCode: string;
  orderId: string;
  orderNumber: number;
  status: PackageStatus;
  courier: PackageCourier;
  slipUrl: string;
  createdBy: string;
  updatedBy: string;
  timestamps: {
    createdAt: string;
    updatedAt: string;
  };
  ageInDays?: number;
  order?: OrderSummary; // NEW: Order information embedded in response
}

// Activity Log
export interface PackageActivity {
  _id: string;
  packageId: string;
  packageCode: string;
  orderId: string;
  orderNumber: number;
  action: string;
  actionDescription: string;
  fromStatus: PackageStatus | null;
  toStatus: PackageStatus;
  user: {
    id: string;
    name: string;
    email: string;
  };
  source: "manual" | "webhook" | "job";
  requestMethod?: string;
  requestUrl?: string;
  ipAddress?: string;
  reason?: string;
  createdAt: string;
}

// Pagination
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Paginated Response
export interface PaginatedResponse<T> {
  packages?: T[];
  activities?: T[];
  pagination: Pagination;
}

// Dashboard Stats
export interface DashboardStats {
  requested: number;
  packing: number;
  packed: number;
  shipping_requested: number;
  shipped: number;
  completed: number;
  cancelled: number;
  returned: number;
  total: number;
}

// Barcode Validation Result
export interface BarcodeValidation {
  barcode: string;
  orderNumber?: number;
  status?: PackageStatus;
  exists: boolean;
  error?: string;
}

export interface BarcodeValidationResult {
  valid: BarcodeValidation[];
  invalid: Array<{ barcode: string; error: string }>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
    validOrderNumbers: number[];
  };
}

// Bulk Operation Response
export interface BulkOperationResponse {
  bulkOperationId: string;
  jobId: string;
  message: string;
  status: "queued";
  estimatedTime: string;
}

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Barcode Response
export interface BarcodeResponse {
  packageCode: string;
  barcode: string; // base64 encoded PNG
  format: string;
  width: number;
  height: number;
  orderNumber: number;
}

// Packaging Slip Response
export interface PackagingSlipResponse {
  package: Package;
}
