import axios from "axios";
import {
  SMSCampaign,
  SMSCampaignResponse,
  CampaignListResponse,
  CampaignQueryParams,
  CreateSMSCampaignRequest,
  ApiResponse,
  QueueStats,
  FailedJob,
  JobStatus,
} from "../pages/bulk-communication/interface";

const BASE_URL = process.env.REACT_APP_API_URL || "";

// Create Bulk SMS Campaign
export const createBulkSMSCampaign = async (
  data: CreateSMSCampaignRequest,
): Promise<ApiResponse<SMSCampaignResponse>> => {
  try {
    const response = await axios.post(`${BASE_URL}/bulk-sms/campaign`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create SMS campaign",
      errors: error.response?.data?.errors,
    };
  }
};

// Get Bulk SMS Campaign by ID
export const getBulkSMSCampaign = async (
  campaignId: string,
): Promise<ApiResponse<SMSCampaign>> => {
  try {
    const response = await axios.get(
      `${BASE_URL}/bulk-sms/campaign/${campaignId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch SMS campaign",
      errors: error.response?.data?.errors,
    };
  }
};

// Get User's Bulk SMS Campaigns
export const getBulkSMSCampaigns = async (
  params?: CampaignQueryParams,
): Promise<ApiResponse<CampaignListResponse<SMSCampaign>>> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const response = await axios.get(
      `${BASE_URL}/bulk-sms/campaigns?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch SMS campaigns",
      errors: error.response?.data?.errors,
    };
  }
};

// Cancel Bulk SMS Campaign
export const cancelBulkSMSCampaign = async (
  campaignId: string,
): Promise<ApiResponse<{ campaignId: string; status: string }>> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/bulk-sms/campaign/${campaignId}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to cancel SMS campaign",
      errors: error.response?.data?.errors,
    };
  }
};

// Delete Bulk SMS Campaign
export const deleteBulkSMSCampaign = async (
  campaignId: string,
): Promise<ApiResponse<void>> => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/bulk-sms/campaign/${campaignId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete SMS campaign",
      errors: error.response?.data?.errors,
    };
  }
};

// Get Queue Statistics
export const getSMSQueueStats = async (): Promise<ApiResponse<QueueStats>> => {
  try {
    const response = await axios.get(`${BASE_URL}/bulk-sms/queue/stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch queue stats",
      errors: error.response?.data?.errors,
    };
  }
};

// Get Failed Jobs
export const getSMSFailedJobs = async (
  start: number = 0,
  end: number = 10,
): Promise<ApiResponse<FailedJob[]>> => {
  try {
    const response = await axios.get(
      `${BASE_URL}/bulk-sms/queue/failed?start=${start}&end=${end}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch failed jobs",
      errors: error.response?.data?.errors,
    };
  }
};

// Retry Failed Job
export const retrySMSJob = async (
  jobId: string,
): Promise<ApiResponse<{ success: boolean; jobId: string }>> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/bulk-sms/queue/${jobId}/retry`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to retry job",
      errors: error.response?.data?.errors,
    };
  }
};

// Get Job Status
export const getSMSJobStatus = async (
  jobId: string,
): Promise<ApiResponse<JobStatus>> => {
  try {
    const response = await axios.get(
      `${BASE_URL}/bulk-sms/queue/job/${jobId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch job status",
      errors: error.response?.data?.errors,
    };
  }
};
