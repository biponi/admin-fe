// Delivery status values as per documentation
export type DeliveryStatus =
  | "not_shipped"
  | "pending"
  | "in_transit"
  | "delivered"
  | "delivered_approval_pending"
  | "partial_delivered"
  | "partial_delivered_approval_pending"
  | "cancelled"
  | "cancelled_approval_pending"
  | "hold"
  | "in_review"
  | "unknown"
  | "unknown_approval_pending";

// Timeline entry for delivery status history
export interface DeliveryTimelineEntry {
  status: DeliveryStatus;
  timestamp: string;
  location: string;
  remarks: string;
  updatedBy: "system" | "webhook" | "manual" | "job";
}

// Courier information embedded in order
export interface CourierInfo {
  provider: string; // "steadfast", "pathao", "redx", etc.
  consignmentId: string;
  trackingCode: string;
  invoice: string;
  createdAt: string;
}

// Full courier order data
export interface CourierOrder {
  orderId: string; // This is the MongoDB _id
  orderNumber: number; // This is the actual order number to use in API calls
  consignmentId: string;
  trackingCode: string;
  invoice: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number;
  deliveryStatus: DeliveryStatus;
  note: string;
  timestamps: {
    createdAt: string;
    updatedAt: string;
  };
}

// Dashboard status breakdown
export interface StatusBreakdown {
  _id: DeliveryStatus;
  count: number;
  totalCOD: number;
  totalCollected: number;
}

// Dashboard statistics
export interface DashboardData {
  totalOrders: number;
  statusBreakdown: StatusBreakdown[];
  filters: {
    startDate?: string;
    endDate?: string;
    status?: string;
  };
}

// Report entry
export interface ReportEntry {
  _id: {
    status: DeliveryStatus;
    date: string;
  };
  count: number;
  totalCOD: number;
  totalCollected: number;
  totalDeliveryCharges: number;
}

// Pagination info
export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Status color mapping
export const deliveryStatusColors: Record<DeliveryStatus, string> = {
  not_shipped: "bg-gray-500",
  pending: "bg-yellow-500",
  in_transit: "bg-blue-500",
  delivered: "bg-green-500",
  delivered_approval_pending: "bg-green-400",
  partial_delivered: "bg-green-300",
  partial_delivered_approval_pending: "bg-green-200",
  cancelled: "bg-red-500",
  cancelled_approval_pending: "bg-red-400",
  hold: "bg-orange-500",
  in_review: "bg-purple-500",
  unknown: "bg-gray-400",
  unknown_approval_pending: "bg-gray-300",
};

// Status text color mapping for badges
export const deliveryStatusTextColors: Record<DeliveryStatus, string> = {
  not_shipped: "text-gray-100",
  pending: "text-yellow-900",
  in_transit: "text-blue-100",
  delivered: "text-green-100",
  delivered_approval_pending: "text-green-900",
  partial_delivered: "text-green-900",
  partial_delivered_approval_pending: "text-green-900",
  cancelled: "text-red-100",
  cancelled_approval_pending: "text-red-900",
  hold: "text-orange-100",
  in_review: "text-purple-100",
  unknown: "text-gray-100",
  unknown_approval_pending: "text-gray-900",
};

// Status display names
export const deliveryStatusLabels: Record<DeliveryStatus, string> = {
  not_shipped: "Not Shipped",
  pending: "Pending Pickup",
  in_transit: "In Transit",
  delivered: "Delivered",
  delivered_approval_pending: "Delivered (Pending Approval)",
  partial_delivered: "Partially Delivered",
  partial_delivered_approval_pending: "Partial Delivery (Pending Approval)",
  cancelled: "Cancelled",
  cancelled_approval_pending: "Cancelled (Pending Approval)",
  hold: "On Hold",
  in_review: "In Review",
  unknown: "Unknown Status",
  unknown_approval_pending: "Unknown (Pending Approval)",
};

// Helper function to format delivery status
export const formatDeliveryStatus = (status: DeliveryStatus): string => {
  return deliveryStatusLabels[status] || status;
};

// Helper function to get status badge classes
export const getStatusBadgeClasses = (
  status: DeliveryStatus
): { bg: string; text: string } => {
  return {
    bg: deliveryStatusColors[status] || "bg-gray-500",
    text: deliveryStatusTextColors[status] || "text-gray-100",
  };
};
