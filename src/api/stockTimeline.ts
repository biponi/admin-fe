import axios from "./axios";
import config from "../utils/config";
import { handleApiError } from ".";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TimelineReference {
  type: string | null;
  id: string | null;
  display: string | null;
}

export interface TimelineImpact {
  before: number | null;
  change: number | null;
  after: number | null;
}

export interface TimelineVariation {
  variationId: string;
  size?: string;
  color?: string;
  sku?: string;
  title?: string;
  before: number;
  change: number;
  after: number;
  unitPrice?: number;
}

export interface TimelineReferenceDetail {
  type: string;
  id: string;
  display: string;
  status?: string;
  customer?: string;
  total?: number;
  orderNumber?: string;
  originalOrderNumber?: string;
  returnReason?: string;
  purchaseNumber?: string;
  adjustmentType?: string;
  reason?: string;
  adjustedBy?: string;
  createdAt?: string | null;
}

export interface TimelineEvent {
  id: string;
  groupId: string | null;
  createdAt: string;
  movementType: string;
  label: string;
  reason: string;
  performedBy: string;
  reference: TimelineReference;
  impact: TimelineImpact;
  variationCount: number;
  variations?: TimelineVariation[];
  unitPrice: number;
  totalValue: number;
  referenceDetail?: TimelineReferenceDetail | null;
}

export interface TimelineQueryParams {
  page?: number;
  limit?: number;
  movementType?: string;
  variationId?: string;
  startDate?: string;
  endDate?: string;
  q?: string;
  sort?: "asc" | "desc";
}

export interface StockTimelineResponse {
  productId: string;
  items: TimelineEvent[];
  summary: {
    currentQuantity: number | null;
    totalEvents: number;
    netChange: number;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  eventTypes: { value: string; label: string }[];
}

export interface StockTimelineEventResponse {
  productId: string;
  event: TimelineEvent;
}

/**
 * Get the quantity timeline for a product (newest first)
 * @param productId - Product ID
 * @param params - Query parameters (page, limit, movementType, startDate, endDate, q, sort)
 */
export const getStockTimeline = async (
  productId: string,
  params?: TimelineQueryParams
): Promise<ApiResponse<StockTimelineResponse>> => {
  try {
    const response = await axios.get<any>(
      config.product.getStockTimeline(productId),
      { params }
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch quantity timeline",
      };
    }
  } catch (error: any) {
    console.error("Error fetching quantity timeline:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get full detail of a single timeline event (variant level breakdown)
 * @param productId - Product ID
 * @param eventId - Timeline event id (or groupId)
 */
export const getStockTimelineEvent = async (
  productId: string,
  eventId: string
): Promise<ApiResponse<StockTimelineEventResponse>> => {
  try {
    const response = await axios.get<any>(
      config.product.getStockTimelineEvent(productId, eventId)
    );

    if (response.status === 200) {
      return { success: true, data: response.data?.data };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch timeline event",
      };
    }
  } catch (error: any) {
    console.error("Error fetching timeline event:", error.message);
    return handleApiError(error);
  }
};
