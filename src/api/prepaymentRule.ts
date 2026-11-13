import axiosInstance from "./axios";
import { handleApiError } from ".";

const baseURL = "/api/v1/prepayment-rule";

export type PrepaymentBasisType =
  | "delivery_charge"
  | "percentage"
  | "fixed"
  | "full_amount";

export interface PrepaymentRule {
  _id: string;
  name: string;
  description: string;
  active: boolean;
  priority: number;
  conditions: {
    zones: string[];
    minOrderTotal: number | null;
    maxOrderTotal: number | null;
    riskLevels: ("green" | "yellow" | "red")[];
    requireCampaignProducts: boolean;
  };
  basis: {
    type: PrepaymentBasisType;
    value: number;
    minAmount: number | null;
    maxAmount: number | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PrepaymentCandidate {
  ruleId: string | null;
  ruleName: string;
  basis: string;
  matchedBy: string | null;
  computedAmount: number;
  priority: number;
}

export interface PrepaymentEvaluation {
  required: boolean;
  amount: number;
  appliedRule: {
    id: string | null;
    name: string;
    basis: string;
    matchedBy: string | null;
  } | null;
  breakdown: PrepaymentCandidate[];
  zoneMatched: boolean;
  orderTotal: number;
  deliveryCharge: number;
  /** resolved only when some rule matches on risk levels (needs customerPhone) */
  riskLevel?: "green" | "yellow" | "red" | null;
}

export interface PrepaymentEvaluateInput {
  shipping?: { district?: string; division?: string };
  orderItems: { productId: string; quantity: number; unitPrice: number }[];
  deliveryCharge?: number | null;
  customerPhone?: string;
}

export interface PrepaymentRuleInput {
  name: string;
  description?: string;
  active?: boolean;
  priority?: number;
  conditions: PrepaymentRule["conditions"];
  basis: PrepaymentRule["basis"];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const getPrepaymentRules = async (params?: {
  page?: number;
  limit?: number;
  active?: "true" | "false";
  search?: string;
}): Promise<
  ApiResponse<{ rules: PrepaymentRule[]; total: number; page: number; limit: number; totalPages: number }>
> => {
  try {
    const response = await axiosInstance.get(`${baseURL}/`, { params });
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error fetching prepayment rules:", error.message);
    return handleApiError(error);
  }
};

export const createPrepaymentRule = async (
  payload: PrepaymentRuleInput
): Promise<ApiResponse<PrepaymentRule>> => {
  try {
    const response = await axiosInstance.post(`${baseURL}/`, payload);
    return { success: true, data: response.data.data.rule };
  } catch (error: any) {
    console.error("Error creating prepayment rule:", error.message);
    return handleApiError(error);
  }
};

export const updatePrepaymentRule = async (
  id: string,
  payload: Partial<PrepaymentRuleInput>
): Promise<ApiResponse<PrepaymentRule>> => {
  try {
    const response = await axiosInstance.put(`${baseURL}/${id}`, payload);
    return { success: true, data: response.data.data.rule };
  } catch (error: any) {
    console.error("Error updating prepayment rule:", error.message);
    return handleApiError(error);
  }
};

export const deletePrepaymentRule = async (
  id: string
): Promise<ApiResponse<{ deleted: boolean }>> => {
  try {
    const response = await axiosInstance.delete(`${baseURL}/${id}`);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error deleting prepayment rule:", error.message);
    return handleApiError(error);
  }
};

/**
 * Evaluate prepayment rules against a sample order context (admin preview or
 * order-creation suggestion). Returns the winning requirement plus the
 * per-rule breakdown.
 */
export const evaluatePrepaymentRules = async (
  input: PrepaymentEvaluateInput
): Promise<ApiResponse<PrepaymentEvaluation>> => {
  try {
    const response = await axiosInstance.post(`${baseURL}/evaluate`, input);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error evaluating prepayment rules:", error.message);
    return handleApiError(error);
  }
};
